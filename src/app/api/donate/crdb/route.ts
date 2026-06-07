import { NextRequest, NextResponse } from 'next/server'
import { db, toNumber } from '@/lib/db'
import {
  initiateBankCheckout,
  shouldSimulate,
  mapBankProvider,
  getPaymentLimits,
  type BankProvider,
} from '@/lib/azampay'
import { sendDonationConfirmationEmail } from '@/lib/resend'
import { generateTransactionId, generateBankReference } from '@/lib/payment-utils'
import { DonationMethod, DonationStatus, DonationType } from '@prisma/client'

/**
 * CRDB Bank Checkout Flow:
 *
 * Step 1: Donor submits account details (POST with otp="")
 *   → AzamPay initiates checkout and sends OTP to donor's phone
 *   → Response includes { otpRequired: true }
 *
 * Step 2: Doner submits OTP (POST with otp="123456")
 *   → AzamPay confirms the payment
 *   → Final status comes via webhook callback
 *
 * Step 3: Webhook callback updates donation status
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      accountHolderName: string
      crdbAccountNumber: string
      amount: number
      name?: string
      email?: string
      phone?: string
      campaignId?: string
      otp?: string       // OTP for step 2 confirmation
      donationId?: string // Existing donation ID for OTP confirmation step
      provider?: string   // Optional: 'crdb' (default) or 'nmb'
    }

    const {
      accountHolderName,
      crdbAccountNumber,
      amount,
      name,
      email,
      phone,
      campaignId,
      otp,
      donationId,
      provider,
    } = body

    // Donor name is optional - default to "Anonymous"
    const donorName = (name && name.trim().length >= 2) ? name.trim() : 'Anonymous'

    // Determine bank provider (default: crdb)
    const bankProvider = provider || 'crdb'
    const mappedProvider = mapBankProvider(bankProvider) as BankProvider

    // ---- OTP Confirmation Step (Step 2) ----
    // If donationId and otp are provided, this is the OTP confirmation step
    if (donationId && otp) {
      const existingDonation = await db.donation.findUnique({
        where: { id: donationId },
        include: { campaign: { select: { title: true } } },
      })

      if (!existingDonation) {
        return NextResponse.json(
          { error: 'Donation not found. Please start a new transaction.' },
          { status: 404 }
        )
      }

      if (existingDonation.status !== 'pending' && existingDonation.status !== 'processing') {
        return NextResponse.json(
          { error: `Transaction already ${existingDonation.status}. Cannot re-confirm.` },
          { status: 400 }
        )
      }

      console.log(`[CRDB] OTP confirmation: donationId=${donationId}, otp=[PROVIDED]`)

      // Real AzamPay OTP confirmation
      if (!shouldSimulate()) {
        try {
          const result = await initiateBankCheckout({
            amount: existingDonation.amount.toString(),
            currencyCode: 'TZS',
            merchantAccountNumber: existingDonation.crdbAccountNumber || crdbAccountNumber,
            merchantMobileNumber: existingDonation.donorPhone || phone?.trim() || '',
            merchantName: existingDonation.crdbAccountHolder || accountHolderName?.trim(),
            otp: otp,
            provider: mappedProvider,
            referenceId: existingDonation.transactionId || '',
            additionalProperties: {
              donationId: existingDonation.id,
              donorName: existingDonation.donorName,
              campaignId: existingDonation.campaignId || '',
              bankReference: existingDonation.crdbReference || '',
            },
          })

          if (result.success) {
            const azampayTransactionId = typeof result.data === 'object' ? result.data?.transactionId : undefined

            console.log(`[CRDB] OTP confirmed: azampayTxId=${azampayTransactionId}`)

            // Update status to processing (waiting for final webhook)
            await db.donation.update({
              where: { id: donationId },
              data: { status: 'processing' as DonationStatus },
            })

            return NextResponse.json({
              success: true,
              transactionId: existingDonation.transactionId,
              donationId: existingDonation.id,
              bankReference: existingDonation.crdbReference,
              azampayTransactionId,
              message: 'Payment authorized. Processing your transaction...',
            })
          } else {
            await db.donation.update({
              where: { id: donationId },
              data: { status: 'failed' as DonationStatus },
            })

            console.error(`[CRDB] OTP confirmation failed: ${result.message}`)

            return NextResponse.json(
              { error: result.message || 'OTP verification failed. Please try again.' },
              { status: 400 }
            )
          }
        } catch (azampayError: unknown) {
          console.error('[CRDB] AzamPay OTP confirmation error:', azampayError)
          const errorMessage = azampayError instanceof Error ? azampayError.message : 'Unknown error'

          return NextResponse.json(
            { error: `Payment service error: ${errorMessage}. Please try again.` },
            { status: 502 }
          )
        }
      }

      // Simulated OTP confirmation
      setTimeout(async () => {
        try {
          const isSuccess = Math.random() > 0.1 // 90% success rate
          if (isSuccess) {
            await db.donation.update({
              where: { id: donationId },
              data: { status: 'successful' as DonationStatus },
            })
            if (existingDonation.campaignId) {
              await db.campaign.update({
                where: { id: existingDonation.campaignId },
                data: { raised: { increment: existingDonation.amount } },
              })
            }
            console.log(`[CRDB] SIMULATED OTP: Donation ${donationId} marked successful`)

            // Send donation confirmation email
            if (existingDonation.donorEmail) {
              try {
                await sendDonationConfirmationEmail({
                  to: existingDonation.donorEmail,
                  name: existingDonation.donorName,
                  amount: toNumber(existingDonation.amount),
                  transactionId: existingDonation.transactionId || existingDonation.id,
                  method: existingDonation.method,
                  date: existingDonation.createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
                  campaign: existingDonation.campaign?.title || undefined,
                })
                console.log(`[CRDB] Confirmation email sent to ${existingDonation.donorEmail}`)
              } catch (emailErr) {
                console.error('[CRDB] Failed to send confirmation email:', emailErr)
              }
            }
          } else {
            await db.donation.update({
              where: { id: donationId },
              data: { status: 'failed' as DonationStatus },
            })
            console.log(`[CRDB] SIMULATED OTP: Donation ${donationId} marked failed`)
          }
        } catch (err) {
          console.error('[CRDB] OTP simulation error:', err)
        }
      }, 2000)

      return NextResponse.json({
        success: true,
        transactionId: existingDonation.transactionId,
        donationId: existingDonation.id,
        bankReference: existingDonation.crdbReference,
        message: 'Payment authorized. Processing your transaction...',
        _simulated: true,
      })
    }

    // ---- Initial Checkout Step (Step 1) ----

    // Validate account holder name
    if (!accountHolderName || accountHolderName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Account holder name is required' },
        { status: 400 }
      )
    }

    // Validate CRDB account number (should be 10-16 digits)
    const cleanedAccount = crdbAccountNumber.replace(/[\s-]/g, '')
    if (!/^\d{10,16}$/.test(cleanedAccount)) {
      return NextResponse.json(
        { error: `Invalid ${mappedProvider} account number. Please enter a valid 10-16 digit account number.` },
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

    // Generate transaction ID and bank reference
    const transactionId = generateTransactionId('CRDB')
    const bankReference = generateBankReference()

    // Create donation record with "pending" status
    const donation = await db.donation.create({
      data: {
        donorName: donorName,
        donorEmail: email?.trim() || null,
        donorPhone: phone?.trim() || null,
        amount,
        currency: 'TZS',
        method: bankProvider.toLowerCase() as DonationMethod,
        type: 'one_time' as DonationType,
        campaignId: campaignId || null,
        status: 'pending' as DonationStatus,
        transactionId,
        crdbAccountHolder: accountHolderName.trim(),
        crdbAccountNumber: cleanedAccount,
        crdbReference: bankReference,
      },
    })

    console.log(`[CRDB] Donation created: id=${donation.id}, txId=${transactionId}, amount=${amount}, account=${cleanedAccount}, provider=${mappedProvider}`)

    // ---- Real AzamPay Bank Checkout ----
    if (!shouldSimulate()) {
      try {
        const merchantPhone = phone?.trim() || ''

        const result = await initiateBankCheckout({
          amount: amount.toString(),
          currencyCode: 'TZS',
          merchantAccountNumber: cleanedAccount,
          merchantMobileNumber: merchantPhone,
          merchantName: accountHolderName.trim(),
          otp: '', // Empty OTP for initial checkout initiation
          provider: mappedProvider,
          referenceId: transactionId,
          additionalProperties: {
            donationId: donation.id,
            donorName,
            campaignId: campaignId || '',
            bankReference,
          },
        })

        if (result.success) {
          const azampayTransactionId = typeof result.data === 'object' ? result.data?.transactionId : undefined

          // Check if OTP is required for the next step
          const otpRequired = typeof result.data === 'object' ? result.data?.otpRequired !== false : true

          console.log(`[CRDB] AzamPay checkout initiated: azampayTxId=${azampayTransactionId}, otpRequired=${otpRequired}`)

          if (otpRequired) {
            // OTP flow: tell the frontend to show OTP input
            return NextResponse.json({
              success: true,
              transactionId,
              donationId: donation.id,
              bankReference,
              azampayTransactionId,
              otpRequired: true,
              message: `An OTP has been sent to your registered phone number with ${mappedProvider}. Please enter it to confirm the payment.`,
            })
          } else {
            // No OTP required — payment is processing
            await db.donation.update({
              where: { id: donation.id },
              data: { status: 'processing' as DonationStatus },
            })

            return NextResponse.json({
              success: true,
              transactionId,
              donationId: donation.id,
              bankReference,
              azampayTransactionId,
              otpRequired: false,
              message: `Connecting to ${mappedProvider}. Please authorize the transaction.`,
            })
          }
        } else {
          // AzamPay rejected the checkout request
          await db.donation.update({
            where: { id: donation.id },
            data: { status: 'failed' as DonationStatus },
          })

          console.error(`[CRDB] AzamPay checkout rejected: ${result.message}`)

          return NextResponse.json(
            { error: result.message || 'Bank payment initiation failed. Please try again.' },
            { status: 400 }
          )
        }
      } catch (azampayError: unknown) {
        console.error('[CRDB] AzamPay Bank checkout error:', azampayError)
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

    // ---- Fallback: Simulated CRDB Bank payment processing (for development) ----
    console.log(`[CRDB] SIMULATED mode: Auto-completing donation ${donation.id} in 4 seconds`)

    setTimeout(async () => {
      try {
        // Simulate: 90% success rate
        const isSuccess = Math.random() > 0.1

        if (isSuccess) {
          await db.donation.update({
            where: { id: donation.id },
            data: {
              status: 'successful' as DonationStatus,
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

          console.log(`[CRDB] SIMULATED: Donation ${donation.id} marked successful`)

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
              console.log(`[CRDB] Confirmation email sent to ${donation.donorEmail}`)
            } catch (emailErr) {
              console.error('[CRDB] Failed to send confirmation email:', emailErr)
            }
          }
        } else {
          await db.donation.update({
            where: { id: donation.id },
            data: {
              status: 'failed' as DonationStatus,
            },
          })
          console.log(`[CRDB] SIMULATED: Donation ${donation.id} marked failed`)
        }
      } catch (err) {
        console.error('[CRDB] Simulation callback error:', err)
      }
    }, 4000)

    return NextResponse.json({
      success: true,
      transactionId,
      donationId: donation.id,
      bankReference,
      otpRequired: true, // In simulation, also show OTP step for testing
      message: `Connecting to ${mappedProvider}. Please authorize the transaction.`,
      _simulated: true, // Indicates this is a simulated payment (dev mode)
    })
  } catch (error) {
    console.error('[CRDB] Donation error:', error)
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
      crdbReference: donation.crdbReference,
      crdbAccountHolder: donation.crdbAccountHolder,
      method: donation.method,
      createdAt: donation.createdAt,
    })
  } catch (error) {
    console.error('[CRDB] Check donation status error:', error)
    return NextResponse.json(
      { error: 'Failed to check donation status' },
      { status: 500 }
    )
  }
}
