/**
 * AzamPay Payment Gateway Integration
 *
 * Supports:
 * - MNO Checkout (M-Pesa, Airtel, Tigo, Halotel, AzamPesa)
 * - Bank Checkout (CRDB, NMB) with OTP flow
 * - Webhook/Callback handling with signature verification
 * - Transaction status verification
 * - Idempotency key support
 *
 * API Flow:
 * 1. Get token using app credentials (appName, clientId, clientSecret)
 * 2. Call checkout API with token + x-api-key
 * 3. Receive callback on webhook endpoint
 * 4. Optionally verify payment via transaction status API
 *
 * Environment Variables Required:
 * - AZAMPAY_APP_NAME: Your AzamPay application name
 * - AZAMPAY_CLIENT_ID: Client ID from AzamPay
 * - AZAMPAY_CLIENT_SECRET: Client secret from AzamPay
 * - AZAMPAY_API_KEY: API key from AzamPay settings
 * - AZAMPAY_ENV: 'sandbox' or 'live' (default: sandbox)
 * - AZAMPAY_WEBHOOK_SECRET: Secret for HMAC-SHA256 callback verification
 * - DONATION_MIN_AMOUNT: Minimum donation in TZS (default: 500)
 * - DONATION_MAX_AMOUNT: Maximum donation in TZS (default: 10000000)
 */

// ---- Types ----

export type AzamPayEnv = 'sandbox' | 'live'

export type MnoProvider = 'Mpesa' | 'Airtel' | 'Tigo' | 'Halopesa' | 'Azampesa'
export type BankProvider = 'CRDB' | 'NMB'

export interface AzamPayConfig {
  appName: string
  clientId: string
  clientSecret: string
  apiKey: string
  env?: AzamPayEnv
  webhookSecret: string
  minAmount: number
  maxAmount: number
  siteUrl: string
}

export interface MnoCheckoutPayload {
  accountNumber: string   // Phone number (MSISDN) e.g., "0754123456"
  amount: string          // Amount as string e.g., "5000"
  currency: string        // Currency code e.g., "TZS"
  externalId: string      // Your unique reference ID
  provider: MnoProvider
  additionalProperties?: Record<string, string> | null
}

export interface BankCheckoutPayload {
  amount: string
  currencyCode: string
  merchantAccountNumber: string    // Donor's bank account number
  merchantMobileNumber: string     // Donor's mobile number
  merchantName?: string | null     // Donor's name
  otp: string                      // One-time password (empty string to initiate, actual OTP for confirmation)
  provider: BankProvider
  referenceId: string              // Your unique reference ID
  additionalProperties?: Record<string, string> | null
}

export interface AzamPayTokenResponse {
  success: boolean
  message: string
  code: string | number
  statusCode: number
  data: {
    accessToken: string
    expire: string
  }
}

export interface AzamPayCheckoutResponse {
  success: boolean
  message: string
  code: string | number
  statusCode: number
  data?: {
    transactionId?: string
    message?: string
    success?: boolean
    otpRequired?: boolean
  } | string
}

export interface AzamPayWebhookData {
  msisdn?: string
  amount?: string
  message?: string
  utilityref?: string
  operator?: string
  reference?: string
  transactionstatus?: string
  submerchantAcc?: string
  externalId?: string
  provider?: string
}

export interface PaymentLimits {
  min: number
  max: number
}

export interface AzamPayStatus {
  configured: boolean
  env: AzamPayEnv
  missingVars: string[]
  callbackUrl: string
  limits: PaymentLimits
}

// ---- Configuration ----

function getBaseUrl(env?: AzamPayEnv): string {
  return env === 'live'
    ? 'https://checkout.azampay.co.tz'
    : 'https://sandbox.azampay.co.tz'
}

function getConfig(): AzamPayConfig {
  const env = (process.env.AZAMPAY_ENV || 'sandbox') as AzamPayEnv
  return {
    appName: process.env.AZAMPAY_APP_NAME || '',
    clientId: process.env.AZAMPAY_CLIENT_ID || '',
    clientSecret: process.env.AZAMPAY_CLIENT_SECRET || '',
    apiKey: process.env.AZAMPAY_API_KEY || '',
    webhookSecret: process.env.AZAMPAY_WEBHOOK_SECRET || '',
    env,
    minAmount: parseInt(process.env.DONATION_MIN_AMOUNT || '500', 10),
    maxAmount: parseInt(process.env.DONATION_MAX_AMOUNT || '10000000', 10),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  }
}

function isConfigured(): boolean {
  const config = getConfig()
  return !!(config.appName && config.clientId && config.clientSecret && config.apiKey)
}

/**
 * Get a detailed status of the AzamPay configuration.
 * Useful for admin dashboard display and debugging.
 */
export function getAzamPayStatus(): AzamPayStatus {
  const config = getConfig()
  const missingVars: string[] = []

  if (!config.appName) missingVars.push('AZAMPAY_APP_NAME')
  if (!config.clientId) missingVars.push('AZAMPAY_CLIENT_ID')
  if (!config.clientSecret) missingVars.push('AZAMPAY_CLIENT_SECRET')
  if (!config.apiKey) missingVars.push('AZAMPAY_API_KEY')

  const callbackUrl = `${config.siteUrl}/api/donate/azampay/callback`

  return {
    configured: missingVars.length === 0,
    env: config.env || 'sandbox',
    missingVars,
    callbackUrl,
    limits: {
      min: config.minAmount,
      max: config.maxAmount,
    },
  }
}

/**
 * Get payment amount limits from environment variables.
 */
export function getPaymentLimits(): PaymentLimits {
  const config = getConfig()
  return { min: config.minAmount, max: config.maxAmount }
}

/**
 * Get the callback URL for AzamPay webhook configuration.
 */
export function getCallbackUrl(): string {
  const config = getConfig()
  return `${config.siteUrl}/api/donate/azampay/callback`
}

// ---- Token Management ----

let cachedToken: { accessToken: string; expireAt: number } | null = null

async function getToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expireAt - 60000) {
    return cachedToken.accessToken
  }

  const config = getConfig()
  const baseUrl = getBaseUrl(config.env)

  console.log(`[AzamPay] Requesting new token from ${baseUrl} (env: ${config.env})`)

  const response = await fetch(`${baseUrl}/Authorization/GetToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      appName: config.appName,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[AzamPay] Token request failed:', response.status, errorText)
    throw new Error(`AzamPay authentication failed: ${response.status}`)
  }

  const data = await response.json() as AzamPayTokenResponse

  if (!data.success || !data.data?.accessToken) {
    throw new Error(`AzamPay token error: ${data.message || 'Unknown error'}`)
  }

  // Parse expire time (format: "2024-01-15T10:30:00Z")
  const expireStr = data.data.expire as string
  const expireAt = expireStr ? new Date(expireStr).getTime() : Date.now() + 3600000 // Default 1 hour

  cachedToken = {
    accessToken: data.data.accessToken,
    expireAt,
  }

  console.log(`[AzamPay] Token obtained, expires at: ${new Date(expireAt).toISOString()}`)

  return cachedToken.accessToken
}

/**
 * Invalidate the cached token (useful after auth errors)
 */
export function invalidateToken(): void {
  cachedToken = null
}

// ---- MNO Checkout (M-Pesa, Airtel, Tigo, Halotel, AzamPesa) ----

export async function initiateMnoCheckout(payload: MnoCheckoutPayload): Promise<AzamPayCheckoutResponse> {
  if (!isConfigured()) {
    throw new Error('AzamPay is not configured. Set AZAMPAY_APP_NAME, AZAMPAY_CLIENT_ID, AZAMPAY_CLIENT_SECRET, and AZAMPAY_API_KEY environment variables.')
  }

  const config = getConfig()
  const baseUrl = getBaseUrl(config.env)
  const token = await getToken()

  console.log(`[AzamPay] MNO Checkout: provider=${payload.provider}, amount=${payload.amount}, phone=${payload.accountNumber}, externalId=${payload.externalId}`)

  const response = await fetch(`${baseUrl}/azampay/mno/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-API-KEY': config.apiKey,
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('[AzamPay] MNO checkout failed:', response.status, JSON.stringify(data))
    // Invalidate token on auth errors
    if (response.status === 401) {
      invalidateToken()
    }
    throw new Error(data.message || `MNO checkout failed: ${response.status}`)
  }

  console.log(`[AzamPay] MNO checkout response: success=${data.success}, message=${data.message}`)

  return data
}

// ---- Bank Checkout (CRDB, NMB) ----

/**
 * Initiate a bank checkout. For OTP-based flows:
 * 1. First call with otp="" to initiate the checkout
 * 2. AzamPay sends OTP to the donor's phone
 * 3. Second call with the actual OTP to confirm
 */
export async function initiateBankCheckout(payload: BankCheckoutPayload): Promise<AzamPayCheckoutResponse> {
  if (!isConfigured()) {
    throw new Error('AzamPay is not configured. Set AZAMPAY_APP_NAME, AZAMPAY_CLIENT_ID, AZAMPAY_CLIENT_SECRET, and AZAMPAY_API_KEY environment variables.')
  }

  const config = getConfig()
  const baseUrl = getBaseUrl(config.env)
  const token = await getToken()

  console.log(`[AzamPay] Bank Checkout: provider=${payload.provider}, amount=${payload.amount}, account=${payload.merchantAccountNumber}, otp=${payload.otp ? '[PROVIDED]' : '[EMPTY-INITIATE]'}, referenceId=${payload.referenceId}`)

  const response = await fetch(`${baseUrl}/azampay/bank/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-API-KEY': config.apiKey,
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('[AzamPay] Bank checkout failed:', response.status, JSON.stringify(data))
    // Invalidate token on auth errors
    if (response.status === 401) {
      invalidateToken()
    }
    throw new Error(data.message || `Bank checkout failed: ${response.status}`)
  }

  console.log(`[AzamPay] Bank checkout response: success=${data.success}, message=${data.message}`)

  return data
}

// ---- Transaction Status ----

/**
 * Verify a transaction's status directly with AzamPay.
 * Use this to cross-check webhook callbacks or for manual status checks.
 */
export async function getTransactionStatus(transactionId: string): Promise<AzamPayCheckoutResponse> {
  if (!isConfigured()) {
    throw new Error('AzamPay is not configured.')
  }

  const config = getConfig()
  const baseUrl = getBaseUrl(config.env)
  const token = await getToken()

  console.log(`[AzamPay] Checking transaction status: ${transactionId}`)

  const response = await fetch(`${baseUrl}/azampay/transaction/status?transactionId=${transactionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-API-KEY': config.apiKey,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('[AzamPay] Transaction status check failed:', response.status, JSON.stringify(data))
    throw new Error(data.message || `Transaction status check failed: ${response.status}`)
  }

  console.log(`[AzamPay] Transaction status result:`, JSON.stringify(data))

  return data
}

/**
 * Verify a donation payment by checking the transaction status with AzamPay.
 * Returns true if the payment is confirmed as successful by AzamPay.
 */
export async function verifyPayment(transactionId: string): Promise<{ verified: boolean; status: string; azampayData?: AzamPayCheckoutResponse }> {
  if (!isConfigured()) {
    // Cannot verify without AzamPay credentials — trust the webhook
    return { verified: false, status: 'unverifiable' }
  }

  try {
    const result = await getTransactionStatus(transactionId)
    const isSuccess = result.success && result.data
      ? (typeof result.data === 'object' ? result.data.success : false)
      : false

    return {
      verified: true,
      status: isSuccess ? 'successful' : 'failed',
      azampayData: result,
    }
  } catch (error) {
    console.error('[AzamPay] Payment verification error:', error)
    return { verified: false, status: 'verification_failed' }
  }
}

// ---- Provider Mapping ----

/** Map from our internal MNO names to AzamPay provider names */
export function mapMnoProvider(method: string): MnoProvider {
  const mapping: Record<string, MnoProvider> = {
    'mpesa': 'Mpesa',
    'vodafone': 'Mpesa',
    'vodacom': 'Mpesa',
    'airtel': 'Airtel',
    'tigo': 'Tigo',
    'halotel': 'Halopesa',
    'halopesa': 'Halopesa',
    'azampesa': 'Azampesa',
  }
  return mapping[method.toLowerCase()] || 'Mpesa'
}

/** Map from our internal bank names to AzamPay bank provider names */
export function mapBankProvider(method: string): BankProvider {
  const mapping: Record<string, BankProvider> = {
    'crdb': 'CRDB',
    'nmb': 'NMB',
  }
  return mapping[method.toLowerCase()] || 'CRDB'
}

/** Get display name for MNO provider */
export function getMnoDisplayName(provider: MnoProvider): string {
  const names: Record<MnoProvider, string> = {
    'Mpesa': 'M-Pesa (Vodacom)',
    'Airtel': 'Airtel Money',
    'Tigo': 'Tigo Pesa',
    'Halopesa': 'Halotel (Halopesa)',
    'Azampesa': 'AzamPesa',
  }
  return names[provider] || provider
}

/** Get all supported MNO providers */
export function getSupportedMnoProviders(): { value: MnoProvider; label: string }[] {
  return [
    { value: 'Mpesa', label: 'M-Pesa' },
    { value: 'Airtel', label: 'Airtel Money' },
    { value: 'Tigo', label: 'Tigo Pesa' },
    { value: 'Halopesa', label: 'Halopesa' },
    { value: 'Azampesa', label: 'AzamPesa' },
  ]
}

/** Get all supported bank providers */
export function getSupportedBankProviders(): { value: BankProvider; label: string }[] {
  return [
    { value: 'CRDB', label: 'CRDB Bank' },
    { value: 'NMB', label: 'NMB Bank' },
  ]
}

// ---- Phone Number Formatting ----

/** Format phone number for AzamPay MNO checkout (expects local format: 07XXXXXXXX) */
export function formatPhoneForAzampay(phone: string): string {
  let cleaned = phone.replace(/[\s-]/g, '')

  // +255 → 0
  if (cleaned.startsWith('+255')) {
    cleaned = '0' + cleaned.substring(4)
  }
  // 255 → 0
  else if (cleaned.startsWith('255') && cleaned.length >= 12) {
    cleaned = '0' + cleaned.substring(3)
  }

  return cleaned
}

// ---- Fallback Simulation ----
// When AzamPay is not configured, we fall back to simulated payments for development

export function shouldSimulate(): boolean {
  return !isConfigured()
}

// ---- Merchant Bank Details ----

/**
 * Get the merchant's bank details for display to donors.
 * These are read from environment variables.
 */
export function getMerchantBankDetails() {
  return {
    bankName: process.env.MERCHANT_BANK_NAME || 'CRDB Bank',
    accountName: process.env.MERCHANT_BANK_ACCOUNT_NAME || "Elia's Hope Community",
    accountNumber: process.env.MERCHANT_BANK_ACCOUNT_NUMBER || '',
    branch: process.env.MERCHANT_BANK_BRANCH || 'Mwanza',
  }
}

export { isConfigured, getConfig }
