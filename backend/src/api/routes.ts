import { FastifyInstance } from 'fastify';
import { db, schema } from '../../../database/rayswap-db/src/index';
import { payrollQueue } from '../workers/scheduler';
import { v4 as uuidv4 } from 'uuid';
import { eq, desc, and } from 'drizzle-orm';
import { FxService } from '../services/fx-service';
import { WdkService } from '../integrations/wdk';
import { WdkSecretManager } from '../integrations/secret-manager';

const { payrollSchedules, payrollBatches, payrollAgentDecisions } = schema;

// Map user-facing network names to WDK wallet manager network
function toWdkNetwork(network: string): string {
    const net = network.toLowerCase();
    if (['tron', 'bsc', 'polygon', 'arbitrum', 'base', 'optimism', 'ethereum'].includes(net)) {
        return net;
    }
    return 'ethereum';
}

// Basic Auth Middleware
const authMiddleware = async (request: any, reply: any) => {
    const apiKey = request.headers['x-api-key'];
    const validKey = process.env.KUVARPAY_API_KEY || 'apa_local_test_key';

    if (!apiKey || apiKey !== validKey) {
        return reply.status(401).send({ error: 'Unauthorized: Invalid API Key' });
    }
};

export default async function payrollRoutes(fastify: FastifyInstance) {

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
     * Create a new Payroll Schedule.
     */
    fastify.post('/schedules', async (request, reply) => {
        const body = request.body as any;
        const scheduleId = uuidv4();
        const network = body.network || 'bsc';

        // Determine vault index: count existing schedules for this business
        const existing = await db.select().from(payrollSchedules)
            .where(eq(payrollSchedules.businessId, body.businessId));
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
            .where(eq(payrollSchedules.businessId, businessId))
            .orderBy(desc(payrollSchedules.createdAt));

        return schedules;
    });

    /**
     * List batches for a business (for dashboard history).
     */
    fastify.get('/batches', async (request, reply) => {
        const { businessId } = request.query as any;
        if (!businessId) return reply.status(400).send({ error: 'businessId is required' });

        const scheduleIds = await db.select({ id: payrollSchedules.id })
            .from(payrollSchedules)
            .where(eq(payrollSchedules.businessId, businessId));

        if (scheduleIds.length === 0) return [];

        const allBatches = [];
        for (const s of scheduleIds) {
            const batches = await db.select().from(payrollBatches)
                .where(eq(payrollBatches.scheduleId, s.id))
                .orderBy(desc(payrollBatches.createdAt));

            for (const batch of batches) {
                const [decision] = await db.select()
                    .from(payrollAgentDecisions)
                    .where(eq(payrollAgentDecisions.batchId, batch.id))
                    .orderBy(desc(payrollAgentDecisions.createdAt))
                    .limit(1);

                allBatches.push({
                    ...batch,
                    reasoning: decision?.reasoning,
                    plan: decision?.plan
                });
            }
        }

        return allBatches;
    });

    /**
     * Submit parsed payroll data (JSON) to trigger a new batch.
     */
    fastify.post('/schedules/:id/submit', async (request, reply) => {
        const { id } = request.params as any;
        const body = request.body as any;
        const { recipients, totalAmountFiat, currency, businessId, network } = body;

        if (!recipients || !Array.isArray(recipients)) {
            return reply.status(400).send({ error: 'Recipients array is required' });
        }

        // 1. Verify schedule exists and update network
        const [schedule] = await db.select().from(payrollSchedules).where(eq(payrollSchedules.id, id)).limit(1);
        if (!schedule) {
            return reply.status(404).send({ error: 'Schedule not found' });
        }

        if (network) {
            await db.update(payrollSchedules).set({ network }).where(eq(payrollSchedules.id, id));
        }

        const batchId = uuidv4();

        // 2. Create the batch record with the JSON recipients
        await db.insert(payrollBatches).values({
            id: batchId,
            scheduleId: id,
            status: 'PENDING',
            totalAmountFiat: String(totalAmountFiat || 0),
            totalAmountUsdt: "0", // Will be updated by agent
            currency: currency || 'NGN',
            recipientCount: recipients.length,
            recipients: recipients,
            updatedAt: new Date().toISOString()
        });

        // 3. Queue the EVALUATION job for the AI Agent
        await payrollQueue.add('EVALUATE_BATCH', {
            scheduleId: id,
            batchId,
            type: 'EVALUATE_FUNDING',
            agentPrompt: body.agentPrompt // Optional custom instructions
        });

        return {
            batchId,
            status: 'PROCESSING',
            message: 'AI Agent is now evaluating the payroll batch and funding requirements.'
        };
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
                .where(eq(payrollSchedules.id, scheduleId)).limit(1);
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

            const balanceUsdt = Number(primaryBalance) / 1e6;

            // Save to schedule if requested
            if (saveToSchedule && primaryAddress !== schedule.vaultAddress) {
                await db.update(payrollSchedules)
                    .set({ vaultAddress: primaryAddress, network, updatedAt: new Date().toISOString() })
                    .where(eq(payrollSchedules.id, scheduleId));
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
     * Update a schedule (e.g., set vault address).
     */
    fastify.patch('/schedules/:id', async (request, reply) => {
        const { id } = request.params as any;
        const body = request.body as any;

        await db.update(payrollSchedules)
            .set({ ...body, updatedAt: new Date().toISOString() })
            .where(eq(payrollSchedules.id, id));

        return { success: true };
    });

    /**
     * Update a batch (status, amounts, etc.).
     */
    fastify.patch('/batches/:id', async (request, reply) => {
        const { id } = request.params as any;
        const body = request.body as any;

        await db.update(payrollBatches)
            .set({ ...body, updatedAt: new Date().toISOString() })
            .where(eq(payrollBatches.id, id));

        return { success: true };
    });

    /**
     * Specialized Decision Log for the Agent's audit trail.
     */
    fastify.post('/agent/decision', async (request, reply) => {
        const { batchId, decisionType, reasoning, plan, inputData } = request.body as any;

        const decisionId = uuidv4();
        await db.insert(payrollAgentDecisions).values({
            id: decisionId,
            batchId,
            decisionType,
            reasoning,
            plan,
            inputData,
            updatedAt: new Date().toISOString()
        });

        return { id: decisionId, success: true };
    });

    /**
     * Send a notification (email) to the business owner.
     */
    fastify.post('/notifications', async (request, reply) => {
        const { businessId, type, message, batchId } = request.body as any;

        // Send real email to business owner
        const { sendPayrollNotification } = await import('../services/email-service');
        const sent = await sendPayrollNotification(businessId, type, message, batchId);

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
            const [batch] = await db.select().from(payrollBatches).where(eq(payrollBatches.id, id)).limit(1);
            if (!batch) {
                return reply.status(404).send({ error: 'Batch not found' });
            }

            const [decision] = await db.select()
                .from(payrollAgentDecisions)
                .where(eq(payrollAgentDecisions.batchId, id))
                .orderBy(desc(payrollAgentDecisions.createdAt))
                .limit(1);

            return {
                ...batch,
                reasoning: decision?.reasoning || 'Agent is still processing...',
                agentThoughts: decision?.reasoning
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    /**
         * Kickoff an existing batch for AI evaluation.
         * This is called by the Merchant Dashboard after it handles DB entry.
         */
    fastify.post('/kickoff', async (request, reply) => {
        const { batchId, scheduleId } = request.body as { batchId: string; scheduleId: string };

        if (!batchId || !scheduleId) {
            return reply.status(400).send({ error: 'batchId and scheduleId are required' });
        }

        // 1. Verify existence in DB (shared)
        const [batch] = await db.select().from(payrollBatches).where(eq(payrollBatches.id, batchId)).limit(1);
        if (!batch) {
            return reply.status(404).send({ error: 'Batch not found' });
        }

        // 2. Queue the EVALUATION job for the AI Agent
        await payrollQueue.add('EVALUATE_BATCH', {
            scheduleId,
            batchId,
            type: 'EVALUATE_FUNDING',
        });

        return {
            batchId,
            status: 'PROCESSING',
            message: 'AI Agent is now processing the kickoff signal.'
        };
    });

    /**
     * Final payout execution. Called by the Agent Brain.
     */
    fastify.post('/batches/:id/payout', async (request, reply) => {
        const { id } = request.params as any;

        const [batch] = await db.select().from(payrollBatches).where(eq(payrollBatches.id, id)).limit(1);
        if (!batch) return reply.status(404).send({ error: 'Batch not found' });

        const [schedule] = await db.select().from(payrollSchedules).where(eq(payrollSchedules.id, batch.scheduleId)).limit(1);
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

            // Execute transfers one by one
            for (const recipient of recipients) {
                const txHash = await wdk.sendUsdt(vaultIndex, recipient.address, recipient.amountUsdt || recipient.amount, network);
                txHashes.push(txHash);
                fastify.log.info(`[Payout] Sent to ${recipient.address}: ${txHash}`);
            }

            await db.update(payrollBatches)
                .set({ 
                    status: 'COMPLETED' as any, 
                    executedAt: new Date().toISOString()
                })
                .where(eq(payrollBatches.id, id));

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
                .where(eq(payrollBatches.id, id));

            return reply.status(500).send({ error: `Payout failed: ${err.message}` });
        }
    });
}
