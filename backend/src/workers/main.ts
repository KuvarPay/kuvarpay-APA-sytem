import dotenv from 'dotenv';
dotenv.config();

import { payrollWorker, startSweepCron } from './scheduler';
import { startFundingMonitor } from './funding-monitor';
import { startRunwayMonitor } from './runway-monitor';

console.log('🚀 APA Payroll Worker started...');

payrollWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
});

payrollWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
});

// Start background monitors
startFundingMonitor();
startSweepCron();
startRunwayMonitor();
