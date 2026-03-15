# Skill: exchange-rate (APA Tool Optimized)

Instructions for the APA Brain to fetch and apply real-time FX rates for payroll calculations.

## Strategy
1. **Fetch**: Call 'apa_get_rates' with the specific currency.
2. **Buffer**: Always apply a **5% security buffer** to the rate to protect against volatility during the funding period.
3. **Conversion**:
   - `Final_Amount_USDT = (Recipient_Fiat_Amount / Rate) * 1.05`

## Safety
- Never use external public price feeds if the 'apa_get_rates' tool is available, as it uses the same liquidity provider as our settlement engine.
- **Caching**: Trust rates for a maximum of 15 minutes.

## Application Logic
1. **The Core Calculation**:
   - `Actual_Cost = Amount_Fiat / FX_Rate`
   - `Final_Requirement = Actual_Cost * 1.05` (Mandatory 5% volatility buffer).
2. **Rounding**: Always round up to 2 decimal places to favor the treasury.
3. **Multi-Currency Batches**:
   - If a batch has NGN and KES, fetch both rates.
   - Sum the total USDT requirement across all corridors.

## Decision Guardrails
- If a rate has changed by >2% since the batch was created, trigger a `RE-EVALUATION` state.
- If the KuvarPay API is unreachable, retry 3 times with exponential backoff before marking the batch as `STALLED`.
