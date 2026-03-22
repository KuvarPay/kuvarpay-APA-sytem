import { Type } from "@sinclair/typebox";
import axios from 'axios';

// Note: In global search, we rely on NODE_PATH to find @tetherto/wdk
// But for development, we use jiti to load this.

export default function (api: any) {
    const BACKEND_URL = process.env.APA_BACKEND_URL || 'http://apa-backend:3001';
    const API_KEY = process.env.KUVARPAY_API_KEY || 'apa_local_test_key';

    // Shared axios instance with auth header pre-configured
    const http = axios.create({
        baseURL: `${BACKEND_URL}/api/v1/payroll`,
        headers: { 'x-api-key': API_KEY }
    });

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
                const response = await http.post(`/rates`, params);
                return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: "text", text: `Error fetching rates: ${error.message}` }], isError: true };
            }
        }
    });

    /**
     * Tool to fetch parent schedule metadata.
     */
    api.registerTool({
        name: "apa_get_schedule_details",
        description: "Fetch the parent schedule metadata (network, vaultAddress, category, etc.).",
        parameters: Type.Object({
            scheduleId: Type.String({ description: "The schedule ID" }),
        }),
        async execute(_id: string, params: { scheduleId: string }) {
            try {
                const response = await http.get(`/schedules/${params.scheduleId}`);
                return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: "text", text: `Error fetching schedule: ${error.message}` }], isError: true };
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
                const response = await http.get(`/batches/${params.batchId}`);
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
                await http.post(`/notifications`, params);
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
        description: "Save a decision log, thought, or plan to the audit trail. Provide either batchId or scheduleId.",
        parameters: Type.Object({
            batchId: Type.Optional(Type.String()),
            scheduleId: Type.Optional(Type.String()),
            decisionType: Type.String({ description: "e.g., EVALUATION, FUNDING_CHECK, EXECUTION" }),
            reasoning: Type.String(),
            plan: Type.Optional(Type.Any()),
        }),
        async execute(_id: string, params: any) {
            try {
                await http.post(`/agent/decision`, params);
                return { content: [{ type: "text", text: "Decision logged." }] };
            } catch (error: any) {
                return { content: [{ type: "text", text: `Log error: ${error.message}` }], isError: true };
            }
        }
    });

    /**
     * Tool to update schedule metadata (e.g., predicted funding, vault).
     */
    api.registerTool({
        name: "apa_update_schedule",
        description: "Update schedule-level metadata like vaultAddress or description.",
        parameters: Type.Object({
            scheduleId: Type.String(),
            data: Type.Object({
                vaultAddress: Type.Optional(Type.String()),
                network: Type.Optional(Type.String()),
                vaultBalanceUsdt: Type.Optional(Type.String()),
                metadata: Type.Optional(Type.Any())
            })
        }),
        async execute(_id: string, params: { scheduleId: string; data: any }) {
            try {
                await http.patch(`/schedules/${params.scheduleId}`, params.data);
                return { content: [{ type: "text", text: "Schedule updated." }] };
            } catch (error: any) {
                return { content: [{ type: "text", text: `Update error: ${error.message}` }], isError: true };
            }
        }
    });

    /**
     * Tool to fetch recipients linked to a schedule (pre-batch).
     */
    api.registerTool({
        name: "apa_get_schedule_recipients",
        description: "Fetch the list of recipients linked to a schedule (e.g. from the Staff Directory). Used for pre-evaluation.",
        parameters: Type.Object({
            scheduleId: Type.String({ description: "The unique ID of the schedule" }),
        }),
        async execute(_id: string, params: { scheduleId: string }) {
            try {
                const response = await http.get(`/schedules/${params.scheduleId}/recipients`);
                return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: "text", text: `Error fetching schedule recipients: ${error.message}` }], isError: true };
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
                await http.patch(`/batches/${params.batchId}`, params.data);
                return { content: [{ type: "text", text: "Batch updated." }] };
            } catch (error: any) {
                return { content: [{ type: "text", text: `Update error: ${error.message}` }], isError: true };
            }
        }
    });

    const isSimulation = process.env.APA_SIMULATION === 'true';

    /**
     * Wallet creation / Wallet retrieval via WDK.
     * Always delegates to the backend /wallet endpoint which handles WDK derivation and DB persistence.
     */
    api.registerTool({
        name: "apa_manage_wallet",
        description: "Get vault wallet address and check balance. Always derives a real address via the backend WDK service and optionally saves it to the schedule.",
        parameters: Type.Object({
            scheduleId: Type.String({ description: "The ID of the payroll schedule" }),
            network: Type.String({ enum: ['ethereum', 'polygon', 'arbitrum', 'base', 'optimism', 'bsc'], default: 'bsc' }),
            saveToSchedule: Type.Optional(Type.Boolean({ default: false })),
            checkCrossChain: Type.Optional(Type.Boolean({ default: true }))
        }),
        async execute(_id: string, params: { scheduleId: string; network: string; saveToSchedule?: boolean; checkCrossChain?: boolean }) {
            try {
                const response = await http.post(`/wallet`, {
                    scheduleId: params.scheduleId,
                    network: params.network,
                    saveToSchedule: params.saveToSchedule ?? false,
                    checkCrossChain: params.checkCrossChain ?? true
                });
                return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: "text", text: `Wallet Error: ${error.response?.data?.error || error.message}` }], isError: true };
            }
        }
    });

    /**
     * Tool to transfer required funds to the Startbutton bridge.
     */
    api.registerTool({
        name: "apa_deposit_to_startbutton",
        description: "Transfer the calculated total USDT (including buffer) from the Vault to the Startbutton Bridge address. This must be called before payouts can begin.",
        parameters: Type.Object({
            amountUsdt: Type.String({ description: "The total USDT amount to transfer" }),
            network: Type.String({ enum: ['ethereum', 'polygon', 'arbitrum', 'base', 'optimism', 'bsc'], default: 'bsc' }),
        }),
        async execute(_id: string, params: { amountUsdt: string; network: string }) {
            try {
                if (isSimulation) {
                    return { content: [{ type: "text", text: `SIMULATION: Transfer of ${params.amountUsdt} USDT to Bridge (0x0Be...) successful. Hash: 0xmock_transfer_hash` }] };
                }

                const BRIDGE_ADDRESS = "0x0Be508750D2C1736c63a5A1dFf11317F54Eb072c";
                const { WDK } = await import('@tetherto/wdk');
                const { NativeWallet } = await import('@tetherto/wdk-wallet-native');
                
                const wdk = new WDK({
                    wallet: new NativeWallet(process.env.WDK_SEED || ''),
                    network: params.network as any,
                });

                const account = await wdk.getAccount(0);
                const tx = await account.transfer({
                    token: "USDT",
                    recipient: BRIDGE_ADDRESS,
                    amount: params.amountUsdt
                });
                
                account.dispose();
                return { content: [{ type: "text", text: `Transfer to Bridge successful. Hash: ${tx.hash}` }] };
            } catch (error: any) {
                return { content: [{ type: "text", text: `Bridge transfer failed: ${error.message}` }], isError: true };
            }
        }
    });

    /**
     * Tool to check the balance of the Startbutton bridge.
     */
    api.registerTool({
        name: "apa_get_startbutton_balance",
        description: "Checks funding status on the bridge address first, then confirms the receipt on Startbutton's dashboard.",
        parameters: Type.Object({
            network: Type.Optional(Type.String({ enum: ['ethereum', 'polygon', 'arbitrum', 'base', 'optimism', 'bsc'], default: 'bsc' })),
        }),
        async execute(_id: string, params: { network?: string }) {
            try {
                const BRIDGE_ADDRESS = "0x0Be508750D2C1736c63a5A1dFf11317F54Eb072c";

                if (isSimulation) {
                    return {
                        content: [{
                            type: "text",
                            text: JSON.stringify({
                                success: true,
                                bridgeAddress: BRIDGE_ADDRESS,
                                bridgeUsdt: "10000.00",
                                startbuttonConfirmation: "Successful",
                                message: "SIMULATION: Funding confirmed on bridge and Startbutton dashboard"
                            }, null, 2)
                        }]
                    };
                }

                const { WDK } = await import('@tetherto/wdk');
                const { NativeWallet } = await import('@tetherto/wdk-wallet-native');

                // Step 1: Check Bridge Wallet balance via WDK
                const wdk = new WDK({
                    wallet: new NativeWallet(process.env.WDK_SEED || ''),
                    network: (params.network || 'bsc') as any,
                });
                const bridgeBalance = await wdk.getBalance(BRIDGE_ADDRESS);
                wdk.dispose();

                // Step 2: Confirm on Startbutton API
                const response = await axios.get('https://api.startbutton.tech/wallet', {
                    headers: {
                        'Authorization': `Bearer ${process.env.STARTBUTTON_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            bridgeAddress: BRIDGE_ADDRESS,
                            bridgeUsdt: bridgeBalance.amount,
                            startbuttonData: response.data
                        }, null, 2)
                    }]
                };
            } catch (error: any) {
                return { content: [{ type: "text", text: `Bridge balance check failed: ${error.message}` }], isError: true };
            }
        }
    });

    /**
     * EXECUTION Tool: Executes fiat transfers via Startbutton API.
     */
    api.registerTool({
        name: "apa_fiat_transfer",
        description: "Execute a fiat transfer to an individual recipient in a batch using Startbutton fiat rails. Bridge funding must be verified before this is called.",
        parameters: Type.Object({
            batchId: Type.String({ description: "The ID of the batch" }),
            recipientIndex: Type.Number({ description: "The index of the recipient to process (0-based)" })
        }),
        async execute(_id: string, params: { batchId: string; recipientIndex: number }) {
            try {
                const batchResponse = await http.get(`/batches/${params.batchId}`);
                const { recipients } = batchResponse.data;

                if (!recipients || !Array.isArray(recipients)) throw new Error("No recipients found in batch.");
                const r = recipients[params.recipientIndex];
                if (!r) throw new Error(`Recipient at index ${params.recipientIndex} not found in batch.`);

                try {
                    if (isSimulation) {
                        const ref = `sim_${Math.random().toString(36).substring(7)}`;
                        r.status = 'COMPLETED';
                        r.reference = ref;
                        await http.patch(`/batches/${params.batchId}`, { recipients });
                        return { content: [{ type: "text", text: `SIMULATION: Transfer to ${r.name} successful. Ref: ${ref}` }] };
                    }

                    const payload: any = {
                        amount: r.amount,
                        currency: r.currency,
                        country: r.country,
                        reference: `apa_${params.batchId}_${r.id || Math.random().toString(36).substring(7)}`
                    };

                    if (r.type === 'MOBILE_MONEY' || r.msisdn) {
                        payload.MNO = r.bankCode || r.MNO;
                        payload.msisdn = r.accountNumber || r.msisdn;
                    } else {
                        payload.bankCode = r.bankCode;
                        payload.accountNumber = r.accountNumber;
                    }

                    const response = await axios.post('https://api.startbutton.tech/transaction/transfer', payload, {
                        headers: {
                            'Authorization': `Bearer ${process.env.STARTBUTTON_SECRET_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    const success = response.data.success;
                    r.status = success ? 'COMPLETED' : 'FAILED';
                    r.transferId = response.data.data?.id || response.data.data?.reference || '';
                    r.reference = payload.reference;

                    await http.patch(`/batches/${params.batchId}`, { recipients });
                    return { content: [{ type: "text", text: `Transfer to ${r.name} ${success ? 'Successful' : 'Failed'}. ID: ${r.transferId}` }] };
                } catch (e: any) {
                    r.status = 'FAILED';
                    r.errorLog = e.response?.data?.message || e.message;
                    await http.patch(`/batches/${params.batchId}`, { recipients });
                    return { content: [{ type: "text", text: `Error: ${r.errorLog}` }], isError: true };
                }
            } catch (error: any) {
                return { content: [{ type: "text", text: `Execution failed: ${error.message}` }], isError: true };
            }
        }
    });

    /**
     * EXECUTION Tool: Executes on-chain USDT payouts.
     */
    api.registerTool({
        name: "apa_payout",
        description: "Execute an on-chain USDT payout to a recipient's wallet address via the WDK vault.",
        parameters: Type.Object({
            batchId: Type.String({ description: "The ID of the batch" }),
            recipientIndex: Type.Number({ description: "The index of the recipient to process" }),
            network: Type.String({ enum: ['ethereum', 'polygon', 'arbitrum', 'base', 'optimism', 'bsc'], default: 'bsc' }),
        }),
        async execute(_id: string, params: { batchId: string; recipientIndex: number; network: string }) {
            try {
                const batchResponse = await http.get(`/batches/${params.batchId}`);
                const { recipients } = batchResponse.data;
                const r = recipients[params.recipientIndex];
                if (!r) throw new Error("Recipient not found.");

                if (isSimulation) {
                    r.status = 'COMPLETED';
                    await http.patch(`/batches/${params.batchId}`, { recipients });
                    return { content: [{ type: "text", text: `SIMULATION: USDT Payout of ${r.amount} to ${r.accountNumber} on ${params.network} successful.` }] };
                }

                const { WDK } = await import('@tetherto/wdk');
                const { NativeWallet } = await import('@tetherto/wdk-wallet-native');
                
                const wdk = new WDK({
                    wallet: new NativeWallet(process.env.WDK_SEED || ''),
                    network: params.network as any,
                });

                const account = await wdk.getAccount(0);
                const tx = await account.transfer({
                    token: "USDT",
                    recipient: r.accountNumber || r.address,
                    amount: r.amount
                });
                
                r.status = 'COMPLETED';
                r.transferId = tx.hash;
                await http.patch(`/batches/${params.batchId}`, { recipients });
                
                account.dispose();
                return { content: [{ type: "text", text: `Payout successful. Hash: ${tx.hash}` }] };
            } catch (error: any) {
                return { content: [{ type: "text", text: `Payout failed: ${error.message}` }], isError: true };
            }
        }
    });
}
