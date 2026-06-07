import { toNumber } from './db'

const AZAMPAY_ENV = process.env.AZAMPAY_ENV || 'sandbox'
const AZAMPAY_APP_NAME = process.env.AZAMPAY_APP_NAME || ''
const AZAMPAY_CLIENT_ID = process.env.AZAMPAY_CLIENT_ID || ''
const AZAMPAY_CLIENT_SECRET = process.env.AZAMPAY_CLIENT_SECRET || ''

// ─── Set Base URL and Endpoints Correctly ──────────────────────────────────
const AZAMPAY_BASE_URL = AZAMPAY_ENV === 'sandbox'
  ? 'https://sandbox.azampay.co.tz'
  : 'https://checkout.azampay.co.tz'

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
 * 1. Request OAuth Token from AzamPay
 * Fixes the 404 error by explicitly pointing to the correct API endpoint.
 */
export async function getAzamPayToken(): Promise<string> {
  // MAREKEBISHO: Lazima URL iishie na /api/Authorization/GetToken
  const tokenUrl = `${AZAMPAY_BASE_URL}/api/Authorization/GetToken`
  
  console.log(`[AzamPay] Requesting new token from ${tokenUrl} (env: ${AZAMPAY_ENV})`)

  if (!AZAMPAY_APP_NAME || !AZAMPAY_CLIENT_ID || !AZAMPAY_CLIENT_SECRET) {
    throw new Error('AzamPay environment variables (APP_NAME, CLIENT_ID, CLIENT_SECRET) are missing!')
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
      const errorText = await response.text()
      console.error(`[AzamPay Auth Failed] Status: ${response.status}, Response: ${errorText}`)
      throw new Error(`AzamPay authentication failed: ${response.status}`)
    }

    const data = await response.json()
    
    // AzamPay kawaida wanarudisha token kwenye: data.token au data.data.token
    const token = data.token || data.data?.token
    
    if (!token) {
      throw new Error('Authentication response did not contain a valid token')
    }

    return token
  } catch (error) {
    console.error('[AzamPay] Token request error:', error)
    throw error
  }
}

/**
 * 2. Initiate MNO Checkout (M-Pesa, AirtelMoney, TigoPesa, Halopesa)
 */
export async function initiateMnoCheckout(params: {
  amount: number
  phone: string // Mfano: 0757337929 au 255757337929
  provider: string // mpesa, airtel, tigo, halopesa
  transactionId: string
}) {
  try {
    const token = await getAzamPayToken()
    const checkoutUrl = `${AZAMPAY_BASE_URL}/api/v1/Checkout/MNOCheckout`

    // Hakikisha namba ya simu ipo kwenye mfano unaokubalika na AzamPay (Kawaida 255...)
    let formattedPhone = params.phone.trim()
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '255' + formattedPhone.substring(1)
    }

    // Ramani ya ma-operator kwenda kwenye majina rasmi ya AzamPay
    const operatorMap: Record<string, string> = {
      mpesa: 'Mpesa',
      tigo: 'Tigo',
      airtel: 'Airtel',
      halopesa: 'Halopesa',
    }

    const payload = {
      accountNumber: formattedPhone,
      amount: params.amount.toString(),
      currency: 'TZS',
      externalId: params.transactionId,
      provider: operatorMap[params.provider.toLowerCase()] || 'Mpesa',
    }

    console.log(`[AzamPay MNO] Requesting Checkout for TxId: ${params.transactionId}`)

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
      console.error('[AzamPay MNO Failed]', JSON.stringify(data))
      throw new Error(data.message || `MNO Checkout failed with status: ${response.status}`)
    }

    return { success: true, data }
  } catch (error) {
    console.error('[AzamPay MNO Checkout Error]:', error)
    throw error
  }
}

/**
 * 3. Cross-Verify Payment Status via AzamPay API
 * (Inatumiwa upande wa Webhook kwa miamala mikubwa ya usalama)
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
    
    // Angalia kama muamala umefanikiwa upande wa AzamPay API yenyewe
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