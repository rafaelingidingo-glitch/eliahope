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
  Download,
  ChevronDown,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Share2,
  X,
  GraduationCap,
  Baby,
  Users,
  Landmark,
  Shield,
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

type DonationState = 'idle' | 'loading' | 'success' | 'error'
type PaymentTab = 'mpesa' | 'crdb'

interface DonationModalProps {
  isOpen: boolean
  onClose: () => void
  preselectedCampaignId?: string
  prefilledAmount?: string
}

export default function DonationModal({ isOpen, onClose, preselectedCampaignId, prefilledAmount }: DonationModalProps) {
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

  // CRDB Bank form
  const [crdbName, setCrdbName] = useState('')
  const [crdbEmail, setCrdbEmail] = useState('')
  const [crdbPhone, setCrdbPhone] = useState('')
  const [crdbAccountHolder, setCrdbAccountHolder] = useState('')
  const [crdbAccountNumber, setCrdbAccountNumber] = useState('')
  const [crdbAmount, setCrdbAmount] = useState('')
  const [crdbDonationState, setCrdbDonationState] = useState<DonationState>('idle')
  const [crdbTransactionId, setCrdbTransactionId] = useState('')
  const [crdbDonationId, setCrdbDonationId] = useState('')
  const [crdbErrorMessage, setCrdbErrorMessage] = useState('')
  const [crdbBankReference, setCrdbBankReference] = useState('')

  // Campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  // Polling for payment status
  const [polling, setPolling] = useState(false)
  const [pollingMethod, setPollingMethod] = useState<'mpesa' | 'crdb'>('mpesa')

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

  useEffect(() => {
    if (isOpen) {
      fetchCampaigns()
    }
  }, [isOpen, fetchCampaigns])

  // Apply preselected campaign
  useEffect(() => {
    if (preselectedCampaignId) {
      setSelectedCampaign(preselectedCampaignId)
    }
  }, [preselectedCampaignId])

  // Apply prefilled amount
  useEffect(() => {
    if (prefilledAmount) {
      setMpesaAmount(prefilledAmount)
      setCrdbAmount(prefilledAmount)
    }
  }, [prefilledAmount])

  // Poll for payment status (both M-Pesa and CRDB)
  useEffect(() => {
    if (!polling || !transactionId) return

    const apiEndpoint = pollingMethod === 'mpesa'
      ? `/api/donate/mpesa?transactionId=${transactionId}`
      : `/api/donate/crdb?transactionId=${transactionId}`

    const interval = setInterval(async () => {
      try {
        const res = await fetch(apiEndpoint)
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'successful') {
            if (pollingMethod === 'mpesa') {
              setDonationState('success')
            } else {
              setCrdbDonationState('success')
            }
            setPolling(false)
            fetchCampaigns()
          } else if (data.status === 'failed') {
            if (pollingMethod === 'mpesa') {
              setDonationState('error')
              setErrorMessage('M-Pesa payment was not completed. Please try again.')
            } else {
              setCrdbDonationState('error')
              setCrdbErrorMessage('CRDB Bank payment was not completed. Please try again.')
            }
            setPolling(false)
          }
        }
      } catch {
        // Continue polling
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [polling, transactionId, pollingMethod, fetchCampaigns])

  // Stop polling after 60 seconds
  useEffect(() => {
    if (!polling) return
    const timeout = setTimeout(() => {
      setPolling(false)
      if (pollingMethod === 'mpesa' && donationState === 'loading') {
        setDonationState('error')
        setErrorMessage('Payment verification timed out. Your payment may still be processing. Please contact us if you don\'t receive confirmation.')
      } else if (pollingMethod === 'crdb' && crdbDonationState === 'loading') {
        setCrdbDonationState('error')
        setCrdbErrorMessage('Payment verification timed out. Your payment may still be processing. Please contact us if you don\'t receive confirmation.')
      }
    }, 60000)
    return () => clearTimeout(timeout)
  }, [polling, pollingMethod, donationState, crdbDonationState])

  const resetForm = () => {
    // M-Pesa
    setDonationState('idle')
    setTransactionId('')
    setDonationId('')
    setErrorMessage('')
    setMpesaName('')
    setMpesaPhone('')
    setMpesaEmail('')
    setMpesaAmount('')
    // CRDB
    setCrdbDonationState('idle')
    setCrdbTransactionId('')
    setCrdbDonationId('')
    setCrdbErrorMessage('')
    setCrdbName('')
    setCrdbEmail('')
    setCrdbPhone('')
    setCrdbAccountHolder('')
    setCrdbAccountNumber('')
    setCrdbAmount('')
    setCrdbBankReference('')
    // Common
    setPolling(false)
    setSelectedCampaign('')
    setActiveTab('mpesa')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  // M-Pesa submit
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
      setPollingMethod('mpesa')
      setPolling(true)
    } catch {
      setDonationState('error')
      setErrorMessage('Network error. Please check your connection and try again.')
    }
  }

  // CRDB Bank submit
  const handleCrdbSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCrdbDonationState('loading')
    setCrdbErrorMessage('')

    try {
      const res = await fetch('/api/donate/crdb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountHolderName: crdbAccountHolder,
          crdbAccountNumber: crdbAccountNumber,
          amount: parseFloat(crdbAmount),
          name: crdbName || undefined,
          email: crdbEmail || undefined,
          phone: crdbPhone || undefined,
          campaignId: selectedCampaign || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setCrdbDonationState('error')
        setCrdbErrorMessage(data.error || 'Failed to process donation')
        return
      }

      setCrdbTransactionId(data.transactionId)
      setCrdbDonationId(data.donationId)
      setCrdbBankReference(data.bankReference)
      setTransactionId(data.transactionId)
      setPollingMethod('crdb')
      setPolling(true)
    } catch {
      setCrdbDonationState('error')
      setCrdbErrorMessage('Network error. Please check your connection and try again.')
    }
  }

  const handleDownloadReceipt = () => {
    const id = activeTab === 'mpesa' ? donationId : crdbDonationId
    const tid = activeTab === 'mpesa' ? transactionId : crdbTransactionId
    if (!id) return
    const a = document.createElement('a')
    a.href = `/api/donate/receipt?donationId=${id}`
    a.download = `receipt-${tid}.txt`
    a.click()
  }

  const handleShare = async () => {
    const amt = activeTab === 'mpesa' ? mpesaAmount : crdbAmount
    const text = `I just donated TZS ${parseFloat(amt).toLocaleString()} to Elia's Hope Community! Join me in making a difference.`
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
    if (pollingMethod === 'mpesa') {
      setDonationState('idle')
      setTransactionId('')
      setDonationId('')
      setErrorMessage('')
    } else {
      setCrdbDonationState('idle')
      setCrdbTransactionId('')
      setCrdbDonationId('')
      setCrdbErrorMessage('')
      setCrdbBankReference('')
    }
    setPolling(false)
  }

  // Determine which success state to show
  const isSuccess = donationState === 'success' || crdbDonationState === 'success'
  const successData = donationState === 'success'
    ? { name: mpesaName, amount: mpesaAmount, tid: transactionId }
    : { name: crdbName, amount: crdbAmount, tid: crdbTransactionId }

  const campaignIcons = [GraduationCap, Building2, Baby, Users, Heart]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-0">
        <DialogTitle className="sr-only">Donate to Elia's Hope Community</DialogTitle>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close donation modal"
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
            {isSuccess ? (
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
                    <span className="text-[#031632] font-semibold">{successData.name || 'Anonymous'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#44474d]">Amount:</span>
                    <span className="text-[#031632] font-semibold">TZS {parseFloat(successData.amount).toLocaleString()}</span>
                  </div>
                  {crdbDonationState === 'success' && crdbBankReference && (
                    <div className="flex justify-between">
                      <span className="text-[#44474d]">Bank Ref:</span>
                      <span className="text-[#031632] font-semibold font-mono text-xs">{crdbBankReference}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#44474d]">Transaction ID:</span>
                    <span className="text-[#031632] font-semibold font-mono text-xs">{successData.tid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#44474d]">Date & Time:</span>
                    <span className="text-[#031632] font-semibold text-xs">
                      {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}{' '}
                      {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
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
                    onClick={() => setActiveTab('crdb')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors border-l-2 border-[#c5c6ce] ${
                      activeTab === 'crdb'
                        ? 'bg-[#031632] text-white'
                        : 'bg-white text-[#44474d] hover:bg-gray-50'
                    }`}
                  >
                    <Landmark className="h-4 w-4" />
                    CRDB Bank
                  </button>
                </div>

                {/* ===== M-Pesa Tab ===== */}
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

                {/* ===== CRDB Bank Tab ===== */}
                {activeTab === 'crdb' && (
                  <form onSubmit={handleCrdbSubmit} className="space-y-4">
                    {/* Secure badge */}
                    <div className="flex items-center gap-2 p-3 bg-[#031632]/5 rounded-xl mb-1">
                      <Shield className="h-4 w-4 text-[#031632]" />
                      <p className="text-[#031632] text-xs font-medium">
                        Secure payment processed directly through CRDB Bank
                      </p>
                    </div>

                    {/* Full Name - Optional */}
                    <div>
                      <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                        Full Name <span className="text-[#44474d] font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]" />
                        <input
                          type="text"
                          value={crdbName}
                          onChange={(e) => setCrdbName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
                          placeholder="Enter your name (optional)"
                          disabled={crdbDonationState === 'loading'}
                        />
                      </div>
                    </div>

                    {/* Email - Optional */}
                    <div>
                      <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                        Email Address <span className="text-[#44474d] font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]" />
                        <input
                          type="email"
                          value={crdbEmail}
                          onChange={(e) => setCrdbEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
                          placeholder="your@email.com"
                          disabled={crdbDonationState === 'loading'}
                        />
                      </div>
                    </div>

                    {/* Phone - Optional */}
                    <div>
                      <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                        Phone Number <span className="text-[#44474d] font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]" />
                        <input
                          type="tel"
                          value={crdbPhone}
                          onChange={(e) => setCrdbPhone(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
                          placeholder="+255 7XX XXX XXX"
                          disabled={crdbDonationState === 'loading'}
                        />
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 py-1">
                      <div className="flex-1 h-px bg-[#c5c6ce]" />
                      <span className="text-[#44474d] text-xs font-semibold uppercase tracking-wider">Bank Details</span>
                      <div className="flex-1 h-px bg-[#c5c6ce]" />
                    </div>

                    {/* Account Holder Name */}
                    <div>
                      <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                        Account Holder Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]" />
                        <input
                          type="text"
                          value={crdbAccountHolder}
                          onChange={(e) => setCrdbAccountHolder(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
                          placeholder="Name on the CRDB account"
                          required
                          disabled={crdbDonationState === 'loading'}
                        />
                      </div>
                    </div>

                    {/* CRDB Account Number */}
                    <div>
                      <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                        CRDB Account Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]" />
                        <input
                          type="text"
                          value={crdbAccountNumber}
                          onChange={(e) => setCrdbAccountNumber(e.target.value.replace(/[^\d]/g, ''))}
                          className="w-full pl-11 pr-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm font-mono tracking-wider focus:outline-none focus:border-[#ff8928] transition-colors"
                          placeholder="Enter your CRDB account number"
                          required
                          disabled={crdbDonationState === 'loading'}
                          maxLength={16}
                        />
                      </div>
                      <p className="text-[#44474d] text-xs mt-1">Your CRDB account number (10-16 digits)</p>
                    </div>

                    {/* Donation Amount */}
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
                          value={crdbAmount}
                          onChange={(e) => setCrdbAmount(e.target.value)}
                          className="w-full pl-14 pr-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] font-semibold text-lg focus:outline-none focus:border-[#ff8928] transition-colors"
                          placeholder="Enter amount"
                          min="1"
                          required
                          disabled={crdbDonationState === 'loading'}
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        {[5000, 10000, 25000, 50000, 100000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setCrdbAmount(amt.toString())}
                            className="flex-1 py-1.5 text-xs font-semibold border-2 border-[#c5c6ce] rounded-lg text-[#031632] hover:border-[#ff8928] hover:bg-[#ffdcc6]/30 transition-colors"
                            disabled={crdbDonationState === 'loading'}
                          >
                            {(amt / 1000).toFixed(0)}K
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Error Message */}
                    {crdbDonationState === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl"
                      >
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-red-700 text-sm font-medium">{crdbErrorMessage}</p>
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
                      disabled={crdbDonationState === 'loading'}
                      className="w-full py-3.5 bg-[#031632] text-white rounded-none shadow-xl font-semibold text-base hover:bg-[#1a2b48] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {crdbDonationState === 'loading' ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Connecting to CRDB Bank...
                        </>
                      ) : (
                        <>
                          <Landmark className="h-5 w-5" />
                          Donate via CRDB Bank
                        </>
                      )}
                    </button>

                    {/* Loading hint */}
                    {crdbDonationState === 'loading' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 p-3 bg-[#031632]/5 border border-[#031632]/10 rounded-xl"
                      >
                        <Building2 className="h-5 w-5 text-[#031632] animate-pulse" />
                        <div>
                          <p className="text-[#031632] text-sm font-medium">
                            Connecting to CRDB Bank...
                          </p>
                          <p className="text-[#44474d] text-xs mt-0.5">
                            Please authorize the transaction on the secure CRDB payment page.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Security note */}
                    <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-xl">
                      <Shield className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                      <p className="text-green-700 text-xs">
                        Your bank details are encrypted and processed securely through CRDB Bank&apos;s payment gateway.
                      </p>
                    </div>
                  </form>
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
