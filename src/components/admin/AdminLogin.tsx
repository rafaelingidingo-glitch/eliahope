'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/lib/i18n'

interface AdminLoginProps {
  isOpen: boolean
  onClose: () => void
  onLogin: () => void
}

export default function AdminLogin({ isOpen, onClose, onLogin }: AdminLoginProps) {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError(t.admin.invalidCredentials)
      return
    }

    setIsLoading(true)

    // Simulate a brief loading state
    await new Promise((resolve) => setTimeout(resolve, 600))

    // Check credentials
    if (email === 'admin@eliashope.org' && password === 'EliaHope2024!') {
      setIsLoading(false)
      setEmail('')
      setPassword('')
      setError('')
      onLogin()
    } else {
      setIsLoading(false)
      setError(t.admin.invalidCredentials)
    }
  }

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setError('')
    setShowPassword(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border-0">
        <DialogTitle className="sr-only">{t.admin.loginTitle}</DialogTitle>

        {/* Header */}
        <div className="bg-[#031632] px-8 py-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mx-auto mb-4 w-16 h-16 bg-[#ff8928]/20 rounded-2xl flex items-center justify-center"
          >
            <Shield className="h-8 w-8 text-[#ff8928]" />
          </motion.div>
          <h2 className="text-white text-xl font-bold">{t.admin.loginTitle}</h2>
          <p className="text-white/60 text-sm mt-1">Elia&apos;s Hope Community</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl"
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
                className="pl-10 h-12 border-2 border-[#c5c6ce] rounded-xl focus:border-[#ff8928] text-[#031632]"
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
                className="pl-10 pr-10 h-12 border-2 border-[#c5c6ce] rounded-xl focus:border-[#ff8928] text-[#031632]"
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
            className="w-full h-12 bg-[#031632] text-white rounded-xl font-semibold text-sm hover:bg-[#1a2b48] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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

          <p className="text-center text-xs text-[#44474d]/60 pt-1">
            {t.admin.loginSubtitle}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
