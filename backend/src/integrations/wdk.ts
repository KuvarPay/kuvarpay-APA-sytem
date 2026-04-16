import WdkManager from "@tetherto/wdk";
import EvmWalletManager from "@tetherto/wdk-wallet-evm";
import TronWalletManager from "@tetherto/wdk-wallet-tron";
import { StellarService } from "./stellar";

/**
 * BlockchainService handles on-chain interactions across multiple networks.
 * It uses Tether WDK for EVM/Tron and native Stellar SDK for XLM.
 */
export class BlockchainService {
    private wdk: any;
    private stellar: StellarService;

    constructor(seed: string) {
        if (!seed) {
            throw new Error("[BlockchainService] Seed is required for initialization.");
        }

        try {
            const cleanSeed = seed.trim();
            this.wdk = new WdkManager(cleanSeed);
            this.stellar = new StellarService();

            // Register WDK Wallets
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

            console.log("[BlockchainService] Initialized successfully with multi-chain support (WDK + Stellar).");
        } catch (err: any) {
            console.error("[BlockchainService] FAILED to initialize:", err.message);
            throw err;
        }
    }

    /**
     * Get the vault address for a specific batch index.
     */
    async getAddress(index: number, network: string = 'bsc'): Promise<string> {
        if (network.toLowerCase() === 'xlm') {
            return process.env.STELLAR_MASTER_WALLET || '';
        }
        const wdkNetwork = this.toWdkNetwork(network);
        const account = await this.wdk.getAccount(wdkNetwork, index);
        return account.address || (account as any).__address;
    }

    /**
     * Get the balance for a given asset/network/memo.
     */
    async getBalance(params: {
        address: string;
        network: string;
        asset?: string;
        memo?: string;
        index?: number;
    }): Promise<number> {
        const { address, network, asset = 'USDT', memo, index = 0 } = params;

        if (process.env.APA_SIMULATION === 'true' || process.env.MOCK_FUNDING === 'true') {
            return 10000; // $10,000 mock
        }

        if (network.toLowerCase() === 'xlm') {
            return await this.stellar.getUsdcBalance(memo || '');
        }

        // Handle WDK-based chains (USDT)
        try {
            const tokenAddress = this.getTokenContract(asset, network);
            const wdkNetwork = this.toWdkNetwork(network);
            const account = await this.wdk.getAccount(wdkNetwork, index);
            const balanceBigInt = await (account as any).getTokenBalance(tokenAddress);
            return Number(balanceBigInt) / 1e6; // Assume 6 decimals for USDT/USDC usually
        } catch (error: any) {
            console.error(`[BlockchainService] Error fetching balance on ${network}:`, error.message);
            return 0;
        }
    }

    /**
     * Execute a token transfer.
     */
    async sendToken(params: {
        index: number;
        to: string;
        amount: number;
        network: string;
        asset?: string;
        memo?: string;
    }): Promise<string> {
        const { index, to, amount, network, asset = 'USDT', memo } = params;

        if (network.toLowerCase() === 'xlm') {
            return await this.stellar.sendUsdc(to, amount, memo);
        }

        // Handle WDK-based chains
        const wdkNetwork = this.toWdkNetwork(network);
        const tokenAddress = this.getTokenContract(asset, network);
        const account = await this.wdk.getAccount(wdkNetwork, index);
        const amountUnits = BigInt(Math.floor(amount * 1e6)); // 1e6 for USDT/USDC

        console.log(`[BlockchainService] Sending ${amount} ${asset} from index ${index} to ${to} on ${network}`);
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

    private getTokenContract(asset: string, network: string): string {
        const net = network.toLowerCase();
        const assetUpper = asset.toUpperCase();

        if (assetUpper === 'USDT') {
            switch (net) {
                case 'tron': return 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
                case 'ethereum': return '0xdAC17F958D2ee523a2206206994597C13D831ec7';
                case 'bsc': return '0x55d398326f99059fF775485246999027B3197955';
                case 'polygon': return '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
                case 'arbitrum': return '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9';
                case 'base': return '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2';
                case 'optimism': return '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58';
                default: return '0x55d398326f99059fF775485246999027B3197955';
            }
        }
        
        if (assetUpper === 'USDC') {
            // USDC Contracts on various chains
            switch (net) {
                case 'polygon': return '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'; // Native
                case 'ethereum': return '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
                case 'base': return '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
                case 'arbitrum': return '0xaf88d065e77c8cC2239326C036d319925741B6b0';
                default: return '';
            }
        }

        return '';
    }

    dispose() {
        this.wdk?.dispose();
    }
}
