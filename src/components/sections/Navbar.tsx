'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Programs', href: '#programs' },
  { label: 'Stories', href: '#stories' },
  { label: 'Events', href: '#events' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
]

interface NavbarProps {
  onAdminClick?: () => void
}

export default function Navbar({ onAdminClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-navy shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault()
              handleNavClick('#home')
            }}
            className="flex items-center gap-2"
          >
            <img src="/logo.png" alt="Elia's Hope Community" className="h-10 md:h-12 w-auto" />
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick(link.href)
                }}
                className="px-3 py-2 text-sm font-medium text-white/90 hover:text-orange transition-colors rounded-md hover:bg-white/10"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onAdminClick}
              className="text-white/50 hover:text-orange hover:bg-white/10 h-9 w-9"
              title="Admin Dashboard"
            >
              <Lock className="h-4 w-4" />
            </Button>
            <Button
              asChild
              className="bg-orange hover:bg-orange-dark text-white font-semibold rounded-full px-5"
            >
              <a href="#donate" onClick={(e) => { e.preventDefault(); handleNavClick('#donate') }}>
                Donate Now
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-orange text-orange hover:bg-orange hover:text-white font-semibold rounded-full px-5"
            >
              <a href="#programs" onClick={(e) => { e.preventDefault(); handleNavClick('#programs') }}>
                Sponsor a Child
              </a>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={onAdminClick}
              className="text-white/50 hover:text-orange hover:bg-white/10 h-9 w-9"
              title="Admin Dashboard"
            >
              <Lock className="h-4 w-4" />
            </Button>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-navy border-navy-light w-72 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <img src="/logo.png" alt="Elia's Hope" className="h-9 w-auto" />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileOpen(false)}
                      className="text-white hover:bg-white/10"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex-1 py-4">
                    {navLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault()
                          handleNavClick(link.href)
                        }}
                        className="block px-6 py-3 text-white/90 hover:text-orange hover:bg-white/5 transition-colors font-medium"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                  <div className="p-4 space-y-3 border-t border-white/10">
                    <Button
                      asChild
                      className="w-full bg-orange hover:bg-orange-dark text-white font-semibold rounded-full"
                    >
                      <a href="#donate" onClick={(e) => { e.preventDefault(); handleNavClick('#donate') }}>
                        Donate Now
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-orange text-orange hover:bg-orange hover:text-white font-semibold rounded-full"
                    >
                      <a href="#programs" onClick={(e) => { e.preventDefault(); handleNavClick('#programs') }}>
                        Sponsor a Child
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
