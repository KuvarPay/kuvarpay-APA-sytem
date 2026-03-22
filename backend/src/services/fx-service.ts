import { db, schema, eq, and, desc } from 'rayswap-db';

const { exchangeRates, paymentFiatRates } = schema;

/**
 * FxService for the Autonomous Payroll Agent.
 * 
 * Logic updated to prioritize Checkout/Transactional rates from the marketplace.
 * The APA essentially performs a "Buy USDT, Sell FIAT" operation for the merchant.
 */
export class FxService {
    /**
     * Get the conversion rate from a fiat currency to USD/USDT.
     * Returns: 1 USD = X SourceFiat (e.g., 1 USD = 1420 NGN or 1 USD = 14.5 GHS)
     * To convert fiat -> USD, use: fiatAmount / rate
     */
    static async getRate(targetCurrency: string): Promise<number | null> {
        const target = targetCurrency.toUpperCase();

        if (target === 'USD' || target === 'USDT') return 1.0;

        try {
            // 1. Priority: payment_fiat_rates (Checkout/Transactional rates)
            // These are the live rates used during a normal checkout flow.
            const [fiatRate] = await db
                .select()
                .from(paymentFiatRates)
                .where(eq(paymentFiatRates.currency, target) as any)
                .limit(1);

            if (fiatRate) {
                const r = parseFloat(fiatRate.rate);
                if (Number.isFinite(r) && r > 0) return r;
            }

            // 2. Secondary: settlement_snapshot (Stable treasury rates)
            // Fallback if no specific checkout rate is available for this currency.
            const [snapshot] = await db
                .select()
                .from(exchangeRates)
                .where(and(
                    eq(exchangeRates.baseCurrency, 'USD'),
                    eq(exchangeRates.targetCurrency, target),
                    eq(exchangeRates.source, 'settlement_snapshot')
                ) as any)
                .orderBy(desc(exchangeRates.fetchedAt))
                .limit(1);

            if (snapshot) {
                const r = parseFloat(snapshot.rate);
                if (Number.isFinite(r) && r > 0) return r;
            }

            // 3. Last Resort: Any auto exchange_rates matching USD -> Target
            const [autoRow] = await db
                .select()
                .from(exchangeRates)
                .where(and(
                    eq(exchangeRates.baseCurrency, 'USD'),
                    eq(exchangeRates.targetCurrency, target)
                ) as any)
                .orderBy(desc(exchangeRates.fetchedAt))
                .limit(1);

            if (autoRow) {
                const r = parseFloat(autoRow.rate);
                if (Number.isFinite(r) && r > 0) return r;
            }

            return null;
        } catch (error) {
            console.error(`[FxService] Error fetching rate for ${target}:`, error);
            return null;
        }
    }

    /**
     * Convert a fiat amount to USD/USDT.
     * This is what the AI agent calls to determine how much USDT a merchant
     * needs to fund for a payroll denominated in local fiat.
     */
    static async convertToUsdt(amount: number, currency: string): Promise<number | null> {
        const cur = currency.toUpperCase();
        if (cur === 'USD' || cur === 'USDT') return amount;

        const rate = await this.getRate(cur);
        if (!rate) return null;

        // rate = 1 USD = X fiat, so fiatAmount / rate = USD amount
        return amount / rate;
    }
}
