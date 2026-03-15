import WdkManager from "@tetherto/wdk";
import EvmWalletManager from "@tetherto/wdk-wallet-evm";
import TronWalletManager from "@tetherto/wdk-wallet-tron";

/**
 * WdkService handles on-chain interactions using the Tether WDK.
 */
export class WdkService {
    private wdk: any;

    constructor(seed: string) {
        if (!seed) {
            throw new Error("[WdkService] Seed is required for initialization.");
        }

        try {
            // Stability Fix: Ensure seed is passed correctly. WDK accepts string or Uint8Array.
            // If the user's seed phrase has leading/trailing whitespace, BIP-39 validation fails.
            const cleanSeed = seed.trim();

            this.wdk = new WdkManager(cleanSeed);

            // Register Wallets with their respective RPCs
            this.wdk.registerWallet("ethereum", EvmWalletManager, {
                provider: process.env.ETH_RPC || "https://eth.drpc.org"
            });

            this.wdk.registerWallet("bsc", EvmWalletManager, {
                provider: process.env.BSC_RPC || "https://bsc-dataseed.binance.org"
            });

            this.wdk.registerWallet("polygon", EvmWalletManager, {
                provider: process.env.POLYGON_RPC || "https://polygon-rpc.com"
            });

            this.wdk.registerWallet("arbitrum", EvmWalletManager, {
                provider: process.env.ARBITRUM_RPC || "https://arb1.arbitrum.io/rpc"
            });

            this.wdk.registerWallet("base", EvmWalletManager, {
                provider: process.env.BASE_RPC || "https://mainnet.base.org"
            });

            this.wdk.registerWallet("optimism", EvmWalletManager, {
                provider: process.env.OPTIMISM_RPC || "https://mainnet.optimism.io"
            });

            this.wdk.registerWallet("tron", TronWalletManager, {
                provider: process.env.TRON_RPC || "https://api.trongrid.io"
            });

            console.log("[WdkService] Initialized successfully with multi-chain support.");
        } catch (err: any) {
            console.error("[WdkService] FAILED to initialize WdkManager:", err.message);
            throw err;
        }
    }

    /**
     * Get the vault address for a specific batch index.
     */
    async getBatchAddress(index: number, network: string = 'bsc'): Promise<string> {
        const wdkNetwork = this.toWdkNetwork(network);
        const account = await this.wdk.getAccount(wdkNetwork, index);
        return account.address;
    }

    /**
     * Get the real USDT balance for a given address.
     */
    async getUsdtBalance(address: string, network: string = 'bsc', index: number = 0): Promise<bigint> {
        if (process.env.MOCK_FUNDING === 'true') {
            return BigInt(10000 * 1e6); // $10,000 USDT
        }

        try {
            const tokenAddress = this.getUsdtContract(network);
            const wdkNetwork = this.toWdkNetwork(network);
            
            // Derive the account at the specific index to use its provider methods
            const account = await this.wdk.getAccount(wdkNetwork, index);
            
            return await (account as any).getTokenBalance(tokenAddress);
        } catch (error: any) {
            console.error(`[WdkService] Error fetching balance for ${address} on ${network}:`, error.message);
            return BigInt(0);
        }
    }

    /**
     * Execute a USDT transfer.
     */
    async sendUsdt(
        index: number, 
        to: string, 
        amountUsdt: number, 
        network: string = 'bsc'
    ): Promise<string> {
        const wdkNetwork = this.toWdkNetwork(network);
        const tokenAddress = this.getUsdtContract(network);
        const account = await this.wdk.getAccount(wdkNetwork, index);
        
        const amountUnits = BigInt(Math.floor(amountUsdt * 1e6));
        
        console.log(`[WdkService] Sending ${amountUsdt} USDT from index ${index} to ${to} on ${network}`);
        
        const tx = await (account as any).transferToken(tokenAddress, to, amountUnits);
        return tx.hash || tx.toString();
    }

    private toWdkNetwork(network: string): string {
        const net = network.toLowerCase();
        if (['tron', 'bsc', 'polygon', 'arbitrum', 'base', 'optimism', 'ethereum'].includes(net)) {
            return net;
        }
        return 'ethereum'; 
    }

    private getUsdtContract(network: string): string {
        switch (network.toLowerCase()) {
            case 'tron': return 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
            case 'ethereum': return '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            case 'bsc': return '0x55d398326f99059fF775485246999027B3197955';
            case 'polygon': return '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
            case 'arbitrum': return '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9';
            case 'base': return '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2';
            case 'optimism': return '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58';
            default: return '0x55d398326f99059fF775485246999027B3197955'; // Default to BSC if unknown
        }
    }

    /**
     * Dispose of the in-memory keys.
     */
    dispose() {
        this.wdk?.dispose();
    }
}
