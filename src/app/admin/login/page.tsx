'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, RefreshCw, ArrowLeft, KeyRound, Heart, Users, GraduationCap, Quote } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/lib/i18n'

type ViewMode = 'login' | 'forgot_password' | 'verify_otp' | 'reset_password'

export default function AdminLoginPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [view, setView] = useState<ViewMode>('login')

  // Login form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Forgot password form
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState('')
  const [emailLogId, setEmailLogId] = useState<string | null>(null)

  // OTP verification
  const [otp, setOtp] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [resendingOtp, setResendingOtp] = useState(false)
  const [otpResendMessage, setOtpResendMessage] = useState('')
  const [otpCooldown, setOtpCooldown] = useState(0)

  // Reset password
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState('')

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      // Check if redirected from a protected page — go back there after login
      const params = new URLSearchParams(window.location.search)
      const redirectTo = params.get('from') || '/admin/dashboard'
      router.replace(redirectTo)
    }
  }, [router])

  // OTP cooldown timer
  useEffect(() => {
    if (otpCooldown <= 0) return
    const timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000)
    return () => clearTimeout(timer)
  }, [otpCooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError(t.admin.invalidCredentials)
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json()

      if (res.ok && data.success && data.token) {
        localStorage.setItem('admin_token', data.token)
        setEmail('')
        setPassword('')
        setError('')
        // Check if redirected from a specific admin page
        const params = new URLSearchParams(window.location.search)
        const redirectTo = params.get('from') || '/admin/dashboard'
        router.replace(redirectTo)
      } else {
        setError(data.error || t.admin.invalidCredentials)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError('')
    setForgotSuccess('')

    if (!forgotEmail.trim()) {
      setForgotError(t.admin.emailRequired)
      return
    }

    setForgotLoading(true)
    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_otp', email: forgotEmail.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setForgotSuccess(data.message)
        setEmailLogId(data.emailLogId || null)
        setTimeout(() => {
          setView('verify_otp')
          setOtpCooldown(60)
        }, 1500)
      } else {
        setForgotError(data.error || t.admin.otpSendError)
      }
    } catch {
      setForgotError(t.admin.otpSendError)
    } finally {
      setForgotLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setOtpError('')

    if (!otp || otp.length < 6) {
      setOtpError(t.admin.otpInvalid)
      return
    }

    setOtpLoading(true)
    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_otp', email: forgotEmail.trim(), otp }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setView('reset_password')
      } else {
        setOtpError(data.error || t.admin.otpInvalid)
      }
    } catch {
      setOtpError(t.admin.otpInvalid)
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (otpCooldown > 0 || resendingOtp) return
    setResendingOtp(true)
    setOtpResendMessage('')
    setOtpError('')

    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend_otp', email: forgotEmail.trim(), emailLogId: emailLogId || undefined }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setOtpResendMessage(t.admin.otpResentSuccess)
        setEmailLogId(data.emailLogId || null)
        setOtpCooldown(60)
      } else {
        setOtpResendMessage(data.error || t.admin.otpResendError)
      }
    } catch {
      setOtpResendMessage(t.admin.otpResendError)
    } finally {
      setResendingOtp(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError('')

    if (!newPassword || newPassword.length < 8) {
      setResetError(t.admin.passwordTooShort)
      return
    }
    if (newPassword !== confirmPassword) {
      setResetError(t.admin.passwordMismatch)
      return
    }

    setResetLoading(true)
    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          email: forgotEmail.trim(),
          otp,
          newPassword,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setResetSuccess(data.message)
        setTimeout(() => {
          handleResetToLogin()
        }, 2000)
      } else {
        setResetError(data.error || t.admin.resetError)
      }
    } catch {
      setResetError(t.admin.resetError)
    } finally {
      setResetLoading(false)
    }
  }

  const handleResetToLogin = () => {
    setView('login')
    setForgotEmail('')
    setForgotError('')
    setForgotSuccess('')
    setOtp('')
    setOtpError('')
    setOtpResendMessage('')
    setEmailLogId(null)
    setNewPassword('')
    setConfirmPassword('')
    setResetError('')
    setResetSuccess('')
    setOtpCooldown(0)
  }

  const getViewTitle = () => {
    switch (view) {
      case 'login': return t.admin.loginTitle
      case 'forgot_password': return t.admin.forgotPasswordTitle
      case 'verify_otp': return t.admin.verifyOtpTitle
      case 'reset_password': return t.admin.resetPasswordTitle
    }
  }

  const getViewIcon = () => {
    switch (view) {
      case 'login': return Shield
      case 'forgot_password': return Lock
      case 'verify_otp': return KeyRound
      case 'reset_password': return Lock
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ===== LEFT COLUMN — Visual / Brand Side ===== */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/admin-login-bg.png')" }}
        />

        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#031632]/85 via-[#0F2D5C]/75 to-[#031632]/85" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#ff8928]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-[#ff8928]/8 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12 xl:p-16">
          {/* Logo + Tagline */}
          <div>
            <div className="flex items-center gap-3 mb-10">
              <img src="/logo.jpeg" alt="Elia's Hope" className="h-12 w-12 rounded-full object-cover ring-2 ring-white/20" />
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">Elia&apos;s Hope</h3>
                <p className="text-white/50 text-xs">Community</p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
                Empowering Lives,<br />
                <span className="text-[#ff8928]">Building Futures</span>
              </h1>
              <p className="text-white/70 text-base xl:text-lg leading-relaxed max-w-md">
                Together we can bring hope, education, and a brighter future to vulnerable children and families in Mwanza, Tanzania.
              </p>
            </motion.div>
          </div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="max-w-md"
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-[5px] p-6">
              <Quote className="h-8 w-8 text-[#ff8928]/60 mb-3" />
              <p className="text-white/90 text-sm leading-relaxed mb-4 italic">
                &ldquo;Elia&apos;s Hope gave my children the chance to go to school and dream big. They are not just surviving now — they are thriving. This community is a beacon of light.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#ff8928]/20 flex items-center justify-center">
                  <span className="text-[#ff8928] font-bold text-sm">AM</span>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Amina Mwangi</p>
                  <p className="text-white/50 text-xs">Parent & Community Member</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex gap-8"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-[5px] bg-[#ff8928]/20 flex items-center justify-center">
                <GraduationCap className="h-4.5 w-4.5 text-[#ff8928]" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">200+</p>
                <p className="text-white/50 text-xs">Children Educated</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-[5px] bg-[#ff8928]/20 flex items-center justify-center">
                <Heart className="h-4.5 w-4.5 text-[#ff8928]" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">500+</p>
                <p className="text-white/50 text-xs">Meals Served Weekly</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-[5px] bg-[#ff8928]/20 flex items-center justify-center">
                <Users className="h-4.5 w-4.5 text-[#ff8928]" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">50+</p>
                <p className="text-white/50 text-xs">Volunteers</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ===== RIGHT COLUMN — Form Side ===== */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col bg-white">
        {/* Back to website link */}
        <div className="px-6 md:px-12 pt-6">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-[#44474d]/60 hover:text-[#031632] text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.adminDashboard.backToWebsite}
          </button>
        </div>

        {/* Form Container — centered vertically */}
        <div className="flex-1 flex items-center justify-center px-6 md:px-12 lg:px-16 xl:px-24 py-8">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo — only visible on mobile/tablet */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <img src="/logo.jpeg" alt="Elia's Hope" className="h-10 w-10 rounded-full object-cover" />
              <div>
                <h3 className="text-[#031632] font-bold text-base leading-tight">Elia&apos;s Hope</h3>
                <p className="text-[#44474d]/50 text-xs">Community</p>
              </div>
            </div>

            {/* View Icon */}
            <div className="mb-6">
              <div className="h-12 w-12 rounded-[5px] bg-[#ff8928]/10 flex items-center justify-center mb-5">
                {(() => {
                  const Icon = getViewIcon()
                  return <Icon className="h-6 w-6 text-[#ff8928]" />
                })()}
              </div>
            </div>

            {/* Greeting */}
            <h2 className="text-2xl xl:text-3xl font-bold text-[#031632] mb-2">
              {view === 'login' && (
                <>
                  Welcome back
                  <span className="text-[#ff8928]">.</span>
                </>
              )}
              {view === 'forgot_password' && t.admin.forgotPasswordTitle}
              {view === 'verify_otp' && t.admin.verifyOtpTitle}
              {view === 'reset_password' && t.admin.resetPasswordTitle}
            </h2>
            <p className="text-[#44474d] text-sm mb-8">
              {view === 'login' && "Sign in to your admin account to manage Elia's Hope Community."}
              {view === 'forgot_password' && t.admin.forgotPasswordDescription}
              {view === 'verify_otp' && t.admin.otpSentTo}
              {view === 'reset_password' && t.admin.resetPasswordDescription}
            </p>

            {/* ===== LOGIN FORM ===== */}
            {view === 'login' && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-[5px]"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label htmlFor="admin-email" className="text-sm font-medium text-[#031632]">
                    {t.admin.email}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]/40" />
                    <Input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@eliashope.org"
                      className="pl-10 h-12 border-2 border-[#e5e7eb] rounded-[5px] focus:border-[#ff8928] text-[#031632] placeholder:text-[#44474d]/40 transition-colors"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="admin-password" className="text-sm font-medium text-[#031632]">
                      {t.admin.password}
                    </label>
                    <button
                      type="button"
                      onClick={() => setView('forgot_password')}
                      className="text-xs text-[#ff8928] hover:text-[#e07820] font-medium transition-colors"
                    >
                      {t.admin.forgotPassword}?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]/40" />
                    <Input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 pr-11 h-12 border-2 border-[#e5e7eb] rounded-[5px] focus:border-[#ff8928] text-[#031632] placeholder:text-[#44474d]/40 transition-colors"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#44474d]/40 hover:text-[#44474d] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#031632] text-white rounded-[5px] font-semibold text-sm hover:bg-[#0F2D5C] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#031632]/20"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t.admin.signingIn}
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      {t.admin.signIn}
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-[#44474d]/50 pt-2">
                  {t.admin.loginSubtitle}
                </p>
              </form>
            )}

            {/* ===== FORGOT PASSWORD FORM ===== */}
            {view === 'forgot_password' && (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                {forgotError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-[5px]"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{forgotError}</span>
                  </motion.div>
                )}

                {forgotSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-[5px]"
                  >
                    <KeyRound className="h-4 w-4 flex-shrink-0" />
                    <span>{forgotSuccess}</span>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label htmlFor="forgot-email" className="text-sm font-medium text-[#031632]">
                    {t.admin.email}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]/40" />
                    <Input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="admin@eliashope.org"
                      className="pl-10 h-12 border-2 border-[#e5e7eb] rounded-[5px] focus:border-[#ff8928] text-[#031632] placeholder:text-[#44474d]/40 transition-colors"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full h-12 bg-[#ff8928] text-white rounded-[5px] font-semibold text-sm hover:bg-[#e07820] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#ff8928]/20"
                >
                  {forgotLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t.admin.sendingOtp}
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      {t.admin.sendOtp}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResetToLogin}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-[#44474d] hover:text-[#031632] font-medium transition-colors pt-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t.admin.backToLogin}
                </button>
              </form>
            )}

            {/* ===== VERIFY OTP FORM ===== */}
            {view === 'verify_otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 p-3 rounded-[5px]">
                  <Mail className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-[#44474d]">{t.admin.otpSentTo}</p>
                    <p className="text-[#031632] font-semibold text-sm mt-0.5">{forgotEmail}</p>
                  </div>
                </div>

                {otpError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-[5px]"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{otpError}</span>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label htmlFor="otp-code" className="text-sm font-medium text-[#031632]">
                    {t.admin.otpCode}
                  </label>
                  <Input
                    id="otp-code"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                    className="h-14 border-2 border-[#e5e7eb] rounded-[5px] focus:border-[#ff8928] text-[#031632] text-center font-mono text-2xl tracking-[0.5em] placeholder:text-[#44474d]/40 transition-colors"
                    placeholder="------"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || otp.length < 6}
                  className="w-full h-12 bg-[#031632] text-white rounded-[5px] font-semibold text-sm hover:bg-[#0F2D5C] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#031632]/20"
                >
                  {otpLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t.admin.verifyingOtp}
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      {t.admin.verifyOtp}
                    </>
                  )}
                </button>

                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpCooldown > 0 || resendingOtp}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#ff8928] hover:text-[#e07820] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${resendingOtp ? 'animate-spin' : ''}`} />
                    {resendingOtp ? t.admin.resendingOtp : (
                      otpCooldown > 0
                        ? `${t.admin.resendOtp} (${otpCooldown}s)`
                        : t.admin.resendOtp
                    )}
                  </button>
                  {otpResendMessage && (
                    <p className={`text-xs ${otpResendMessage === t.admin.otpResentSuccess ? 'text-green-600' : 'text-red-500'}`}>
                      {otpResendMessage}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleResetToLogin}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-[#44474d] hover:text-[#031632] font-medium transition-colors pt-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t.admin.backToLogin}
                </button>
              </form>
            )}

            {/* ===== RESET PASSWORD FORM ===== */}
            {view === 'reset_password' && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                {resetError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-[5px]"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{resetError}</span>
                  </motion.div>
                )}

                {resetSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-[5px]"
                  >
                    <Shield className="h-4 w-4 flex-shrink-0" />
                    <span>{resetSuccess}</span>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label htmlFor="new-password" className="text-sm font-medium text-[#031632]">
                    {t.admin.newPassword}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]/40" />
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t.admin.newPasswordPlaceholder}
                      className="pl-10 pr-11 h-12 border-2 border-[#e5e7eb] rounded-[5px] focus:border-[#ff8928] text-[#031632] placeholder:text-[#44474d]/40 transition-colors"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#44474d]/40 hover:text-[#44474d] transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium text-[#031632]">
                    {t.admin.confirmPassword}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]/40" />
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t.admin.confirmPasswordPlaceholder}
                      className="pl-10 h-12 border-2 border-[#e5e7eb] rounded-[5px] focus:border-[#ff8928] text-[#031632] placeholder:text-[#44474d]/40 transition-colors"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full h-12 bg-[#031632] text-white rounded-[5px] font-semibold text-sm hover:bg-[#0F2D5C] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#031632]/20"
                >
                  {resetLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t.admin.resettingPassword}
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      {t.admin.resetPasswordButton}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResetToLogin}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-[#44474d] hover:text-[#031632] font-medium transition-colors pt-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t.admin.backToLogin}
                </button>
              </form>
            )}

            {/* Footer credit */}
            <div className="mt-10 pt-6 border-t border-gray-100">
              <p className="text-center text-xs text-[#44474d]/40">
                &copy; {new Date().getFullYear()} Elia&apos;s Hope Community. Created by{' '}
                <a href="https://rwextech.co.tz" target="_blank" rel="noopener noreferrer" className="text-[#ff8928] hover:underline">
                  rwextech
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
