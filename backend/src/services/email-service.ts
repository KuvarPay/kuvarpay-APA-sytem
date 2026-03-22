import nodemailer from 'nodemailer';
import { db, schema } from '../../../database/rayswap-db/src/index';
import { eq } from '../../../database/rayswap-db/node_modules/drizzle-orm';

const { businesses, users, systemSettings } = schema;

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://kuvarpay.com';

/**
 * Lightweight email service for the APA backend.
 * Uses the same SMTP env vars as the main merchant dashboard.
 */
/**
 * Fetch SMTP settings from DB and create transporter
 * Fallbacks to env vars if DB settings are incomplete
 */
async function getTransporter() {
    try {
        const settings = await db.select().from(systemSettings)
            .where(eq(systemSettings.category, 'email') as any);
        
        const config: any = {};
        settings.forEach(s => {
            config[s.key] = s.value;
        });

        const host = config.smtpHost || process.env.SMTP_HOST;
        const port = parseInt(config.smtpPort || process.env.SMTP_PORT || '587');
        const user = config.smtpUser || process.env.SMTP_USER;
        const pass = config.smtpPassword || process.env.SMTP_PASS;
        const fromEmail = config.fromEmail || process.env.FROM_EMAIL || user;
        const fromName = config.fromName || process.env.FROM_NAME || 'KuvarPay Payroll';

        if (!host || !user || !pass) {
            console.warn('[APA Email] SMTP not configured in DB or ENV');
            return null;
        }

        return {
            transporter: nodemailer.createTransport({
                host,
                port,
                secure: config.smtpSecure === true || port === 465,
                auth: { user, pass },
            }),
            from: `"${fromName}" <${fromEmail}>`
        };
    } catch (err) {
        console.error('[APA Email] Failed to load SMTP settings:', err);
        return null;
    }
}

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

/** Helper function to create email template using Stripo design (from Merchant Dashboard) */
const createEmailTemplate = (title: string, content: string, preheader?: string) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
 <head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>${title}</title>
  <style type="text/css">
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .button {
      background-color: #CDF140 !important;
      color: #000000 !important;
      padding: 14px 28px !important;
      text-decoration: none !important;
      border-radius: 6px !important;
      display: inline-block !important;
      font-weight: 600 !important;
      font-size: 16px !important;
      border: 1px solid #CDF140 !important;
    }
    .button-container { text-align: center !important; margin: 32px 0 !important; }
    .info-box { padding: 16px; border-radius: 6px; margin: 16px 0; border: 1px solid #E2E8F0; background-color: #F8FAFC; }
    .info-box.success { background-color: #F0FDF4; border-color: #BBF7D0; }
    .info-box.error { background-color: #FEF2F2; border-color: #FECACA; }
    .card-bg { background-color: #FFFFFF; }
    .text-body { color: #334155; }
    .text-muted { color: #64748B; }
    
    @media (prefers-color-scheme: dark) {
      body { background-color: #000000 !important; }
      .card-bg { background-color: #11181C !important; }
      h1, h2, h3, h4, h5, h6 { color: #FFFFFF !important; }
      p, li, span, div, .text-body { color: #E2E8F0 !important; }
      .text-muted { color: #94A3B8 !important; }
      .info-box { background-color: #1F2937 !important; border-color: #374151 !important; color: #E2E8F0 !important; }
    }
  </style>
 </head>
 <body class="body" style="width:100%;height:100%;padding:0;Margin:0;background-color:#F6F6F6">
  ${preheader ? `<div style="display:none !important; font-size:1px; color:#fefefe; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">${preheader}</div>` : ''}
  <div dir="ltr" style="background-color:#F6F6F6">
   <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#F6F6F6;width:100%;padding:40px 0;">
     <tr>
      <td valign="top">
       <table align="center" style="width:600px;background-color:#FFFFFF;border-radius:8px;overflow:hidden;" bgcolor="#ffffff">
         <tr>
          <td align="left" class="card-bg" style="padding:30px;text-align:center;">
             <img src="https://kuvarpay.com/email-logo-light.jpg" alt="KuvarPay" width="180" style="display:block;margin:0 auto;">
          </td>
         </tr>
         <tr>
          <td align="left" class="card-bg" style="padding:20px 30px;">
            <div class="text-body" style="line-height:24px;color:#334155;font-size:16px">${content}</div>
          </td>
         </tr>
         <tr>
          <td align="left" class="card-bg" style="padding:20px 30px;border-top:1px solid #E2E8F0;text-align:center;">
            <p class="text-muted" style="margin:0;color:#94A3B8;font-size:12px;">© KuvarPay ${new Date().getFullYear()}. All Rights Reserved.</p>
          </td>
         </tr>
       </table></td>
     </tr>
   </table>
  </div>
 </body>
</html>
`;

/** Build the HTML body for payroll notifications using the premium template */
function buildPayrollEmailHtml(type: string, message: string, batchId?: string, vaultAddress?: string): string {
    const dashboardUrl = `${FRONTEND_URL}/dashboard/payroll`;
    const statusColor = type === 'COMPLETED' ? '#16A34A' : type === 'FAILED' ? '#DC2626' : type === 'FUNDING_REQUIRED' ? '#D97706' : '#7C3AED';
    const statusBg = type === 'COMPLETED' ? '#F0FDF4' : type === 'FAILED' ? '#FEF2F2' : type === 'FUNDING_REQUIRED' ? '#FFFBEB' : '#F5F3FF';

    const vaultSection = (type === 'FUNDING_REQUIRED' && vaultAddress) ? `
    <div style="background:#0F172A;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #CDF14030;text-align:left;">
      <p style="margin:0 0 12px;color:#94A3B8;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;">Secure Funding Vault</p>
      <code style="display:block;background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;color:#CDF140;font-family:monospace;font-size:14px;word-break:break-all;border:1px solid rgba(255,255,255,0.1);">${vaultAddress}</code>
      <p style="margin:12px 0 0;color:#64748B;font-size:12px;line-height:1.5;">Please transfer the required USDT amount to this address on the network specified in your dashboard. The AI agent will detect the funding automatically.</p>
    </div>` : '';

    const content = `
      <h2 style="margin:0 0 16px;color:#0F172A;font-size:22px;">Payroll Update</h2>
      <div style="background:${statusBg};border:1px solid ${statusColor}20;border-radius:8px;padding:16px;margin-bottom:20px;">
        <span style="display:inline-block;background:${statusColor};color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:8px;">${type.replace(/_/g, ' ')}</span>
        <p style="margin:8px 0 0;color:#334155;font-size:15px;line-height:1.6;">${message}</p>
      </div>
      ${vaultSection}
      <div class="button-container">
        <a href="${dashboardUrl}" class="button">View in Dashboard</a>
      </div>
      <p style="color:#64748B;font-size:14px;margin-top:24px;">If you have any questions, please contact our support team at support@kuvarpay.com.</p>
    `;

    return createEmailTemplate('Payroll Update', content, `Update on your payroll batch ${batchId || ''}`);
}

/** Send a payroll notification email to the business owner */
export async function sendPayrollNotification(
    businessId: string,
    type: string,
    message: string,
    batchId?: string,
    vaultAddress?: string
): Promise<boolean> {
    const smtp = await getTransporter();
    if (!smtp) {
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
        await smtp.transporter.sendMail({
            from: smtp.from,
            to: owner.email,
            subject: subjectMap[type] || `Payroll Update: ${type}`,
            html: buildPayrollEmailHtml(type, message, batchId, vaultAddress),
            text: `Payroll ${type}: ${message}\n\nVault: ${vaultAddress || 'N/A'}\n\nView details: ${FRONTEND_URL}/dashboard/payroll`,
        });
        console.log(`[APA Email] ✅ Sent ${type} email to ${owner.email}`);
        return true;
    } catch (err: any) {
        console.error(`[APA Email] ❌ Failed to send email:`, err.message);
        return false;
    }
}
