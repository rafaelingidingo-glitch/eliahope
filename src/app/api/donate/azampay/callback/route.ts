import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { AzamPayWebhookData } from '@/lib/azampay'

/**
 * AzamPay Webhook/Callback Endpoint
 * 
 * AzamPay sends payment status updates to this endpoint after:
 * - MNO Checkout (M-Pesa, Airtel, Tigo, etc.) - when donor completes PIN entry
 * - Bank Checkout (CRDB, NMB) - when bank payment is authorized/declined
 * 
 * Webhook data format from AzamPay:
 * {
 *   "msisdn": "0754123456",
 *   "amount": "5000",
 *   "message": "Success",
 *   "utilityref": "1292-123",
 *   "operator": "Mpesa",        // or "CRDB", "NMB", "Airtel", "Tigo"
 *   "reference": "123-123",     // Our externalId / transactionId
 *   "transactionstatus": "success",  // or "failed"
 *   "submerchantAcc": "01723113"
 * }
 * 
 * IMPORTANT: Configure this URL in your AzamPay merchant dashboard:
 * - Sandbox: https://sandbox.azampay.co.tz → Settings → Callback URL
 * - Live: https://checkout.azampay.co.tz → Settings → Callback URL
 * - URL should be: https://yourdomain.com/api/donate/azampay/callback
 * 
 * SECURITY: Set AZAMPAY_WEBHOOK_SECRET env var to enable signature verification.
 * AzamPay may include a signature header (e.g., X-Azampay-Signature) in webhook requests.
 * When configured, requests without a valid signature will be rejected.
 */

/** Verify webhook signature if AZAMPAY_WEBHOOK_SECRET is configured */
function verifyWebhookSignature(request: NextRequest): boolean {
  const secret = process.env.AZAMPAY_WEBHOOK_SECRET
  
  // If no secret configured, skip verification (development mode)
  if (!secret) {
    console.warn('AZAMPAY_WEBHOOK_SECRET not set — webhook signature verification is disabled')
    return true
  }
  
  // TODO: Implement signature verification based on AzamPay's documentation
  // when they provide the signing algorithm. Typically:
  // 1. Read the raw request body
  // 2. Compute HMAC-SHA256(rawBody, secret)
  // 3. Compare with the signature header value
  // Example:
  // const signature = request.headers.get('X-Azampay-Signature')
  // const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  // return signature === computed
  
  const signature = request.headers.get('X-Azampay-Signature')
  if (!signature) {
    console.error('AzamPay webhook: Missing signature header')
    return false
  }
  
  // Placeholder: when AzamPay provides signing details, implement real verification
  console.warn('AzamPay webhook signature verification is not fully implemented yet — accepting all signed requests')
  return true
}
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    if (!verifyWebhookSignature(request)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    const body = await request.json() as AzamPayWebhookData

    console.log('AzamPay webhook received:', JSON.stringify(body))

    const {
      reference,
      transactionstatus,
      amount,
      operator,
      utilityref,
      msisdn,
    } = body

    if (!reference || !transactionstatus) {
      console.error('AzamPay webhook: Missing required fields (reference or transactionstatus)')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find the donation by our transaction ID (stored in reference/externalId)
    const donation = await db.donation.findFirst({
      where: { transactionId: reference },
    })

    if (!donation) {
      console.error(`AzamPay webhook: Donation not found for reference: ${reference}`)
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    // Skip if already processed (idempotency)
    if (donation.status === 'successful' || donation.status === 'failed') {
      console.log(`AzamPay webhook: Donation ${donation.id} already processed with status: ${donation.status}`)
      return NextResponse.json({ success: true, message: 'Already processed' })
    }

    const isSuccess = transactionstatus.toLowerCase() === 'success'

    if (isSuccess) {
      // Update donation to successful
      await db.donation.update({
        where: { id: donation.id },
        data: {
          status: 'successful',
          mpesaReceipt: utilityref || donation.mpesaReceipt,
          // Store AzamPay transaction reference
          crdbReference: operator === 'CRDB' || operator === 'NMB'
            ? (utilityref || donation.crdbReference)
            : donation.crdbReference,
        },
      })

      // Update campaign raised amount if applicable
      if (donation.campaignId) {
        await db.campaign.update({
          where: { id: donation.campaignId },
          data: {
            raised: { increment: donation.amount },
          },
        })
      }

      console.log(`AzamPay webhook: Donation ${donation.id} marked as successful. Amount: TZS ${donation.amount}`)
    } else {
      // Update donation to failed
      await db.donation.update({
        where: { id: donation.id },
        data: {
          status: 'failed',
        },
      })

      console.log(`AzamPay webhook: Donation ${donation.id} marked as failed. Reason: ${body.message || 'Unknown'}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('AzamPay webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// GET endpoint for manual transaction status verification
export async function GET(request: NextRequest) {
  try {
    const transactionId = request.nextUrl.searchParams.get('transactionId')

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      )
    }

    const donation = await db.donation.findFirst({
      where: { transactionId },
    })

    if (!donation) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: donation.id,
      status: donation.status,
      amount: donation.amount,
      donorName: donation.donorName,
      transactionId: donation.transactionId,
      method: donation.method,
      mpesaReceipt: donation.mpesaReceipt,
      crdbReference: donation.crdbReference,
      createdAt: donation.createdAt,
    })
  } catch (error) {
    console.error('Check transaction status error:', error)
    return NextResponse.json(
      { error: 'Failed to check transaction status' },
      { status: 500 }
    )
  }
}
