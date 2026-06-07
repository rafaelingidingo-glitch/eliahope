'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, RefreshCw, ArrowLeft, KeyRound } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/lib/i18n'

interface AdminLoginProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (token: string) => void
}

type ViewMode = 'login' | 'forgot_password' | 'verify_otp' | 'reset_password'

export default function AdminLogin({ isOpen, onClose, onLogin }: AdminLoginProps) {
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
        onLogin(data.token)
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
        // Move to OTP verification after a short delay
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
        // Go back to login after 2 seconds
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

  const handleClose = () => {
    handleResetToLogin()
    setEmail('')
    setPassword('')
    setError('')
    setShowPassword(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-[5px] border-0">
        <DialogTitle className="sr-only">
          {view === 'login' ? t.admin.loginTitle : t.admin.forgotPasswordTitle}
        </DialogTitle>

        {/* Header */}
        <div className="bg-[#031632] px-8 py-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mx-auto mb-4 w-16 h-16 bg-[#ff8928]/20 rounded-[5px] flex items-center justify-center"
          >
            {view === 'login' ? (
              <Shield className="h-8 w-8 text-[#ff8928]" />
            ) : view === 'verify_otp' ? (
              <KeyRound className="h-8 w-8 text-[#ff8928]" />
            ) : (
              <Lock className="h-8 w-8 text-[#ff8928]" />
            )}
          </motion.div>
          <h2 className="text-white text-xl font-bold">
            {view === 'login' && t.admin.loginTitle}
            {view === 'forgot_password' && t.admin.forgotPasswordTitle}
            {view === 'verify_otp' && t.admin.verifyOtpTitle}
            {view === 'reset_password' && t.admin.resetPasswordTitle}
          </h2>
          <p className="text-white/60 text-sm mt-1">Elia&apos;s Hope Community</p>
        </div>

        {/* ─── Login Form ─── */}
        {view === 'login' && (
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
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

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="admin-email" className="text-sm font-medium text-[#031632]">
                {t.admin.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]/50" />
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eliashope.org"
                  className="pl-10 h-12 border-2 border-[#c5c6ce] rounded-[5px] focus:border-[#ff8928] text-[#031632]"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium text-[#031632]">
                {t.admin.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]/50" />
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-12 border-2 border-[#c5c6ce] rounded-[5px] focus:border-[#ff8928] text-[#031632]"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#44474d]/50 hover:text-[#44474d] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#031632] text-white rounded-[5px] font-semibold text-sm hover:bg-[#1a2b48] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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

            {/* Forgot Password Link */}
            <button
              type="button"
              onClick={() => setView('forgot_password')}
              className="w-full text-center text-sm text-[#ff8928] hover:text-[#e07820] font-medium transition-colors"
            >
              {t.admin.forgotPassword}
            </button>

            <p className="text-center text-xs text-[#44474d]/60 pt-1">
              {t.admin.loginSubtitle}
            </p>
          </form>
        )}

        {/* ─── Forgot Password (Enter Email) ─── */}
        {view === 'forgot_password' && (
          <form onSubmit={handleForgotPassword} className="px-8 py-6 space-y-5">
            <p className="text-sm text-[#44474d]">{t.admin.forgotPasswordDescription}</p>

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
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]/50" />
                <Input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@eliashope.org"
                  className="pl-10 h-12 border-2 border-[#c5c6ce] rounded-[5px] focus:border-[#ff8928] text-[#031632]"
                  autoComplete="email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full h-12 bg-[#ff8928] text-white rounded-[5px] font-semibold text-sm hover:bg-[#e07820] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
              className="w-full flex items-center justify-center gap-1.5 text-sm text-[#44474d] hover:text-[#031632] font-medium transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t.admin.backToLogin}
            </button>
          </form>
        )}

        {/* ─── Verify OTP ─── */}
        {view === 'verify_otp' && (
          <form onSubmit={handleVerifyOtp} className="px-8 py-6 space-y-5">
            <p className="text-sm text-[#44474d]">
              {t.admin.otpSentTo} <span className="font-semibold text-[#031632]">{forgotEmail}</span>
            </p>

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
                className="h-14 border-2 border-[#c5c6ce] rounded-[5px] focus:border-[#ff8928] text-[#031632] text-center font-mono text-2xl tracking-[0.5em]"
                placeholder="------"
                maxLength={6}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={otpLoading || otp.length < 6}
              className="w-full h-12 bg-[#031632] text-white rounded-[5px] font-semibold text-sm hover:bg-[#1a2b48] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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

            {/* Resend OTP */}
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
              className="w-full flex items-center justify-center gap-1.5 text-sm text-[#44474d] hover:text-[#031632] font-medium transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t.admin.backToLogin}
            </button>
          </form>
        )}

        {/* ─── Reset Password ─── */}
        {view === 'reset_password' && (
          <form onSubmit={handleResetPassword} className="px-8 py-6 space-y-5">
            <p className="text-sm text-[#44474d]">{t.admin.resetPasswordDescription}</p>

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
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]/50" />
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t.admin.newPasswordPlaceholder}
                  className="pl-10 pr-10 h-12 border-2 border-[#c5c6ce] rounded-[5px] focus:border-[#ff8928] text-[#031632]"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#44474d]/50 hover:text-[#44474d] transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium text-[#031632]">
                {t.admin.confirmPassword}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44474d]/50" />
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.admin.confirmPasswordPlaceholder}
                  className="pl-10 h-12 border-2 border-[#c5c6ce] rounded-[5px] focus:border-[#ff8928] text-[#031632]"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={resetLoading}
              className="w-full h-12 bg-[#031632] text-white rounded-[5px] font-semibold text-sm hover:bg-[#1a2b48] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
              className="w-full flex items-center justify-center gap-1.5 text-sm text-[#44474d] hover:text-[#031632] font-medium transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t.admin.backToLogin}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
