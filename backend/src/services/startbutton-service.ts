import axios from 'axios';

const STARTBUTTON_SECRET_KEY = process.env.STARTBUTTON_SECRET_KEY || '';
const STARTBUTTON_BASE_URL = 'https://api.startbutton.tech';

export interface StartbuttonTransferRequest {
    amount: number;
    currency: string;
    country: string;
    bankCode?: string;
    accountNumber?: string;
    accountName?: string;
    MNO?: string;
    msisdn?: string;
    reference?: string;
}

export class StartbuttonService {
    /**
     * Initiate a transfer via Startbutton.
     * Supports Bank and Mobile Money payouts.
     */
    static async initiateTransfer(payload: StartbuttonTransferRequest) {
        if (!STARTBUTTON_SECRET_KEY) {
            throw new Error('STARTBUTTON_SECRET_KEY is not configured');
        }

        // Mock mode for local testing — skip real API call
        if (process.env.MOCK_PAYOUT === 'true' || process.env.APA_SIMULATION === 'true') {
            console.log(`[Startbutton] SIMULATION/MOCK_PAYOUT: Simulating transfer of ${payload.amount} ${payload.currency} to ${payload.accountNumber || payload.msisdn}`);
            return {
                success: true,
                data: {
                    id: `mock_${Date.now()}`,
                    reference: payload.reference || `mock_ref_${Date.now()}`,
                    status: 'SUCCESS'
                }
            };
        }

        try {
            const response = await axios.post(`${STARTBUTTON_BASE_URL}/transaction/transfer`, payload, {
                headers: {
                    'Authorization': `Bearer ${STARTBUTTON_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message;
            console.error('[Startbutton] Transfer failed:', msg);
            throw new Error(`Startbutton transfer failed: ${msg}`);
        }
    }

    /**
     * Retrieve the list of banks or mobile money operators for a currency.
     */
    static async getBankList(currency: string, type: 'bank' | 'mobile_money' = 'bank', countryCode?: string) {
        if (process.env.APA_SIMULATION === 'true') {
            return { 
                success: true, 
                data: [{ name: 'Test Provider', code: '000' }] 
            };
        }

        try {
            let url = `${STARTBUTTON_BASE_URL}/bank/list/${currency.toUpperCase()}?type=${type}`;
            if (countryCode) {
                url += `&countryCode=${countryCode}`;
            }

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${STARTBUTTON_SECRET_KEY}`
                }
            });

            return response.data;
        } catch (error: any) {
            console.error('[Startbutton] Failed to fetch bank list:', error.message);
            return null;
        }
    }

    /**
     * Verify a bank account or mobile money identity.
     * Available for NGN and GHS.
     */
    static async verifyAccount(bankCode: string, accountNumber: string, countryCode: 'NGN' | 'GH') {
        if (process.env.APA_SIMULATION === 'true') {
            return {
                success: true,
                data: { accountName: 'Test Sim User', accountNumber }
            };
        }

        try {
            const response = await axios.get(`${STARTBUTTON_BASE_URL}/bank/verify`, {
                params: { bankCode, accountNumber, countryCode },
                headers: {
                    'Authorization': `Bearer ${STARTBUTTON_SECRET_KEY}`
                }
            });

            return response.data;
        } catch (error: any) {
            console.error('[Startbutton] Account verification failed:', error.message);
            return null;
        }
    }
    /**
     * Get the Startbutton wallet balances across all currencies.
     */
    static async getWalletBalance() {
        if (process.env.APA_SIMULATION === 'true') {
            return {
                success: true,
                data: [
                    { currency: 'USDT', balance: '10000.00' },
                    { currency: 'NGN', balance: '5000000.00' }
                ]
            };
        }

        if (!STARTBUTTON_SECRET_KEY) {
            throw new Error('STARTBUTTON_SECRET_KEY is not configured');
        }

        try {
            const response = await axios.get(`${STARTBUTTON_BASE_URL}/wallet`, {
                headers: {
                    'Authorization': `Bearer ${STARTBUTTON_SECRET_KEY}`
                }
            });

            return response.data;
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message;
            console.error('[Startbutton] Wallet balance check failed:', msg);
            throw new Error(`Startbutton wallet balance check failed: ${msg}`);
        }
    }
}
