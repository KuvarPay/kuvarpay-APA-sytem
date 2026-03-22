import { Type } from "@sinclair/typebox";
import axios from 'axios';

// Note: In global search, we rely on NODE_PATH to find @tetherto/wdk
// But for development, we use jiti to load this.

export default function (api: any) {
    const BACKEND_URL = process.env.APA_BACKEND_URL || 'http://apa-backend:3001';

    /**
     * Tool to get FX rates from the settlement chain.
     * This ensures the agent uses the SAME rates as our gateway.
     */
    api.registerTool({
        name: "apa_get_rates",
        description: "Fetch the latest settlement-snapshot FX rates for a currency. Returns rate and converted USD amount if an amount is provided.",
        parameters: Type.Object({
            currency: Type.String({ description: "The fiat currency code (e.g., NGN, GHS)" }),
            amount: Type.Optional(Type.Number({ description: "Optional amount to convert to USDT" })),
        }),
        async execute(_id: string, params: { currency: string; amount?: number }) {
            try {
                const response = await axios.post(`${BACKEND_URL}/rates`, params);
                return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: "text", text: `Error fetching rates: ${error.message}` }], isError: true };
            }
        }
    });

    /**
     * Tool to fetch batch recipients and details.
     */
    api.registerTool({
        name: "apa_get_batch_details",
        description: "Fetch the recipient list and details for a specific payroll batch-id.",
        parameters: Type.Object({
            batchId: Type.String({ description: "The unique ID of the batch" }),
        }),
        async execute(_id: string, params: { batchId: string }) {
            try {
                const response = await axios.get(`${BACKEND_URL}/batches/${params.batchId}`);
                return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: "text", text: `Error fetching batch: ${error.message}` }], isError: true };
            }
        }
    });

    /**
     * Tool to send notification via the backend.
     */
    api.registerTool({
        name: "apa_send_notification",
        description: "Send a notification (Email/SMS) to the merchant regarding payroll status.",
        parameters: Type.Object({
            businessId: Type.String(),
            type: Type.String({ enum: ['FUNDING_REQUIRED', 'PROCESSING', 'COMPLETED', 'FAILED'] }),
            message: Type.String(),
        }),
        async execute(_id: string, params: any) {
            try {
                await axios.post(`${BACKEND_URL}/notifications`, params);
                return { content: [{ type: "text", text: "Notification sent successfully." }] };
            } catch (error: any) {
                return { content: [{ type: "text", text: `Failed to send notification: ${error.message}` }], isError: true };
            }
        }
    });

    /**
     * Tool to log Agent's internal decision logic for transparency.
     */
    api.registerTool({
        name: "apa_log_decision",
        description: "Save a decision log, thought, or plan to the audit trail.",
        parameters: Type.Object({
            batchId: Type.String(),
            decisionType: Type.String({ description: "e.g., EVALUATION, FUNDING_CHECK, EXECUTION" }),
            reasoning: Type.String(),
            plan: Type.Optional(Type.Any()),
        }),
        async execute(_id: string, params: any) {
            try {
                await axios.post(`${BACKEND_URL}/agent/decision`, params);
                return { content: [{ type: "text", text: "Decision logged." }] };
            } catch (error: any) {
                return { content: [{ type: "text", text: `Log error: ${error.message}` }], isError: true };
            }
        }
    });

    /**
     * Status and metadata update tool.
     */
    api.registerTool({
        name: "apa_update_batch",
        description: "Update batch status, amounts, or error logs in the database.",
        parameters: Type.Object({
            batchId: Type.String(),
            data: Type.Object({
                status: Type.Optional(Type.String()),
                totalAmountUsdt: Type.Optional(Type.String()),
                errorLog: Type.Optional(Type.String()),
                executedAt: Type.Optional(Type.String())
            })
        }),
        async execute(_id: string, params: { batchId: string; data: any }) {
            try {
                await axios.patch(`${BACKEND_URL}/batches/${params.batchId}`, params.data);
                return { content: [{ type: "text", text: "Batch updated." }] };
            } catch (error: any) {
                return { content: [{ type: "text", text: `Update error: ${error.message}` }], isError: true };
            }
        }
    });

    /**
     * Wallet creation / Wallet retrieval via WDK.
     */
    api.registerTool({
        name: "apa_manage_wallet",
        description: "Get vault wallet address and check balance. Supports cross-chain EVM monitoring.",
        parameters: Type.Object({
            scheduleId: Type.String({ description: "The ID of the payroll schedule" }),
            network: Type.String({ enum: ['ethereum', 'polygon', 'arbitrum', 'base', 'optimism', 'bsc'], default: 'bsc' }),
            saveToSchedule: Type.Optional(Type.Boolean({ default: false })),
            checkCrossChain: Type.Optional(Type.Boolean({ default: true }))
        }),
        async execute(_id: string, params: { scheduleId: string; network: string; saveToSchedule?: boolean; checkCrossChain?: boolean }) {
            try {
                const { WDK } = await import('@tetherto/wdk');
                const { NativeWallet } = await import('@tetherto/wdk-wallet-native');

                const networksToCheck = params.checkCrossChain
                    ? ['ethereum', 'polygon', 'arbitrum', 'base', 'optimism', 'bsc']
                    : [params.network];

                const index = 0;
                let primaryAddress = '';
                const balances: any[] = [];

                for (const net of networksToCheck) {
                    try {
                        const wdk = new WDK({
                            wallet: new NativeWallet(process.env.WDK_SEED || ''),
                            network: net as any,
                        });
                        const wallet = await wdk.getWallet(index);
                        const address = await wallet.getAddress();
                        if (net === params.network) primaryAddress = address;

                        const balance = await wdk.getBalance(address);
                        if (parseFloat(balance.amount) > 0 || net === params.network) {
                            balances.push({ network: net, address, amount: balance.amount, symbol: balance.symbol });
                        }
                        wdk.dispose(); // Important for cleanup
                    } catch (e) {
                        // Skip failed network checks
                    }
                }

                if (params.saveToSchedule && primaryAddress) {
                    await axios.patch(`${BACKEND_URL}/schedules/${params.scheduleId}`, {
                        vaultAddress: primaryAddress,
                        vaultIndex: 0,
                        network: params.network
                    });
                }

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            primaryNetwork: params.network,
                            primaryAddress,
                            allBalances: balances,
                            totalUsdt: balances.reduce((acc, b) => acc + parseFloat(b.amount), 0)
                        }, null, 2)
                    }]
                };
            } catch (error: any) {
                return { content: [{ type: "text", text: `WDK Error: ${error.message}` }], isError: true };
            }
        }
    });

    /**
     * EXECUTION Tool: Signs and broadcasts payout transactions.
     */
    api.registerTool({
        name: "apa_execute_payout",
        description: "Signs and broadcasts multiple USDT transfers for a batch. Requires 'FUNDED' check.",
        parameters: Type.Object({
            batchId: Type.String(),
            network: Type.String({ enum: ['ethereum', 'polygon', 'arbitrum', 'base', 'optimism', 'bsc'], default: 'bsc' }),
        }),
        async execute(_id: string, params: { batchId: string; network: string }) {
            try {
                const batchResponse = await axios.get(`${BACKEND_URL}/batches/${params.batchId}`);
                const { recipients } = batchResponse.data;

                if (!recipients || !Array.isArray(recipients)) throw new Error("No recipients found in batch.");

                const { WDK } = await import('@tetherto/wdk');
                const { NativeWallet } = await import('@tetherto/wdk-wallet-native');
                const wdk = new WDK({
                    wallet: new NativeWallet(process.env.WDK_SEED || ''),
                    network: params.network as any,
                });

                const account = await wdk.getAccount(0);
                const results = [];
                const isMock = process.env.MOCK_PAYOUT === 'true';

                for (const r of recipients) {
                    try {
                        if (isMock) {
                            results.push({ 
                                name: r.name, 
                                address: r.address, 
                                hash: `0xmock_${Math.random().toString(36).substring(7)}`, 
                                success: true 
                            });
                            continue;
                        }
                        // In a real autonomous run, the agent would have pre-calculated r.amountUsdt
                        const tx = await account.transfer({
                            token: "USDT",
                            recipient: r.address,
                            amount: r.amountUsdt || "0"
                        });
                        results.push({ name: r.name, address: r.address, hash: tx.hash, success: true });
                    } catch (e: any) {
                        results.push({ name: r.name, address: r.address, error: e.message, success: false });
                    }
                }

                if (!isMock) account.dispose();

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(results, null, 2)
                    }]
                };
            } catch (error: any) {
                return { content: [{ type: "text", text: `Execution failed: ${error.message}` }], isError: true };
            }
        }
    });
}
