import { db, schema } from '../../../database/rayswap-db/src/index';
import { eq, and, gt, desc } from 'drizzle-orm';

const { exchangeRates, paymentFiatRates } = schema;

/**
 * FxService for the Autonomous Payroll Agent.
 *
 * Mirrors the fiat-gateway-ts settlement exchange rate logic:
 * - Uses `settlement_snapshot` rates from `exchange_rates` table
 *   (written by the settlement cron's PaymentFiatRateService.snapshotRatesForSettlement)
 * - Conversion chain: Source Fiat → NGN → USD → USDT (crypto)
 * - Falls back to paymentFiatRates / auto exchange_rates if no snapshot exists
 */
export class FxService {
    /**
     * Get the conversion rate from a fiat currency to USD,
     * using the same rate chain the settlement cron uses for crypto payouts.
     *
     * Settlement chain: SourceFiat → NGN → USD
     *  - NGN→USD: exchange_rates where baseCurrency='USD', targetCurrency='NGN', source='settlement_snapshot'
     *  - SourceFiat→NGN: exchange_rates where baseCurrency='NGN', targetCurrency=source, source='settlement_snapshot'
     *
     * Returns: 1 USD = X SourceFiat (e.g. 1 USD = 1420 NGN)
     *          so to convert fiat→USD you do: fiatAmount / rate
     */
    static async getRate(targetCurrency: string): Promise<number | null> {
        const target = targetCurrency.toUpperCase();

        if (target === 'USD' || target === 'USDT') return 1.0;

        try {
            // ── Step 1: Get USD→NGN snapshot rate ──
            const usdToNgnRate = await this.getUsdToNgnRate();
            if (!usdToNgnRate) return null;

            // ── If the target IS NGN, we're done ──
            if (target === 'NGN') {
                return usdToNgnRate; // 1 USD = X NGN
            }

            // ── Step 2: Get NGN→TargetFiat snapshot rate ──
            // Settlement stores baseCurrency='NGN', targetCurrency=<currency>
            const ngnToTargetRate = await this.getNgnToTargetRate(target);
            if (!ngnToTargetRate) return null;

            // ── Step 3: Derive USD→Target rate ──
            // usdToNgnRate = how many NGN per 1 USD
            // ngnToTargetRate = how many TargetFiat per 1 NGN (Flutterwave transfer rate)
            // So USD→Target = usdToNgnRate * ngnToTargetRate
            return usdToNgnRate * ngnToTargetRate;
        } catch (error) {
            console.error(`[FxService] Error fetching rate for ${target}:`, error);
            return null;
        }
    }

    /**
     * Get the USD→NGN rate, prioritising settlement_snapshot,
     * then paymentFiatRates, then any auto exchange_rates.
     */
    private static async getUsdToNgnRate(): Promise<number | null> {
        // 1. Settlement snapshot (written by settlement cron – Bybit BUY + spread)
        const [snapshot] = await db
            .select()
            .from(exchangeRates)
            .where(and(
                eq(exchangeRates.baseCurrency, 'USD'),
                eq(exchangeRates.targetCurrency, 'NGN'),
                eq(exchangeRates.source, 'settlement_snapshot')
            ))
            .orderBy(desc(exchangeRates.fetchedAt))
            .limit(1);

        if (snapshot) {
            const r = parseFloat(snapshot.rate);
            if (Number.isFinite(r) && r > 0) return r;
        }

        // 2. Marketplace P2P rate from paymentFiatRates table
        const [fiatRate] = await db
            .select()
            .from(paymentFiatRates)
            .where(eq(paymentFiatRates.currency, 'NGN'))
            .limit(1);

        if (fiatRate) {
            const r = parseFloat(fiatRate.rate);
            if (Number.isFinite(r) && r > 0) return r;
        }

        // 3. Any auto exchange_rates
        const [autoRow] = await db
            .select()
            .from(exchangeRates)
            .where(and(
                eq(exchangeRates.baseCurrency, 'USD'),
                eq(exchangeRates.targetCurrency, 'NGN')
            ))
            .orderBy(desc(exchangeRates.fetchedAt))
            .limit(1);

        if (autoRow) {
            const r = parseFloat(autoRow.rate);
            if (Number.isFinite(r) && r > 0) return r;
        }

        return null;
    }

    /**
     * Get the NGN→TargetFiat rate, prioritising settlement_snapshot,
     * then paymentFiatRates, then any auto exchange_rates.
     */
    private static async getNgnToTargetRate(target: string): Promise<number | null> {
        // 1. Settlement snapshot (written by settlement cron – Flutterwave rates)
        const [snapshot] = await db
            .select()
            .from(exchangeRates)
            .where(and(
                eq(exchangeRates.baseCurrency, 'NGN'),
                eq(exchangeRates.targetCurrency, target),
                eq(exchangeRates.source, 'settlement_snapshot')
            ))
            .orderBy(desc(exchangeRates.fetchedAt))
            .limit(1);

        if (snapshot) {
            const r = parseFloat(snapshot.rate);
            if (Number.isFinite(r) && r > 0) return r;
        }

        // 2. paymentFiatRates stores "1 <target> = X NGN" – we need the inverse
        const [fiatRate] = await db
            .select()
            .from(paymentFiatRates)
            .where(eq(paymentFiatRates.currency, target))
            .limit(1);

        if (fiatRate) {
            const targetToNgn = parseFloat(fiatRate.rate);
            if (Number.isFinite(targetToNgn) && targetToNgn > 0) {
                return 1 / targetToNgn; // invert: NGN→Target
            }
        }

        // 3. Any auto exchange_rates
        const [autoRow] = await db
            .select()
            .from(exchangeRates)
            .where(and(
                eq(exchangeRates.baseCurrency, 'NGN'),
                eq(exchangeRates.targetCurrency, target)
            ))
            .orderBy(desc(exchangeRates.fetchedAt))
            .limit(1);

        if (autoRow) {
            const r = parseFloat(autoRow.rate);
            if (Number.isFinite(r) && r > 0) return r;
        }

        return null;
    }

    /**
     * Convert a fiat amount to USD/USDT using the settlement rate chain.
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
