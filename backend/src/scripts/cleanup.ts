import { db, schema, eq, sql } from 'rayswap-db';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Manually replace host.docker.internal if needed
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('host.docker.internal')) {
    process.env.DATABASE_URL = process.env.DATABASE_URL!.replace('host.docker.internal', 'localhost');
}

const {
    payrollSchedules,
    payrollBatches,
    payrollAgentDecisions,
    scheduleRecipients
} = schema;

async function cleanup() {
    console.log('🧹 Cleaning up ALL payroll tables (Wiping everything)...');
    
    try {
        console.log('🗑️ Clearing schedule recipients...');
        await db.delete(scheduleRecipients);
        
        console.log('🗑️ Clearing agent decisions...');
        await db.delete(payrollAgentDecisions);
        
        console.log('🗑️ Clearing all batches...');
        await db.delete(payrollBatches);
        
        console.log('🗑️ Clearing all schedules...');
        await db.delete(payrollSchedules);
        
        console.log('✅ DATABASE WIPED: All payroll data has been deleted.');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Cleanup failed:', err);
        process.exit(1);
    }
}

cleanup();
