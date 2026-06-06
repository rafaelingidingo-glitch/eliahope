'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  { label: 'What We Do', href: '#programs' },
  { label: 'Our Impact', href: '#impact' },
  { label: 'Donate', href: '#donate-modal' },
]

interface NavbarProps {
  onAdminClick?: () => void
  onDonateClick?: (campaignId?: string, amount?: string) => void
}

export default function Navbar({ onAdminClick, onDonateClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('#home')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)

      const sections = ['#home', '#about', '#programs', '#impact']
      for (const section of sections.reverse()) {
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

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm h-20"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault()
              handleNavClick('#home')
            }}
            className="flex items-center gap-3"
          >
            <img src="/logo.jpeg" alt="Elia's Hope Community" className="h-12 w-12 rounded-full object-cover" />
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
            <Button
              variant="outline"
              onClick={onAdminClick}
              className="border-[#031632]/20 text-[#031632] hover:bg-[#031632] hover:text-white font-medium rounded-none px-5 transition-all"
            >
              Login
            </Button>
            <Button
              asChild
              className="bg-[#ff8928] hover:bg-[#964900] text-white font-semibold rounded-none px-6"
            >
              <a href="#donate-modal" onClick={(e) => { e.preventDefault(); onDonateClick?.() }}>
                Donate Now
              </a>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="outline"
              onClick={onAdminClick}
              className="border-[#031632]/20 text-[#031632] hover:bg-[#031632] hover:text-white font-medium rounded-none px-4 text-xs transition-all"
            >
              Login
            </Button>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[#031632] hover:bg-[#ffdcc6]/20">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white w-72 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b border-[#c5c6ce]/30">
                    <div className="flex items-center gap-3">
                      <img src="/logo.jpeg" alt="Elia's Hope" className="h-9 w-9 rounded-full object-cover" />
                      <span className="text-[#031632] font-bold">Elia&apos;s Hope</span>
                    </div>
                  </div>
                  <div className="flex-1 py-4">
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
                  <div className="p-4 space-y-3 border-t border-[#c5c6ce]/30">
                    <Button
                      asChild
                      className="w-full bg-[#ff8928] hover:bg-[#964900] text-white font-semibold rounded-none"
                    >
                      <a href="#donate-modal" onClick={(e) => { e.preventDefault(); onDonateClick?.(); setMobileOpen(false) }}>
                        Donate Now
                      </a>
                    </Button>
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
