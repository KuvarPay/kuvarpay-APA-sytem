import { db, schema, eq } from 'rayswap-db';
import { v4 as uuidv4 } from 'uuid';
import { WdkService } from '../integrations/wdk';
import { WdkSecretManager } from '../integrations/secret-manager';
import { payrollQueue } from './scheduler';

const { payrollBatches, payrollSchedules, payrollAgentDecisions } = schema;

// Map user-facing network to WDK network
function toWdkNetwork(network: string): string {
    const net = network?.toLowerCase();
    if (['tron', 'bsc', 'polygon', 'arbitrum', 'base', 'optimism', 'ethereum'].includes(net)) {
        return net;
    }
    return 'ethereum';
}

/**
 * Polls all FUNDING_REQUIRED batches and checks if the vault has been funded.
 * Transitions to FUNDED when the balance meets the required USDT amount.
 */
async function checkFunding() {
    try {
        // Find all batches waiting for funding
        const pendingBatches = await db.select().from(payrollBatches)
            .where(eq(payrollBatches.status, 'FUNDING_REQUIRED' as any));

        if (pendingBatches.length === 0) return;

        const seed = await WdkSecretManager.getSeed();
        const wdk = new WdkService(seed);

        for (const batch of pendingBatches) {
            try {
                const [schedule] = await db.select().from(payrollSchedules)
                    .where(eq(payrollSchedules.id, batch.scheduleId))
                    .limit(1);

                if (!schedule) continue;

                const requiredUsdt = parseFloat(batch.totalAmountUsdt) || 0;
                if (requiredUsdt <= 0) continue;

                let balanceUsdt = 0;
                const isSimulation = process.env.APA_SIMULATION === 'true';

                if (isSimulation) {
                    // In simulation mode, we wait at least 5 seconds after the batch is created/updated 
                    // before "detecting" the funding to make the flow feels realistic.
                    const updatedAt = new Date(batch.updatedAt || new Date()).getTime();
                    const now = new Date().getTime();
                    
                    if (now - updatedAt < 20000) {
                        console.log(`[FundingMonitor] [SIMULATION] Batch ${batch.id.slice(0, 8)}... waiting for mock funding delay (20s).`);
                        continue;
                    }
                    
                    balanceUsdt = requiredUsdt;
                    console.log(`[FundingMonitor] [SIMULATION] Batch ${batch.id.slice(0, 8)}... mock funding DETECTED!`);
                } else {
                    // Check vault balance on-chain
                    const balance = await wdk.getUsdtBalance(
                        schedule.vaultAddress,
                        schedule.network || 'bsc',
                        schedule.vaultIndex || 0
                    );

                    // WDK returns bigint in smallest unit (6 decimals for USDT)
                    balanceUsdt = Number(balance) / 1e6;

                    console.log(
                        `[FundingMonitor] Batch ${batch.id.slice(0, 8)}... ` +
                        `vault=${schedule.vaultAddress.slice(0, 10)}... ` +
                        `balance=${balanceUsdt.toFixed(2)} / required=${requiredUsdt.toFixed(2)} USDT`
                    );

                    // Sync balance to schedule and update timestamp
                    await db.update(payrollSchedules)
                        .set({ vaultBalanceUsdt: String(balanceUsdt), updatedAt: new Date().toISOString() })
                        .where(eq(payrollSchedules.id, schedule.id));
                }

                if (balanceUsdt >= requiredUsdt) {
                    // Transition to FUNDED
                    await db.update(payrollBatches)
                        .set({ status: 'FUNDED' as any, updatedAt: new Date().toISOString() })
                        .where(eq(payrollBatches.id, batch.id));

                    await db.insert(payrollAgentDecisions).values({
                        id: uuidv4(),
                        batchId: batch.id,
                        decisionType: 'FUNDING_DETECTED',
                        reasoning: `Vault ${schedule.vaultAddress} has ${balanceUsdt.toFixed(6)} USDT. Required: ${requiredUsdt.toFixed(6)} USDT. Batch is now FUNDED.`,
                        plan: { balanceUsdt, requiredUsdt, vaultAddress: schedule.vaultAddress },
                        updatedAt: new Date().toISOString()
                    });

                    // ✨ TRIGGER THE BRAIN to execute the payout
                    await payrollQueue.add('EXECUTE_PAYOUT', {
                        scheduleId: batch.scheduleId,
                        batchId: batch.id,
                        type: 'EXECUTE_PAYOUT'
                    });

                    console.log(`[FundingMonitor] ✅ Batch ${batch.id.slice(0, 8)} is now FUNDED! Brain triggered.`);
                }
            } catch (batchErr: any) {
                console.error(`[FundingMonitor] Error checking batch ${batch.id}:`, batchErr.message);
            }
        }

        // --- NEW: Recovery for Abandoned FUNDED batches ---
        // Find FUNDED batches that haven't been completed but might have been stuck
        const now = new Date();
        const staleThreshold = 10 * 60 * 1000; // 10 minutes
        
        const staleFundedBatches = await db.select().from(payrollBatches)
            .where(eq(payrollBatches.status, 'FUNDED' as any));

        for (const batch of staleFundedBatches) {
            const updatedAt = new Date(batch.updatedAt || batch.createdAt).getTime();
            if (now.getTime() - updatedAt > staleThreshold) {
                console.log(`[FundingMonitor] ⚠️ Batch ${batch.id.slice(0, 8)} is FUNDED but stale (abandoned). Re-triggering execution brain...`);
                
                // Update timestamp so we don't spam it every 30s
                await db.update(payrollBatches)
                    .set({ updatedAt: new Date().toISOString() })
                    .where(eq(payrollBatches.id, batch.id));

                await payrollQueue.add('EXECUTE_PAYOUT', {
                    scheduleId: batch.scheduleId,
                    batchId: batch.id,
                    type: 'EXECUTE_PAYOUT',
                    agentPrompt: 'System recovery: This batch was funded but appeared abandoned. Please verify balances and process payouts.'
                });
            }
        }
    } catch (err: any) {
        console.error('[FundingMonitor] Poll error:', err.message);
    }
}

const POLL_INTERVAL = parseInt(process.env.FUNDING_POLL_INTERVAL || '30000'); // 30s default

export function startFundingMonitor() {
    console.log(`[FundingMonitor] 🔍 Started (polling every ${POLL_INTERVAL / 1000}s)`);
    setInterval(checkFunding, POLL_INTERVAL);
    // Run immediately once
    checkFunding();
}
