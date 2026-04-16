import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
  if (!_resend && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

const FROM = process.env.EMAIL_FROM ?? 'Sirat Properties <noreply@siratproperties.com>'

interface SendParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendParams) {
  const resend = getResend()
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping email to', to)
    return null
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    })
    if (error) {
      console.error('[email] Send failed:', error)
      return null
    }
    return data
  } catch (err) {
    console.error('[email] Exception:', err)
    return null
  }
}

/* ─── Email Templates ─── */

const WRAPPER = (body: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0F;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111118;border:1px solid rgba(255,255,255,0.06);border-radius:16px;overflow:hidden">
        <!-- Header -->
        <tr><td style="padding:24px 32px;border-bottom:1px solid rgba(255,255,255,0.04)">
          <span style="color:#C9A96E;font-size:14px;font-weight:600;letter-spacing:0.1em">SIRAT PROPERTIES</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;color:#F0EDE8;font-size:14px;line-height:1.7">
          ${body}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.04);text-align:center">
          <span style="color:#5C5866;font-size:11px">Sirat Properties Real Estate OS &mdash; Bangladesh</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

export const emailTemplates = {
  bookingCreated: (buyerName: string, propertyTitle: string, bookingType: string, amount: string) =>
    WRAPPER(`
      <h2 style="margin:0 0 16px;color:#F0EDE8;font-size:22px;font-weight:600">Booking Request Sent</h2>
      <p>Hi <strong>${buyerName}</strong>,</p>
      <p>Your booking request has been submitted successfully.</p>
      <table style="width:100%;margin:20px 0;border-collapse:collapse">
        <tr>
          <td style="padding:10px 0;color:#9E9AA0;border-bottom:1px solid rgba(255,255,255,0.04)">Property</td>
          <td style="padding:10px 0;color:#F0EDE8;text-align:right;border-bottom:1px solid rgba(255,255,255,0.04);font-weight:600">${propertyTitle}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#9E9AA0;border-bottom:1px solid rgba(255,255,255,0.04)">Type</td>
          <td style="padding:10px 0;color:#F0EDE8;text-align:right;border-bottom:1px solid rgba(255,255,255,0.04)">${bookingType}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#9E9AA0">Amount</td>
          <td style="padding:10px 0;color:#C9A96E;text-align:right;font-weight:700;font-size:18px">${amount}</td>
        </tr>
      </table>
      <p style="color:#9E9AA0">The seller will review your request and update the status. You'll be notified when it changes.</p>
    `),

  bookingStatusChanged: (buyerName: string, propertyTitle: string, status: string) =>
    WRAPPER(`
      <h2 style="margin:0 0 16px;color:#F0EDE8;font-size:22px;font-weight:600">Booking Status Updated</h2>
      <p>Hi <strong>${buyerName}</strong>,</p>
      <p>Your booking for <strong style="color:#C9A96E">${propertyTitle}</strong> has been updated.</p>
      <div style="margin:20px 0;padding:16px;background:rgba(201,169,110,0.06);border:1px solid rgba(201,169,110,0.15);border-radius:12px;text-align:center">
        <span style="font-size:12px;color:#9E9AA0;text-transform:uppercase;letter-spacing:0.1em">New Status</span>
        <p style="margin:8px 0 0;font-size:20px;font-weight:700;color:#C9A96E;text-transform:capitalize">${status}</p>
      </div>
      <p style="color:#9E9AA0">Log in to your dashboard for full details.</p>
    `),

  sellerNewBooking: (sellerName: string, buyerName: string, propertyTitle: string, amount: string) =>
    WRAPPER(`
      <h2 style="margin:0 0 16px;color:#F0EDE8;font-size:22px;font-weight:600">New Booking Request</h2>
      <p>Hi <strong>${sellerName}</strong>,</p>
      <p>You've received a new booking request.</p>
      <table style="width:100%;margin:20px 0;border-collapse:collapse">
        <tr>
          <td style="padding:10px 0;color:#9E9AA0;border-bottom:1px solid rgba(255,255,255,0.04)">Buyer</td>
          <td style="padding:10px 0;color:#F0EDE8;text-align:right;border-bottom:1px solid rgba(255,255,255,0.04);font-weight:600">${buyerName}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#9E9AA0;border-bottom:1px solid rgba(255,255,255,0.04)">Property</td>
          <td style="padding:10px 0;color:#F0EDE8;text-align:right;border-bottom:1px solid rgba(255,255,255,0.04)">${propertyTitle}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#9E9AA0">Amount</td>
          <td style="padding:10px 0;color:#C9A96E;text-align:right;font-weight:700;font-size:18px">${amount}</td>
        </tr>
      </table>
      <p style="color:#9E9AA0">Review and respond from your seller dashboard.</p>
    `),

  kycApproved: (userName: string) =>
    WRAPPER(`
      <h2 style="margin:0 0 16px;color:#F0EDE8;font-size:22px;font-weight:600">Verification Approved &#10003;</h2>
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Your identity verification has been <strong style="color:#10b981">approved</strong>.</p>
      <p>You can now publish listings, manage agents, and access all workspace features.</p>
      <div style="margin:24px 0;text-align:center">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://siratproperties.com'}/auth/login"
           style="display:inline-block;padding:12px 32px;background:#C9A96E;color:#0A0A0F;font-weight:600;border-radius:12px;text-decoration:none;font-size:14px">
          Enter Workspace
        </a>
      </div>
    `),

  kycRejected: (userName: string, reason?: string) =>
    WRAPPER(`
      <h2 style="margin:0 0 16px;color:#F0EDE8;font-size:22px;font-weight:600">Verification Update</h2>
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Your identity verification could not be approved at this time.</p>
      ${reason ? `<p style="padding:12px;background:rgba(244,63,94,0.06);border:1px solid rgba(244,63,94,0.15);border-radius:8px;color:#f43f5e;font-size:13px">${reason}</p>` : ''}
      <p style="color:#9E9AA0">Please re-upload a valid document from your profile settings, or contact support.</p>
    `),

  installmentPaid: (buyerName: string, propertyTitle: string, installmentNumber: number, amount: string) =>
    WRAPPER(`
      <h2 style="margin:0 0 16px;color:#F0EDE8;font-size:22px;font-weight:600">Payment Recorded</h2>
      <p>Hi <strong>${buyerName}</strong>,</p>
      <p>Installment #${installmentNumber} for <strong style="color:#C9A96E">${propertyTitle}</strong> has been marked as paid.</p>
      <div style="margin:20px 0;padding:16px;background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.15);border-radius:12px;text-align:center">
        <span style="font-size:12px;color:#9E9AA0;text-transform:uppercase;letter-spacing:0.1em">Amount Paid</span>
        <p style="margin:8px 0 0;font-size:24px;font-weight:700;color:#10b981">${amount}</p>
      </div>
      <p style="color:#9E9AA0">View your receipt and remaining schedule from your dashboard.</p>
    `),

  welcome: (name: string, role: string) =>
    WRAPPER(`
      <h2 style="margin:0 0 16px;color:#F0EDE8;font-size:22px;font-weight:600">Welcome to Sirat Properties</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your <strong style="color:#C9A96E">${role}</strong> workspace is ready.</p>
      <p>Here's what you can do next:</p>
      <ul style="padding-left:20px;color:#9E9AA0">
        ${role === 'buyer' ? '<li>Search and save properties</li><li>Book properties or request installment plans</li><li>Track project updates</li>' : ''}
        ${role === 'seller' ? '<li>List your properties</li><li>Build landing pages for projects</li><li>Manage bookings and agents</li>' : ''}
        ${role === 'agent' ? '<li>Browse and apply to listings</li><li>Negotiate commission deals</li><li>Track your earnings</li>' : ''}
      </ul>
      <div style="margin:24px 0;text-align:center">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://siratproperties.com'}/auth/login"
           style="display:inline-block;padding:12px 32px;background:#C9A96E;color:#0A0A0F;font-weight:600;border-radius:12px;text-decoration:none;font-size:14px">
          Go to Dashboard
        </a>
      </div>
    `),
}
