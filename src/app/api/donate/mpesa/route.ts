import { NextRequest, NextResponse } from 'next/server'
import { db, toNumber } from '@/lib/db'
import {
  initiateMnoCheckout,
  shouldSimulate,
  mapMnoProvider,
  formatPhoneForAzampay,
  getPaymentLimits,
  type MnoProvider,
} from '@/lib/azampay'
import { sendDonationConfirmationEmail } from '@/lib/resend'
import { DonationMethod, DonationStatus, DonationType } from '@prisma/client'

function generateTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `EHC${timestamp}${random}`
}

function normalizePhone(phone: string): string | null {
  // Remove spaces and dashes
  let cleaned = phone.replace(/[\s-]/g, '')

  // Handle +255 prefix
  if (cleaned.startsWith('+255')) {
    cleaned = '0' + cleaned.substring(4)
  }
  // Handle 255 prefix (without +)
  else if (cleaned.startsWith('255') && cleaned.length >= 12) {
    cleaned = '0' + cleaned.substring(3)
  }

  // Validate: should start with 0 and be 10 digits
  if (/^0\d{9}$/.test(cleaned)) {
    return cleaned
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      phone: string
      amount: number
      name?: string
      email?: string
      campaignId?: string
      provider?: string // Optional: 'mpesa' (default), 'airtel', 'tigo', 'halopesa', 'azampesa'
    }

    const { phone, amount, name, email, campaignId, provider } = body

    // Name is optional — default to "Anonymous"
    const donorName = (name && name.trim().length >= 2) ? name.trim() : 'Anonymous'

    // Validate phone
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizePhone(phone)
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: 'Invalid Tanzanian phone number. Use format: +255XXXXXXXXX or 0XXXXXXXXX' },
        { status: 400 }
      )
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Donation amount must be greater than zero' },
        { status: 400 }
      )
    }

    // Check payment limits
    const limits = getPaymentLimits()
    if (amount < limits.min) {
      return NextResponse.json(
        { error: `Minimum donation amount is TZS ${limits.min.toLocaleString()}` },
        { status: 400 }
      )
    }
    if (amount > limits.max) {
      return NextResponse.json(
        { error: `Maximum donation amount is TZS ${limits.max.toLocaleString()}. Please contact us for larger donations.` },
        { status: 400 }
      )
    }

    // Get campaign name if provided
    let campaignName: string | null = null
    if (campaignId) {
      const campaign = await db.campaign.findUnique({ where: { id: campaignId } })
      if (campaign) {
        campaignName = campaign.title
      }
    }

    // Generate transaction ID
    const transactionId = generateTransactionId()

    // Determine the MNO provider (default: mpesa)
    const mnoProvider = provider || 'mpesa'

    // Create donation record
    const donation = await db.donation.create({
      data: {
        donorName: donorName,
        donorEmail: email?.trim() || null,
        donorPhone: normalizedPhone,
        amount,
        currency: 'TZS',
        method: mnoProvider.toLowerCase() as DonationMethod,
        type: 'one_time' as DonationType,
        campaignId: campaignId || null,
        status: 'pending' as DonationStatus,
        transactionId,
      },
    })

    console.log(`[M-Pesa] Donation created: id=${donation.id}, txId=${transactionId}, amount=${amount}, phone=${normalizedPhone}, provider=${mnoProvider}`)

    // ---- Real AzamPay MNO Checkout ----
    if (!shouldSimulate()) {
      try {
        const azampayPhone = formatPhoneForAzampay(normalizedPhone)
        const mappedProvider = mapMnoProvider(mnoProvider) as MnoProvider

        const result = await initiateMnoCheckout({
          accountNumber: azampayPhone,
          amount: amount.toString(),
          currency: 'TZS',
          externalId: transactionId,
          provider: mappedProvider,
          additionalProperties: {
            donationId: donation.id,
            donorName,
            campaignId: campaignId || '',
          },
        })

        if (result.success) {
          // Payment initiated — AzamPay will push STK to the phone
          // We'll receive the final status via webhook callback
          const azampayTransactionId = typeof result.data === 'object' ? result.data?.transactionId : undefined

          console.log(`[M-Pesa] AzamPay checkout initiated: azampayTxId=${azampayTransactionId}`)

          return NextResponse.json({
            success: true,
            transactionId,
            donationId: donation.id,
            azampayTransactionId,
            provider: mappedProvider,
            message: `STK Push sent to your phone via ${mappedProvider}. Please enter your PIN to complete.`,
          })
        } else {
          // AzamPay rejected the checkout request
          await db.donation.update({
            where: { id: donation.id },
            data: { status: 'failed' as DonationStatus },
          })

          console.error(`[M-Pesa] AzamPay checkout rejected: ${result.message}`)

          return NextResponse.json(
            { error: result.message || 'Payment initiation failed. Please try again.' },
            { status: 400 }
          )
        }
      } catch (azampayError: unknown) {
        console.error('[M-Pesa] AzamPay MNO checkout error:', azampayError)
        const errorMessage = azampayError instanceof Error ? azampayError.message : 'Unknown error'

        // Mark donation as failed
        await db.donation.update({
          where: { id: donation.id },
          data: { status: 'failed' as DonationStatus },
        })

        return NextResponse.json(
          { error: `Payment service error: ${errorMessage}. Please try again later.` },
          { status: 502 }
        )
      }
    }

    // ---- Fallback: Simulated M-Pesa STK Push (for development) ----
    console.log(`[M-Pesa] SIMULATED mode: Auto-completing donation ${donation.id} in 3 seconds`)

    setTimeout(async () => {
      try {
        const mockReceipt = `QHK${Date.now().toString().slice(-8)}`
        await db.donation.update({
          where: { id: donation.id },
          data: {
            status: 'successful' as DonationStatus,
            mpesaReceipt: mockReceipt,
          },
        })

        // Update campaign raised amount if applicable
        if (campaignId) {
          await db.campaign.update({
            where: { id: campaignId },
            data: {
              raised: { increment: amount },
            },
          })
        }

        console.log(`[M-Pesa] SIMULATED: Donation ${donation.id} marked as successful`)

        // Send donation confirmation email if email was provided
        if (donation.donorEmail) {
          try {
            await sendDonationConfirmationEmail({
              to: donation.donorEmail,
              name: donation.donorName,
              amount: toNumber(donation.amount),
              transactionId: donation.transactionId || donation.id,
              method: donation.method,
              date: donation.createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
              campaign: campaignName || undefined,
            })
            console.log(`[M-Pesa] Confirmation email sent to ${donation.donorEmail}`)
          } catch (emailErr) {
            console.error('[M-Pesa] Failed to send confirmation email:', emailErr)
          }
        }
      } catch (err) {
        console.error('[M-Pesa] Simulation callback error:', err)
      }
    }, 3000)

    return NextResponse.json({
      success: true,
      transactionId,
      donationId: donation.id,
      provider: mapMnoProvider(mnoProvider),
      message: 'STK Push sent to your phone. Please enter your PIN to complete.',
      _simulated: true, // Indicates this is a simulated payment (dev mode)
    })
  } catch (error) {
    console.error('[M-Pesa] Donation error:', error)
    return NextResponse.json(
      { error: 'Failed to process donation. Please try again.' },
      { status: 500 }
    )
  }
}

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
      amount: toNumber(donation.amount),
      donorName: donation.donorName,
      transactionId: donation.transactionId,
      mpesaReceipt: donation.mpesaReceipt,
      method: donation.method,
      createdAt: donation.createdAt,
    })
  } catch (error) {
    console.error('[M-Pesa] Check donation status error:', error)
    return NextResponse.json(
      { error: 'Failed to check donation status' },
      { status: 500 }
    )
  }
}
