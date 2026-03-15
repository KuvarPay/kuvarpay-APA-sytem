import { Queue, Worker, Job } from 'bullmq';
import { db, schema } from '../../../database/rayswap-db/src/index';
import { eq } from '../../../database/rayswap-db/node_modules/drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const { payrollBatches, payrollSchedules, payrollAgentDecisions } = schema;

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/openai/gpt-4o-mini';
const APA_BACKEND_URL = process.env.APA_BACKEND_URL || 'http://localhost:3001';

export const payrollQueue = new Queue('payroll-processing', {
    connection: { url: REDIS_URL }
});

// ─── Tool definitions the brain can call ───────────────────────────────
const TOOLS = [
    {
        type: 'function' as const,
        function: {
            name: 'apa_get_rates',
            description: 'Fetch settlement-snapshot FX rate for a fiat currency. Returns the rate and optionally converts an amount to USDT.',
            parameters: {
                type: 'object',
                properties: {
                    currency: { type: 'string', description: 'Fiat currency code e.g. NGN, GHS, RWF' },
                    amount: { type: 'number', description: 'Optional fiat amount to convert to USDT' }
                },
                required: ['currency']
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'apa_get_batch_details',
            description: 'Fetch the recipients list and full details for a payroll batch.',
            parameters: {
                type: 'object',
                properties: {
                    batchId: { type: 'string', description: 'The batch ID' }
                },
                required: ['batchId']
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'apa_manage_wallet',
            description: 'Get or derive the vault wallet address for a schedule. Checks USDT balance on-chain. Optionally saves the address to the schedule.',
            parameters: {
                type: 'object',
                properties: {
                    scheduleId: { type: 'string', description: 'The payroll schedule ID' },
                    network: { type: 'string', enum: ['ethereum', 'polygon', 'arbitrum', 'base', 'optimism', 'bsc'], description: 'EVM network' },
                    saveToSchedule: { type: 'boolean', description: 'If true, persist derived address to the schedule record' },
                    checkCrossChain: { type: 'boolean', description: 'If true, check balances on all EVM chains' }
                },
                required: ['scheduleId', 'network']
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'apa_log_decision',
            description: 'Save a decision, thought, or plan to the audit trail for transparency.',
            parameters: {
                type: 'object',
                properties: {
                    batchId: { type: 'string' },
                    decisionType: { type: 'string', description: 'e.g. EVALUATION, FUNDING_CHECK, EXECUTION' },
                    reasoning: { type: 'string' },
                    plan: { description: 'Optional structured plan data' }
                },
                required: ['batchId', 'decisionType', 'reasoning']
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'apa_update_batch',
            description: 'Update batch status, USDT total, or error log in the database.',
            parameters: {
                type: 'object',
                properties: {
                    batchId: { type: 'string' },
                    data: {
                        type: 'object',
                        properties: {
                            status: { type: 'string', enum: ['PENDING', 'FUNDING_REQUIRED', 'FUNDED', 'PROCESSING', 'COMPLETED', 'FAILED'] },
                            totalAmountUsdt: { type: 'string' },
                            errorLog: { type: 'string' },
                            executedAt: { type: 'string' }
                        }
                    }
                },
                required: ['batchId', 'data']
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'apa_send_notification',
            description: 'Send a notification to the merchant about payroll status.',
            parameters: {
                type: 'object',
                properties: {
                    businessId: { type: 'string' },
                    type: { type: 'string', enum: ['FUNDING_REQUIRED', 'PROCESSING', 'COMPLETED', 'FAILED'] },
                    message: { type: 'string' },
                    batchId: { type: 'string' }
                },
                required: ['businessId', 'type', 'message']
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'apa_payout',
            description: 'Execute the final payout to recipients. Calls the payment gateway to trigger transfers.',
            parameters: {
                type: 'object',
                properties: {
                    batchId: { type: 'string' }
                },
                required: ['batchId']
            }
        }
    }
];

// ─── Tool execution — calls the APA Backend HTTP API ───────────────────
async function executeTool(name: string, args: any): Promise<string> {
    try {
        switch (name) {
            case 'apa_get_rates': {
                const res = await axios.post(`${APA_BACKEND_URL}/api/v1/payroll/rates`, args);
                return JSON.stringify(res.data);
            }
            case 'apa_get_batch_details': {
                const res = await axios.get(`${APA_BACKEND_URL}/api/v1/payroll/batches/${args.batchId}`);
                return JSON.stringify(res.data);
            }
            case 'apa_manage_wallet': {
                const res = await axios.post(`${APA_BACKEND_URL}/api/v1/payroll/wallet`, args);
                return JSON.stringify(res.data);
            }
            case 'apa_log_decision': {
                await axios.post(`${APA_BACKEND_URL}/api/v1/payroll/agent/decision`, args);
                return 'Decision logged successfully.';
            }
            case 'apa_update_batch': {
                await axios.patch(`${APA_BACKEND_URL}/api/v1/payroll/batches/${args.batchId}`, args.data);
                return 'Batch updated successfully.';
            }
            case 'apa_send_notification': {
                await axios.post(`${APA_BACKEND_URL}/api/v1/payroll/notifications`, args);
                return 'Notification sent successfully.';
            }
            case 'apa_payout': {
                const res = await axios.post(`${APA_BACKEND_URL}/api/v1/payroll/batches/${args.batchId}/payout`, {});
                return JSON.stringify(res.data);
            }
            default:
                return `Unknown tool: ${name}`;
        }
    } catch (err: any) {
        const errMsg = err.response?.data?.error || err.message;
        console.error(`[ToolExec] ${name} failed:`, errMsg);
        return JSON.stringify({ error: errMsg });
    }
}

// ─── Agentic loop — the brain calls tools until it's done ──────────────
const MAX_ITERATIONS = 20;

async function runAgentLoop(batchId: string, scheduleId: string, jobType: string, agentPrompt?: string) {
    const isExecution = jobType === 'EXECUTE_PAYOUT';

    const systemPrompt = isExecution
        ? `You are the execution brain of the Autonomous Payroll Agent (APA).
Your mission is to process payouts for a FUNDED payroll batch.
1. Call 'apa_get_batch_details' to verify the recipients and total amount.
2. Call 'apa_manage_wallet' to check that the vault actually has enough balance now.
3. Compare the vault balance against the required total (including the 5% buffer).
4. If balance is sufficient, call 'apa_update_batch' to set status to 'PROCESSING'.
5. Call 'apa_payout' to execute the transfers.
6. Call 'apa_log_decision' with your final confirmation.
7. Call 'apa_send_notification' to inform the merchant of success or failure.

CORE RULES:
- Never call 'apa_payout' if the on-chain balance is less than required.
- Always be verbose in your final summary.`
        : `You are the evaluation brain of the Autonomous Payroll Agent (APA).
Your mission is to analyze a new payroll batch and determine funding needs.
1. Call 'apa_get_batch_details' to understand the recipients.
2. Call 'apa_get_rates' for EACH unique fiat currency in the recipients.
3. Calculate the total USDT required (sum all recipients) and apply a 5% security buffer.
4. Call 'apa_manage_wallet' (saveToSchedule=true) to derive the vault wallet and check balance.
5. EXTREMELY IMPORTANT: You MUST call 'apa_update_batch' to transition status:
   - If balance >= total required (with buffer): set status to 'FUNDED' and PROCEED to call 'apa_payout' in this same session.
   - If balance < total required: set status to 'FUNDING_REQUIRED' and set 'totalAmountUsdt' to your computed total.
6. Call 'apa_log_decision' to record your final math and reasoning.
7. Call 'apa_send_notification' to inform the merchant.

CORE RULES:
- Always use the 5% buffer.
- When finished, summarize your actions.`;

    const userPrompt = isExecution
        ? `Funds have been detected! Please execute the payout for:
- Batch ID: ${batchId}
- Schedule ID: ${scheduleId}
${agentPrompt ? `- Additional Context: ${agentPrompt}` : ''}`
        : `New payroll received. Evaluate funding:
- Batch ID: ${batchId}
- Schedule ID: ${scheduleId}
${agentPrompt ? `- User Instructions: ${agentPrompt}` : ''}`;

    const messages: any[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ];

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        console.log(`[AgentLoop] Iteration ${i + 1}/${MAX_ITERATIONS}`);

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: OPENROUTER_MODEL,
            messages,
            tools: TOOLS,
            tool_choice: 'auto',
            temperature: 0.1,
            max_tokens: 4096
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://kuvarpay.com',
                'X-Title': 'KuvarPay APA'
            }
        });

        const choice = response.data.choices?.[0];
        const assistantMessage = choice?.message;

        if (choice) {
            console.log(`[AgentLoop] Model response: ${JSON.stringify({ finish_reason: choice.finish_reason, has_content: !!assistantMessage.content, tool_calls: assistantMessage.tool_calls?.length || 0 })}`);
        }

        if (!assistantMessage) {
            console.error('[AgentLoop] No message in response');
            break;
        }

        messages.push(assistantMessage);

        if (assistantMessage.content) {
            console.log(`[AgentLoop] 🤖 Assistant thoughts: ${assistantMessage.content.substring(0, 500)}`);
        }

        if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
            for (const toolCall of assistantMessage.tool_calls) {
                const fnName = toolCall.function.name;
                let fnArgs: any;
                try {
                    fnArgs = JSON.parse(toolCall.function.arguments);
                } catch {
                    fnArgs = {};
                }

                console.log(`[AgentLoop] 🔧 Calling tool: ${fnName}`, JSON.stringify(fnArgs).substring(0, 200));
                const result = await executeTool(fnName, fnArgs);
                console.log(`[AgentLoop] ✅ ${fnName} result:`, result.substring(0, 300));

                messages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: result
                });
            }
        } else {
            const finalContent = assistantMessage.content || 'Agent completed without specific summary.';
            console.log(`[AgentLoop] 🏁 Agent finished: ${finalContent.substring(0, 500)}`);
            return finalContent;
        }
    }

    return 'Agent reached max iterations.';
}

export const payrollWorker = new Worker('payroll-processing', async (job: Job) => {
    const { scheduleId, batchId, type, agentPrompt } = job.data;
    console.log(`[Worker] 🚀 Dispatching ${type} for Batch ${batchId} to Agent Brain`);
    try {
        const finalSummary = await runAgentLoop(batchId, scheduleId, type, agentPrompt);
        console.log(`[Worker] ✅ Agent completed for Batch ${batchId}`);
        return { summary: finalSummary };
    } catch (error: any) {
        console.error(`[Worker] ❌ Agent error for Batch ${batchId}:`, error.message);
        try {
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
        } catch (dbErr) {
            console.error('[Worker] Failed to log error to DB:', dbErr);
        }
        throw error;
    }
}, {
    connection: { url: REDIS_URL }
});
