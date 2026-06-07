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
import { useLanguage } from '@/lib/i18n'

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
type MnoProviderValue = 'mpesa' | 'airtel' | 'tigo' | 'halopesa' | 'azampesa'
type CrdbStep = 'form' | 'otp'

interface DonationModalProps {
  isOpen: boolean
  onClose: () => void
  preselectedCampaignId?: string
  prefilledAmount?: string
}

export default function DonationModal({ isOpen, onClose, preselectedCampaignId, prefilledAmount }: DonationModalProps) {
  const { toast } = useToast()
  const { t } = useLanguage()

  // Form states
  const [activeTab, setActiveTab] = useState<PaymentTab>('mpesa')
  const [selectedCampaign, setSelectedCampaign] = useState<string>('')

  // M-Pesa form
  const [mpesaName, setMpesaName] = useState('')
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [mpesaEmail, setMpesaEmail] = useState('')
  const [mpesaAmount, setMpesaAmount] = useState('')
  const [mnoProvider, setMnoProvider] = useState<MnoProviderValue>('mpesa')
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
  const [crdbStep, setCrdbStep] = useState<CrdbStep>('form')
  const [crdbOtp, setCrdbOtp] = useState('')
  const [crdbOtpConfirming, setCrdbOtpConfirming] = useState(false)

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
              setErrorMessage(t.donation.mpesaFailed)
            } else {
              setCrdbDonationState('error')
              setCrdbErrorMessage(t.donation.crdbFailed)
            }
            setPolling(false)
          }
        }
      } catch {
        // Continue polling
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [polling, transactionId, pollingMethod, fetchCampaigns, t.donation.mpesaFailed, t.donation.crdbFailed])

  // Stop polling after 60 seconds
  useEffect(() => {
    if (!polling) return
    const timeout = setTimeout(() => {
      setPolling(false)
      if (pollingMethod === 'mpesa' && donationState === 'loading') {
        setDonationState('error')
        setErrorMessage(t.donation.paymentTimeout)
      } else if (pollingMethod === 'crdb' && crdbDonationState === 'loading') {
        setCrdbDonationState('error')
        setCrdbErrorMessage(t.donation.paymentTimeout)
      }
    }, 60000)
    return () => clearTimeout(timeout)
  }, [polling, pollingMethod, donationState, crdbDonationState, t.donation.paymentTimeout])

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
    setMnoProvider('mpesa')
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
    setCrdbStep('form')
    setCrdbOtp('')
    setCrdbOtpConfirming(false)
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
          provider: mnoProvider,
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
      setErrorMessage(t.donation.networkError)
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

      // If OTP is required, show OTP step instead of polling
      if (data.otpRequired) {
        setCrdbDonationState('idle')
        setCrdbStep('otp')
      } else {
        // No OTP required — start polling for status
        setPollingMethod('crdb')
        setPolling(true)
      }
    } catch {
      setCrdbDonationState('error')
      setCrdbErrorMessage(t.donation.networkError)
    }
  }

  // CRDB OTP confirmation
  const handleCrdbOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!crdbOtp || crdbOtp.length < 4) return

    setCrdbOtpConfirming(true)
    setCrdbErrorMessage('')

    try {
      const res = await fetch('/api/donate/crdb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationId: crdbDonationId,
          otp: crdbOtp,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setCrdbOtpConfirming(false)
        setCrdbDonationState('error')
        setCrdbErrorMessage(data.error || 'OTP verification failed')
        return
      }

      // OTP confirmed — start polling for final status
      setCrdbOtpConfirming(false)
      setCrdbDonationState('loading')
      setPollingMethod('crdb')
      setPolling(true)
    } catch {
      setCrdbOtpConfirming(false)
      setCrdbDonationState('error')
      setCrdbErrorMessage(t.donation.networkError)
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
    const text = t.donation.shareText.replace('{amount}', parseFloat(amt).toLocaleString())
    if (navigator.share) {
      try {
        await navigator.share({ title: "Elia's Hope Community", text })
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text)
      toast({ title: t.donation.copied, description: t.donation.copiedDescription })
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
              <h2 className="text-white font-bold text-lg">{t.donation.title}</h2>
              <p className="text-white/60 text-xs">{t.donation.subtitle}</p>
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
                  {t.donation.thankYou}
                </h3>
                <p className="text-[#44474d] text-sm mb-4">
                  {t.donation.thankYouMessage}
                </p>

                <div className="bg-[#f5f3ef] rounded-2xl p-4 text-left max-w-xs mx-auto mb-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#44474d]">{t.donation.donor}</span>
                    <span className="text-[#031632] font-semibold">{successData.name || t.donation.anonymous}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#44474d]">{t.donation.amount}</span>
                    <span className="text-[#031632] font-semibold">TZS {parseFloat(successData.amount).toLocaleString()}</span>
                  </div>
                  {crdbDonationState === 'success' && crdbBankReference && (
                    <div className="flex justify-between">
                      <span className="text-[#44474d]">{t.donation.bankRef}</span>
                      <span className="text-[#031632] font-semibold font-mono text-xs">{crdbBankReference}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#44474d]">{t.donation.transactionId}</span>
                    <span className="text-[#031632] font-semibold font-mono text-xs">{successData.tid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#44474d]">{t.donation.dateTime}</span>
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
                    <Download className="h-4 w-4" /> {t.donation.downloadReceipt}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#ff8928] text-white rounded-none font-semibold hover:bg-[#e07820] transition-colors text-sm"
                  >
                    <Share2 className="h-4 w-4" /> {t.donation.shareDonation}
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-[#c5c6ce] text-[#031632] rounded-none font-semibold hover:bg-gray-50 transition-colors text-sm"
                  >
                    {t.donation.close}
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
                      {t.donation.selectCampaign}
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCampaign}
                        onChange={(e) => setSelectedCampaign(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors appearance-none bg-white pr-10"
                      >
                        <option value="">{t.donation.generalDonation}</option>
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
                    onClick={() => { setActiveTab('mpesa'); setCrdbStep('form') }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
                      activeTab === 'mpesa'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-[#44474d] hover:bg-gray-50'
                    }`}
                  >
                    <Phone className="h-4 w-4" />
                    {t.donation.mobileMoney}
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
                    {t.donation.crdbBank}
                  </button>
                </div>

                {/* ===== M-Pesa / Mobile Money Tab ===== */}
                {activeTab === 'mpesa' && (
                  <form onSubmit={handleMpesaSubmit} className="space-y-4">
                    {/* Mobile Money Provider Selector */}
                    <div>
                      <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                        {t.donation.selectProvider} <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {([
                          { value: 'mpesa' as MnoProviderValue, label: 'M-Pesa', color: 'bg-green-600 border-green-600 text-white' },
                          { value: 'airtel' as MnoProviderValue, label: 'Airtel', color: 'bg-red-600 border-red-600 text-white' },
                          { value: 'tigo' as MnoProviderValue, label: 'Tigo', color: 'bg-blue-600 border-blue-600 text-white' },
                          { value: 'halopesa' as MnoProviderValue, label: 'Halo', color: 'bg-orange-500 border-orange-500 text-white' },
                          { value: 'azampesa' as MnoProviderValue, label: 'Azam', color: 'bg-purple-600 border-purple-600 text-white' },
                        ]).map((p) => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => setMnoProvider(p.value)}
                            disabled={donationState === 'loading'}
                            className={`py-2 px-1 text-xs font-bold rounded-lg border-2 transition-all ${
                              mnoProvider === p.value
                                ? p.color
                                : 'border-[#c5c6ce] text-[#44474d] bg-white hover:border-[#ff8928]'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Full Name - Optional */}
                    <div>
                      <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                        {t.donation.fullName} <span className="text-[#44474d] font-normal">{t.donation.optional}</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]" />
                        <input
                          type="text"
                          value={mpesaName}
                          onChange={(e) => setMpesaName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
                          placeholder={`${t.donation.fullName} ${t.donation.optional}`}
                          disabled={donationState === 'loading'}
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                        {t.donation.phoneNumber} <span className="text-red-500">*</span>
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
                        {t.donation.email} <span className="text-[#44474d] font-normal">{t.donation.optional}</span>
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
                        {t.donation.donationAmount} <span className="text-red-500">*</span>
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
                          placeholder={t.donation.enterAmount}
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
                            {t.donation.tryAgain}
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
                          {t.donation.sendingStkPush}
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5" />
                          {t.donation.donateViaMobile}
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
                            {t.donation.checkPhoneMpesa}
                          </p>
                          <p className="text-green-600 text-xs mt-0.5">
                            {t.donation.waitingConfirmation}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </form>
                )}

                {/* ===== CRDB Bank Tab ===== */}
                {activeTab === 'crdb' && (
                  crdbStep === 'otp' ? (
                    /* ---- OTP Confirmation Step ---- */
                    <form onSubmit={handleCrdbOtpSubmit} className="space-y-4">
                      <div className="text-center py-2">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200 }}
                          className="w-14 h-14 bg-[#031632]/10 rounded-full flex items-center justify-center mx-auto mb-3"
                        >
                          <Shield className="h-7 w-7 text-[#031632]" />
                        </motion.div>
                        <h3 className="text-lg font-bold text-[#031632] mb-1">
                          {t.donation.otpTitle}
                        </h3>
                        <p className="text-[#44474d] text-sm">
                          {t.donation.otpDescription}
                        </p>
                      </div>

                      {/* Transaction summary */}
                      <div className="bg-[#f5f3ef] rounded-xl p-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#44474d]">{t.donation.amount}</span>
                          <span className="text-[#031632] font-semibold">TZS {parseFloat(crdbAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#44474d]">{t.donation.bankRef}</span>
                          <span className="text-[#031632] font-semibold font-mono text-xs">{crdbBankReference}</span>
                        </div>
                      </div>

                      {/* OTP Input */}
                      <div>
                        <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                          {t.donation.otpCode} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={crdbOtp}
                          onChange={(e) => setCrdbOtp(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                          className="w-full px-4 py-3.5 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-center font-mono text-2xl tracking-[0.5em] focus:outline-none focus:border-[#ff8928] transition-colors"
                          placeholder="------"
                          maxLength={6}
                          required
                          disabled={crdbOtpConfirming}
                          autoFocus
                        />
                      </div>

                      {/* Error Message */}
                      {crdbErrorMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl"
                        >
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-red-700 text-sm font-medium">{crdbErrorMessage}</p>
                        </motion.div>
                      )}

                      {/* Confirm Button */}
                      <button
                        type="submit"
                        disabled={crdbOtpConfirming || crdbOtp.length < 4}
                        className="w-full py-3.5 bg-[#031632] text-white rounded-none shadow-xl font-semibold text-base hover:bg-[#1a2b48] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {crdbOtpConfirming ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            {t.donation.confirmingPayment}
                          </>
                        ) : (
                          <>
                            <Shield className="h-5 w-5" />
                            {t.donation.confirmPayment}
                          </>
                        )}
                      </button>

                      {/* Back to form */}
                      <button
                        type="button"
                        onClick={() => { setCrdbStep('form'); setCrdbOtp(''); setCrdbErrorMessage('') }}
                        className="w-full py-2.5 text-[#44474d] text-sm font-semibold hover:text-[#031632] transition-colors"
                      >
                        &larr; {t.donation.tryAgain}
                      </button>
                    </form>
                  ) : (
                  /* ---- CRDB Bank Form (Step 1) ---- */
                  <form onSubmit={handleCrdbSubmit} className="space-y-4">
                    {/* Secure badge */}
                    <div className="flex items-center gap-2 p-3 bg-[#031632]/5 rounded-xl mb-1">
                      <Shield className="h-4 w-4 text-[#031632]" />
                      <p className="text-[#031632] text-xs font-medium">
                        {t.donation.securePayment}
                      </p>
                    </div>

                    {/* Full Name - Optional */}
                    <div>
                      <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                        {t.donation.fullName} <span className="text-[#44474d] font-normal">{t.donation.optional}</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]" />
                        <input
                          type="text"
                          value={crdbName}
                          onChange={(e) => setCrdbName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
                          placeholder={`${t.donation.fullName} ${t.donation.optional}`}
                          disabled={crdbDonationState === 'loading'}
                        />
                      </div>
                    </div>

                    {/* Email - Optional */}
                    <div>
                      <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                        {t.donation.emailAddress} <span className="text-[#44474d] font-normal">{t.donation.optional}</span>
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
                        {t.donation.phoneNumber} <span className="text-[#44474d] font-normal">{t.donation.optional}</span>
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
                      <span className="text-[#44474d] text-xs font-semibold uppercase tracking-wider">{t.donation.bankDetails}</span>
                      <div className="flex-1 h-px bg-[#c5c6ce]" />
                    </div>

                    {/* Account Holder Name */}
                    <div>
                      <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                        {t.donation.accountHolderName} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]" />
                        <input
                          type="text"
                          value={crdbAccountHolder}
                          onChange={(e) => setCrdbAccountHolder(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
                          placeholder={t.donation.nameOnAccount}
                          required
                          disabled={crdbDonationState === 'loading'}
                        />
                      </div>
                    </div>

                    {/* CRDB Account Number */}
                    <div>
                      <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                        {t.donation.crdbAccountNumber} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]" />
                        <input
                          type="text"
                          value={crdbAccountNumber}
                          onChange={(e) => setCrdbAccountNumber(e.target.value.replace(/[^\d]/g, ''))}
                          className="w-full pl-11 pr-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm font-mono tracking-wider focus:outline-none focus:border-[#ff8928] transition-colors"
                          placeholder={t.donation.crdbAccountNumber}
                          required
                          disabled={crdbDonationState === 'loading'}
                          maxLength={16}
                        />
                      </div>
                      <p className="text-[#44474d] text-xs mt-1">{t.donation.crdbAccountHint}</p>
                    </div>

                    {/* Donation Amount */}
                    <div>
                      <label className="text-sm font-semibold text-[#031632] mb-1.5 block">
                        {t.donation.donationAmount} <span className="text-red-500">*</span>
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
                          placeholder={t.donation.enterAmount}
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
                            {t.donation.tryAgain}
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
                          {t.donation.connectingCrdb}
                        </>
                      ) : (
                        <>
                          <Landmark className="h-5 w-5" />
                          {t.donation.donateViaCrdb}
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
                            {t.donation.connectingCrdb}
                          </p>
                          <p className="text-[#44474d] text-xs mt-0.5">
                            {t.donation.authorizeCrdb}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Security note */}
                    <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-xl">
                      <Shield className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                      <p className="text-green-700 text-xs">
                        {t.donation.bankDetailsEncrypted}
                      </p>
                    </div>
                  </form>
                  )
                )}

                {/* Campaign progress at bottom */}
                {campaigns.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="text-[#031632] font-bold text-sm">{t.donation.activeCampaigns}</h4>
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
                            <span>TZS {campaign.raised.toLocaleString()} {t.donation.raised}</span>
                            <span>{t.donation.goal} TZS {campaign.goal.toLocaleString()}</span>
                          </div>
                          <button
                            onClick={() => setSelectedCampaign(campaign.id)}
                            className="w-full mt-2 py-2 text-xs font-semibold border-2 border-[#ff8928] text-[#ff8928] rounded-none hover:bg-[#ff8928] hover:text-white transition-colors"
                          >
                            {t.donation.supportCampaign}
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
