'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Menu, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { useLanguage } from '@/lib/i18n'

interface NavbarProps {
  onAdminClick?: () => void
  onDonateClick?: (campaignId?: string, amount?: string) => void
}

export default function Navbar({ onAdminClick, onDonateClick }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('#home')
  const [scrolled, setScrolled] = useState(false)
  const { t, locale, setLocale } = useLanguage()

  const navLinks = [
    { label: t.nav.home, href: '#home' },
    { label: t.nav.aboutUs, href: '#about' },
    { label: t.nav.whatWeDo, href: '#programs' },
    { label: t.nav.ourImpact, href: '#impact' },
    { label: t.nav.volunteer, href: '#take-action' },
    { label: t.nav.contact, href: '#contact' },
    { label: t.nav.donate, href: '#donate-modal' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)

      const sections = ['#home', '#about', '#programs', '#impact', '#take-action', '#contact']
      for (const section of [...sections].reverse()) {
        const el = document.querySelector(section)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 150) {
            setActiveSection(section)
            break
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const switchLocale = (newLocale: 'en' | 'sw') => {
    if (newLocale !== locale) {
      setLocale(newLocale)
    }
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300 ${
        scrolled
          ? 'bg-white/98 shadow-md py-2'
          : 'bg-white/95 shadow-sm py-4'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault()
              handleNavClick('#home')
            }}
            className="flex items-center gap-3"
          >
            <img src="/logo.jpeg" alt="Elia's Hope Community" className="h-10 w-10 rounded-full object-cover" />
            <span className="text-[#031632] font-bold text-lg hidden sm:inline">Elia&apos;s Hope</span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  if (link.href === '#donate-modal') {
                    onDonateClick?.()
                  } else {
                    handleNavClick(link.href)
                  }
                }}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeSection === link.href
                    ? 'text-[#ff8928] font-bold border-b-2 border-[#ff8928]'
                    : 'text-[#44474d] hover:text-[#031632]'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Switcher - Single toggle button */}
            <button
              onClick={() => switchLocale(locale === 'en' ? 'sw' : 'en')}
              className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-[#031632]/20 text-[#031632] font-bold text-xs hover:bg-[#031632] hover:text-white hover:border-[#031632] transition-all"
              title={t.language.switchLanguage}
            >
              {locale === 'en' ? 'SW' : 'EN'}
            </button>
            <Button
              variant="outline"
              onClick={onAdminClick}
              className="border-[#031632]/20 text-[#031632] hover:bg-[#031632] hover:text-white font-medium rounded-none px-5 transition-all"
            >
              {t.nav.login}
            </Button>
            <Button
              asChild
              className="bg-[#ff8928] hover:bg-[#964900] text-white font-semibold rounded-none px-6"
            >
              <a href="#donate-modal" onClick={(e) => { e.preventDefault(); onDonateClick?.() }}>
                {t.nav.donateNow}
              </a>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Mobile Language Switcher */}
            <button
              onClick={() => switchLocale(locale === 'en' ? 'sw' : 'en')}
              className="flex items-center justify-center w-9 h-9 rounded-lg border-2 border-[#031632]/20 text-[#031632] font-bold text-xs hover:bg-[#031632] hover:text-white hover:border-[#031632] transition-all"
              title={t.language.switchLanguage}
            >
              {locale === 'en' ? 'SW' : 'EN'}
            </button>
            <Button
              variant="outline"
              onClick={onAdminClick}
              className="border-[#031632]/20 text-[#031632] hover:bg-[#031632] hover:text-white font-medium rounded-none px-4 text-xs transition-all"
            >
              {t.nav.login}
            </Button>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[#031632] hover:bg-[#ffdcc6]/20">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">{t.nav.openMenu}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white w-72 p-0">
                <SheetTitle className="sr-only">{t.nav.navigationMenu}</SheetTitle>
                <div className="flex flex-col h-full">
                  {/* Mobile Donate Banner */}
                  <div className="bg-[#ff8928] p-4">
                    <Button
                      onClick={() => { onDonateClick?.(); setMobileOpen(false) }}
                      className="w-full bg-white text-[#ff8928] hover:bg-white/90 font-bold rounded-none flex items-center justify-center gap-2 h-12"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                      {t.nav.donateNow}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-[#c5c6ce]/30">
                    <div className="flex items-center gap-3">
                      <img src="/logo.jpeg" alt="Elia's Hope" className="h-9 w-9 rounded-full object-cover" />
                      <span className="text-[#031632] font-bold">Elia&apos;s Hope</span>
                    </div>
                  </div>
                  <div className="flex-1 py-4 overflow-y-auto">
                    {navLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault()
                          if (link.href === '#donate-modal') {
                            onDonateClick?.()
                            setMobileOpen(false)
                          } else {
                            handleNavClick(link.href)
                          }
                        }}
                        className={`block px-6 py-3 font-medium transition-colors ${
                          activeSection === link.href
                            ? 'text-[#ff8928] bg-[#ffdcc6]/20 border-r-2 border-[#ff8928]'
                            : 'text-[#44474d] hover:text-[#031632] hover:bg-[#f5f3ef]'
                        }`}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </motion.header>
  )
}
