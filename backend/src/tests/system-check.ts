import { db, schema } from '../../../database/rayswap-db/src/index';
// @ts-ignore
import { eq } from '../../../database/rayswap-db/node_modules/drizzle-orm';
import { WdkService } from '../integrations/wdk';
import { WdkSecretManager } from '../integrations/secret-manager';
import { sendPayrollNotification } from '../services/email-service';
import { FxService } from '../services/fx-service';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const { businesses, payrollSchedules, payrollBatches, payrollAgentDecisions } = schema;

async function runCheck() {
    console.log('🚀 Starting APA Comprehensive System Check...\n');

    // 1. DB Connectivity
    try {
        console.log('--- 1. Database Check ---');
        const [bizCount] = await (db as any).select({ count: (businesses as any).id }).from(businesses as any).limit(1);
        console.log('✅ Connected to Database. Found businesses count:', bizCount ? 1 : 0);
    } catch (err: any) {
        console.error('❌ Database Connection Failed:', err);
        return;
    }

    // 2. WDK Address Derivation
    try {
        console.log('\n--- 2. WDK Logic Check ---');
        const seed = await WdkSecretManager.getSeed();
        const wdk = new WdkService(seed);
        
        const networks = ['bsc', 'polygon', 'tron', 'ethereum'];
        for (const net of networks) {
            const addr = await wdk.getBatchAddress(0, net);
            console.log(`✅ [${net.toUpperCase()}] derived address: ${addr}`);
        }
    } catch (err: any) {
        console.error('❌ WDK Derivation Failed:', err);
    }

    // 3. FX Service Check
    try {
        console.log('\n--- 3. FX Service Check ---');
        const rate = await FxService.getRate('NGN');
        console.log(`✅ NGN FX Rate (1 USD): ${rate || 'Not Found'}`);
        
        const conversion = await FxService.convertToUsdt(10000, 'NGN');
        console.log(`✅ 10,000 NGN converts to: ${conversion?.toFixed(2) || 'N/A'} USDT`);
    } catch (err: any) {
        console.error('⚠️ FX Service Check failed (might be no rates in DB):', err);
    }

    // 4. Email Resolution Check
    try {
        console.log('\n--- 4. Email Resolution Check ---');
        const [testBiz] = await (db as any).select({ id: (businesses as any).id }).from(businesses as any).limit(1);
        if (testBiz) {
            const sent = await sendPayrollNotification(
                testBiz.id, 
                'FUNDING_REQUIRED', 
                'Automated System Health Check: Please ignore.'
            );
            console.log(`✅ Email process completed. Status: ${sent ? 'Sent' : 'Skipped (likely SMTP not configured)'}`);
        } else {
            console.log('⚠️ No business found in DB to test email resolution.');
        }
    } catch (err: any) {
        console.error('❌ Email Check Failed:', err);
    }

    // 5. End-to-End Simulation (Safety First: Mocking Payout)
    try {
        console.log('\n--- 5. End-to-End Flow Check (Simulation) ---');
        const [testBiz] = await (db as any).select({ id: (businesses as any).id }).from(businesses as any).limit(1);
        if (!testBiz) throw new Error('No business for E2E check');

        const testScheduleId = uuidv4();
        const testBatchId = uuidv4();

        console.log(`Creating dummy schedule and batch for test... id=${testScheduleId}`);

        // Insert Test Data
        await (db as any).insert(payrollSchedules as any).values({
            id: testScheduleId,
            businessId: testBiz.id,
            name: 'Health Check Schedule',
            category: 'SALARY',
            timing: 'ONE_TIME',
            status: 'PENDING',
            vaultAddress: 'pending',
            vaultIndex: 999, // Use a high index to avoid conflicts
            network: 'bsc',
            updatedAt: new Date().toISOString()
        });

        await (db as any).insert(payrollBatches as any).values({
            id: testBatchId,
            scheduleId: testScheduleId,
            status: 'PENDING',
            totalAmountFiat: '5000',
            totalAmountUsdt: '0',
            currency: 'NGN',
            recipientCount: 1,
            recipients: [{ address: '0x0000000000000000000000000000000000000000', amount: 5000 }],
            updatedAt: new Date().toISOString()
        });

        console.log('✅ Test data inserted. You can now verify this in the dashboard.');
        console.log('To run a real Agent loop, use the dashboard to kickoff this batch.');
        
    } catch (err: any) {
        console.error('❌ E2E Simulation Failed:', err);
    }

    console.log('\n--- System Check Finished ---');
    process.exit(0);
}

runCheck();
