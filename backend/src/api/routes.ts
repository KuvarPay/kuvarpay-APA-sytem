import { FastifyInstance } from 'fastify';
import { db, schema, eq, desc, and, sql } from 'rayswap-db';
import { payrollQueue } from '../workers/scheduler';
import { v4 as uuidv4 } from 'uuid';
import { FxService } from '../services/fx-service';
import { WdkService } from '../integrations/wdk';
import { WdkSecretManager } from '../integrations/secret-manager';
import { StartbuttonService } from '../services/startbutton-service';
import { FastifySSEPlugin } from 'fastify-sse-v2';
import { thoughtEmitter } from '../utils/thought-emitter';
import { EventEmitter } from 'events';

const {
    payrollSchedules,
    payrollBatches,
    payrollAgentDecisions,
    flutterwaveBanks,
    flutterwaveMobileNetworks,
    scheduleRecipients,
    staffDirectory,
    recipientDirectory
} = schema;

// Map user-facing network names to WDK wallet manager network
function toWdkNetwork(network: string): string {
    const net = network.toLowerCase();
    if (['tron', 'bsc', 'polygon', 'arbitrum', 'base', 'optimism', 'ethereum'].includes(net)) {
        return net;
    }
    return 'ethereum';
}

// Basic Auth Middleware - Trust internal network if Business ID is present
const authMiddleware = async (request: any, reply: any) => {
    const apiKey = request.headers['x-api-key'];
    const businessId = request.headers['x-business-id'] || (request.body as any)?.businessId || (request.query as any)?.businessId;
    const validKey = process.env.KUVARPAY_API_KEY || 'apa_local_test_key';

    // If API Key is provided, it must be valid
    if (apiKey && apiKey !== validKey) {
        return reply.status(401).send({ error: 'Unauthorized: Invalid API Key' });
    }

    // If no API Key, we require a Business ID to identify the context (trusting internal VPC)
    if (!apiKey && !businessId && !request.url.includes('/rates')) {
        return reply.status(401).send({ error: 'Unauthorized: API Key or Business ID required' });
    }

    // Attach businessId to request if found in header
    if (businessId && !request.body?.businessId) {
        if (typeof request.body === 'object' && request.body !== null) {
            request.body.businessId = businessId;
        }
    }
};

export default async function payrollRoutes(fastify: FastifyInstance) {
    // Register SSE plugin
    fastify.register(FastifySSEPlugin);

    // Register auth hook for all routes in this plugin
    fastify.addHook('preHandler', authMiddleware);

    /**
     * Get exchange rate for a fiat currency → USD/USDT.
     * Uses the same settlement-snapshot rate chain as the core crypto settlement.
     * The AI agent calls this to convert payroll amounts from local fiat to USDT.
     */
    fastify.post('/rates', async (request, reply) => {
        const { currency, amount } = request.body as { currency: string; amount?: number };

        if (!currency) {
            return reply.status(400).send({ error: 'currency is required' });
        }

        const rate = await FxService.getRate(currency);
        if (!rate) {
            return reply.status(404).send({ error: `No rate found for ${currency}` });
        }

        const result: any = { currency: currency.toUpperCase(), rate };

        if (amount != null && amount > 0) {
            const usdAmount = await FxService.convertToUsdt(amount, currency);
            result.amount = amount;
            result.usdAmount = usdAmount;
        }

        return result;
    });

    /**
     * Get list of banks or mobile money operators for a specific currency.
     */
    fastify.get('/banks/:currency', async (request, reply) => {
        const { currency } = request.params as any;
        const { type, countryCode } = request.query as any;
        const targetCurrency = currency.toUpperCase();

        if (!targetCurrency) {
            return reply.status(400).send({ error: 'currency is required' });
        }

        try {
            // Use Startbutton service to fetch the provider list (Bank or Mobile Money)
            const result = await StartbuttonService.getBankList(targetCurrency, type || 'bank', countryCode);

            if (result && result.success) {
                // Ensure the response structure is uniform (name, code)
                const banks = (result.data || []).map((b: any) => ({
                    name: b.name,
                    code: b.code
                }));
                return { success: true, data: banks };
            }

            return { success: false, error: 'Failed to fetch provider list from partner' };
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    /**
     * Create a new Payroll Schedule.
     */
    fastify.post('/schedules', async (request, reply) => {
        const body = request.body as any;
        const scheduleId = uuidv4();
        const network = body.network || 'bsc';

        // Determine vault index: count existing schedules for this business
        const existing = await db.select().from(payrollSchedules)
            .where(eq(payrollSchedules.businessId, body.businessId) as any);
        const vaultIndex = existing.length;

        // Derive real vault address via WDK
        let vaultAddress: string;
        try {
            const seed = await WdkSecretManager.getSeed();
            const wdk = new WdkService(seed);
            vaultAddress = await wdk.getBatchAddress(vaultIndex, toWdkNetwork(network));
        } catch (wdkErr: any) {
            console.warn('WDK derivation failed, using placeholder:', wdkErr.message);
            vaultAddress = 'Vault-' + scheduleId.slice(0, 8);
        }

        try {
            const newSchedule = await db.insert(payrollSchedules).values({
                id: scheduleId,
                businessId: body.businessId,
                name: body.name,
                category: body.category || 'CUSTOM',
                customLabel: body.customLabel,
                timing: body.timing || 'ONE_TIME',
                status: 'PENDING',
                vaultAddress,
                vaultIndex,
                network,
                updatedAt: new Date().toISOString()
            }).returning();

            return newSchedule[0];
        } catch (error) {
            fastify.log.error(error);
            console.error('SCHEDULE CREATION ERROR:', error);
            return reply.status(500).send({ error: 'Failed to create schedule' });
        }
    });

    /**
     * List schedules for a business (for dashboard).
     */
    fastify.get('/schedules', async (request, reply) => {
        const { businessId } = request.query as any;
        if (!businessId) return reply.status(400).send({ error: 'businessId is required' });

        const schedules = await db.select().from(payrollSchedules)
            .where(eq(payrollSchedules.businessId, businessId) as any)
            .orderBy(desc(payrollSchedules.createdAt));

        return schedules;
    });

    /**
     * List batches for a business (for dashboard history).
     */
    fastify.get('/batches', async (request, reply) => {
        const { businessId } = request.query as any;
        if (!businessId) return reply.status(400).send({ error: 'businessId is required' });

        const scheduleMap = new Map();
        const schedules = await db.select().from(payrollSchedules)
            .where(eq(payrollSchedules.businessId, businessId) as any);
        schedules.forEach(s => scheduleMap.set(s.id, s));

        if (schedules.length === 0) return [];

        const allBatches = [];
        for (const s of schedules) {
            const batches = await db.select().from(payrollBatches)
                .where(eq(payrollBatches.scheduleId, s.id) as any)
                .orderBy(desc(payrollBatches.createdAt));

            for (const batch of batches) {
                const [decision] = await db.select()
                    .from(payrollAgentDecisions)
                    .where(eq(payrollAgentDecisions.batchId, batch.id) as any)
                    .orderBy(desc(payrollAgentDecisions.createdAt))
                    .limit(1);

                allBatches.push({
                    ...batch,
                    scheduleName: s.name,
                    network: s.network,
                    vaultAddress: s.vaultAddress,
                    reasoning: decision?.reasoning,
                    plan: decision?.plan
                });
            }
        }

        return allBatches.sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    });

    /**
     * Submit parsed payroll data (JSON) to trigger a new batch.
     * Idempotent: if an active batch already exists for this schedule, return it instead of creating a duplicate.
     */
    fastify.post('/schedules/:id/submit', async (request, reply) => {
        const { id } = request.params as any;
        const body = request.body as any;
        const { recipients, totalAmountFiat, currency, businessId, network } = body;

        if (!recipients || !Array.isArray(recipients)) {
            return reply.status(400).send({ error: 'Recipients array is required' });
        }

        try {
            const result = await db.transaction(async (tx) => {
                // 1. Verify schedule exists and update network
                const [schedule] = await tx.select().from(payrollSchedules).where(eq(payrollSchedules.id, id) as any).limit(1);
                if (!schedule) {
                    throw new Error('Schedule not found');
                }

                if (network) {
                    await tx.update(payrollSchedules).set({ network }).where(eq(payrollSchedules.id, id) as any);
                }

                // 2. Idempotency: check for existing active batch for this schedule
                const activeStatuses = ['PENDING', 'PROCESSING', 'FUNDING_REQUIRED', 'FUNDED'];
                const [existingActive] = await tx.select().from(payrollBatches)
                    .where(
                        and(
                            eq(payrollBatches.scheduleId, id) as any,
                            sql`${payrollBatches.status} IN (${sql.join(activeStatuses.map(s => sql`${s}`), sql`, `)})` as any
                        )
                    )
                    .orderBy(desc(payrollBatches.createdAt))
                    .limit(1);

                if (existingActive) {
                    console.log(`[Submit] Idempotent: returning existing active batch ${existingActive.id} (status: ${existingActive.status}) for schedule ${id}`);
                    return {
                        batchId: existingActive.id,
                        status: existingActive.status,
                        isExisting: true
                    };
                }

                const batchId = uuidv4();

                // 3. Create the batch record with the JSON recipients
                await tx.insert(payrollBatches).values({
                    id: batchId,
                    scheduleId: id,
                    status: 'PENDING',
                    totalAmountFiat: String(totalAmountFiat || 0),
                    totalAmountUsdt: "0",
                    currency: currency || 'NGN',
                    recipientCount: recipients.length,
                    recipients: recipients,
                    updatedAt: new Date().toISOString()
                });

                return { batchId, status: 'PROCESSING', isExisting: false };
            });

            if (!result.isExisting) {
                // 4. Queue the EVALUATION job for the AI Agent (outside transaction to avoid delays)
                await payrollQueue.add('EVALUATE_BATCH', {
                    scheduleId: id,
                    batchId: result.batchId,
                    type: 'EVALUATE_FUNDING',
                    agentPrompt: body.agentPrompt
                });
            }

            return {
                batchId: result.batchId,
                status: result.status,
                message: result.isExisting
                    ? 'Active batch already exists for this schedule.'
                    : 'AI Agent is now evaluating the payroll batch and funding requirements.'
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(error.message === 'Schedule not found' ? 404 : 500).send({ error: error.message });
        }
    });

    /**
     * Wallet management endpoint — called by the agent brain's apa_manage_wallet tool.
     * Derives vault address via WDK, checks balance, optionally saves to schedule.
     */
    fastify.post('/wallet', async (request, reply) => {
        const { scheduleId, network, saveToSchedule, checkCrossChain } = request.body as any;

        if (!scheduleId || !network) {
            return reply.status(400).send({ error: 'scheduleId and network are required' });
        }

        try {
            const [schedule] = await db.select().from(payrollSchedules)
                .where(eq(payrollSchedules.id, scheduleId) as any).limit(1);
            if (!schedule) {
                return reply.status(404).send({ error: 'Schedule not found' });
            }

            const vaultIndex = schedule.vaultIndex || 0;
            const seed = await WdkSecretManager.getSeed();
            const wdk = new WdkService(seed);

            // Derive the primary address
            const primaryAddress = await wdk.getBatchAddress(vaultIndex, toWdkNetwork(network));

            // Check balance on the primary network
            let primaryBalance = BigInt(0);
            try {
                primaryBalance = await wdk.getUsdtBalance(primaryAddress, toWdkNetwork(network));
            } catch (balErr: any) {
                console.warn(`[Wallet] Balance check failed for ${network}:`, balErr.message);
            }

            let balanceUsdt = Number(primaryBalance) / 1e6;

            // Simulation Mock: If APA_SIMULATION is true, return a fake balance of 10,000 USDT
            if (process.env.APA_SIMULATION === 'true') {
                balanceUsdt = 10000;
                console.log(`[Wallet] APA_SIMULATION active. Overriding balance to ${balanceUsdt} USDT`);
            }

            // Save to schedule if requested
            if (saveToSchedule && primaryAddress !== schedule.vaultAddress) {
                await db.update(payrollSchedules)
                    .set({ vaultAddress: primaryAddress, network, updatedAt: new Date().toISOString() })
                    .where(eq(payrollSchedules.id, scheduleId) as any);
            }

            return {
                primaryNetwork: network,
                primaryAddress,
                balanceUsdt,
                totalUsdt: balanceUsdt,
                allBalances: [{ network, address: primaryAddress, amount: balanceUsdt.toFixed(6), symbol: 'USDT' }]
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({ error: `Wallet error: ${error.message}` });
        }
    });

    /**
     * Get Startbutton wallet balance.
     * Called by the agent brain's apa_get_startbutton_balance tool.
     */
    fastify.get('/wallet/startbutton/balance', async (request, reply) => {
        try {
            const result = await StartbuttonService.getWalletBalance();
            return result;
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({ error: error.message });
        }
    });

    fastify.get('/schedules/:id', async (request, reply) => {
        const { id } = request.params as any;
        const [schedule] = await db.select().from(payrollSchedules).where(eq(payrollSchedules.id, id) as any).limit(1);
        if (!schedule) return reply.status(404).send({ error: 'Schedule not found' });
        return { success: true, data: schedule };
    });



    /**
     * Deposit USDT from vault to Startbutton deposit address.
     * Called by the agent brain's apa_deposit_to_startbutton tool.
     */
    fastify.post('/wallet/startbutton/deposit', async (request, reply) => {
        const { scheduleId, amountUsdt } = request.body as any;

        if (!scheduleId || !amountUsdt) {
            return reply.status(400).send({ error: 'scheduleId and amountUsdt are required' });
        }

        const depositAddress = process.env.STARTBUTTON_USDT_DEPOSIT_ADDRESS;
        if (!depositAddress) {
            return reply.status(500).send({ error: 'STARTBUTTON_USDT_DEPOSIT_ADDRESS is not configured' });
        }

        try {
            const [schedule] = await db.select().from(payrollSchedules)
                .where(eq(payrollSchedules.id, scheduleId) as any).limit(1);
            if (!schedule) {
                return reply.status(404).send({ error: 'Schedule not found' });
            }

            const vaultIndex = schedule.vaultIndex || 0;
            const network = schedule.network || 'bsc';
            const seed = await WdkSecretManager.getSeed();
            const wdk = new WdkService(seed);

            let txHash: string;
            if (process.env.MOCK_PAYOUT === 'true') {
                txHash = `0xmock_deposit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
                console.log(`[Deposit] MOCK_PAYOUT active. Fake deposit of ${amountUsdt} USDT to ${depositAddress} on ${network}. Tx: ${txHash}`);
            } else {
                txHash = await wdk.sendUsdt(vaultIndex, depositAddress, amountUsdt, toWdkNetwork(network));
            }

            return { success: true, txHash, destination: depositAddress, network };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({ error: `Deposit failed: ${error.message}` });
        }
    });

    /**
     * Get recipients linked to a specific schedule.
     */
    fastify.get('/schedules/:id/recipients', async (request, reply) => {
        const { id } = request.params as any;

        try {
            const links = await db.select({
                id: scheduleRecipients.id,
                staffId: scheduleRecipients.staffId,
                recipientId: scheduleRecipients.recipientId,
                amountOverride: scheduleRecipients.amountOverride,
                staffName: staffDirectory.name,
                staffSalary: staffDirectory.basicSalary,
                staffAllowances: staffDirectory.allowances,
                staffDeductions: staffDirectory.deductions,
                staffCurrency: staffDirectory.currency,
                recipientName: recipientDirectory.name,
                recipientAmount: recipientDirectory.amount,
                recipientCurrency: recipientDirectory.currency,
                recipientType: recipientDirectory.type
            })
                .from(scheduleRecipients)
                // @ts-ignore
                .leftJoin(staffDirectory, eq(scheduleRecipients.staffId, staffDirectory.id))
                // @ts-ignore
                .leftJoin(recipientDirectory, eq(scheduleRecipients.recipientId, recipientDirectory.id))
                .where(eq(scheduleRecipients.scheduleId, id) as any);

            const decoded = links.map(l => {
                const isStaff = !!l.staffId;
                let baseAmount = "0";
                let currency = "NGN";

                if (isStaff) {
                    baseAmount = String(Number(l.staffSalary || 0) + Number(l.staffAllowances || 0) - Number(l.staffDeductions || 0));
                    currency = l.staffCurrency || "NGN";
                } else {
                    baseAmount = l.recipientAmount || "0";
                    currency = l.recipientCurrency || "NGN";
                }

                return {
                    id: l.id,
                    staffId: l.staffId,
                    recipientId: l.recipientId,
                    name: isStaff ? l.staffName : l.recipientName,
                    staffName: l.staffName,
                    recipientName: l.recipientName,
                    amount: l.amountOverride && Number(l.amountOverride) > 0 ? l.amountOverride : baseAmount,
                    currency,
                    type: isStaff ? 'STAFF' : l.recipientType
                };
            });

            return { success: true, data: decoded };
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
        }
    });

    /**
     * Link recipients to a schedule.
     */
    fastify.post('/schedules/:id/links', async (request, reply) => {
        const { id } = request.params as any;
        const { items } = request.body as { items: Array<{ staffId?: string; recipientId?: string; amountOverride?: string }> };

        if (!items || !Array.isArray(items)) {
            return reply.status(400).send({ error: 'items array is required' });
        }

        try {
            const values = items.map(item => ({
                id: uuidv4(),
                scheduleId: id,
                staffId: item.staffId,
                recipientId: item.recipientId,
                amountOverride: item.amountOverride || '0',
                isActive: true,
                updatedAt: new Date().toISOString()
            }));

            await db.insert(scheduleRecipients).values(values);
            return { success: true };
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
        }
    });

    /**
     * Remove a recipient link from a schedule.
     */
    fastify.delete('/schedules/:id/links/:linkId', async (request, reply) => {
        const { linkId } = request.params as any;

        try {
            await db.delete(scheduleRecipients)
                .where(eq(scheduleRecipients.id, linkId) as any);
            return { success: true };
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
        }
    });

    /**
     * Delete a schedule and all its links/batches.
     */
    fastify.delete('/schedules/:id', async (request, reply) => {
        const { id } = request.params as any;

        try {
            // Note: Cascade deletes should handle batches and links if set up in schema.
            // But we can be explicit if needed.
            await db.delete(payrollSchedules).where(eq(payrollSchedules.id, id) as any);
            return { success: true };
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
        }
    });

    /**
     * Update a batch (status, amounts, etc.).
     */
    fastify.patch('/batches/:id', async (request, reply) => {
        const { id } = request.params as any;
        const body = request.body as any;

        await db.update(payrollBatches)
            .set({ ...body, updatedAt: new Date().toISOString() })
            .where(eq(payrollBatches.id, id) as any);

        return { success: true };
    });

    /**
     * Update a single recipient status/metadata in a batch.
     * Prevents race conditions when multiple recipients are processed in parallel.
     */
    fastify.patch('/batches/:id/recipients/:index', async (request, reply) => {
        const { id, index } = request.params as any;
        const body = request.body as any;
        const idx = parseInt(index);

        return await db.transaction(async (tx) => {
            const [batch] = await tx.select().from(payrollBatches).where(eq(payrollBatches.id, id) as any).limit(1);
            if (!batch) return reply.status(404).send({ error: 'Batch not found' });
            
            const recipients = [...(batch.recipients as any[])];
            if (recipients[idx]) {
                recipients[idx] = { ...recipients[idx], ...body };
            }
            
            await tx.update(payrollBatches)
                .set({ recipients, updatedAt: new Date().toISOString() })
                .where(eq(payrollBatches.id, id) as any);
                
            return { success: true };
        });
    });


    /**
     * Specialized Decision Log for the Agent's audit trail.
     */
    fastify.post('/agent/decision', async (request, reply) => {
        const { batchId, scheduleId, decisionType, reasoning, plan, inputData } = request.body as any;

        const decisionId = uuidv4();
        await db.insert(payrollAgentDecisions).values({
            id: decisionId,
            batchId,
            scheduleId,
            decisionType,
            reasoning,
            plan,
            inputData,
            updatedAt: new Date().toISOString()
        } as any);

        return { id: decisionId, success: true };
    });

    /**
     * Send a notification (email) to the business owner.
     */
    fastify.post('/notifications', async (request, reply) => {
        const { businessId, type, message, batchId, vaultAddress } = request.body as any;

        // Send real email to business owner
        const { sendPayrollNotification } = await import('../services/email-service.js');
        const sent = await sendPayrollNotification(businessId, type, message, batchId, vaultAddress);

        if (batchId) {
            await db.insert(payrollAgentDecisions).values({
                id: uuidv4(),
                batchId,
                decisionType: 'NOTIFICATION',
                reasoning: `Agent sent ${type} notification: ${message} (email ${sent ? 'delivered' : 'skipped'})`,
                updatedAt: new Date().toISOString()
            });
        }

        return { success: true, emailSent: sent };
    });

    /**
     * Get the status of a specific batch and the Agent's reasoning.
     */
    fastify.get('/batches/:id', async (request, reply) => {
        const { id } = request.params as any;

        try {
            const [batch] = await db.select({
                batch: payrollBatches,
                vaultBalanceUsdt: payrollSchedules.vaultBalanceUsdt,
                vaultAddress: payrollSchedules.vaultAddress,
                network: payrollSchedules.network
            })
                .from(payrollBatches)
                .leftJoin(payrollSchedules, eq(payrollBatches.scheduleId, payrollSchedules.id))
                .where(eq(payrollBatches.id, id) as any)
                .limit(1);

            if (!batch) {
                return reply.status(404).send({ error: 'Batch not found' });
            }

            const [decision] = await db.select()
                .from(payrollAgentDecisions)
                .where(eq(payrollAgentDecisions.batchId, id) as any)
                .orderBy(desc(payrollAgentDecisions.updatedAt))
                .limit(1);

            return {
                ...batch.batch,
                vaultBalanceUsdt: batch.vaultBalanceUsdt,
                vaultAddress: batch.vaultAddress,
                network: batch.network,
                reasoning: decision?.reasoning || 'Agent is still processing...',
                agentThoughts: decision?.reasoning
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({ error: error.message });
        }
    });

    /**
     * Kickoff an existing batch for AI evaluation or create a first batch for a schedule.
     * Centralized authority for Batch Creation.
     */
    fastify.post('/kickoff', async (request, reply) => {
        const { batchId, scheduleId, forceAction, recipients, totalAmountFiat } = request.body as any;

        if (!scheduleId) {
            return reply.status(400).send({ error: 'scheduleId is required' });
        }

        try {
            const result = await db.transaction(async (tx) => {
                const [schedule] = await tx.select().from(payrollSchedules).where(eq(payrollSchedules.id, scheduleId) as any).limit(1);
                if (!schedule) throw new Error('Schedule not found');

                // If vault is still 'pending', the Agent MUST derive it first at the SCHEDULE level.
                // We do NOT create a batch until the vault is ready.
                if (schedule.vaultAddress === 'pending') {
                    console.log(`[Kickoff] 🛡️ Schedule ${scheduleId} is pending vault. Kicking off EVALUATE_SCHEDULE.`);
                    return { batchId: null, jobType: 'EVALUATE_SCHEDULE' };
                }

                // If batchId is missing OR matches scheduleId, we are handling a first-time or recurring run
                let targetBatchId = batchId;
                let jobType = 'EVALUATE_FUNDING';

                if (!batchId || batchId === scheduleId) {
                    // Check if an active batch already exists to prevent duplicate creation
                    const activeStatuses = ['PENDING', 'PROCESSING', 'FUNDING_REQUIRED', 'FUNDED'];
                    const [existingActive] = await tx.select().from(payrollBatches)
                        .where(
                            and(
                                eq(payrollBatches.scheduleId, scheduleId) as any,
                                sql`${payrollBatches.status} IN (${sql.join(activeStatuses.map(s => sql`${s}`), sql`, `)})` as any
                            )
                        )
                        .orderBy(desc(payrollBatches.createdAt))
                        .limit(1);

                    if (existingActive) {
                        console.log(`[Kickoff] Idempotent: Using existing active batch ${existingActive.id} for schedule ${scheduleId}`);
                        targetBatchId = existingActive.id;
                    } else {
                        // Create a brand new batch autonomously
                        targetBatchId = uuidv4();
                        console.log(`[Kickoff] 🆕 Creating first batch ${targetBatchId} for schedule ${scheduleId}`);

                        await tx.insert(payrollBatches).values({
                            id: targetBatchId,
                            scheduleId: scheduleId,
                            status: 'PENDING',
                            totalAmountFiat: String(totalAmountFiat || 0),
                            totalAmountUsdt: "0",
                            currency: schedule.category === 'SALARY' ? 'NGN' : 'GHS',
                            recipientCount: recipients?.length || 0,
                            recipients: recipients || [],
                            updatedAt: new Date().toISOString()
                        });
                        jobType = 'EVALUATE_FUNDING';
                    }
                } else {
                    // Specific Batch Kickoff
                    const [batch] = await tx.select().from(payrollBatches).where(eq(payrollBatches.id, batchId) as any).limit(1);
                    if (!batch) throw new Error('Batch not found');

                    if (forceAction === 'PAYOUT') jobType = 'EXECUTE_PAYOUT';
                    else if (forceAction === 'EVALUATE') jobType = 'EVALUATE_FUNDING';
                    else if (['FUNDED', 'PROCESSING'].includes(batch.status)) jobType = 'EXECUTE_PAYOUT';
                }

                return { batchId: targetBatchId, jobType };
            });

            // 2. Queue the job for the AI Agent (outside transaction)
            const job = await payrollQueue.add('PROCESS_BATCH', {
                scheduleId,
                batchId: result.batchId,
                type: result.jobType,
            });

            fastify.log.info(`[Kickoff] Job ${job.id} (${result.jobType}) queued for batch ${result.batchId}`);

            return {
                success: true,
                batchId: result.batchId,
                message: `Agent ${result.jobType} initiated`,
                jobId: job.id
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(error.message.includes('not found') ? 404 : 500).send({ error: error.message });
        }
    });

    /**
     * Update a payroll schedule directly.
     */
    fastify.patch('/schedules/:id', async (request, reply) => {
        const { id } = request.params as any;
        const body = request.body as any;

        try {
            await db.update(payrollSchedules)
                .set({ ...body, updatedAt: new Date().toISOString() })
                .where(eq(payrollSchedules.id, id) as any);
            return { success: true };
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
        }
    });

    /**
     * Retry a failed or stuck batch by resetting status.
     */
    fastify.post('/batches/:id/retry', async (request, reply) => {
        const { id } = request.params as any;
        const [batch] = await db.select().from(payrollBatches).where(eq(payrollBatches.id, id) as any).limit(1);
        if (!batch) return reply.status(404).send({ error: 'Batch not found' });

        // Reset status to PENDING or FUNDING_REQUIRED
        const nextStatus = batch.status === 'FAILED' ? 'PENDING' : batch.status;

        await db.update(payrollBatches)
            .set({
                status: nextStatus,
                errorLog: null,
                updatedAt: new Date().toISOString()
            })
            .where(eq(payrollBatches.id, id) as any);

        return { success: true };
    });

    /**
     * Final payout execution. Called by the Agent Brain.
     */
    fastify.post('/batches/:id/payout', async (request, reply) => {
        const { id } = request.params as any;

        const [batch] = await db.select().from(payrollBatches).where(eq(payrollBatches.id, id) as any).limit(1);
        if (!batch) return reply.status(404).send({ error: 'Batch not found' });

        const [schedule] = await db.select().from(payrollSchedules).where(eq(payrollSchedules.id, batch.scheduleId) as any).limit(1);
        if (!schedule) return reply.status(404).send({ error: 'Schedule not found' });

        const recipients = batch.recipients as any[];
        if (!recipients || recipients.length === 0) {
            return reply.status(400).send({ error: 'No recipients found in batch' });
        }

        try {
            fastify.log.info(`[Payout] Starting execution for Batch ${id} (${recipients.length} recipients) on ${schedule.network}...`);

            const seed = await WdkSecretManager.getSeed();
            const wdk = new WdkService(seed);
            const vaultIndex = schedule.vaultIndex || 0;
            const network = schedule.network || 'bsc';

            const txHashes: string[] = [];

            for (const recipient of recipients) {
                let txHash: string;
                if (process.env.APA_SIMULATION === 'true') {
                    txHash = `0xmock_tx_hash_${id.slice(0, 8)}_${Math.random().toString(36).substring(7)}`;
                    console.log(`[Payout] APA_SIMULATION active. Generating fake hash: ${txHash}`);
                } else {
                    txHash = await wdk.sendUsdt(vaultIndex, recipient.address, recipient.amountUsdt || recipient.amount, network);
                }
                txHashes.push(txHash);
                fastify.log.info(`[Payout] Sent to ${recipient.address}: ${txHash}`);
            }

            await db.update(payrollBatches)
                .set({
                    status: 'COMPLETED' as any,
                    executedAt: new Date().toISOString()
                })
                .where(eq(payrollBatches.id, id) as any);

            await db.insert(payrollAgentDecisions).values({
                id: uuidv4(),
                batchId: id,
                decisionType: 'EXECUTION',
                reasoning: `Agent successfully executed payouts to ${recipients.length} recipients. Transactions: ${txHashes.join(', ')}`,
                updatedAt: new Date().toISOString()
            });

            return { success: true, message: 'Payout completed', txHashes };
        } catch (err: any) {
            fastify.log.error(`[Payout] Execution failed for Batch ${id}: ${err.message}`);

            await db.update(payrollBatches)
                .set({ status: 'FAILED' as any, errorLog: err.message, updatedAt: new Date().toISOString() })
                .where(eq(payrollBatches.id, id) as any);

            return reply.status(500).send({ error: `Payout failed: ${err.message}` });
        }
    });

    /**
     * Fiat Payout (Startbutton) for a single recipient.
     * Called by the Agent Brain for each recipient in a batch.
     */
    fastify.post('/batches/:id/fiat-transfer', async (request, reply) => {
        const { id } = request.params as any;
        const { recipientIndex, reference } = request.body as any;

        if (recipientIndex === undefined) {
            return reply.status(400).send({ error: 'recipientIndex is required' });
        }

        const [batch] = await db.select().from(payrollBatches).where(eq(payrollBatches.id, id) as any).limit(1);
        if (!batch) return reply.status(404).send({ error: 'Batch not found' });

        const recipients = batch.recipients as any[];
        const recipient = recipients[recipientIndex];

        if (!recipient) {
            return reply.status(404).send({ error: 'Recipient not found at index' });
        }

        // Idempotency: skip if already processing or completed
        if (recipient.status === 'PROCESSING' || recipient.status === 'COMPLETED') {
            return { success: true, message: 'Already processed', status: recipient.status };
        }

        try {
            let result: any;
            if (process.env.APA_SIMULATION === 'true') {
                result = {
                    success: true,
                    data: {
                        id: `mock_sb_id_${Math.random().toString(36).substring(7)}`,
                        reference: reference || `mock_sb_ref_${Date.now()}`
                    }
                };
                console.log(`[Fiat-Payout] APA_SIMULATION active. Returning fake Startbutton result.`);
            } else {
                result = await StartbuttonService.initiateTransfer({
                    amount: recipient.amount,
                    currency: recipient.currency,
                    country: recipient.country || 'Nigeria', // Fallback or extracted from CSV
                    bankCode: recipient.bankCode,
                    accountNumber: recipient.accountNumber,
                    MNO: recipient.MNO,
                    msisdn: recipient.msisdn,
                    reference: reference || `pay_${id.slice(0, 8)}_${recipientIndex}_${Date.now()}`
                });
            }

            // Update recipient status in the JSON array based on bridge response
            recipient.status = result.data?.status === 'SUCCESS' ? 'SUCCESS' : 'PROCESSING';
            recipient.transferId = result.data?.id || 'pending';
            recipient.sbReference = result.data?.reference || '';

            await db.update(payrollBatches)
                .set({ recipients: recipients, updatedAt: new Date().toISOString() })
                .where(eq(payrollBatches.id, id) as any);

            return { success: true, result };
        } catch (err: any) {
            fastify.log.error(`[Fiat-Payout] Failed for ${recipient.name}: ${err.message}`);
            recipient.status = 'FAILED';
            recipient.error = err.message;

            await db.update(payrollBatches)
                .set({ recipients: recipients, updatedAt: new Date().toISOString() })
                .where(eq(payrollBatches.id, id) as any);

            return reply.status(500).send({ error: err.message });
        }
    });

    /**
     * SSE Stream for Agent Thoughts.
     */
    fastify.get('/schedules/:id/thoughts', async (request, reply) => {
        const { id } = request.params as { id: string };

        const onThought = (thought: any) => {
            if (thought.scheduleId === id) {
                reply.sse({
                    event: 'thought',
                    data: JSON.stringify(thought)
                });
            }
        };

        // Initialize the stream with a connection message to keep it open
        reply.sse({ event: 'connected', data: JSON.stringify({ status: 'connected', scheduleId: id }) });

        thoughtEmitter.on('thought', onThought);

        request.raw.on('close', () => {
            thoughtEmitter.removeListener('thought', onThought);
        });
    });

    /**
     * Debug helper to emit a manual thought for UI testing.
     */
    fastify.post('/debug/emit', async (request, reply) => {
        const { scheduleId, message, type } = request.body as any;
        if (!scheduleId || !message) return reply.status(400).send({ error: 'scheduleId and message are required' });

        thoughtEmitter.emit('thought', {
            scheduleId,
            batchId: 'debug-batch',
            type: type || 'INFO',
            message
        });

        return { success: true };
    });
}
