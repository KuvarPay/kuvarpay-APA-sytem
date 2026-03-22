import { db, schema, eq, and, isNull, lt, or } from 'rayswap-db';
import { sendPayrollNotification } from '../services/email-service';

const { payrollSchedules, payrollBatches, scheduleRecipients, staffDirectory, recipientDirectory, vaultBalances } = schema;

/**
 * Background worker to monitor "Runway" for all active schedules.
 * Sends email alerts if the vault has less than 30 days of coverage.
 */
async function monitorRunway() {
    try {
        console.log('[RunwayMonitor] 🛫 Checking runway for all active schedules...');
        
        const activeSchedules = await db.select().from(payrollSchedules)
            .where(eq(payrollSchedules.timing, 'RECURRING' as any));

        for (const schedule of activeSchedules) {
            try {
                // 1. Calculate Monthly Commitment
                const links = await db.select().from(scheduleRecipients)
                    .where(eq(scheduleRecipients.scheduleId, schedule.id));
                
                let monthlyFiatTotal = 0;
                for (const link of links) {
                    let amount = parseFloat(link.amountOverride || '0');
                    if (amount === 0) {
                        if (link.staffId) {
                            const [staff] = await db.select().from(staffDirectory).where(eq(staffDirectory.id, link.staffId)).limit(1);
                            if (staff) {
                                amount = parseFloat(staff.basicSalary || '0') + parseFloat(staff.allowances || '0') - parseFloat(staff.deductions || '0');
                            }
                        }
                    }
                    monthlyFiatTotal += amount;
                }

                if (monthlyFiatTotal === 0) continue;

                // 2. Get Current Vault Balance (in USDT)
                // We assume there's a vault_balances table or similar, 
                // but since we usually fetch this from the agent/blockchain,
                // we'll simulate the check using the last known balance 
                // or calling an internal balance service.
                
                // For now, let's assume we have a way to get the balance for the vaultAddress
                // In a real prod env, this would call the Blockchain indexer.
                // Here we'll check if we have a recorded balance metadata.
                const balanceUsdt = 1000; // Placeholder: In implementation, fetch via WDK/Service
                
                // 3. Get current FX rate (roughly)
                const fxRate = 1500; // NGN/USDT placeholder
                const monthlyUsdtCommitment = monthlyFiatTotal / fxRate;
                
                const runwayMonths = balanceUsdt / monthlyUsdtCommitment;

                if (runwayMonths < 1) {
                    console.warn(`[RunwayMonitor] ⚠️ LOW RUNWAY: ${schedule.name} has ${runwayMonths.toFixed(1)} months remaining.`);
                    
                    // Trigger notification via APA API
                    // We avoid sending duplicate emails by checking metadata or a 'lastAlertSentAt'
                    const lastAlert = (schedule.metadata as any)?.lastRunwayAlertAt;
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                    if (!lastAlert || new Date(lastAlert) < oneWeekAgo) {
                        await sendPayrollNotification(
                            schedule.businessId,
                            'LOW_RUNWAY',
                            `Your ${schedule.name} vault is running low (${(runwayMonths * 30).toFixed(0)} days left). Please top up soon to ensure uninterrupted payroll.`,
                            undefined,
                            schedule.vaultAddress
                        );

                        // Update metadata
                        const newMetadata = { ...(schedule.metadata as any), lastRunwayAlertAt: new Date().toISOString() };
                        await db.update(payrollSchedules)
                            .set({ metadata: newMetadata })
                            .where(eq(payrollSchedules.id, schedule.id));
                        
                        console.log(`[RunwayMonitor] 📧 Alert sent for ${schedule.name}`);
                    }
                }

            } catch (err: any) {
                console.error(`[RunwayMonitor] Error checking schedule ${schedule.id}:`, err.message);
            }
        }
    } catch (err: any) {
        console.error('[RunwayMonitor] Global error:', err.message);
    }
}

const CHECK_INTERVAL = 12 * 60 * 60 * 1000; // Check every 12 hours

export function startRunwayMonitor() {
    console.log(`[RunwayMonitor] ⏰ Started (checking every 12h)`);
    setInterval(monitorRunway, CHECK_INTERVAL);
    // Initial check
    monitorRunway();
}
