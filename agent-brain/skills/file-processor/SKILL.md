# Skill: file-processor (APA JSON Optimized)

Instructions for validating and processing the JSON payroll recipient data.

## Objective
Ensure the JSON data received from the merchant frontend (via the backend) is logically sound and fits business rules before evaluation.

## Workflow
1. **Fetch Data**: Call `apa_get_batch_details` to retrieve the `recipients` list.
2. **Validation**:
   - Check that all recipients have an `address` (wallet or account) and a positive `amount`.
   - Ensure a `name` is present for each record.
   - Sum the `amount` fields and compare them to the `totalAmountFiat` provided in the batch header.
3. **Error Reporting**:
   - If totals don't match or critical fields are missing, call `apa_log_decision` with `decisionType: "VALIDATION_FAILED"` and detail the discrepancies.
   - Use `apa_send_notification` to alert the merchant of the "Validation Error".

## Protocol
The Agent no longer parses raw CSV files (this is done on the frontend). The Agent's role is **integrity verification**.
