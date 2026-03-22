import { db, schema, eq, and, isNull, lt, or, sql } from 'rayswap-db';
import { v4 as uuidv4 } from 'uuid';
import { payrollQueue } from './scheduler';

const { payrollSchedules, payrollBatches, scheduleRecipients, staffDirectory, recipientDirectory } = schema;

/**
 * Polls for recurring schedules that are due for execution.
 * Creates a batch and triggers the evaluation brain.
 */
async function triggerSchedules() {
    try {
        const now = new Date();
        
        // Find schedules that are due
        // 1. RECURRING that are due (nextRunAt <= now)
        // 2. ONE_TIME that are due (nextRunAt <= now) and NOT yet COMPLETED
        const dueSchedules = await db.select().from(payrollSchedules)
            .where(
                and(
                    or(
                        eq(payrollSchedules.status, 'PENDING' as any),
                        eq(payrollSchedules.status, 'ACTIVE' as any)
                    ),
                    or(
                        isNull(payrollSchedules.nextRunAt),
                        lt(payrollSchedules.nextRunAt, now.toISOString())
                    )
                )
            );

        if (dueSchedules.length === 0) return;

        for (const schedule of dueSchedules) {
            try {
                // For recurring, double check if a batch was already created this month
                if (schedule.timing === 'RECURRING') {
                    const currentMonth = now.getMonth();
                    const currentYear = now.getFullYear();
                    const startOfMonth = new Date(currentYear, currentMonth, 1).toISOString();

                    const recentBatches = await db.select().from(payrollBatches)
                        .where(
                            and(
                                eq(payrollBatches.scheduleId, schedule.id),
                                sql`${payrollBatches.createdAt} >= ${startOfMonth}`
                            )
                        ).limit(1);

                    if (recentBatches.length > 0) {
                        console.log(`[ScheduleTrigger] Schedule ${schedule.name} (${schedule.id}) already has a batch for this month. Updating nextRunAt.`);
                        const nextMonth = new Date(currentYear, currentMonth + 1, 1);
                        await db.update(payrollSchedules)
                            .set({ nextRunAt: nextMonth.toISOString(), updatedAt: new Date().toISOString() })
                            .where(eq(payrollSchedules.id, schedule.id));
                        continue;
                    }
                }

                console.log(`[ScheduleTrigger] 🚀 Triggering schedule: ${schedule.name} (${schedule.id}) [${schedule.timing}]`);

                // 1. Fetch linked recipients/staff
                const links = await db.select().from(scheduleRecipients)
                    .where(eq(scheduleRecipients.scheduleId, schedule.id));

                if (links.length === 0) {
                    console.warn(`[ScheduleTrigger] Schedule ${schedule.id} has no linked recipients. Skipping.`);
                    // If one-time has no recipients, we still mark it as completed so it doesn't keep triggering
                    if (schedule.timing === 'ONE_TIME') {
                        await db.update(payrollSchedules)
                            .set({ status: 'COMPLETED' as any, updatedAt: new Date().toISOString() })
                            .where(eq(payrollSchedules.id, schedule.id));
                    }
                    continue;
                }

                const recipientsData: any[] = [];
                let totalAmountFiat = 0;
                let currency = 'NGN';

                for (const link of links) {
                    let details: any = null;
                    let amount = parseFloat(link.amountOverride || '0');

                    if (link.staffId) {
                        const [staff] = await db.select().from(staffDirectory).where(eq(staffDirectory.id, link.staffId)).limit(1);
                        if (staff) {
                            if (amount === 0) {
                                amount = parseFloat(staff.basicSalary || '0') + parseFloat(staff.allowances || '0') - parseFloat(staff.deductions || '0');
                            }
                            details = {
                                name: staff.name,
                                email: staff.email,
                                type: 'STAFF',
                                bankDetails: staff.bankDetails,
                                category: 'Salary'
                            };
                        }
                    } else if (link.recipientId) {
                        const [recip] = await db.select().from(recipientDirectory).where(eq(recipientDirectory.id, link.recipientId)).limit(1);
                        if (recip) {
                            details = {
                                name: recip.name,
                                email: recip.email,
                                type: recip.type,
                                bankDetails: recip.bankDetails,
                                category: recip.type === 'VENDOR' ? 'Vendor' : 'Contractor'
                            };
                        }
                    }

                    if (details && amount > 0) {
                        recipientsData.push({
                            ...details,
                            amount,
                            accountNumber: details.bankDetails?.accountNumber,
                            bankCode: details.bankDetails?.bankCode,
                            currency: details.bankDetails?.currency || 'NGN'
                        });
                        totalAmountFiat += amount;
                        currency = details.bankDetails?.currency || currency;
                    }
                }

                if (recipientsData.length === 0) {
                    console.warn(`[ScheduleTrigger] Schedule ${schedule.id} has links but no valid recipient data. Skipping.`);
                    if (schedule.timing === 'ONE_TIME') {
                        await db.update(payrollSchedules)
                            .set({ status: 'COMPLETED' as any, updatedAt: new Date().toISOString() })
                            .where(eq(payrollSchedules.id, schedule.id));
                    }
                    continue;
                }

                // 2. Create the batch
                const batchId = uuidv4();
                await db.insert(payrollBatches).values({
                    id: batchId,
                    scheduleId: schedule.id,
                    status: 'PENDING',
                    totalAmountFiat: String(totalAmountFiat),
                    totalAmountUsdt: "0",
                    currency,
                    recipientCount: recipientsData.length,
                    recipients: recipientsData,
                    updatedAt: new Date().toISOString()
                });

                // 3. Queue evaluation
                await payrollQueue.add('EVALUATE_BATCH', {
                    scheduleId: schedule.id,
                    batchId,
                    type: 'EVALUATE_FUNDING',
                    agentPrompt: `Autonomous ${schedule.timing.toLowerCase()} run triggered by system scheduler.`
                });

                // 4. Update schedule next run / status
                if (schedule.timing === 'RECURRING') {
                    const currentMonth = now.getMonth();
                    const nextMonth = new Date(now.getFullYear(), currentMonth + 1, 1);
                    await db.update(payrollSchedules)
                        .set({ nextRunAt: nextMonth.toISOString(), updatedAt: new Date().toISOString() })
                        .where(eq(payrollSchedules.id, schedule.id));
                } else {
                    // ONE_TIME is now triggered, mark as COMPLETED
                    await db.update(payrollSchedules)
                        .set({ status: 'COMPLETED' as any, updatedAt: new Date().toISOString() })
                        .where(eq(payrollSchedules.id, schedule.id));
                }

                console.log(`[ScheduleTrigger] ✅ Batch ${batchId} created and queued for schedule ${schedule.id} (${schedule.timing})`);

            } catch (scheduleErr: any) {
                console.error(`[ScheduleTrigger] Error processing schedule ${schedule.id}:`, scheduleErr.message);
            }
        }
    } catch (err: any) {
        console.error('[ScheduleTrigger] Poll error:', err.message);
    }
}

const POLL_INTERVAL = 60 * 60 * 1000; // Check every hour

export function startScheduleTrigger() {
    console.log(`[ScheduleTrigger] ⏰ Started (polling every ${POLL_INTERVAL / (60 * 60 * 1000)}h)`);
    setInterval(triggerSchedules, POLL_INTERVAL);
    // Run immediately once
    triggerSchedules();
}
