import { NextResponse } from 'next/server'
import { getAzamPayStatus, getMerchantBankDetails } from '@/lib/azampay'

/**
 * Payment Configuration Status Endpoint
 *
 * Returns the current status of the AzamPay payment integration.
 * Useful for the admin dashboard to display whether payments are
 * in sandbox/live mode and which credentials are still missing.
 *
 * NOTE: This does NOT expose actual credential values — only
 * whether they are configured or not.
 */
export async function GET() {
  try {
    const azampayStatus = getAzamPayStatus()
    const bankDetails = getMerchantBankDetails()

    return NextResponse.json({
      azampay: {
        configured: azampayStatus.configured,
        env: azampayStatus.env,
        missingVars: azampayStatus.missingVars,
        callbackUrl: azampayStatus.callbackUrl,
        webhookSecretConfigured: !!process.env.AZAMPAY_WEBHOOK_SECRET,
      },
      limits: azampayStatus.limits,
      merchantBank: {
        bankName: bankDetails.bankName,
        accountName: bankDetails.accountName,
        accountNumberConfigured: !!bankDetails.accountNumber,
        accountNumberPreview: bankDetails.accountNumber
          ? `${bankDetails.accountNumber.slice(0, 3)}****${bankDetails.accountNumber.slice(-3)}`
          : '',
        branch: bankDetails.branch,
      },
    })
  } catch (error) {
    console.error('Payment config status error:', error)
    return NextResponse.json(
      { error: 'Failed to get payment config' },
      { status: 500 }
    )
  }
}
