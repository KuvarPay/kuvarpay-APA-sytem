import dotenv from 'dotenv';
dotenv.config();

import { payrollWorker } from './scheduler';
import { startFundingMonitor } from './funding-monitor';

console.log('🚀 APA Payroll Worker started...');

payrollWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
});

payrollWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
});

// Start the funding monitor (polls vault balances)
startFundingMonitor();
