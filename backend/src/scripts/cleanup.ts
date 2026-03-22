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
    console.log('🧹 Cleaning up payroll tables...');
    
    // The specific schedule ID from the logs
    const scheduleId = '467ea793-dcb1-4e0f-b931-08f9555e4228';
    
    try {
        console.log(`🗑️ Deleting recipients linked to schedule ${scheduleId}...`);
        await db.delete(scheduleRecipients).where(eq(scheduleRecipients.scheduleId, scheduleId));
        
        console.log(`🗑️ Deleting decisions linked to schedule ${scheduleId}...`);
        await db.delete(payrollAgentDecisions).where(eq(payrollAgentDecisions.scheduleId, scheduleId));
        
        console.log(`🗑️ Deleting all batches linked to schedule ${scheduleId}...`);
        await db.delete(payrollBatches).where(eq(payrollBatches.scheduleId, scheduleId));
        
        console.log(`🗑️ Deleting schedule ${scheduleId}...`);
        await db.delete(payrollSchedules).where(eq(payrollSchedules.id, scheduleId));
        
        console.log('✅ Specific Cleanup successful.');
        
        // Final sanity check: Total active schedules remaining
        const remaining = await db.select().from(payrollSchedules);
        console.log(`📊 Current payroll schedules count: ${remaining.length}`);
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Cleanup failed:', err);
        process.exit(1);
    }
}

cleanup();
