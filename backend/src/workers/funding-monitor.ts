import { db, schema, eq } from 'rayswap-db';
import { v4 as uuidv4 } from 'uuid';
import { BlockchainService } from '../integrations/wdk';
import { WdkSecretManager } from '../integrations/secret-manager';
import { payrollQueue } from './scheduler';

const { payrollBatches, payrollSchedules, payrollAgentDecisions } = schema;

/**
 * Polls all FUNDING_REQUIRED batches and checks if the vault has been funded.
 * Transitions to FUNDED when the balance meets the required asset amount.
 */
async function checkFunding() {
    try {
        // Find all batches waiting for funding
        const pendingBatches = await db.select().from(payrollBatches)
            .where(eq(payrollBatches.status, 'FUNDING_REQUIRED' as any));

        if (pendingBatches.length === 0) return;

        const seed = await WdkSecretManager.getSeed();
        const blockchain = new BlockchainService(seed);

        for (const batch of pendingBatches) {
            try {
                const [schedule] = await db.select().from(payrollSchedules)
                    .where(eq(payrollSchedules.id, batch.scheduleId))
                    .limit(1);

                if (!schedule) continue;

                const requiredAmount = parseFloat(batch.totalAmountUsdt) || 0;
                if (requiredAmount <= 0) continue;

                let balanceValue = 0;
                const isSimulation = process.env.APA_SIMULATION === 'true';

                if (isSimulation) {
                    const updatedAt = new Date(batch.updatedAt || new Date()).getTime();
                    const now = new Date().getTime();
                    
                    if (now - updatedAt < 10000) { // Reduced to 10s for better demo feel
                        console.log(`[FundingMonitor] [SIMULATION] Batch ${batch.id.slice(0, 8)}... waiting for mock funding delay.`);
                        continue;
                    }
                    
                    balanceValue = requiredAmount;
                    console.log(`[FundingMonitor] [SIMULATION] Batch ${batch.id.slice(0, 8)}... mock funding DETECTED!`);
                } else {
                    // Check vault balance via Generalized BlockchainService
                    balanceValue = await blockchain.getBalance({
                        address: schedule.vaultAddress,
                        network: schedule.network || 'bsc',
                        asset: schedule.network.toLowerCase() === 'xlm' ? 'USDC' : 'USDT',
                        memo: schedule.vaultMemo || undefined,
                        index: schedule.vaultIndex || 0
                    });

                    console.log(
                        `[FundingMonitor] Batch ${batch.id.slice(0, 8)}... ` +
                        `vault=${schedule.vaultAddress.slice(0, 10)}... ` +
                        `balance=${balanceValue.toFixed(2)} / required=${requiredAmount.toFixed(2)}`
                    );

                    // Sync balance to schedule and update timestamp
                    await db.update(payrollSchedules)
                        .set({ vaultBalanceUsdt: String(balanceValue), updatedAt: new Date().toISOString() })
                        .where(eq(payrollSchedules.id, schedule.id));
                }

                if (balanceValue >= requiredAmount) {
                    // Transition to FUNDED
                    await db.update(payrollBatches)
                        .set({ status: 'FUNDED' as any, updatedAt: new Date().toISOString() })
                        .where(eq(payrollBatches.id, batch.id));

                    await db.insert(payrollAgentDecisions).values({
                        id: uuidv4(),
                        batchId: batch.id,
                        decisionType: 'FUNDING_DETECTED',
                        reasoning: `Vault ${schedule.vaultAddress} has ${balanceValue.toFixed(6)} units. Required: ${requiredAmount.toFixed(6)}. Batch is now FUNDED.`,
                        plan: { balanceValue, requiredAmount, vaultAddress: schedule.vaultAddress },
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
