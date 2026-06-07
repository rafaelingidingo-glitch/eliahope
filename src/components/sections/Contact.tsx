'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { MapPin, Phone, Mail, Send, Clock, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/lib/i18n'

const MAX_MESSAGE_LENGTH = 500

export default function Contact() {
  const { t } = useLanguage()
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [statusMsg, setStatusMsg] = useState('')

  const contactInfo = [
    {
      icon: MapPin,
      label: t.contact.address,
      value: 'Mwanza, Tanzania',
    },
    {
      icon: Phone,
      label: t.contact.phone,
      value: '+255 754 208 639',
    },
    {
      icon: Mail,
      label: t.contact.email,
      value: 'elianixsonl27@gmail.com',
    },
    {
      icon: Clock,
      label: t.contact.officeHours,
      value: t.contact.officeHoursValue,
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) return

    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setStatusMsg(data.message || t.contact.successMessage)
        setFormData({ name: '', email: '', phone: '', message: '' })
      } else {
        setStatus('error')
        setStatusMsg(data.error || t.contact.errorMessage)
      }
    } catch {
      setStatus('error')
      setStatusMsg(t.contact.errorMessage)
    }
  }

  return (
    <section id="contact" ref={ref} className="py-20 md:py-28 bg-[#f5f3ef]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-orange font-semibold text-sm uppercase tracking-wider mb-3">
            {t.contact.subtitle}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            {t.contact.title}
          </h2>
          <div className="w-16 h-1 bg-orange mx-auto rounded-full mb-4" />
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t.contact.description}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left - Contact Info + Map */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-4 mb-6">
              {contactInfo.map((info) => {
                const Icon = info.icon
                return (
                  <div
                    key={info.label}
                    className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-orange/20"
                  >
                    <div className="bg-orange/10 p-2.5 rounded-lg shrink-0">
                      <Icon className="h-5 w-5 text-orange" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                        {info.label}
                      </p>
                      <p className="text-navy font-medium">{info.value}</p>
                    </div>
                  </div>
                )
              })}

              {/* WhatsApp Card */}
              <a
                href="https://wa.me/255754208639"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 bg-green-50 rounded-xl p-4 shadow-sm border border-green-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-green-400 group"
              >
                <div className="bg-green-500/10 p-2.5 rounded-lg shrink-0">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">
                    {t.contact.whatsapp}
                  </p>
                  <p className="text-green-700 font-medium group-hover:text-green-800 transition-colors">
                    {t.contact.whatsappLabel}
                  </p>
                </div>
              </a>
            </div>

            {/* Map Embed */}
            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100 h-52">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127672.75772628!2d32.85!3d-2.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19c2dbb6e5e4e3e3%3A0x4e8e8e8e8e8e8e8e!2sMwanza%2C%20Tanzania!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mwanza, Tanzania"
              />
            </div>
          </motion.div>

          {/* Right - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-navy mb-6">{t.contact.sendMessage}</h3>
              <div className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder={t.contact.yourName}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-12 rounded-xl border-gray-200 focus:border-orange focus:ring-orange"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder={t.contact.yourEmail}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-12 rounded-xl border-gray-200 focus:border-orange focus:ring-orange"
                  />
                </div>
                <div>
                  <Input
                    type="tel"
                    placeholder={t.contact.yourPhone}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12 rounded-xl border-gray-200 focus:border-orange focus:ring-orange"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder={t.contact.yourMessage}
                    value={formData.message}
                    onChange={(e) => {
                      const val = e.target.value.slice(0, MAX_MESSAGE_LENGTH)
                      setFormData({ ...formData, message: val })
                    }}
                    required
                    rows={5}
                    maxLength={MAX_MESSAGE_LENGTH}
                    className="rounded-xl border-gray-200 focus:border-orange focus:ring-orange resize-none"
                  />
                  <p className="text-xs text-text-secondary mt-1 text-right">
                    {t.contact.characterCount.replace('{count}', String(formData.message.length))}
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-navy hover:bg-navy-light text-white font-semibold rounded-none h-12"
                >
                  {status === 'loading' ? t.contact.sending : (
                    <>
                      {t.contact.send}
                      <Send className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {/* Response time note */}
              <p className="text-xs text-text-secondary text-center mt-3 flex items-center justify-center gap-1.5">
                <Clock className="h-3 w-3" />
                {t.contact.responseTime}
              </p>

              {status !== 'idle' && status !== 'loading' && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 text-sm font-medium text-center ${
                    status === 'success' ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {statusMsg}
                </motion.p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
