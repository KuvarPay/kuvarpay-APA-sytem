import nodemailer from 'nodemailer';
import { db, schema } from '../../../database/rayswap-db/src/index';
import { eq } from '../../../database/rayswap-db/node_modules/drizzle-orm';

const { businesses, users } = schema;

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://kuvarpay.com';

/**
 * Lightweight email service for the APA backend.
 * Uses the same SMTP env vars as the main merchant dashboard.
 */
function createTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        console.warn('[APA Email] SMTP not configured — emails will be skipped');
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });
}

const transporter = createTransporter();

/** Resolve the business owner's email from the DB */
async function getBusinessOwnerEmail(businessId: string): Promise<{ email: string; firstName: string } | null> {
    try {
        const [biz] = await (db as any).select({ ownerId: (businesses as any).ownerId })
            .from(businesses as any)
            .where(eq((businesses as any).id, businessId) as any)
            .limit(1);

        if (!biz) return null;

        const [user] = await db.select({ email: users.email, firstName: users.firstName })
            .from(users)
            .where(eq(users.id, biz.ownerId) as any)
            .limit(1);

        return user ? { email: user.email, firstName: user.firstName || 'there' } : null;
    } catch (err) {
        console.error('[APA Email] Failed to resolve business owner:', err);
        return null;
    }
}

/** Build the HTML body for payroll notifications */
function buildPayrollEmailHtml(type: string, message: string, batchId?: string): string {
    const dashboardUrl = `${FRONTEND_URL}/dashboard/payroll`;
    const statusColor = type === 'COMPLETED' ? '#16A34A' : type === 'FAILED' ? '#DC2626' : type === 'FUNDING_REQUIRED' ? '#D97706' : '#7C3AED';
    const statusBg = type === 'COMPLETED' ? '#F0FDF4' : type === 'FAILED' ? '#FEF2F2' : type === 'FUNDING_REQUIRED' ? '#FFFBEB' : '#F5F3FF';

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#F6F6F6;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F6F6F6;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:8px;overflow:hidden;">
  <tr><td style="padding:30px;text-align:center;">
    <img src="https://kuvarpay.com/email-logo-light.jpg" alt="KuvarPay" width="180" style="display:block;margin:0 auto;">
  </td></tr>
  <tr><td style="padding:20px 30px;">
    <h2 style="margin:0 0 16px;color:#0F172A;font-size:22px;">Payroll Update</h2>
    <div style="background:${statusBg};border:1px solid ${statusColor}20;border-radius:8px;padding:16px;margin-bottom:20px;">
      <span style="display:inline-block;background:${statusColor};color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:8px;">${type.replace(/_/g, ' ')}</span>
      <p style="margin:8px 0 0;color:#334155;font-size:15px;line-height:1.6;">${message}</p>
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="${dashboardUrl}" style="background:#CDF140;color:#000;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px;display:inline-block;">View in Dashboard</a>
    </div>
  </td></tr>
  <tr><td style="padding:20px 30px;text-align:center;">
    <p style="margin:0;color:#94A3B8;font-size:12px;">© KuvarPay ${new Date().getFullYear()}. All Rights Reserved.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/** Send a payroll notification email to the business owner */
export async function sendPayrollNotification(
    businessId: string,
    type: string,
    message: string,
    batchId?: string
): Promise<boolean> {
    if (!transporter) {
        console.warn('[APA Email] Transporter not configured, skipping email');
        return false;
    }

    const owner = await getBusinessOwnerEmail(businessId);
    if (!owner) {
        console.warn(`[APA Email] No owner found for business ${businessId}`);
        return false;
    }

    const subjectMap: Record<string, string> = {
        FUNDING_REQUIRED: '💰 Payroll Funding Required',
        PROCESSING: '⏳ Payroll Processing',
        COMPLETED: '✅ Payroll Completed',
        FAILED: '❌ Payroll Failed',
    };

    try {
        await transporter.sendMail({
            from: `"KuvarPay Payroll" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to: owner.email,
            subject: subjectMap[type] || `Payroll Update: ${type}`,
            html: buildPayrollEmailHtml(type, message, batchId),
            text: `Payroll ${type}: ${message}\n\nView details: ${FRONTEND_URL}/dashboard/payroll`,
        });
        console.log(`[APA Email] ✅ Sent ${type} email to ${owner.email}`);
        return true;
    } catch (err: any) {
        console.error(`[APA Email] ❌ Failed to send email:`, err.message);
        return false;
    }
}
