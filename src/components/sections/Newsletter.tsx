'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Mail, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Newsletter() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

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
        setMessage(data.message || 'Thank you for subscribing!')
        setName('')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <section ref={ref} className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-[0.03]">
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
            Stay Updated
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto mb-8">
            Subscribe to our newsletter and stay connected with the latest news, events, 
            and stories of impact from Elia&apos;s Hope Community.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
            <Input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12 rounded-xl border-gray-200 focus:border-orange focus:ring-orange"
            />
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl border-gray-200 focus:border-orange focus:ring-orange"
            />
            <Button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-orange hover:bg-orange-dark text-white font-semibold rounded-xl h-12"
            >
              {status === 'loading' ? 'Subscribing...' : (
                <>
                  Subscribe
                  <Send className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {status !== 'idle' && status !== 'loading' && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 text-sm font-medium ${
                status === 'success' ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  )
}
