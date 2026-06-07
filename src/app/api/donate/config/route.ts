/**
 * Payment Configuration Status Endpoint
 *
 * Returns the current status of the AzamPay payment integration.
 * Only exposes non-sensitive configuration info for the public donate page.
 * Detailed config (callback URLs, missing vars) requires admin auth.
 */

import { NextResponse } from 'next/server'
import { getPaymentLimits, getMerchantBankDetails, shouldSimulate } from '@/lib/azampay'

export async function GET() {
  try {
    const limits = getPaymentLimits()
    const bankDetails = getMerchantBankDetails()

    return NextResponse.json({
      // Public info: payment limits & available methods
      limits,
      simulated: shouldSimulate(),
      methods: {
        mpesa: true,
        crdb: true,
        bankTransfer: true,
        proofUpload: true,
      },
      merchantBank: {
        bankName: bankDetails.bankName,
        accountName: bankDetails.accountName,
        accountNumber: bankDetails.accountNumber,
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
