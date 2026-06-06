'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { MapPin, Phone, Mail, Send, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const contactInfo = [
  {
    icon: MapPin,
    label: 'Address',
    value: 'Mwanza, Tanzania',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+255 754 208 639',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'elianixsonl27@gmail.com',
  },
  {
    icon: Clock,
    label: 'Office Hours',
    value: 'Mon-Fri: 8:00 AM - 5:00 PM',
  },
]

export default function Contact() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [statusMsg, setStatusMsg] = useState('')

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
        setStatusMsg(data.message || 'Message sent successfully!')
        setFormData({ name: '', email: '', phone: '', message: '' })
      } else {
        setStatus('error')
        setStatusMsg(data.error || 'Failed to send message. Please try again.')
      }
    } catch {
      setStatus('error')
      setStatusMsg('Failed to send message. Please try again.')
    }
  }

  return (
    <section id="contact" ref={ref} className="py-20 md:py-28 bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-orange font-semibold text-sm uppercase tracking-wider mb-3">
            Get in Touch
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Contact Us
          </h2>
          <div className="w-16 h-1 bg-orange mx-auto rounded-full mb-4" />
          <p className="text-text-secondary max-w-2xl mx-auto">
            We would love to hear from you. Whether you have questions, want to volunteer, or 
            need more information, reach out to us.
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
                <p className="text-navy/30 text-xs">Map view</p>
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
              <h3 className="text-xl font-bold text-navy mb-6">Send us a Message</h3>
              <div className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-12 rounded-xl border-gray-200 focus:border-orange focus:ring-orange"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-12 rounded-xl border-gray-200 focus:border-orange focus:ring-orange"
                  />
                </div>
                <div>
                  <Input
                    type="tel"
                    placeholder="Your Phone (optional)"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12 rounded-xl border-gray-200 focus:border-orange focus:ring-orange"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Your Message"
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
                  className="w-full bg-navy hover:bg-navy-light text-white font-semibold rounded-xl h-12"
                >
                  {status === 'loading' ? 'Sending...' : (
                    <>
                      Send Message
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
