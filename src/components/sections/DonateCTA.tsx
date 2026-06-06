'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
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
  ArrowLeft,
  GraduationCap,
  Baby,
  Users,
  X,
} from 'lucide-react'
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

export default function DonateCTA() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
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
      // Silent fail for campaigns
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
    fetchCampaigns()
    fetchBankDetails()
  }, [fetchCampaigns, fetchBankDetails])

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
            fetchCampaigns() // Refresh campaign progress
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
          name: mpesaName,
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
      // State stays 'loading' until callback confirms
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
      formData.append('donorName', proofName)
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
    const text = `I just donated TZS ${parseFloat(mpesaAmount).toLocaleString()} to Elia's Hope Community! Join me in making a difference. 🧡`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Elia\'s Hope Community', text })
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

  const handleReturnHome = () => {
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
  }

  const selectCampaign = (id: string) => {
    setSelectedCampaign(id)
    // Scroll to form
    document.getElementById('donate-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const campaignIcons = [GraduationCap, Building2, Baby, Users, Heart]

  return (
    <section id="donate" ref={ref} className="py-20 bg-[#f5f3ef]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-[#ff8928] font-bold text-xs uppercase tracking-widest mb-4 block">
            MAKE A DIFFERENCE
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#031632] mb-4">
            Support Our Mission
          </h2>
          <p className="text-[#44474d] max-w-2xl mx-auto">
            Every contribution, no matter the size, makes a real difference. Help us provide education,
            nutrition, and hope to children in need across Tanzania.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Left - Donation Form (3 cols) */}
          <motion.div
            id="donate-form"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-3xl soft-shadow p-6 sm:p-8 lg:p-10 border border-gray-200/10">
              <AnimatePresence mode="wait">
                {/* Success State */}
                {donationState === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                      className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-[#031632] mb-2">
                      Thank You For Your Donation!
                    </h3>
                    <p className="text-[#44474d] mb-6">
                      Your generosity helps change lives in our community.
                    </p>

                    <div className="bg-[#f5f3ef] rounded-2xl p-6 text-left max-w-sm mx-auto mb-8 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#44474d] text-sm">Donor:</span>
                        <span className="text-[#031632] font-semibold text-sm">{mpesaName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#44474d] text-sm">Amount:</span>
                        <span className="text-[#031632] font-semibold text-sm">TZS {parseFloat(mpesaAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#44474d] text-sm">Transaction ID:</span>
                        <span className="text-[#031632] font-semibold text-sm font-mono">{transactionId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#44474d] text-sm">Date:</span>
                        <span className="text-[#031632] font-semibold text-sm">{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={handleDownloadReceipt}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#031632] text-white rounded-none font-semibold hover:bg-[#1a2b48] transition-colors"
                      >
                        <Download className="h-4 w-4" /> Download Receipt
                      </button>
                      <button
                        onClick={handleShare}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#ff8928] text-white rounded-none font-semibold hover:bg-[#e07820] transition-colors"
                      >
                        <Share2 className="h-4 w-4" /> Share Donation
                      </button>
                      <button
                        onClick={handleReturnHome}
                        className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#c5c6ce] text-[#031632] rounded-none font-semibold hover:bg-gray-50 transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4" /> Return
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
                      <div className="mb-6">
                        <label className="text-sm font-semibold text-[#031632] mb-2 block">
                          Select Campaign (Optional)
                        </label>
                        <div className="relative">
                          <select
                            value={selectedCampaign}
                            onChange={(e) => setSelectedCampaign(e.target.value)}
                            className="w-full px-4 py-3.5 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors appearance-none bg-white pr-10"
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
                    <div className="flex mb-6 border-2 border-[#c5c6ce] rounded-xl overflow-hidden">
                      <button
                        onClick={() => setActiveTab('mpesa')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${
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
                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors border-l-2 border-[#c5c6ce] ${
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
                        {/* Full Name */}
                        <div>
                          <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]" />
                            <input
                              type="text"
                              value={mpesaName}
                              onChange={(e) => setMpesaName(e.target.value)}
                              className="w-full pl-11 pr-4 py-3.5 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
                              placeholder="Enter your full name"
                              required
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
                              className="w-full pl-16 pr-4 py-3.5 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
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
                              className="w-full pl-11 pr-4 py-3.5 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
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
                              className="w-full pl-14 pr-4 py-3.5 border-2 border-[#c5c6ce] rounded-xl text-[#031632] font-semibold text-lg focus:outline-none focus:border-[#ff8928] transition-colors"
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
                                className="px-3 py-1.5 text-xs font-semibold border-2 border-[#c5c6ce] rounded-lg text-[#031632] hover:border-[#ff8928] hover:bg-[#ffdcc6]/30 transition-colors"
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
                            className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl"
                          >
                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
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
                          className="w-full py-4 bg-green-600 text-white rounded-none shadow-xl font-semibold text-lg hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
                            className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl"
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
                      <div className="space-y-6">
                        {/* Bank Details Card */}
                        <div className="bg-[#f5f3ef] rounded-2xl p-6 space-y-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-[#031632] p-2.5 rounded-xl">
                              <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-[#031632] font-bold">CRDB Bank Transfer</h4>
                              <p className="text-[#44474d] text-xs">Send your donation via bank transfer</p>
                            </div>
                          </div>

                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                              <span className="text-[#44474d]">Account Name</span>
                              <span className="text-[#031632] font-semibold">Elia&apos;s Hope Community</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                              <span className="text-[#44474d]">Bank</span>
                              <span className="text-[#031632] font-semibold">CRDB Bank</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                              <span className="text-[#44474d]">Account Number</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[#031632] font-semibold font-mono">
                                  {bankDetails.accountNumber}
                                </span>
                                <button
                                  onClick={handleCopyAccount}
                                  className="p-1.5 hover:bg-white rounded-lg transition-colors"
                                  title="Copy account number"
                                >
                                  <Copy className="h-3.5 w-3.5 text-[#ff8928]" />
                                </button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                              <span className="text-[#44474d]">Branch</span>
                              <span className="text-[#031632] font-semibold">{bankDetails.branch}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-[#44474d]">SWIFT Code</span>
                              <span className="text-[#031632] font-semibold font-mono">{bankDetails.swift}</span>
                            </div>
                          </div>

                          <button
                            onClick={handleDownloadBankDetails}
                            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#031632] text-[#031632] rounded-none font-semibold hover:bg-[#031632] hover:text-white transition-colors"
                          >
                            <Download className="h-4 w-4" /> Download Bank Details
                          </button>
                        </div>

                        {/* Submit Proof of Payment */}
                        <div>
                          <button
                            onClick={() => setShowProofForm(!showProofForm)}
                            className="w-full flex items-center justify-between p-4 bg-[#031632] text-white rounded-xl font-semibold"
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
                                <div className="pt-4 space-y-4">
                                  <div>
                                    <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                                      Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      value={proofName}
                                      onChange={(e) => setProofName(e.target.value)}
                                      className="w-full px-4 py-3.5 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
                                      placeholder="Enter your full name"
                                      required
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
                                      className="w-full px-4 py-3.5 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
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
                                        className="w-full pl-14 pr-4 py-3.5 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm font-semibold focus:outline-none focus:border-[#ff8928] transition-colors"
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
                                    <div className="relative">
                                      <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={(e) => setProofReceipt(e.target.files?.[0] || null)}
                                        className="w-full px-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-[#ff8928] file:text-white hover:file:bg-[#e07820]"
                                        required
                                        disabled={proofSubmitting}
                                      />
                                    </div>
                                    {proofReceipt && (
                                      <div className="flex items-center gap-2 mt-2 text-xs text-[#44474d]">
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
                                    className="w-full py-3.5 bg-[#ff8928] text-white rounded-none font-semibold hover:bg-[#e07820] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right - Campaign Progress (2 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            <h3 className="text-[#031632] font-bold text-xl">Active Campaigns</h3>

            {campaigns.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center soft-shadow">
                <Heart className="h-10 w-10 text-[#ff8928] mx-auto mb-3" />
                <p className="text-[#44474d] text-sm">No active campaigns at the moment.</p>
                <p className="text-[#44474d] text-sm">Your general donation still makes a huge impact!</p>
              </div>
            ) : (
              campaigns.map((campaign, i) => {
                const Icon = campaignIcons[i % campaignIcons.length]
                return (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                    className="bg-white rounded-2xl p-5 border border-gray-200/10 soft-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-[#ffdcc6] p-1.5 rounded-lg">
                          <Icon className="h-4 w-4 text-[#964900]" />
                        </div>
                        <h4 className="text-[#031632] font-semibold text-sm">{campaign.title}</h4>
                      </div>
                      <span className="text-[#ff8928] font-bold text-sm">{campaign.percentage}%</span>
                    </div>

                    {campaign.description && (
                      <p className="text-[#44474d] text-xs mb-3 line-clamp-2">{campaign.description}</p>
                    )}

                    <Progress value={campaign.percentage} className="h-2 mb-3 [&>div]:bg-[#ff8928]" />

                    <div className="flex items-center justify-between text-xs text-[#44474d] mb-3">
                      <span>TZS {campaign.raised.toLocaleString()} raised</span>
                      <span>Goal: TZS {campaign.goal.toLocaleString()}</span>
                    </div>

                    {campaign.remaining > 0 && (
                      <p className="text-xs text-[#ff8928] mb-3">
                        TZS {campaign.remaining.toLocaleString()} still needed
                      </p>
                    )}

                    <button
                      onClick={() => selectCampaign(campaign.id)}
                      className="w-full py-2.5 text-sm font-semibold text-[#031632] border-2 border-[#031632] rounded-none hover:bg-[#031632] hover:text-white transition-colors"
                    >
                      Support This Campaign
                    </button>
                  </motion.div>
                )
              })
            )}

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="bg-white rounded-2xl p-5 border border-gray-200/10 soft-shadow"
            >
              <h4 className="text-[#031632] font-bold text-sm mb-4">Why Donate With Us?</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-1.5 rounded-lg mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[#031632] text-sm font-medium">Secure Payments</p>
                    <p className="text-[#44474d] text-xs">All transactions are encrypted and secure</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-1.5 rounded-lg mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[#031632] text-sm font-medium">100% Transparent</p>
                    <p className="text-[#44474d] text-xs">Every shilling goes directly to those in need</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-1.5 rounded-lg mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[#031632] text-sm font-medium">Instant Receipt</p>
                    <p className="text-[#44474d] text-xs">Download your donation receipt immediately</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
