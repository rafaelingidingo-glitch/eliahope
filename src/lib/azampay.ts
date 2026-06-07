/**
 * AzamPay Payment Gateway Integration
 * 
 * Supports:
 * - MNO Checkout (M-Pesa, Airtel, Tigo, Halotel, AzamPesa)
 * - Bank Checkout (CRDB, NMB)
 * - Webhook/Callback handling
 * 
 * API Flow:
 * 1. Get token using app credentials (appName, clientId, clientSecret)
 * 2. Call checkout API with token + x-api-key
 * 3. Receive callback on webhook endpoint
 * 
 * Environment Variables Required:
 * - AZAMPAY_APP_NAME: Your AzamPay application name
 * - AZAMPAY_CLIENT_ID: Client ID from AzamPay
 * - AZAMPAY_CLIENT_SECRET: Client secret from AzamPay
 * - AZAMPAY_API_KEY: API key from AzamPay settings
 * - AZAMPAY_ENV: 'sandbox' or 'live' (default: sandbox)
 */

// ---- Types ----

export type AzamPayEnv = 'sandbox' | 'live'

export interface AzamPayConfig {
  appName: string
  clientId: string
  clientSecret: string
  apiKey: string
  env?: AzamPayEnv
}

export interface MnoCheckoutPayload {
  accountNumber: string   // Phone number (MSISDN) e.g., "0754123456"
  amount: string          // Amount as string e.g., "5000"
  currency: string        // Currency code e.g., "TZS"
  externalId: string      // Your unique reference ID
  provider: 'Mpesa' | 'Airtel' | 'Tigo' | 'Halopesa' | 'Azampesa'
  additionalProperties?: Record<string, string> | null
}

export interface BankCheckoutPayload {
  amount: string
  currencyCode: string
  merchantAccountNumber: string    // Donor's bank account number
  merchantMobileNumber: string     // Donor's mobile number
  merchantName?: string | null     // Donor's name
  otp: string                      // One-time password (can be empty string for some flows)
  provider: 'CRDB' | 'NMB'
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
  bankCheckout: (payload: BankCheckoutPayload) => Promise<AzamPayCheckoutResponse>
  mnoCheckout: (payload: MnoCheckoutPayload) => Promise<AzamPayCheckoutResponse>
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
    env,
  }
}

function isConfigured(): boolean {
  const config = getConfig()
  return !!(config.appName && config.clientId && config.clientSecret && config.apiKey)
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
    console.error('AzamPay token request failed:', response.status, errorText)
    throw new Error(`AzamPay authentication failed: ${response.status}`)
  }

  const data = await response.json()

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

  return cachedToken.accessToken
}

// ---- MNO Checkout (M-Pesa, Airtel, Tigo, Halotel, AzamPesa) ----

export async function initiateMnoCheckout(payload: MnoCheckoutPayload): Promise<AzamPayCheckoutResponse> {
  if (!isConfigured()) {
    throw new Error('AzamPay is not configured. Set AZAMPAY_APP_NAME, AZAMPAY_CLIENT_ID, AZAMPAY_CLIENT_SECRET, and AZAMPAY_API_KEY environment variables.')
  }

  const config = getConfig()
  const baseUrl = getBaseUrl(config.env)
  const token = await getToken()

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
    console.error('AzamPay MNO checkout failed:', response.status, JSON.stringify(data))
    throw new Error(data.message || `MNO checkout failed: ${response.status}`)
  }

  return data
}

// ---- Bank Checkout (CRDB, NMB) ----

export async function initiateBankCheckout(payload: BankCheckoutPayload): Promise<AzamPayCheckoutResponse> {
  if (!isConfigured()) {
    throw new Error('AzamPay is not configured. Set AZAMPAY_APP_NAME, AZAMPAY_CLIENT_ID, AZAMPAY_CLIENT_SECRET, and AZAMPAY_API_KEY environment variables.')
  }

  const config = getConfig()
  const baseUrl = getBaseUrl(config.env)
  const token = await getToken()

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
    console.error('AzamPay Bank checkout failed:', response.status, JSON.stringify(data))
    throw new Error(data.message || `Bank checkout failed: ${response.status}`)
  }

  return data
}

// ---- Transaction Status ----

export async function getTransactionStatus(transactionId: string): Promise<AzamPayCheckoutResponse> {
  if (!isConfigured()) {
    throw new Error('AzamPay is not configured.')
  }

  const config = getConfig()
  const baseUrl = getBaseUrl(config.env)
  const token = await getToken()

  const response = await fetch(`${baseUrl}/azampay/transaction/status?transactionId=${transactionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-API-KEY': config.apiKey,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || `Transaction status check failed: ${response.status}`)
  }

  return data
}

// ---- Provider Mapping ----

/** Map from our internal MNO names to AzamPay provider names */
export function mapMnoProvider(method: string): MnoCheckoutPayload['provider'] {
  const mapping: Record<string, MnoCheckoutPayload['provider']> = {
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
export function mapBankProvider(method: string): BankCheckoutPayload['provider'] {
  const mapping: Record<string, BankCheckoutPayload['provider']> = {
    'crdb': 'CRDB',
    'nmb': 'NMB',
  }
  return mapping[method.toLowerCase()] || 'CRDB'
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

export { isConfigured, getConfig }
