import { Queue, Worker, Job } from 'bullmq';
import { db, schema, eq, and, sql, desc } from 'rayswap-db';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { emitThought } from '../utils/thought-emitter';

const { payrollBatches, payrollSchedules, payrollAgentDecisions } = schema;

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const OPENCLAW_URL = process.env.OPENCLAW_URL || 'http://apa-agent:8000';
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || '45575214285178078e4e65046cc363065ba63e82f19c7028';

export const payrollQueue = new Queue('payroll-processing', {
    connection: { url: REDIS_URL }
});

export const emailQueue = new Queue('email-notifications', {
    connection: { url: REDIS_URL }
});

// ─── Wait for OpenClaw agent to be ready (retry up to 60s) ────────────────
async function waitForAgent(maxWaitMs = 60000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
        try {
            await axios.get(`${OPENCLAW_URL}/healthz`, { timeout: 3000 });
            return; // healthy
        } catch {
            console.log('[Worker] Waiting for apa-agent to be ready...');
            await new Promise(r => setTimeout(r, 3000));
        }
    }
    throw new Error('apa-agent did not become ready in time');
}

// ─── Build the instructions for OpenClaw based on job type ──────────────
function buildInstructions(jobType: string, scheduleId: string): string {
    const isExecution = jobType === 'EXECUTE_PAYOUT';

    if (isExecution) {
        return `You are the execution brain of the Autonomous Payroll Agent (APA).
Your mission is to process fiat payouts for a FUNDED payroll batch using Startbutton.
1. Call 'apa_get_schedule_details' to check the parent schedule's configuration (network, vault).
2. Call 'apa_get_batch_details' to verify the recipients list and calculate total USDT needed.
3. Call 'apa_manage_wallet' to check that the vault actually has enough USDT balance.
4. If fiat payouts are required:
   - Call 'apa_deposit_to_startbutton' to transfer the total required USDT from vault to Startbutton partner account.
   - Use 'apa_get_startbutton_balance' to verify the funds have arrived.
5. Once confirmed:
   - For EACH recipient in the batch recipients list requiring fiat payout (bank or mobile money):
     - Call 'apa_fiat_transfer' with the 'batchId' and 'recipientIndex'.
   - If USDT on-chain payouts are required (STAFF or VENDOR with addresses):
     - Call 'apa_payout' with the 'batchId' and 'recipientIndex'.
6. After all transfers, call 'apa_update_batch' to set status to 'COMPLETED'.
7. Call 'apa_log_decision' (batchId required here) and 'apa_send_notification'.

CORE RULES:
- Never initiate transfers if vault balance is insufficient.
- Startbutton requires bank details. Skip and log if missing.
- Iterate carefully using recipient index.`;
    }

    if (jobType === 'EVALUATE_SCHEDULE') {
        return `You are the pre-evaluation brain of the Autonomous Payroll Agent (APA).
Your mission is to perform a pre-check on a payroll SCHEDULE before its first batch is finalized.
CRITICAL: There is NO batch yet. Do NOT ask for a Batch ID and do NOT call 'apa_get_batch_details'.
1. Call 'apa_get_schedule_details' to see current setup (ID: ${scheduleId}).
2. Call 'apa_get_schedule_recipients' to get the list of active recipients linked to this schedule.
3. For each fiat currency in the recipient list, call 'apa_get_rates' for USDT equivalent.
4. Calculate total USDT required + 5% buffer.
5. SAVE the estimate: Call 'apa_update_schedule' (scheduleId: ${scheduleId}) and set 'metadata' with { "estimatedUsdt": [amount] }.
6. If the schedule has no vault address:
   - Call 'apa_manage_wallet' (saveToSchedule=true) to derive the vault address.
7. FORMAT: You MUST end your thoughts with precisely this format: "Estimated Funding: [amount] USDT".
   Mention the Vault Address clearly as your final outcome.`;
    }

    return `You are the evaluation and setup brain of the Autonomous Payroll Agent (APA).
Your mission is to analyze a payroll batch and ensure the parent schedule is correctly configured.
1. Call 'apa_get_schedule_details' to see the current schedule setup (ID: ${scheduleId}).
2. Call 'apa_get_batch_details' to get recipients and fiat amounts.
3. For each unique fiat currency, call 'apa_get_rates' for USDT equivalent.
4. Calculate total USDT required + 5% buffer.
5. Vault Check: If the schedule ALREADY has a 'vaultAddress', DO NOT call 'apa_manage_wallet'. If it is missing, call 'apa_manage_wallet' (saveToSchedule=true) to derive it.
6. Transition status:
   - Set batch status to 'FUNDING_REQUIRED' and set 'totalAmountUsdt' to the calculated amount (with buffer).
7. Call 'apa_log_decision' and 'apa_send_notification'.

CORE RULES:
- Always use the 5% buffer.
- PRE-EVALUATION MODE (Step 3 Review): If this is a pre-evaluation run, your job is ONLY to provide the estimate and ensure a vault address is derived. Do NOT proceed to execution.
- FORMAT: You MUST end your thoughts with precisely this format: "Total USDT needed: [amount] USDT" so the UI can parse it. Summarize the Vault Address as well.`;
}

// ─── Map user-friendly tool-call names to human-readable messages ───────
function toolCallMessage(fnName: string): string {
    switch (fnName) {
        case 'apa_get_rates': return 'Fetching latest FX rates...';
        case 'apa_get_batch_details': return 'Retrieving batch & recipient info...';
        case 'apa_manage_wallet': return 'Deriving vault address & checking balances...';
        case 'apa_update_batch': return 'Syncing status to database...';
        case 'apa_log_decision': return 'Finalizing evaluation logic...';
        case 'apa_send_notification': return 'Notifying merchant...';
        case 'apa_fiat_transfer': return 'Broadcasting fiat payout to recipient...';
        case 'apa_deposit_to_startbutton': return 'Depositing USDT to payment bridge...';
        case 'apa_get_startbutton_balance': return 'Verifying bridge balance...';
        case 'apa_payout': return 'Broadcasting on-chain payout...';
        case 'apa_get_schedule_details': return 'Fetching schedule configuration...';
        case 'apa_get_schedule_recipients': return 'Fetching directory amounts & FX context...';
        default: return `Executing ${fnName}...`;
    }
}

// ─── Send request to OpenClaw Gateway's /v1/responses endpoint with SSE streaming ──
async function runAgentViaOpenClaw(
    batchId: string | null, 
    scheduleId: string, 
    jobType: string, 
    network: string, 
    agentPrompt?: string
): Promise<string> {
    const isExecution = jobType === 'EXECUTE_PAYOUT';
    const isScheduleOnly = jobType === 'EVALUATE_SCHEDULE';

    emitThought({
        scheduleId,
        batchId: batchId || undefined,
        type: 'INFO',
        message: `Agent Brain initialized via OpenClaw for ${jobType}. Starting evaluation cycle...`
    });

    const instructions = buildInstructions(jobType, scheduleId);

    const userMessage = isExecution
        ? `Funds have been detected! Please execute the payout for:
- Batch ID: ${batchId}
- Schedule ID: ${scheduleId}`
        : isScheduleOnly 
            ? `Please perform a pre-check evaluation for Schedule ID: ${scheduleId}. We need an FX estimate and a Vault address.`
            : `Please evaluate the following for funding requirements:
- Batch ID: ${batchId}
- Schedule ID: ${scheduleId}
- Selected Network: ${network}
${agentPrompt ? `- User Instructions: ${agentPrompt}` : ''}`;

    // Use OpenClaw's OpenResponses API with SSE streaming
    const response = await axios.post(
        `${OPENCLAW_URL}/v1/responses`,
        {
            model: 'openclaw:main',
            input: userMessage,
            instructions,
            stream: true,
            user: `apa-worker-${scheduleId}`
        },
        {
            headers: {
                'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream'
            },
            responseType: 'stream',
            timeout: 300000 // 5 min timeout for long agent runs
        }
    );

    let finalOutput = '';
    let currentToolName = '';
    let textBuffer = ''; // Buffer for accumulating text deltas into complete sentences
    let flushTimer: ReturnType<typeof setTimeout> | null = null;

    const flushTextBuffer = () => {
        if (textBuffer.trim()) {
            emitThought({
                scheduleId,
                batchId: batchId || undefined,
                type: 'INFO',
                message: textBuffer.trim()
            });
            textBuffer = '';
        }
    };

    return new Promise<string>((resolve, reject) => {
        let buffer = '';

        response.data.on('data', (chunk: Buffer) => {
            buffer += chunk.toString();

            // Parse SSE events line by line
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete last line in buffer

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') continue;

                    try {
                        const event = JSON.parse(data);

                        // ── Handle text delta buffering inline (needs closure access) ──
                        if (event.type === 'response.output_text.delta' && event.delta) {
                            console.log(`[OpenClaw] 🤖 ${event.delta.substring(0, 200)}`);
                            finalOutput += event.delta;
                            textBuffer += event.delta;

                            // Reset the flush timer on each new delta
                            if (flushTimer) clearTimeout(flushTimer);

                            // Check for sentence boundaries — avoid splitting on decimals like "38.98"
                            // Matches: ! or ? (always), or . followed by space+uppercase/bullet, or newlines
                            const sentenceEndRegex = /[!?]\s*|\.\s*\n|\.(?=\s+[A-Z*\-•\u2022])|\n\n/g;
                            let lastSentenceEnd = -1;
                            let match;
                            while ((match = sentenceEndRegex.exec(textBuffer)) !== null) {
                                lastSentenceEnd = match.index + match[0].length;
                            }

                            if (lastSentenceEnd > 0) {
                                const completeSentences = textBuffer.substring(0, lastSentenceEnd).trim();
                                textBuffer = textBuffer.substring(lastSentenceEnd);
                                if (completeSentences) {
                                    emitThought({
                                        scheduleId,
                                        batchId: batchId || undefined,
                                        type: 'INFO',
                                        message: completeSentences
                                    });
                                }
                            }

                            // Safety flush: if no sentence boundary arrives within 2s, emit what we have
                            flushTimer = setTimeout(flushTextBuffer, 2000);
                        } else if ((event.type === 'response.thought.delta' || event.type === 'response.thinking.delta' || event.type === 'response.output_thinking.delta') && event.delta) {
                            // Track activity to prevent timeouts
                            // Optionally stream thought to logs
                            console.log(`[OpenClaw] 💭 Thought: ${event.delta}`);
                        } else {
                            // Delegate non-delta events to the handler
                            handleSSEEvent(event, scheduleId, batchId);
                        }

                        if (event.type === 'response.output_text.done') {
                            finalOutput = event.text || finalOutput;
                        }

                        // Track tool calls for thought emissions
                        if (event.type === 'response.output_item.added' && event.item?.type === 'function_call') {
                            // Flush any buffered text before showing tool call
                            if (flushTimer) clearTimeout(flushTimer);
                            flushTextBuffer();

                            currentToolName = event.item.name || '';
                            emitThought({
                                scheduleId,
                                batchId: batchId || undefined,
                                type: 'TOOL',
                                message: toolCallMessage(currentToolName)
                            });
                        }

                        // Agent completed
                        if (event.type === 'response.completed') {
                            if (flushTimer) clearTimeout(flushTimer);
                            flushTextBuffer();
                            emitThought({
                                scheduleId,
                                batchId: batchId || undefined,
                                type: 'SUCCESS',
                                message: 'Payroll optimization cycle complete. Batch status updated.'
                            });
                        }

                        // Agent failed
                        if (event.type === 'response.failed') {
                            if (flushTimer) clearTimeout(flushTimer);
                            flushTextBuffer();
                            const errMsg = event.response?.status_details?.error?.message || 'Agent run failed';
                            emitThought({
                                scheduleId,
                                batchId: batchId || undefined,
                                type: 'ERROR',
                                message: `Agent error: ${errMsg}`
                            });
                        }
                    } catch (parseErr) {
                        // Skip lines that aren't valid JSON
                    }
                }
            }
        });

        response.data.on('end', () => {
            // Flush any remaining buffered text
            if (flushTimer) clearTimeout(flushTimer);
            flushTextBuffer();

            const result = finalOutput || 'Agent completed via OpenClaw.';
            console.log(`[OpenClaw] 🏁 Agent finished: ${result.substring(0, 500)}`);
            resolve(result);
        });

        response.data.on('error', (err: Error) => {
            if (flushTimer) clearTimeout(flushTimer);
            flushTextBuffer();
            console.error('[OpenClaw] Stream error:', err.message);
            reject(err);
        });
    });
}

// ─── Handle individual SSE events from OpenClaw ────────────────────────
function handleSSEEvent(event: any, scheduleId: string, batchId: string | null) {
    switch (event.type) {
        case 'response.output_text.done':
            console.log(`[OpenClaw] ✅ Full text output received (${(event.text || '').length} chars)`);
            break;

        case 'response.output_item.added':
            if (event.item?.type === 'function_call') {
                console.log(`[OpenClaw] 🔧 Tool call: ${event.item.name}`);
            }
            break;

        case 'response.output_item.done':
            if (event.item?.type === 'function_call_output') {
                console.log(`[OpenClaw] ✅ Tool result received`);
            }
            break;

        case 'response.completed':
            console.log(`[OpenClaw] 🏁 Response completed`);
            break;

        case 'response.failed':
            const errMsg = event.response?.status_details?.error?.message || event.error?.message || 'Agent run failed';
            const code = event.response?.status_details?.error?.code || 'TIMEOUT_OR_PROTOCOL_ERROR';
            console.error(`[OpenClaw] ❌ Agent Failed (${code}):`, errMsg);
            emitThought({
                scheduleId,
                batchId: batchId || undefined,
                type: 'ERROR',
                message: `The agent encountered a critical processing error: ${errMsg}`
            });
            break;

        case 'response.done':
            if (event.response?.usage) {
                const { total_tokens, input_tokens, output_tokens } = event.response.usage;
                console.log(`[OpenClaw] 📊 Usage: ${total_tokens} tokens (In: ${input_tokens}, Out: ${output_tokens})`);
            }
            break;

        default:
            // response.created, response.in_progress, etc. — just log
            if (event.type) {
                console.log(`[OpenClaw] ℹ️ ${event.type}`);
            }
            break;
    }
}

// ─── BullMQ Worker — dispatches jobs to OpenClaw ───────────────────────
export const payrollWorker = new Worker('payroll-processing', async (job: Job) => {
    const { scheduleId, batchId, type, agentPrompt } = job.data;
    
    // Fetch schedule to get the selected network
    const [schedule] = await db.select().from(payrollSchedules).where(eq(payrollSchedules.id, scheduleId));
    const network = schedule?.network || 'bsc';

    console.log(`[Worker] 🚀 Dispatching ${type} for Batch ${batchId} (Network: ${network}) to OpenClaw Agent Brain`);
    try {
        await waitForAgent(); // Ensure OpenClaw is healthy before proceeding
        const finalSummary = await runAgentViaOpenClaw(batchId, scheduleId, type, network, agentPrompt);
        console.log(`[Worker] ✅ Agent completed for Batch ${batchId}`);

        // ── Safeguard: if the agent finished but never called apa_update_batch, ──
        // ── parse its text output and apply the status update ourselves.          ──
        if (batchId && (type === 'EVALUATE_FUNDING' || type === 'EVALUATE_BATCH')) {
            const [currentBatch] = await db.select().from(payrollBatches).where(eq(payrollBatches.id, batchId));
            if (currentBatch?.status === 'PENDING') {
                console.warn(`[Worker] ⚠️ Batch ${batchId} still PENDING after agent run. Applying fallback update.`);

                // Try to extract USDT amount from the agent's text (e.g. "Total USDT needed: 61.78 USDT")
                const match = finalSummary.match(/(?:Total USDT needed|total.*?USDT(?:\s+needed)?)[:\s]+([0-9]+\.?[0-9]*)/i);
                const parsedUsdt = match ? parseFloat(match[1]).toFixed(8) : '0.00000000';

                await db.update(payrollBatches)
                    .set({ status: 'FUNDING_REQUIRED' as any, totalAmountUsdt: parsedUsdt, updatedAt: new Date().toISOString() })
                    .where(eq(payrollBatches.id, batchId));

                await db.insert(payrollAgentDecisions).values({
                    id: uuidv4(),
                    batchId,
                    decisionType: 'EVALUATION',
                    reasoning: finalSummary,
                    updatedAt: new Date().toISOString()
                });

                console.log(`[Worker] ✅ Fallback applied: status=FUNDING_REQUIRED, totalAmountUsdt=${parsedUsdt}`);
            }
        }

        return { summary: finalSummary };
    } catch (error: any) {
        console.error(`[Worker] ❌ Agent error for ${batchId ? `Batch ${batchId}` : `Schedule ${scheduleId}`}:`, error.message);
        try {
            if (batchId) {
                await db.insert(payrollAgentDecisions).values({
                    id: uuidv4(),
                    batchId,
                    decisionType: 'ERROR',
                    reasoning: `Agent loop error: ${error.message}`,
                    updatedAt: new Date().toISOString()
                });
                await db.update(payrollBatches)
                    .set({ status: 'FAILED' as any, errorLog: error.message, updatedAt: new Date().toISOString() })
                    .where(eq(payrollBatches.id, batchId));
            }
        } catch (dbErr) {
            console.error('[Worker] Failed to log error to DB:', dbErr);
        }
        throw error;
    }
}, {
    connection: { url: REDIS_URL }
});

/**
 * ─── Email Worker — Processes notifications in the background ──────────
 */
export const emailWorker = new Worker('email-notifications', async (job: Job) => {
    const { businessId, type, message, batchId, vaultAddress } = job.data;
    try {
        const { sendPayrollNotification } = await import('../services/email-service');
        await sendPayrollNotification(businessId, type, message, batchId, vaultAddress);
        console.log(`[EmailWorker] ✅ Job ${job.id} notification sent for business ${businessId}`);
    } catch (err: any) {
        console.error(`[EmailWorker] ❌ Error in notification job ${job.id}:`, err.message);
        throw err; // BullMQ will handle retries
    }
}, {
    connection: { url: REDIS_URL },
    limiter: {
        max: 5,
        duration: 2000 // 5 emails per 2 seconds to avoid SMTP slamming
    }
});

/**
 * ─── Sweep Cron — Autonomous Batch Creation ────────────────────────────
 * This background process scans for schedules that need a batch.
 * 1. ONE_TIME schedules that have just been created (status: PENDING)
 * 2. RECURRING schedules whose nextRunAt has passed.
 */
export async function startSweepCron() {
    console.log('[SweepCron] 🛰️ Initializing Autonomous Sweep Monitor...');

    const sweep = async () => {
        try {
            // 1. Find ONE_TIME schedules that are PENDING, have a VAULT derived, and have no batches yet
            const pendingSchedules = await db.select().from(payrollSchedules)
                .where(
                    and(
                        eq(payrollSchedules.status, 'PENDING') as any,
                        eq(payrollSchedules.timing, 'ONE_TIME') as any,
                        sql`${payrollSchedules.vaultAddress} != 'pending'` as any
                    )
                );

            for (const schedule of pendingSchedules) {
                // Check if a batch already exists
                const existingBatches = await db.select().from(payrollBatches)
                    .where(eq(payrollBatches.scheduleId, schedule.id) as any)
                    .limit(1);

                if (existingBatches.length === 0) {
                    // Use a transaction for the entire batch creation process to avoid race conditions
                    await db.transaction(async (tx) => {
                        // Double-check inside transaction if a batch already exists
                        const [reallyNoBatches] = await tx.select().from(payrollBatches)
                            .where(eq(payrollBatches.scheduleId, schedule.id) as any)
                            .limit(1);
                        
                        if (reallyNoBatches) return;

                        console.log(`[SweepCron] 🆕 Vault ready. Auto-creating first batch for ONE_TIME schedule: ${schedule.id}`);
                        
                        const batchId = uuidv4();
                        
                        // Fetch full recipient details to populate the batch properly
                        const links = await tx.select({
                            staffId: schema.scheduleRecipients.staffId,
                            recipientId: schema.scheduleRecipients.recipientId,
                            amountOverride: schema.scheduleRecipients.amountOverride,
                            staffSalary: schema.staffDirectory.basicSalary,
                            staffAllowances: schema.staffDirectory.allowances,
                            staffDeductions: schema.staffDirectory.deductions,
                            staffCurrency: schema.staffDirectory.currency,
                            recipientAmount: schema.recipientDirectory.amount,
                            recipientCurrency: schema.recipientDirectory.currency,
                            staffName: schema.staffDirectory.name,
                            recipientName: schema.recipientDirectory.name,
                        })
                        .from(schema.scheduleRecipients)
                        // @ts-ignore
                        .leftJoin(schema.staffDirectory, eq(schema.scheduleRecipients.staffId, schema.staffDirectory.id))
                        // @ts-ignore
                        .leftJoin(schema.recipientDirectory, eq(schema.scheduleRecipients.recipientId, schema.recipientDirectory.id))
                        .where(eq(schema.scheduleRecipients.scheduleId, schedule.id) as any);

                        let totalFiat = 0;
                        const recipientsForBatch = links.map(l => {
                            const isStaff = !!l.staffId;
                            let amount = 0;
                            let currency = "NGN";
                            
                            if (isStaff) {
                                amount = Number(l.staffSalary || 0) + Number(l.staffAllowances || 0) - Number(l.staffDeductions || 0);
                                currency = l.staffCurrency || "NGN";
                            } else {
                                amount = Number(l.recipientAmount || 0);
                                currency = l.recipientCurrency || "NGN";
                            }

                            const finalAmount = l.amountOverride && Number(l.amountOverride) > 0 ? Number(l.amountOverride) : amount;
                            totalFiat += finalAmount;

                            return {
                                id: isStaff ? l.staffId : l.recipientId,
                                name: isStaff ? l.staffName : l.recipientName,
                                amount: String(finalAmount),
                                currency,
                                type: isStaff ? 'STAFF' : 'VENDOR'
                            };
                        });

                        // Extract estimate from metadata if agent saved it during pre-evaluation
                        const metadata = (schedule.metadata as any) || {};
                        const estimatedUsdt = String(metadata.estimatedUsdt || "0");

                        await tx.insert(payrollBatches).values({
                            id: batchId,
                            scheduleId: schedule.id,
                            status: 'PENDING',
                            totalAmountFiat: String(totalFiat),
                            totalAmountUsdt: estimatedUsdt,
                            currency: schedule.category === 'SALARY' ? 'NGN' : 'GHS',
                            recipientCount: recipientsForBatch.length,
                            recipients: recipientsForBatch, 
                            updatedAt: new Date().toISOString()
                        });

                        // Kickoff the agent evaluation (outside the tx is safer for BullMQ but after is fine if we return)
                        await payrollQueue.add('PROCESS_BATCH', {
                            scheduleId: schedule.id,
                            batchId,
                            type: 'EVALUATE_FUNDING'
                        });
                    });
                }
            }

            // 2. Handle RECURRING schedules based on nextRunAt logic
            const now = new Date();
            const recurringSchedules = await db.select().from(payrollSchedules)
                .where(
                    and(
                        eq(payrollSchedules.timing, 'RECURRING') as any,
                        sql`${payrollSchedules.nextRunAt} <= ${now.toISOString()}` as any,
                        sql`${payrollSchedules.vaultAddress} != 'pending'` as any
                    )
                );

            for (const schedule of recurringSchedules) {
                await db.transaction(async (tx) => {
                    // Double check nextRunAt inside transaction (optimistic locking would be better but this handles simple races)
                    const [latest] = await tx.select().from(payrollSchedules).where(eq(payrollSchedules.id, schedule.id) as any).limit(1);
                    if (!latest || !latest.nextRunAt || new Date(latest.nextRunAt) > now) return;

                    console.log(`[SweepCron] 🔄 Vault ready. Auto-creating recurring batch for schedule: ${schedule.id}`);
                    
                    const batchId = uuidv4();
                    
                    // Fetch full recipient details to populate the batch properly
                    const links = await tx.select({
                        staffId: schema.scheduleRecipients.staffId,
                        recipientId: schema.scheduleRecipients.recipientId,
                        amountOverride: schema.scheduleRecipients.amountOverride,
                        staffSalary: schema.staffDirectory.basicSalary,
                        staffAllowances: schema.staffDirectory.allowances,
                        staffDeductions: schema.staffDirectory.deductions,
                        staffCurrency: schema.staffDirectory.currency,
                        recipientAmount: schema.recipientDirectory.amount,
                        recipientCurrency: schema.recipientDirectory.currency,
                        staffName: schema.staffDirectory.name,
                        recipientName: schema.recipientDirectory.name,
                    })
                    .from(schema.scheduleRecipients)
                    // @ts-ignore
                    .leftJoin(schema.staffDirectory, eq(schema.scheduleRecipients.staffId, schema.staffDirectory.id))
                    // @ts-ignore
                    .leftJoin(schema.recipientDirectory, eq(schema.scheduleRecipients.recipientId, schema.recipientDirectory.id))
                    .where(eq(schema.scheduleRecipients.scheduleId, schedule.id) as any);

                    let totalFiat = 0;
                    const recipientsForBatch = links.map(l => {
                        const isStaff = !!l.staffId;
                        let amount = 0;
                        let currency = "NGN";
                        
                        if (isStaff) {
                            amount = Number(l.staffSalary || 0) + Number(l.staffAllowances || 0) - Number(l.staffDeductions || 0);
                            currency = l.staffCurrency || "NGN";
                        } else {
                            amount = Number(l.recipientAmount || 0);
                            currency = l.recipientCurrency || "NGN";
                        }

                        const finalAmount = l.amountOverride && Number(l.amountOverride) > 0 ? Number(l.amountOverride) : amount;
                        totalFiat += finalAmount;

                        return {
                            id: isStaff ? l.staffId : l.recipientId,
                            name: isStaff ? l.staffName : l.recipientName,
                            amount: String(finalAmount),
                            currency,
                            type: isStaff ? 'STAFF' : 'VENDOR'
                        };
                    });

                    // For recurring, we might rely on the agent to recalculate FX or use last known estimate
                    const metadata = (schedule.metadata as any) || {};
                    const estimatedUsdt = String(metadata.estimatedUsdt || "0");

                    await tx.insert(payrollBatches).values({
                        id: batchId,
                        scheduleId: schedule.id,
                        status: 'PENDING',
                        totalAmountFiat: String(totalFiat),
                        totalAmountUsdt: estimatedUsdt,
                        currency: schedule.category === 'SALARY' ? 'NGN' : 'GHS',
                        recipientCount: recipientsForBatch.length,
                        recipients: recipientsForBatch, 
                        updatedAt: new Date().toISOString()
                    });

                    // Calculate next increment
                    const nextDate = new Date(schedule.nextRunAt!);
                    const freq = schedule.cronExpression?.toLowerCase() || 'monthly';
                    
                    if (freq === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
                    else if (freq === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
                    else nextDate.setMonth(nextDate.getMonth() + 1); // Default to monthly

                    await tx.update(payrollSchedules)
                        .set({ 
                            nextRunAt: nextDate.toISOString(),
                            updatedAt: new Date().toISOString()
                        })
                        .where(eq(payrollSchedules.id, schedule.id) as any);

                    // Kickoff the agent evaluation
                    await payrollQueue.add('PROCESS_BATCH', {
                        scheduleId: schedule.id,
                        batchId,
                        type: 'EVALUATE_FUNDING'
                    });
                });
            }

        } catch (err) {
            console.error('[SweepCron] ❌ Error in sweep cycle:', err);
        }
    };

    // Run every 10 seconds
    setInterval(sweep, 10000);
}

// Monitors are now started by main.ts or index.ts explicitly
// To avoid double-starting when imported, we don't call them globally here.

