'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Building2,
  Heart,
  Phone,
  Mail,
  User,
  Copy,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Share2,
  X,
  GraduationCap,
  Baby,
  Users,
} from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'

interface Campaign {
  id: string
  title: string
  description: string
  goal: number
  raised: number
  percentage: number
  remaining: number
  status: string
}

interface BankDetails {
  accountNumber: string
  branch: string
  swift: string
}

type DonationState = 'idle' | 'loading' | 'success' | 'error'
type PaymentTab = 'mpesa' | 'bank'

interface DonationModalProps {
  isOpen: boolean
  onClose: () => void
  preselectedCampaignId?: string
}

export default function DonationModal({ isOpen, onClose, preselectedCampaignId }: DonationModalProps) {
  const { toast } = useToast()

  // Form states
  const [activeTab, setActiveTab] = useState<PaymentTab>('mpesa')
  const [selectedCampaign, setSelectedCampaign] = useState<string>('')

  // M-Pesa form
  const [mpesaName, setMpesaName] = useState('')
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [mpesaEmail, setMpesaEmail] = useState('')
  const [mpesaAmount, setMpesaAmount] = useState('')
  const [donationState, setDonationState] = useState<DonationState>('idle')
  const [transactionId, setTransactionId] = useState('')
  const [donationId, setDonationId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Bank transfer form
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountNumber: '0150234567890',
    branch: 'Mwanza Main',
    swift: 'CORUTZTZ',
  })
  const [showProofForm, setShowProofForm] = useState(false)
  const [proofName, setProofName] = useState('')
  const [proofPhone, setProofPhone] = useState('')
  const [proofAmount, setProofAmount] = useState('')
  const [proofReceipt, setProofReceipt] = useState<File | null>(null)
  const [proofSubmitting, setProofSubmitting] = useState(false)

  // Campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  // Polling for M-Pesa status
  const [polling, setPolling] = useState(false)

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch('/api/donate/campaigns')
      if (res.ok) {
        const data = await res.json()
        setCampaigns(data.campaigns || [])
      }
    } catch {
      // Silent fail
    }
  }, [])

  const fetchBankDetails = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const settings = await res.json() as { key: string; value: string }[]
        const accountNumber = settings.find((s) => s.key === 'crdb_account_number')
        const branch = settings.find((s) => s.key === 'crdb_branch')
        const swift = settings.find((s) => s.key === 'crdb_swift')
        if (accountNumber || branch || swift) {
          setBankDetails({
            accountNumber: accountNumber?.value || '0150234567890',
            branch: branch?.value || 'Mwanza Main',
            swift: swift?.value || 'CORUTZTZ',
          })
        }
      }
    } catch {
      // Use defaults
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchCampaigns()
      fetchBankDetails()
    }
  }, [isOpen, fetchCampaigns, fetchBankDetails])

  // Apply preselected campaign
  useEffect(() => {
    if (preselectedCampaignId) {
      setSelectedCampaign(preselectedCampaignId)
    }
  }, [preselectedCampaignId])

  // Poll for M-Pesa status
  useEffect(() => {
    if (!polling || !transactionId) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/donate/mpesa?transactionId=${transactionId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'successful') {
            setDonationState('success')
            setPolling(false)
            fetchCampaigns()
          } else if (data.status === 'failed') {
            setDonationState('error')
            setErrorMessage('M-Pesa payment was not completed. Please try again.')
            setPolling(false)
          }
        }
      } catch {
        // Continue polling
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [polling, transactionId, fetchCampaigns])

  // Stop polling after 60 seconds
  useEffect(() => {
    if (!polling) return
    const timeout = setTimeout(() => {
      setPolling(false)
      if (donationState === 'loading') {
        setDonationState('error')
        setErrorMessage('Payment verification timed out. Your payment may still be processing. Please contact us if you don\'t receive confirmation.')
      }
    }, 60000)
    return () => clearTimeout(timeout)
  }, [polling, donationState])

  const resetForm = () => {
    setDonationState('idle')
    setTransactionId('')
    setDonationId('')
    setErrorMessage('')
    setPolling(false)
    setMpesaName('')
    setMpesaPhone('')
    setMpesaEmail('')
    setMpesaAmount('')
    setSelectedCampaign('')
    setActiveTab('mpesa')
    setShowProofForm(false)
    setProofName('')
    setProofPhone('')
    setProofAmount('')
    setProofReceipt(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleMpesaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDonationState('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/donate/mpesa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: mpesaPhone,
          amount: parseFloat(mpesaAmount),
          name: mpesaName || undefined,
          email: mpesaEmail || undefined,
          campaignId: selectedCampaign || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setDonationState('error')
        setErrorMessage(data.error || 'Failed to process donation')
        return
      }

      setTransactionId(data.transactionId)
      setDonationId(data.donationId)
      setPolling(true)
    } catch {
      setDonationState('error')
      setErrorMessage('Network error. Please check your connection and try again.')
    }
  }

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(bankDetails.accountNumber)
      toast({ title: 'Copied!', description: 'Account number copied to clipboard' })
    } catch {
      toast({ title: 'Copy failed', description: 'Please copy the account number manually', variant: 'destructive' })
    }
  }

  const handleDownloadBankDetails = () => {
    const text = `ELIA'S HOPE COMMUNITY - BANK TRANSFER DETAILS
============================================
Account Name:  Elia's Hope Community
Bank:          CRDB Bank
Account Number: ${bankDetails.accountNumber}
Branch:        ${bankDetails.branch}
SWIFT Code:    ${bankDetails.swift}

Thank you for your generous donation!
After making the transfer, please submit proof of payment on our website.`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'elias-hope-bank-details.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: 'Downloaded!', description: 'Bank details saved' })
  }

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!proofReceipt) {
      toast({ title: 'Missing receipt', description: 'Please upload your payment receipt', variant: 'destructive' })
      return
    }
    setProofSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('donorName', proofName || 'Anonymous')
      formData.append('donorPhone', proofPhone)
      formData.append('amount', proofAmount)
      formData.append('receipt', proofReceipt)
      if (selectedCampaign) formData.append('campaignId', selectedCampaign)

      const res = await fetch('/api/donate/proof', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'Failed to submit proof', variant: 'destructive' })
        return
      }

      toast({ title: 'Submitted!', description: 'Your payment proof has been submitted. We will verify it shortly.' })
      setProofName('')
      setProofPhone('')
      setProofAmount('')
      setProofReceipt(null)
      setShowProofForm(false)
    } catch {
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' })
    } finally {
      setProofSubmitting(false)
    }
  }

  const handleDownloadReceipt = () => {
    if (!donationId) return
    const a = document.createElement('a')
    a.href = `/api/donate/receipt?donationId=${donationId}`
    a.download = `receipt-${transactionId}.txt`
    a.click()
  }

  const handleShare = async () => {
    const text = `I just donated TZS ${parseFloat(mpesaAmount).toLocaleString()} to Elia's Hope Community! Join me in making a difference.`
    if (navigator.share) {
      try {
        await navigator.share({ title: "Elia's Hope Community", text })
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text)
      toast({ title: 'Copied!', description: 'Donation message copied to clipboard' })
    }
  }

  const handleRetry = () => {
    setDonationState('idle')
    setTransactionId('')
    setDonationId('')
    setErrorMessage('')
    setPolling(false)
  }

  const campaignIcons = [GraduationCap, Building2, Baby, Users, Heart]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-0">
        <DialogTitle className="sr-only">Donate to Elia's Hope Community</DialogTitle>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>

        {/* Header */}
        <div className="bg-[#031632] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ff8928] rounded-xl flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Donate Now</h2>
              <p className="text-white/60 text-xs">Support Elia&apos;s Hope Community</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Success State */}
            {donationState === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-[#031632] mb-2">
                  Thank You For Your Donation!
                </h3>
                <p className="text-[#44474d] text-sm mb-4">
                  Your generosity helps change lives in our community.
                </p>

                <div className="bg-[#f5f3ef] rounded-2xl p-4 text-left max-w-xs mx-auto mb-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#44474d]">Donor:</span>
                    <span className="text-[#031632] font-semibold">{mpesaName || 'Anonymous'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#44474d]">Amount:</span>
                    <span className="text-[#031632] font-semibold">TZS {parseFloat(mpesaAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#44474d]">Transaction ID:</span>
                    <span className="text-[#031632] font-semibold font-mono text-xs">{transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#44474d]">Date:</span>
                    <span className="text-[#031632] font-semibold">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleDownloadReceipt}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#031632] text-white rounded-none font-semibold hover:bg-[#1a2b48] transition-colors text-sm"
                  >
                    <Download className="h-4 w-4" /> Download Receipt
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#ff8928] text-white rounded-none font-semibold hover:bg-[#e07820] transition-colors text-sm"
                  >
                    <Share2 className="h-4 w-4" /> Share Donation
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-[#c5c6ce] text-[#031632] rounded-none font-semibold hover:bg-gray-50 transition-colors text-sm"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Campaign Selector */}
                {campaigns.length > 0 && (
                  <div className="mb-5">
                    <label className="text-sm font-semibold text-[#031632] mb-2 block">
                      Select Campaign (Optional)
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCampaign}
                        onChange={(e) => setSelectedCampaign(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors appearance-none bg-white pr-10"
                      >
                        <option value="">General Donation</option>
                        {campaigns.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d] pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Payment Tabs */}
                <div className="flex mb-5 border-2 border-[#c5c6ce] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setActiveTab('mpesa')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
                      activeTab === 'mpesa'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-[#44474d] hover:bg-gray-50'
                    }`}
                  >
                    <Phone className="h-4 w-4" />
                    M-Pesa
                  </button>
                  <button
                    onClick={() => setActiveTab('bank')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors border-l-2 border-[#c5c6ce] ${
                      activeTab === 'bank'
                        ? 'bg-[#031632] text-white'
                        : 'bg-white text-[#44474d] hover:bg-gray-50'
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    Bank Transfer
                  </button>
                </div>

                {/* M-Pesa Tab */}
                {activeTab === 'mpesa' && (
                  <form onSubmit={handleMpesaSubmit} className="space-y-4">
                    {/* Full Name - Optional */}
                    <div>
                      <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                        Full Name <span className="text-[#44474d] font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]" />
                        <input
                          type="text"
                          value={mpesaName}
                          onChange={(e) => setMpesaName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
                          placeholder="Enter your name (optional)"
                          disabled={donationState === 'loading'}
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#44474d] font-semibold text-sm">
                          +255
                        </span>
                        <input
                          type="tel"
                          value={mpesaPhone}
                          onChange={(e) => setMpesaPhone(e.target.value)}
                          className="w-full pl-16 pr-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
                          placeholder="7XX XXX XXX"
                          required
                          disabled={donationState === 'loading'}
                        />
                      </div>
                    </div>

                    {/* Email (Optional) */}
                    <div>
                      <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                        Email <span className="text-[#44474d] font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]" />
                        <input
                          type="email"
                          value={mpesaEmail}
                          onChange={(e) => setMpesaEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
                          placeholder="your@email.com"
                          disabled={donationState === 'loading'}
                        />
                      </div>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                        Donation Amount <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#44474d] font-semibold text-sm">
                          TSh
                        </span>
                        <input
                          type="number"
                          value={mpesaAmount}
                          onChange={(e) => setMpesaAmount(e.target.value)}
                          className="w-full pl-14 pr-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] font-semibold text-lg focus:outline-none focus:border-[#ff8928] transition-colors"
                          placeholder="Enter amount"
                          min="1"
                          required
                          disabled={donationState === 'loading'}
                        />
                      </div>
                      {/* Quick amount buttons */}
                      <div className="flex gap-2 mt-2">
                        {[5000, 10000, 25000, 50000, 100000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setMpesaAmount(amt.toString())}
                            className="flex-1 py-1.5 text-xs font-semibold border-2 border-[#c5c6ce] rounded-lg text-[#031632] hover:border-[#ff8928] hover:bg-[#ffdcc6]/30 transition-colors"
                            disabled={donationState === 'loading'}
                          >
                            {(amt / 1000).toFixed(0)}K
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Error Message */}
                    {donationState === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl"
                      >
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-red-700 text-sm font-medium">{errorMessage}</p>
                          <button
                            onClick={handleRetry}
                            className="text-red-600 text-xs font-semibold underline mt-1"
                          >
                            Try Again
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={donationState === 'loading'}
                      className="w-full py-3.5 bg-green-600 text-white rounded-none shadow-xl font-semibold text-base hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {donationState === 'loading' ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Sending payment request...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5" />
                          Donate via M-Pesa
                        </>
                      )}
                    </button>

                    {/* Loading hint */}
                    {donationState === 'loading' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl"
                      >
                        <Phone className="h-5 w-5 text-green-600 animate-pulse" />
                        <div>
                          <p className="text-green-700 text-sm font-medium">
                            Please check your phone and enter your M-Pesa PIN.
                          </p>
                          <p className="text-green-600 text-xs mt-0.5">
                            We&apos;re waiting for payment confirmation...
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </form>
                )}

                {/* Bank Transfer Tab */}
                {activeTab === 'bank' && (
                  <div className="space-y-5">
                    {/* Bank Details Card */}
                    <div className="bg-[#f5f3ef] rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-[#031632] p-2 rounded-xl">
                          <Building2 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="text-[#031632] font-bold text-sm">CRDB Bank Transfer</h4>
                          <p className="text-[#44474d] text-xs">Send your donation via bank transfer</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="text-[#44474d]">Account Name</span>
                          <span className="text-[#031632] font-semibold">Elia&apos;s Hope Community</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="text-[#44474d]">Bank</span>
                          <span className="text-[#031632] font-semibold">CRDB Bank</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="text-[#44474d]">Account Number</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[#031632] font-semibold font-mono text-xs">
                              {bankDetails.accountNumber}
                            </span>
                            <button
                              onClick={handleCopyAccount}
                              className="p-1 hover:bg-white rounded-lg transition-colors"
                              title="Copy account number"
                            >
                              <Copy className="h-3.5 w-3.5 text-[#ff8928]" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                          <span className="text-[#44474d]">Branch</span>
                          <span className="text-[#031632] font-semibold">{bankDetails.branch}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-[#44474d]">SWIFT Code</span>
                          <span className="text-[#031632] font-semibold font-mono text-xs">{bankDetails.swift}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleDownloadBankDetails}
                        className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-[#031632] text-[#031632] rounded-none font-semibold hover:bg-[#031632] hover:text-white transition-colors text-sm"
                      >
                        <Download className="h-4 w-4" /> Download Bank Details
                      </button>
                    </div>

                    {/* Submit Proof of Payment */}
                    <div>
                      <button
                        onClick={() => setShowProofForm(!showProofForm)}
                        className="w-full flex items-center justify-between p-3.5 bg-[#031632] text-white rounded-xl font-semibold text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Submit Proof of Payment
                        </span>
                        {showProofForm ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>

                      <AnimatePresence>
                        {showProofForm && (
                          <motion.form
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleProofSubmit}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 space-y-3">
                              <div>
                                <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                                  Full Name <span className="text-[#44474d] font-normal">(Optional)</span>
                                </label>
                                <input
                                  type="text"
                                  value={proofName}
                                  onChange={(e) => setProofName(e.target.value)}
                                  className="w-full px-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
                                  placeholder="Enter your name (optional)"
                                  disabled={proofSubmitting}
                                />
                              </div>

                              <div>
                                <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                                  Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="tel"
                                  value={proofPhone}
                                  onChange={(e) => setProofPhone(e.target.value)}
                                  className="w-full px-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
                                  placeholder="e.g. 0754123456"
                                  required
                                  disabled={proofSubmitting}
                                />
                              </div>

                              <div>
                                <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                                  Amount (TZS) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#44474d] font-semibold text-sm">
                                    TSh
                                  </span>
                                  <input
                                    type="number"
                                    value={proofAmount}
                                    onChange={(e) => setProofAmount(e.target.value)}
                                    className="w-full pl-14 pr-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm font-semibold focus:outline-none focus:border-[#ff8928] transition-colors"
                                    placeholder="Enter amount transferred"
                                    required
                                    disabled={proofSubmitting}
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                                  Upload Payment Receipt <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={(e) => setProofReceipt(e.target.files?.[0] || null)}
                                  className="w-full px-4 py-2.5 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-[#ff8928] file:text-white hover:file:bg-[#e07820]"
                                  required
                                  disabled={proofSubmitting}
                                />
                                {proofReceipt && (
                                  <div className="flex items-center gap-2 mt-1.5 text-xs text-[#44474d]">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                    {proofReceipt.name}
                                    <button
                                      type="button"
                                      onClick={() => setProofReceipt(null)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              <button
                                type="submit"
                                disabled={proofSubmitting}
                                className="w-full py-3 bg-[#ff8928] text-white rounded-none font-semibold hover:bg-[#e07820] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
                              >
                                {proofSubmitting ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Submitting...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4" />
                                    Submit Proof of Payment
                                  </>
                                )}
                              </button>
                            </div>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Campaign progress at bottom */}
                {campaigns.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="text-[#031632] font-bold text-sm">Active Campaigns</h4>
                    {campaigns.map((campaign, i) => {
                      const Icon = campaignIcons[i % campaignIcons.length]
                      return (
                        <div
                          key={campaign.id}
                          className="bg-[#f5f3ef] rounded-xl p-3.5"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="bg-[#ffdcc6] p-1 rounded-lg">
                                <Icon className="h-3.5 w-3.5 text-[#964900]" />
                              </div>
                              <span className="text-[#031632] font-semibold text-xs">{campaign.title}</span>
                            </div>
                            <span className="text-[#ff8928] font-bold text-xs">{campaign.percentage}%</span>
                          </div>
                          <Progress value={campaign.percentage} className="h-1.5 mb-2 [&>div]:bg-[#ff8928]" />
                          <div className="flex items-center justify-between text-[10px] text-[#44474d]">
                            <span>TZS {campaign.raised.toLocaleString()} raised</span>
                            <span>Goal: TZS {campaign.goal.toLocaleString()}</span>
                          </div>
                          <button
                            onClick={() => setSelectedCampaign(campaign.id)}
                            className="w-full mt-2 py-2 text-xs font-semibold border-2 border-[#ff8928] text-[#ff8928] rounded-none hover:bg-[#ff8928] hover:text-white transition-colors"
                          >
                            Support This Campaign
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
