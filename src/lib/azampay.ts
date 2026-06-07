import { toNumber } from './db'

const AZAMPAY_ENV = process.env.AZAMPAY_ENV || 'sandbox'
const AZAMPAY_APP_NAME = process.env.AZAMPAY_APP_NAME || ''
const AZAMPAY_CLIENT_ID = process.env.AZAMPAY_CLIENT_ID || ''
const AZAMPAY_CLIENT_SECRET = process.env.AZAMPAY_CLIENT_SECRET || ''

const AZAMPAY_BASE_URL = AZAMPAY_ENV === 'sandbox'
  ? 'https://sandbox.azampay.co.tz'
  : 'https://checkout.azampay.co.tz'

// ─── Exported Types standard kwa API zako ─────────────────────────────────────
export type MnoProvider = 'mpesa' | 'tigo' | 'airtel' | 'halopesa'
export type BankProvider = 'crdb' | 'nmb'

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
}

/**
 * 1. Safisha na weka namba ya simu kwenye muundo wa AzamPay (255...)
 */
export function formatPhoneForAzampay(phone: string): string {
  let formatted = phone.trim().replace(/\s+/g, '')
  if (formatted.startsWith('0')) {
    formatted = '255' + formatted.substring(1)
  } else if (formatted.startsWith('+')) {
    formatted = formatted.substring(1)
  }
  return formatted
}

/**
 * 2. Vigezo vya ukomo wa malipo (Limits) vinavyotafutwa na /api/donate/config
 */
export function getPaymentLimits() {
  return {
    mno: { min: 1000, max: 3000000 },
    bank: { min: 5000, max: 50000000 }
  }
}

/**
 * 3. Maelezo ya Benki ya Mfanyabiashara (Merchant Bank Details)
 */
export function getMerchantBankDetails() {
  return {
    bankName: process.env.MERCHANT_BANK_NAME || 'CRDB BANK',
    accountName: process.env.MERCHANT_ACCOUNT_NAME || 'ELIAS HOPE FOUNDATION',
    accountNumber: process.env.MERCHANT_ACCOUNT_NUMBER || '01JXXXXXXXXXX'
  }
}

/**
 * 4. Kagua kama mfumo uko kwenye majaribio au uigizaji (Simulation)
 */
export function shouldSimulate(): boolean {
  return process.env.AZAMPAY_SIMULATE === 'true' || AZAMPAY_ENV === 'sandbox'
}

/**
 * 5. Ramani ya ma-MNO kwenda kwenye majina rasmi ya AzamPay
 */
export function mapMnoProvider(provider: string): string {
  const operatorMap: Record<string, string> = {
    mpesa: 'Mpesa',
    tigo: 'Tigo',
    airtel: 'Airtel',
    halopesa: 'Halopesa',
  }
  return operatorMap[provider.toLowerCase()] || 'Mpesa'
}

/**
 * 6. Ramani ya Benki kwenda kwenye majina rasmi ya AzamPay
 */
export function mapBankProvider(provider: string): string {
  const bankMap: Record<string, string> = {
    crdb: 'CRDB',
    nmb: 'NMB'
  }
  return bankMap[provider.toLowerCase()] || 'CRDB'
}

/**
 * 7. Request OAuth Token kutoka AzamPay
 */
export async function getAzamPayToken(): Promise<string> {
  const tokenUrl = `${AZAMPAY_BASE_URL}/api/Authorization/GetToken`
  
  if (!AZAMPAY_APP_NAME || !AZAMPAY_CLIENT_ID || !AZAMPAY_CLIENT_SECRET) {
    throw new Error('AzamPay variables are missing in environment configuration!')
  }

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        appName: AZAMPAY_APP_NAME,
        clientId: AZAMPAY_CLIENT_ID,
        clientSecret: AZAMPAY_CLIENT_SECRET,
      }),
    })

    if (!response.ok) {
      throw new Error(`AzamPay authentication failed: ${response.status}`)
    }

    const data = await response.json()
    const token = data.token || data.data?.token
    
    if (!token) {
      throw new Error('No token found in response')
    }

    return token
  } catch (error) {
    console.error('[AzamPay Token Error]:', error)
    throw error
  }
}

/**
 * 8. Anzisha MNO Checkout (M-Pesa, Airtel, Tigo, Halopesa)
 */
export async function initiateMnoCheckout(params: {
  amount: number
  phone: string
  provider: string
  transactionId: string
}) {
  try {
    const token = await getAzamPayToken()
    const checkoutUrl = `${AZAMPAY_BASE_URL}/api/v1/Checkout/MNOCheckout`

    const payload = {
      accountNumber: formatPhoneForAzampay(params.phone),
      amount: params.amount.toString(),
      currency: 'TZS',
      externalId: params.transactionId,
      provider: mapMnoProvider(params.provider),
    }

    console.log(`[AzamPay MNO] Triggering Checkout for ${params.transactionId}`)

    const response = await fetch(checkoutUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || `MNO Checkout failed status: ${response.status}`)
    }

    return { success: true, data }
  } catch (error) {
    console.error('[AzamPay MNO Error]:', error)
    throw error
  }
}

/**
 * 9. Anzisha Bank Checkout (CRDB, NMB) - Inatafutwa na /api/donate/crdb
 */
export async function initiateBankCheckout(params: {
  amount: number
  bank: string
  reference: string
  transactionId: string
}) {
  try {
    const token = await getAzamPayToken()
    const bankUrl = `${AZAMPAY_BASE_URL}/api/v1/Checkout/BankCheckout`

    const payload = {
      amount: params.amount.toString(),
      currency: 'TZS',
      externalId: params.transactionId,
      merchantReference: params.reference,
      provider: mapBankProvider(params.bank),
    }

    const response = await fetch(bankUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || `Bank Checkout failed: ${response.status}`)
    }

    return { success: true, data }
  } catch (error) {
    console.error('[AzamPay Bank Error]:', error)
    throw error
  }
}

/**
 * 10. Cross-Verify Payment Status (Webhook verification)
 */
export async function verifyPayment(transactionId: string) {
  try {
    const token = await getAzamPayToken()
    const verifyUrl = `${AZAMPAY_BASE_URL}/api/v1/Checkout/GetMSISDNWithAccession?id=${transactionId}`

    const response = await fetch(verifyUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      return { verified: false, status: 'unknown' }
    }

    const data = await response.json()
    const isSuccess = data.status?.toLowerCase() === 'success' || data.transactionstatus?.toLowerCase() === 'success'

    return {
      verified: true,
      status: isSuccess ? 'successful' : 'failed',
      raw: data
    }
  } catch (error) {
    console.error('[AzamPay Verification Error]:', error)
    return { verified: false, status: 'error' }
  }
}