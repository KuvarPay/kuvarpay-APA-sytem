import axios from 'axios';

const BASE_URL = process.env.APA_API_URL || 'http://localhost:3001/api/v1/payroll';

async function runTest() {
    console.log('\n==========================================');
    console.log('🚀 APA E2E: MULTI-CURRENCY FIAT PAYROLL');
    console.log('==========================================\n');

    try {
        // Stage 1: Create a Payroll Schedule
        console.log('STAGING: Creating payroll schedule...');
        const scheduleResponse = await axios.post(`${BASE_URL}/schedules`, {
            businessId: '34c708f8-2ca8-48e9-9ea5-ee7ddfe88e63',
            name: 'January 2026 Salaries',
            category: 'SALARY',
            network: 'bsc',
            timing: 'ONE_TIME'
        });

        const scheduleId = scheduleResponse.data.id;
        console.log(`✅ Schedule Created: ${scheduleId}`);

        // Stage 2: Submit multi-currency fiat payroll
        // Each recipient is paid in their LOCAL fiat currency
        console.log('\nACTION: Submitting multi-currency fiat payroll...');
        const batchResponse = await axios.post(`${BASE_URL}/schedules/${scheduleId}/submit`, {
            recipients: [
                {
                    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                    amount: 500000,
                    currency: 'NGN',
                    name: 'Adebayo (Nigeria)',
                    email: 'adebayo@company.com'
                },
                {
                    address: '0xABCdef1234567890abcdef1234567890ABCDef12',
                    amount: 350000,
                    currency: 'NGN',
                    name: 'Chioma (Nigeria)',
                    email: 'chioma@company.com'
                },
                {
                    address: '0x1111222233334444555566667777888899990000',
                    amount: 2500,
                    currency: 'GHS',
                    name: 'Kwame (Ghana)',
                    email: 'kwame@company.com'
                },
                {
                    address: '0x2222333344445555666677778888999900001111',
                    amount: 800000,
                    currency: 'RWF',
                    name: 'Uwimana (Rwanda)',
                    email: 'uwimana@company.com'
                }
            ],
            totalAmountFiat: 0, // Will be computed from recipients
            currency: 'NGN',    // Default/primary currency
            businessId: '34c708f8-2ca8-48e9-9ea5-ee7ddfe88e63',
            network: 'bsc',
            agentPrompt: 'Please be extra careful with the FX conversion for GHS and RWF. Ensure the 5% buffer is applied. Provide a detailed summary of your math.'
        });

        const batchId = batchResponse.data.batchId;
        console.log(`✅ Batch Submitted: ${batchId}`);
        console.log(`🤖 ${batchResponse.data.message}`);

        // Stage 3: Poll for agent decision
        console.log('\nMONITORING: Waiting for AI Agent to evaluate...');
        let attempts = 0;
        const maxAttempts = 20;

        while (attempts < maxAttempts) {
            attempts++;
            await new Promise(r => setTimeout(r, 5000));

            try {
                // Add businessId to query to pass auth check
                const statusResponse = await axios.get(`${BASE_URL}/batches/${batchId}?businessId=${'34c708f8-2ca8-48e9-9ea5-ee7ddfe88e63'}`);
                const data = statusResponse.data;

                console.log(`[Attempt ${attempts}] Status: ${data.status}`);
                if (data.reasoning && data.reasoning !== 'Agent is still processing...') {
                    console.log(`\n💬 Agent Reasoning:\n${data.reasoning}`);
                }

                if (['FUNDING_REQUIRED', 'FUNDED', 'COMPLETED', 'FAILED'].includes(data.status)) {
                    console.log(`\n🎯 Terminal State: ${data.status}`);

                    // Show the computed USDT amount
                    if (data.totalAmountUsdt && data.totalAmountUsdt !== '0') {
                        console.log(`💰 Total USDT Required: ${data.totalAmountUsdt} USDT`);
                    }

                    // Show vault address from schedule
                    const scheduleDetails = await axios.get(`${BASE_URL}/batches/${batchId}?businessId=${'34c708f8-2ca8-48e9-9ea5-ee7ddfe88e63'}`);
                    console.log(`🏦 Fund to Vault: ${scheduleDetails.data.vaultAddress || 'Check schedule'}`);

                    break;
                }
            } catch (err: any) {
                console.warn(`⚠️  Status check failed: ${err.message}`);
            }
        }

        // Stage 4: Verify DB state
        console.log('\n--- VERIFICATION ---');
        const finalStatus = await axios.get(`${BASE_URL}/batches/${batchId}?businessId=${'34c708f8-2ca8-48e9-9ea5-ee7ddfe88e63'}`);
        console.log(`Final Status: ${finalStatus.data.status}`);
        console.log(`Final USDT Amount: ${finalStatus.data.totalAmountUsdt}`);

        console.log('\n==========================================');
        console.log('✅ E2E MULTI-CURRENCY TEST COMPLETE');
        console.log('==========================================\n');

    } catch (error: any) {
        console.error('\n❌ E2E TEST FAILED');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
        } else {
            console.error(`Error: ${error.message}`);
        }
        process.exit(1);
    }
}

runTest();
