# Skill: payout-executor (APA Tool Optimized)

Instructions for executing final payouts using the `apa_execute_payout` tool.

## Objective
Safely and reliably disburse funds to recipients while ensuring the agent only triggers execution after a full funding audit.

## Execution Flow
1. **The Payout Trigger**:
   - Verify the batch status is `FUNDED` (checked via `apa_get_batch_details`).
   - Confirm the vault balance via `apa_manage_wallet`.
2. **Execution**:
   - Call `apa_execute_payout` with the `batchId` and `network`.
   - This tool handles the signing and broadcasting logic for all recipients in the batch.
3. **Post-Execution Logging**:
   - Log the tool's output (tx hashes) using `apa_log_decision` with `decisionType: "EXECUTION"`.
   - Update the batch status to `COMPLETED` using `apa_update_batch`.

## Decision Guardrails
- **Verification**: Never call `apa_execute_payout` if you suspect the FX rate has changed significantly since the last evaluation (15 min+).
- **Critical Failure**: If the payout tool returns errors for more than 20% of recipients, use `apa_send_notification` to alert the merchant and set the batch status to `FAILED`.
- **Success Logging**: The `apa_execute_payout` tool returns an array of hashes. You must record these in the batch audit log.

## Final Reconciliation
Once completed, verify that the `total_amount_usdt` sent matches the initial evaluation. Use `apa_send_notification` to send a "Success Digest".
