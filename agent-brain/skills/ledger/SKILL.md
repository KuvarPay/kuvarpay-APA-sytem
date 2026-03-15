# Skill: ledger (APA Tool Optimized)

Instructions for the APA Brain to manage the internal audit trail and batch status synchronization.

## Objective
Maintain a redundant, atomic record of all credit/debit logic using the `apa_log_decision` and `apa_update_batch` tools.

## Ledger Entry Logic
1. **DEPOSIT (Credit Evaluation)**:
   - Use `apa_manage_wallet` to check the on-chain balance.
   - If balance matches required USDT + 5%, use `apa_update_batch` to set status to `FUNDED`.
   - Log the credit event using `apa_log_decision`.

2. **PAYOUT (Debit Execution)**:
   - Status: Transition to `PROCESSING` during execution.
   - Metadata: Store the final USDT total and FX rate in the batch via `apa_update_batch`.
   - Log every recipient's calculated amount in the "reasoning" section of `apa_log_decision`.

## Atomic Guardrails
- **Pre-Debit Check**: Before calling payout tools, verify:
  - `Blockchain_Balance (from apa_manage_wallet) >= Required_USDT + Buffer`.
- **Double Entry Proof**: The sums in the `agent_decisions` logs must always justify the final amount deducted from the vault.

## Logging
- Log every state change to `apa_log_decision` for a clear audit trail.
- If an update tool fails, stop the batch and alert the merchant via `apa_send_notification`.
