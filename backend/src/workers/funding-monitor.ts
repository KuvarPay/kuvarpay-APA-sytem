import { db, schema } from '../../../database/rayswap-db/src/index';
import { eq } from '../../../database/rayswap-db/node_modules/drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { WdkService } from '../integrations/wdk';
import { WdkSecretManager } from '../integrations/secret-manager';
import { payrollQueue } from './scheduler';

const { payrollBatches, payrollSchedules, payrollAgentDecisions } = schema;

// Map user-facing network to WDK network
function toWdkNetwork(network: string): string {
    if (network === 'tron') return 'tron';
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

                // Check vault balance on-chain
                const balance = await wdk.getUsdtBalance(
                    schedule.vaultAddress,
                    schedule.network || 'bsc',
                    schedule.vaultIndex || 0
                );

                // WDK returns bigint in smallest unit (6 decimals for USDT)
                const balanceUsdt = Number(balance) / 1e6;

                console.log(
                    `[FundingMonitor] Batch ${batch.id.slice(0, 8)}... ` +
                    `vault=${schedule.vaultAddress.slice(0, 10)}... ` +
                    `balance=${balanceUsdt.toFixed(2)} / required=${requiredUsdt.toFixed(2)} USDT`
                );

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
