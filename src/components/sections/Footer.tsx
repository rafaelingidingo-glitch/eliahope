'use client'

import { useState } from 'react'
import { Facebook, Twitter, Instagram, Youtube, ArrowUp, Mail, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/lib/i18n'

interface FooterProps {
  onDonateClick?: (campaignId?: string, amount?: string) => void
}

export default function Footer({ onDonateClick }: FooterProps) {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const quickLinks = [
    { label: t.footer.about, href: '#about' },
    { label: t.footer.programs, href: '#programs' },
    { label: t.footer.donate, href: '#donate' },
    { label: t.footer.volunteer, href: '#take-action' },
    { label: t.footer.events, href: '#events' },
    { label: t.footer.contact, href: '#contact' },
  ]

  const programLinks = [
    { label: t.programs.education, href: '#programs' },
    { label: t.programs.feedingProgram, href: '#programs' },
    { label: t.programs.childCare, href: '#programs' },
    { label: t.programs.bibleStudy, href: '#programs' },
    { label: t.programs.communitySupport, href: '#programs' },
  ]

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/elias hope community', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/elias hope community', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/elias hope community', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com/@elias hope community', label: 'YouTube' },
  ]

  const handleNavClick = (href: string) => {
    if (href === '#donate') {
      onDonateClick?.()
      return
    }
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleBackToTop = () => {
    const el = document.querySelector('#home')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setSubscribeStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Newsletter Subscriber', email: email.trim() }),
      })
      if (res.ok) {
        setSubscribeStatus('success')
        setEmail('')
        setTimeout(() => setSubscribeStatus('idle'), 3000)
      } else {
        setSubscribeStatus('error')
        setTimeout(() => setSubscribeStatus('idle'), 3000)
      }
    } catch {
      setSubscribeStatus('error')
      setTimeout(() => setSubscribeStatus('idle'), 3000)
    }
  }

  return (
    <footer className="bg-navy-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1 - Logo & Description */}
          <div className="lg:col-span-2">
            <img src="/logo.jpeg" alt="Elia's Hope Community" className="h-12 w-12 rounded-full object-cover mb-4" />
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {t.footer.description}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="bg-white/10 hover:bg-orange p-2.5 rounded-full transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t.footer.quickLinks}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavClick(link.href)
                    }}
                    className="text-white/60 hover:text-orange transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Programs */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t.footer.programs}</h3>
            <ul className="space-y-2">
              {programLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavClick(link.href)
                    }}
                    className="text-white/60 hover:text-orange transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t.footer.contactInfo}</h3>
            <div className="space-y-3 text-sm text-white/60">
              <p>{t.common.mwanzaTanzania}</p>
              <p>
                <a
                  href="tel:+255754208639"
                  className="hover:text-orange transition-colors"
                >
                  +255 754 208 639
                </a>
              </p>
              <p>
                <a
                  href="mailto:elianixsonl27@gmail.com"
                  className="hover:text-orange transition-colors"
                >
                  elianixsonl27@gmail.com
                </a>
              </p>
              <div className="pt-2">
                <p className="text-white/40 text-xs">{t.footer.registration}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Mini-Form */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3 shrink-0">
              <Mail className="h-5 w-5 text-[#ff8928]" />
              <div>
                <h4 className="font-bold text-sm">{t.footer.newsletterTitle}</h4>
                <p className="text-white/50 text-xs">{t.footer.newsletterDescription}</p>
              </div>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex w-full sm:max-w-md gap-2">
              <Input
                type="email"
                placeholder={t.footer.emailAddress}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-none h-10 text-sm focus-visible:ring-[#ff8928]"
                disabled={subscribeStatus === 'loading'}
              />
              <Button
                type="submit"
                disabled={subscribeStatus === 'loading' || !email.trim()}
                className="bg-[#ff8928] hover:bg-[#964900] text-white font-semibold rounded-none px-4 h-10 shrink-0 text-sm"
              >
                {subscribeStatus === 'loading' && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                {subscribeStatus === 'loading'
                  ? t.footer.subscribing
                  : subscribeStatus === 'success'
                    ? t.footer.subscribeSuccess
                    : subscribeStatus === 'error'
                      ? t.footer.subscribeError
                      : t.footer.subscribe
                }
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Divider line above bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
            <p>Copyright &copy; {new Date().getFullYear()} Elia&apos;s Hope Community. {t.footer.copyright}</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-orange transition-colors">{t.footer.privacyPolicy}</a>
              <span>|</span>
              <a href="#" className="hover:text-orange transition-colors">{t.footer.termsConditions}</a>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={handleBackToTop}
        className="fixed bottom-6 right-6 z-40 bg-[#ff8928] hover:bg-[#964900] text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
        aria-label={t.footer.backToTop}
      >
        <ArrowUp className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </footer>
  )
}
