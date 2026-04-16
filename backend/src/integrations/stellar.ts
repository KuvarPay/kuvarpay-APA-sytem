import { 
    Asset, 
    Networks, 
    Keypair, 
    TransactionBuilder, 
    Operation, 
    Memo,
    Horizon
} from '@stellar/stellar-sdk';

/**
 * StellarService handles collections and payouts for USDC on the Stellar network.
 * It uses a Master Wallet + Memo strategy for deposit identification.
 */
export class StellarService {
    private server: Horizon.Server;
    private networkPassphrase: string;
    private masterWalletAddress: string;
    private masterSecretKey: string;

    constructor() {
        const isTestnet = process.env.STELLAR_NETWORK === 'testnet';
        this.server = new Horizon.Server(
            isTestnet ? 'https://horizon-testnet.stellar.org' : 'https://horizon.stellar.org'
        );
        this.networkPassphrase = isTestnet ? Networks.TESTNET : Networks.PUBLIC;
        this.masterWalletAddress = process.env.STELLAR_MASTER_WALLET || '';
        this.masterSecretKey = process.env.STELLAR_MASTER_SECRET || '';
    }

    private getUsdcIssuer(): string {
        const isTestnet = process.env.STELLAR_NETWORK === 'testnet';
        return isTestnet 
            ? 'GBBD67V63DU765MCO6BK6S6S475BEEI7N2W2ULYV4K6A4BOKO6B4ZUSK' 
            : 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';
    }

    /**
     * Get the USDC balance linked to a specific memo from the Master Wallet.
     * Since we use a Master Wallet, we check recent payments for this memo.
     */
    async getUsdcBalance(memo: string): Promise<number> {
        if (process.env.APA_SIMULATION === 'true') {
            return 10000; // Mock $10k
        }

        if (!this.masterWalletAddress) {
            console.error('[StellarService] Master Wallet address missing.');
            return 0;
        }

        try {
            // Fetch recent payments for the master wallet
            const payments = await this.server.payments()
                .forAccount(this.masterWalletAddress)
                .order('desc')
                .limit(50)
                .call();

            let totalForMemo = 0;
            const usdcIssuer = this.getUsdcIssuer();

            for (const payment of (payments.records as any[])) {
                // Check if it's a USDC payment
                if (
                    payment.type === 'payment' &&
                    payment.asset_code === 'USDC' &&
                    payment.asset_issuer === usdcIssuer &&
                    payment.to === this.masterWalletAddress
                ) {
                    // Fetch transaction to verify memo
                    const tx = await payment.transaction();
                    if (tx.memo === memo) {
                        totalForMemo += parseFloat(payment.amount);
                    }
                }
            }

            return totalForMemo;
        } catch (error: any) {
            console.error('[StellarService] Error fetching balance:', error.message);
            return 0;
        }
    }

    /**
     * Send USDC from the Master Wallet to a recipient.
     */
    async sendUsdc(to: string, amount: number, memo?: string): Promise<string> {
        if (!this.masterSecretKey) {
            throw new Error('[StellarService] Master Secret Key missing.');
        }

        try {
            const keypair = Keypair.fromSecret(this.masterSecretKey);
            const sourceAccount = await this.server.loadAccount(keypair.publicKey());
            const usdcAsset = new Asset('USDC', this.getUsdcIssuer());

            const txBuilder = new TransactionBuilder(sourceAccount, {
                fee: '1000',
                networkPassphrase: this.networkPassphrase
            })
            .addOperation(Operation.payment({
                destination: to,
                asset: usdcAsset,
                amount: amount.toFixed(7)
            }))
            .setTimeout(30);

            if (memo) {
                txBuilder.addMemo(Memo.text(memo));
            }

            const tx = txBuilder.build();
            tx.sign(keypair);

            const result = await this.server.submitTransaction(tx);
            return result.hash;
        } catch (error: any) {
            console.error('[StellarService] Error sending USDC:', error.message);
            throw error;
        }
    }

    /**
     * Generate a unique numeric memo for a new schedule.
     */
    static generateMemo(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}

export default StellarService;
