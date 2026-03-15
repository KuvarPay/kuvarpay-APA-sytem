# Skill: notification

Instructions for the APA Brain to plan and trigger critical notifications to merchants and recipients.

## Objective
Provide clear, proactive, and empathetic financial communication for all payroll lifecycle events.

## Notification Hierarchy

1. **The Top-up Request (High Priority)**:
   - Trigger: `Confirmed_Balance < Required_USDT + Buffer`.
   - Message: 
     > "Urgent: Your batch [ID] requires additional funding. 
     > Total Required: [X] USDT. Detected: [Y] USDT. 
     > Please send [Z] USDT to the vault address [Address] to proceed."

2. **The Low Balance Warning (Predictive)**:
   - Trigger: `Remaining_Vault_Balance < Predicted_Next_Run_Cost`.
   - Message:
     > "Heads-up: Due to current FX fluctuations, your persistent vault balance is running low. 
     > You have roughly [N] months of payroll coverage remaining. 
     > Please consider topping up to ensure uninterrupted salary delivery."

3. **The Execution Digest (Batch Success)**:
   - Trigger: `Batch Status = COMPLETED`.
   - Message:
     > "Success! Your [Category] payroll for [Month] has been fully disbursed. 
     > Total Recipients: [Count]. 
     > Total Paid: [Amount] [Fiat]. 
     > Detailed report is ready in your dashboard."

4. **The Critical Failure Alert (Human Required)**:
   - Trigger: `Core API Errors, 401/403, or Logic Mismatch`.
   - Message:
     > "Action Required: The AI Agent has paused payroll [ID] due to a technical mismatch. 
     > No further funds will be moved until you manually review the audit log."

## Execution Delivery
- The Agent uses the 'apa_send_notification' tool to trigger notifications.
- The tool sends parameters like `businessId`, `type`, and `message` to the **APA Backend**, which dispatches the actual message.
- **Recipient Privacy**: Never include full bank account numbers in notification text.
