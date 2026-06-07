'use client'

import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'

interface FooterProps {
  onDonateClick?: (campaignId?: string, amount?: string) => void
}

export default function Footer({ onDonateClick }: FooterProps) {
  const { t } = useLanguage()

  const quickLinks = [
    { label: t.footer.about, href: '#about' },
    { label: t.footer.programs, href: '#programs' },
    { label: t.footer.donate, href: '#donate' },
    { label: t.footer.volunteer, href: '#contact' },
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
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ]

  const handleNavClick = (href: string) => {
    if (href === '#donate') {
      onDonateClick?.()
      return
    }
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="bg-navy-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1 - Logo & Description */}
          <div>
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
              <p>Mwanza, Tanzania</p>
              <p>+255 754 208 639</p>
              <p>elianixsonl27@gmail.com</p>
              <div className="pt-2">
                <p className="text-white/40 text-xs">{t.footer.registration}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
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
    </footer>
  )
}
