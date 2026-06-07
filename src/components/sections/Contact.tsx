'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { MapPin, Phone, Mail, Send, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/lib/i18n'

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
          {/* Left - Contact Info + Map Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-4 mb-8">
              {contactInfo.map((info) => {
                const Icon = info.icon
                return (
                  <div key={info.label} className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
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
            </div>

            {/* Map Placeholder */}
            <div className="bg-navy/5 rounded-xl h-52 flex items-center justify-center border-2 border-dashed border-navy/10">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-navy/30 mx-auto mb-2" />
                <p className="text-navy/40 font-medium text-sm">Mwanza, Tanzania</p>
                <p className="text-navy/30 text-xs">{t.contact.mapView}</p>
              </div>
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
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="rounded-xl border-gray-200 focus:border-orange focus:ring-orange resize-none"
                  />
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
