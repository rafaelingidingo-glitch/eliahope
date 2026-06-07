import { Resend } from 'resend'
import { db } from '@/lib/db'

// ─── Configuration ──────────────────────────────────────────────
const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

// Initialize Resend client (or null for demo mode)
const resend = RESEND_API_KEY && RESEND_API_KEY !== 'demo'
  ? new Resend(RESEND_API_KEY)
  : null

/**
 * Check if Resend is configured with a real API key.
 * When in demo mode, emails are logged to the console instead of being sent.
 */
export function isResendConfigured(): boolean {
  return !!resend
}

// ─── Email Templates (HTML) ─────────────────────────────────────

function getBaseStyles(): string {
  return `
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
      .header { background: linear-gradient(135deg, #031632 0%, #0F2D5C 100%); padding: 32px 24px; text-align: center; }
      .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; }
      .header p { color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px; }
      .content { padding: 32px 24px; }
      .content h2 { color: #031632; font-size: 18px; margin: 0 0 16px; }
      .content p { color: #44474d; font-size: 15px; line-height: 1.6; margin: 0 0 12px; }
      .otp-box { background: #f5f3ef; border: 2px dashed #ff8928; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
      .otp-code { font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #031632; font-family: 'Courier New', monospace; }
      .otp-note { font-size: 13px; color: #666; margin-top: 8px; }
      .receipt-box { background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 16px 0; }
      .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
      .receipt-row:last-child { border-bottom: none; }
      .receipt-label { color: #666; font-size: 14px; }
      .receipt-value { color: #031632; font-weight: 600; font-size: 14px; }
      .btn { display: inline-block; background: #ff8928; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 16px 0; }
      .footer { background: #f5f3ef; padding: 20px 24px; text-align: center; }
      .footer p { color: #999; font-size: 12px; margin: 4px 0; }
      .footer a { color: #ff8928; text-decoration: none; }
      .highlight { color: #ff8928; font-weight: 600; }
      .divider { border: none; border-top: 1px solid #eee; margin: 20px 0; }
    </style>
  `
}

function getFooterHtml(): string {
  return `
    <div class="footer">
      <p><strong>Elia's Hope Community</strong></p>
      <p>Mwanza, Tanzania | Reg No: OONGO/R/6243</p>
      <p>This email was sent via Resend. <a href="https://eliashope.org">eliashope.org</a></p>
    </div>
  `
}

// ─── Newsletter Welcome Email ───────────────────────────────────

function newsletterWelcomeHtml(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>${getBaseStyles()}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Elia's Hope Community!</h1>
          <p>Thank you for joining our newsletter</p>
        </div>
        <div class="content">
          <h2>Dear ${name},</h2>
          <p>Thank you for subscribing to our newsletter! We are thrilled to have you as part of our community of hope and transformation.</p>
          <p>By subscribing, you will receive:</p>
          <ul style="color: #44474d; font-size: 15px; line-height: 1.8;">
            <li><strong>Monthly Impact Updates</strong> — See how your support is making a difference</li>
            <li><strong>Event Notifications</strong> — Be the first to know about upcoming events</li>
            <li><strong>Volunteer Opportunities</strong> — Discover ways to get involved</li>
            <li><strong>Success Stories</strong> — Read inspiring stories of transformation</li>
          </ul>
          <p>Together, we can continue to provide <span class="highlight">hope, education, and a brighter future</span> for vulnerable children and families in Mwanza, Tanzania.</p>
          <p>If you did not subscribe to this newsletter, please ignore this email.</p>
        </div>
        ${getFooterHtml()}
      </div>
    </body>
    </html>
  `
}

// ─── Donation Confirmation Email ────────────────────────────────

function donationConfirmationHtml(data: {
  name: string
  amount: number
  transactionId: string
  method: string
  date: string
  campaign?: string
}): string {
  const methodLabel = data.method === 'mpesa' ? 'M-Pesa (Mobile Money)' : 'CRDB Bank Transfer'
  return `
    <!DOCTYPE html>
    <html>
    <head>${getBaseStyles()}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Donation Confirmation</h1>
          <p>Thank you for your generous contribution</p>
        </div>
        <div class="content">
          <h2>Dear ${data.name},</h2>
          <p>Thank you so much for your generous donation to <strong>Elia's Hope Community</strong>. Your contribution is helping us provide hope, education, and essential support to vulnerable children and families in Mwanza, Tanzania.</p>

          <div class="receipt-box">
            <div class="receipt-row">
              <span class="receipt-label">Amount</span>
              <span class="receipt-value" style="font-size:18px; color:#ff8928;">TZS ${data.amount.toLocaleString()}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Transaction ID</span>
              <span class="receipt-value" style="font-family: monospace; font-size: 12px;">${data.transactionId}</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Payment Method</span>
              <span class="receipt-value">${methodLabel}</span>
            </div>
            ${data.campaign ? `<div class="receipt-row">
              <span class="receipt-label">Campaign</span>
              <span class="receipt-value">${data.campaign}</span>
            </div>` : ''}
            <div class="receipt-row">
              <span class="receipt-label">Date</span>
              <span class="receipt-value">${data.date}</span>
            </div>
          </div>

          <p>Your donation will go directly toward supporting our programs in education, nutrition, childcare, and community empowerment. Every contribution, no matter the size, makes a real difference.</p>

          <p>If you have any questions about your donation, please don't hesitate to <a href="mailto:info@eliashope.org" style="color: #ff8928;">contact us</a>.</p>
        </div>
        ${getFooterHtml()}
      </div>
    </body>
    </html>
  `
}

// ─── Admin OTP Email ────────────────────────────────────────────

function adminOtpHtml(otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>${getBaseStyles()}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset OTP</h1>
          <p>Elia's Hope Community Admin Portal</p>
        </div>
        <div class="content">
          <h2>Hello Administrator,</h2>
          <p>A request was made to reset your admin password for the Elia's Hope Community website. Please use the following One-Time Password (OTP) to verify your identity:</p>

          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p class="otp-note">This code expires in 10 minutes</p>
          </div>

          <p><strong>Important:</strong></p>
          <ul style="color: #44474d; font-size: 15px; line-height: 1.8;">
            <li>This OTP can only be used once</li>
            <li>It will expire in <strong>10 minutes</strong></li>
            <li>If you did not request this password reset, please ignore this email and ensure your account is secure</li>
          </ul>

          <p>Do not share this code with anyone. Elia's Hope Community will never ask for your OTP.</p>
        </div>
        ${getFooterHtml()}
      </div>
    </body>
    </html>
  `
}

// ─── Core Send Function ─────────────────────────────────────────

interface SendEmailParams {
  to: string
  subject: string
  html: string
  type: 'newsletter_welcome' | 'donation_confirmation' | 'admin_otp' | 'newsletter_broadcast'
  resentFromId?: string
}

async function sendEmail({ to, subject, html, type, resentFromId }: SendEmailParams): Promise<{
  success: boolean
  id?: string
  error?: string
}> {
  try {
    if (resend) {
      const { data, error } = await resend.emails.send({
        from: `Elia's Hope Community <${RESEND_FROM_EMAIL}>`,
        to: [to],
        subject,
        html,
      })

      if (error) {
        console.error('[Resend] Send error:', error)
        // Log failed email
        await db.emailLog.create({
          data: { to, subject, type, status: 'failed', resentFrom: resentFromId || null },
        })
        return { success: false, error: error.message }
      }

      // Log successful email
      await db.emailLog.create({
        data: {
          to,
          subject,
          type,
          status: resentFromId ? 'resent' : 'sent',
          resentFrom: resentFromId || null,
        },
      })

      return { success: true, id: data?.id }
    } else {
      // Demo mode: log to console
      console.log(`\n${'='.repeat(60)}`)
      console.log(`[RESEND DEMO] Email: ${type}`)
      console.log(`To: ${to}`)
      console.log(`Subject: ${subject}`)
      console.log(`${'='.repeat(60)}`)

      // Log to database
      await db.emailLog.create({
        data: {
          to,
          subject,
          type,
          status: resentFromId ? 'resent' : 'sent',
          resentFrom: resentFromId || null,
        },
      })

      return { success: true, id: `demo_${Date.now()}` }
    }
  } catch (err) {
    console.error('[Resend] Unexpected error:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ─── Public API ─────────────────────────────────────────────────

/**
 * Send a welcome email to a new newsletter subscriber
 */
export async function sendNewsletterWelcomeEmail(
  to: string,
  name: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  return sendEmail({
    to,
    subject: 'Welcome to Elia\'s Hope Community Newsletter!',
    html: newsletterWelcomeHtml(name),
    type: 'newsletter_welcome',
  })
}

/**
 * Resend a newsletter welcome email
 */
export async function resendNewsletterWelcomeEmail(
  to: string,
  name: string,
  originalEmailId: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  return sendEmail({
    to,
    subject: 'Welcome to Elia\'s Hope Community Newsletter!',
    html: newsletterWelcomeHtml(name),
    type: 'newsletter_welcome',
    resentFromId: originalEmailId,
  })
}

/**
 * Send a donation confirmation email
 */
export async function sendDonationConfirmationEmail(data: {
  to: string
  name: string
  amount: number
  transactionId: string
  method: string
  date: string
  campaign?: string
}): Promise<{ success: boolean; id?: string; error?: string }> {
  return sendEmail({
    to: data.to,
    subject: `Donation Confirmation - TZS ${data.amount.toLocaleString()} | Elia's Hope Community`,
    html: donationConfirmationHtml(data),
    type: 'donation_confirmation',
  })
}

/**
 * Resend a donation confirmation email
 */
export async function resendDonationConfirmationEmail(
  data: {
    to: string
    name: string
    amount: number
    transactionId: string
    method: string
    date: string
    campaign?: string
  },
  originalEmailId: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  return sendEmail({
    to: data.to,
    subject: `Donation Confirmation - TZS ${data.amount.toLocaleString()} | Elia's Hope Community`,
    html: donationConfirmationHtml(data),
    type: 'donation_confirmation',
    resentFromId: originalEmailId,
  })
}

/**
 * Send an OTP code to the admin email for password reset
 */
export async function sendAdminOtpEmail(
  to: string,
  otp: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  return sendEmail({
    to,
    subject: 'Your Password Reset OTP - Elia\'s Hope Community',
    html: adminOtpHtml(otp),
    type: 'admin_otp',
  })
}

/**
 * Resend an OTP code email
 */
export async function resendAdminOtpEmail(
  to: string,
  otp: string,
  originalEmailId: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  return sendEmail({
    to,
    subject: 'Your Password Reset OTP - Elia\'s Hope Community',
    html: adminOtpHtml(otp),
    type: 'admin_otp',
    resentFromId: originalEmailId,
  })
}

/**
 * Send a newsletter broadcast email (admin feature)
 */
export async function sendNewsletterBroadcastEmail(
  to: string,
  subject: string,
  htmlContent: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  return sendEmail({
    to,
    subject,
    html: htmlContent,
    type: 'newsletter_broadcast',
  })
}

// ─── OTP Utility ────────────────────────────────────────────────

/**
 * Generate a 6-digit OTP code
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Create an OTP record in the database and return the code
 */
export async function createOtpRecord(email: string, purpose: string = 'forgot_password'): Promise<string> {
  const code = generateOtp()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

  // Invalidate any existing unused OTPs for this email/purpose
  await db.otpCode.updateMany({
    where: { email, purpose, verified: false, expiresAt: { gt: new Date() } },
    data: { verified: true }, // Mark as used to invalidate
  })

  // Create new OTP
  await db.otpCode.create({
    data: { email, code, purpose, expiresAt },
  })

  return code
}

/**
 * Verify an OTP code
 */
export async function verifyOtp(email: string, code: string, purpose: string = 'forgot_password'): Promise<{
  valid: boolean
  error?: string
}> {
  const otpRecord = await db.otpCode.findFirst({
    where: { email, code, purpose, verified: false },
    orderBy: { createdAt: 'desc' },
  })

  if (!otpRecord) {
    return { valid: false, error: 'Invalid OTP code' }
  }

  if (otpRecord.expiresAt < new Date()) {
    return { valid: false, error: 'OTP code has expired. Please request a new one.' }
  }

  // Mark as verified
  await db.otpCode.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  })

  return { valid: true }
}
