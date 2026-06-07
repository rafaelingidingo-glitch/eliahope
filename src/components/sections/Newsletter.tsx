'use client'

import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Mail, Send, CheckCircle, PartyPopper, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/lib/i18n'

export default function Newsletter() {
  const { t } = useLanguage()
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [emailLogId, setEmailLogId] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [resending, setResending] = useState(false)
  // Store last subscription data for resend functionality
  const [lastSubscribedName, setLastSubscribedName] = useState('')
  const [lastSubscribedEmail, setLastSubscribedEmail] = useState('')

  const benefits = [
    { icon: CheckCircle, text: t.newsletter.benefitUpdates },
    { icon: CheckCircle, text: t.newsletter.benefitEvents },
    { icon: CheckCircle, text: t.newsletter.benefitVolunteer },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) return

    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(data.message || t.newsletter.successMessage)
        setEmailSent(data.emailSent !== false)
        setEmailLogId(data.emailLogId || null)
        setLastSubscribedName(name)
        setLastSubscribedEmail(email)
        setName('')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || t.newsletter.errorMessage)
      }
    } catch {
      setStatus('error')
      setMessage(t.newsletter.errorMessage)
    }
  }

  const handleResendEmail = async () => {
    const resendTo = email || lastSubscribedEmail
    const resendName = name || lastSubscribedName
    if (!emailLogId && !resendTo) return
    setResending(true)
    try {
      const res = await fetch('/api/email/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'newsletter_welcome',
          to: resendTo || undefined,
          name: resendName || undefined,
          emailLogId: emailLogId || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setMessage(t.newsletter.resendSuccess)
        setEmailLogId(data.emailLogId || null)
      } else {
        setMessage(data.error || t.newsletter.resendError)
      }
    } catch {
      setMessage(t.newsletter.resendError)
    } finally {
      setResending(false)
    }
  }

  return (
    <section id="newsletter" ref={ref} className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Decorative background — opacity 0.06 */}
      <div className="absolute inset-0 opacity-[0.06]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, #0F2D5C 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-orange/10 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <Mail className="h-8 w-8 text-orange" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            {t.newsletter.title}
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto mb-6">
            {t.newsletter.description}
          </p>

          {/* Benefit items */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 text-sm text-text-secondary"
              >
                <benefit.icon className="h-4 w-4 text-[#ff8928] flex-shrink-0" />
                <span>{benefit.text}</span>
              </motion.div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
            <Input
              type="text"
              placeholder={t.newsletter.fullName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12 rounded-[5px] border-gray-200 focus:border-orange focus:ring-orange"
            />
            <Input
              type="email"
              placeholder={t.newsletter.emailAddress}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-[5px] border-gray-200 focus:border-orange focus:ring-orange"
            />
            <Button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-orange hover:bg-orange-dark text-white font-semibold rounded-[5px] h-12"
            >
              {status === 'loading' ? t.newsletter.subscribing : (
                <>
                  {t.newsletter.subscribe}
                  <Send className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Privacy note */}
          <p className="text-text-secondary/60 text-xs mt-3">
            {t.newsletter.privacyNote}
          </p>

          {/* Success / Error message with animation */}
          <AnimatePresence>
            {status !== 'idle' && status !== 'loading' && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mt-4"
              >
                {status === 'success' ? (
                  <div>
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      >
                        <PartyPopper className="h-5 w-5 text-green-500" />
                      </motion.div>
                      <motion.p
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm font-medium text-green-600"
                      >
                        {message}
                      </motion.p>
                    </div>
                    {/* Resend welcome email button */}
                    {emailSent && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-3"
                      >
                        <button
                          onClick={handleResendEmail}
                          disabled={resending}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#ff8928] hover:text-[#e07820] transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
                          {resending ? t.newsletter.resending : t.newsletter.resendEmail}
                        </button>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-red-500">{message}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
