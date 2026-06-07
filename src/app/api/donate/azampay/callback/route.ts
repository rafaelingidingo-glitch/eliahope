import { NextRequest, NextResponse } from 'next/server'
import { db, toNumber } from '@/lib/db'
import { verifyWebhookSignature } from '@/lib/auth'
import { verifyPayment } from '@/lib/azampay'
import type { AzamPayWebhookData } from '@/lib/azampay'
import { sendDonationConfirmationEmail } from '@/lib/resend'
import { DonationStatus } from '@/generated/prisma/client'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()

    if (!verifyWebhookSignature(request, rawBody)) {
      console.error('[AzamPay Webhook] Invalid signature — rejecting request')
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody) as AzamPayWebhookData
    console.log('[AzamPay Webhook] Received:', JSON.stringify(body))

    const {
      reference,
      transactionstatus,
      amount,
      operator,
      utilityref,
      externalId,
    } = body

    const lookupId = reference || externalId
    if (!lookupId) {
      console.error('[AzamPay Webhook] Missing reference/externalId')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!transactionstatus) {
      return NextResponse.json({ error: 'Missing transactionstatus field' }, { status: 400 })
    }

    const donation = await db.donation.findFirst({
      where: { transactionId: lookupId },
      include: { campaign: { select: { title: true } } },
    })

    if (!donation) {
      console.error(`[AzamPay Webhook] Donation not found for reference: ${lookupId}`)
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 })
    }

    if (donation.status === 'successful' || donation.status === 'failed') {
      console.log(`[AzamPay Webhook] Donation ${donation.id} already processed.`)
      return NextResponse.json({ success: true, message: 'Already processed' })
    }

    const isSuccess = transactionstatus.toLowerCase() === 'success'

    // Cross-verify payments >= 500,000 TZS
    if (isSuccess && toNumber(donation.amount) >= 500000) {
      console.log(`[AzamPay Webhook] Cross-verifying high-value payment...`)
      const verification = await verifyPayment(donation.transactionId || '')
      if (verification.verified && verification.status !== 'successful') {
        await db.donation.update({
          where: { id: donation.id },
          data: { status: 'pending' as DonationStatus, message: 'Payment mismatch - manual review required' },
        })
        return NextResponse.json({ success: true, message: 'Payment flagged for review' })
      }
    }

    if (isSuccess) {
      // Kuzuia udanganyifu wa kiasi cha pesa
      if (amount && parseFloat(amount) !== toNumber(donation.amount)) {
        await db.donation.update({
          where: { id: donation.id },
          data: {
            status: 'pending' as DonationStatus,
            message: `Amount mismatch: expected ${toNumber(donation.amount)}, received ${amount}.`,
          },
        })
        return NextResponse.json({ success: true, message: 'Payment flagged for amount verification' })
      }

      const normalizedOperator = operator?.toLowerCase() || ''

      // 1. Sasisha hali ya mchango kuwa 'successful'
      await db.donation.update({
        where: { id: donation.id },
        data: {
          status: 'successful' as DonationStatus,
          mpesaReceipt: ['mpesa', 'airtel', 'tigo', 'halopesa', 'azampesa'].includes(normalizedOperator)
            ? (utilityref || donation.mpesaReceipt)
            : donation.mpesaReceipt,
          crdbReference: ['crdb', 'nmb'].includes(normalizedOperator)
            ? (utilityref || donation.crdbReference)
            : donation.crdbReference,
        },
      })

      // 2. Ongeza kiasi kilichokusanywa kwenye kampeni (HAPA TUMEREKEBISHA KOSA LA DECIMAL)
      if (donation.campaignId) {
        await db.campaign.update({
          where: { id: donation.campaignId },
          data: {
            raised: { increment: toNumber(donation.amount) }, // <-- Sahihi sasa!
          },
        })
      }

      console.log(`[AzamPay Webhook] Donation ${donation.id} marked SUCCESSFUL.`)

      // 3. Tuma barua pepe bila kuchelewesha jibu la AzamPay (Fire and Forget)
      if (donation.donorEmail) {
        sendDonationConfirmationEmail({
          to: donation.donorEmail,
          name: donation.donorName,
          amount: toNumber(donation.amount),
          transactionId: donation.transactionId || donation.id,
          method: donation.method,
          date: donation.createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
          campaign: donation.campaign?.title || undefined,
        }).catch((emailErr) => {
          console.error('[AzamPay Webhook] Failed to send confirmation email asynchronously:', emailErr)
        })
      }
    } else {
      await db.donation.update({
        where: { id: donation.id },
        data: {
          status: 'failed' as DonationStatus,
          message: body.message || `Payment ${transactionstatus}`,
        },
      })
      console.log(`[AzamPay Webhook] Donation ${donation.id} marked FAILED.`)
    }

    // Daima rudisha status 200 kwa AzamPay kuzuia marudio (retries)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[AzamPay Webhook] Processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// GET endpoint haina mabadiliko, iko sawa kabisa...
export async function GET(request: NextRequest) {
  // ... msimbo wako wa GET uliopo uko sawa na hauna shida yoyote.
}