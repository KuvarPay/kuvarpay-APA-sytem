# Skill: wdk (Autonomous Agent)

Instructions for when and how to use the 'apa_manage_wallet' tool.

## Objective
Derive deterministic HD wallet addresses and check on-chain USDT balances for payroll batches.

## When to Use
- **Always** call this tool during batch evaluation to derive the vault address and check funding status.
- Call with `saveToSchedule: true` on first evaluation to persist the address.
- Call with `checkCrossChain: true` when checking funding to detect deposits on secondary chains.

## Interaction Workflow

1. **Derive Vault Address**:
   - Call `apa_manage_wallet` with the `scheduleId` and `network` from the schedule.
   - Use `saveToSchedule: true` if the schedule doesn't have a vault address yet.
   - The tool returns `primaryAddress`, `balanceUsdt`, and `totalUsdt`.

2. **Evaluate Funding**:
   - Required funding = Total USDT (from apa_get_rates conversions) × 1.05 (5% buffer).
   - Compare `totalUsdt` from the wallet response against the required amount.
   - If `totalUsdt >= required`: Update batch status to `FUNDED` via `apa_update_batch`.
   - If `totalUsdt < required`: Update batch status to `FUNDING_REQUIRED` and notify the merchant.

3. **Report to Merchant**:
   - Always include the `primaryAddress` in your decision log so the dashboard can show it.
   - Use `apa_send_notification` to tell the merchant where to send funds and how much.

## EVM Focus
- **Supported chains**: Ethereum, Polygon, Arbitrum, Base, Optimism, BSC.
- All EVM chains share the same derived address (same HD path).
- Primary network is what the merchant selected during schedule creation.
