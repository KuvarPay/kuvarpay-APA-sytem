import 'dotenv/config';
import { 
    Asset, 
    Networks, 
    Keypair, 
    TransactionBuilder, 
    Operation, 
    Horizon
} from '@stellar/stellar-sdk';

/**
 * Script to set a USDC Trustline on a Stellar Wallet.
 * 
 * Usage:
 * npx tsx src/scripts/setUsdcTrustline.ts [SECRET_KEY]
 * 
 * If no secret key is provided, it will use STELLAR_MASTER_SECRET from the .env file.
 */
async function setTrustline() {
    console.log('🌟 --- STELLAR USDC TRUSTLINE SETUP --- 🌟\n');

    // Determine network
    const isTestnet = process.env.STELLAR_NETWORK === 'testnet';
    const server = new Horizon.Server(
        isTestnet ? 'https://horizon-testnet.stellar.org' : 'https://horizon.stellar.org'
    );
    const networkPassphrase = isTestnet ? Networks.TESTNET : Networks.PUBLIC;
    
    // Set appropriate USDC Issuer based on Network
    let usdcIssuer = isTestnet 
        ? 'GBBD67V63DU765MCO6BK6S6S475BEEI7N2W2ULYV4K6A4BOKO6B4ZUSK'
        : 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'; 
        // Note: Using the official Centre USDC issuer for Public net

    // Determine target wallet
    const args = process.argv.slice(2);
    const secretKey = args[0] || process.env.STELLAR_MASTER_SECRET;

    if (!secretKey) {
        console.error('❌ ERROR: No secret key provided.');
        console.log('Provide it as an argument or ensure STELLAR_MASTER_SECRET is in your .env file.');
        process.exit(1);
    }

    try {
        const keypair = Keypair.fromSecret(secretKey);
        const publicKey = keypair.publicKey();

        console.log(`📡 Network: ${isTestnet ? 'TESTNET' : 'PUBLIC'}`);
        console.log(`🏦 Target Wallet: ${publicKey}`);
        console.log(`💎 Asset: USDC`);
        console.log(`🏛️ Issuer: ${usdcIssuer}\n`);

        console.log('⏳ Loading account from Horizon...');
        const sourceAccount = await server.loadAccount(publicKey);

        // Check if trustline already exists
        const balances = sourceAccount.balances as any[];
        const hasTrustline = balances.some(b => b.asset_code === 'USDC' && b.asset_issuer === usdcIssuer);

        if (hasTrustline) {
            console.log('✅ Success: This wallet ALREADY has an active trustline for USDC.');
            process.exit(0);
        }

        console.log('🛠️ Building ChangeTrust operation...');
        const usdcAsset = new Asset('USDC', usdcIssuer);

        const txBuilder = new TransactionBuilder(sourceAccount, {
            fee: '1000',
            networkPassphrase: networkPassphrase
        })
        .addOperation(Operation.changeTrust({
            asset: usdcAsset,
            // limit: '100000000' // Optional: omit to default to max limit
        }))
        .setTimeout(30);

        const tx = txBuilder.build();
        
        console.log('✍️ Signing transaction...');
        tx.sign(keypair);

        console.log('🚀 Submitting to Stellar network...');
        const result = await server.submitTransaction(tx);
        
        console.log(`\n🎉 TRUSTLINE CREATED SUCCESSFULLY!`);
        console.log(`🔗 Transaction Hash: ${result.hash}`);
        console.log(`Explorer Link: https://stellar.expert/explorer/${isTestnet ? 'testnet' : 'public'}/tx/${result.hash}\n`);

    } catch (error: any) {
        console.error('\n❌ FAILED TO CREATE TRUSTLINE:');
        if (error.response && error.response.data) {
            console.error('Horizon Error:', JSON.stringify(error.response.data.extras, null, 2));
            if (error.response.data.extras?.result_codes?.operations?.includes('op_low_reserve')) {
                console.error('\n💡 HINT: You need at least 1.5 XLM in this wallet to establish a trustline (0.5 XLM for the account reserve + 0.5 XLM for the trustline + buffer). Fund the wallet first!');
            }
        } else {
            console.error(error.message || error);
        }
        process.exit(1);
    }
}

setTrustline();
