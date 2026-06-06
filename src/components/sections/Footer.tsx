'use client'

import { Facebook, Twitter, Instagram, Youtube, Heart } from 'lucide-react'

const quickLinks = [
  { label: 'About', href: '#about' },
  { label: 'Programs', href: '#programs' },
  { label: 'Donate', href: '#donate' },
  { label: 'Volunteer', href: '#contact' },
  { label: 'Events', href: '#events' },
  { label: 'Contact', href: '#contact' },
]

const programLinks = [
  { label: 'Education', href: '#programs' },
  { label: 'Feeding Program', href: '#programs' },
  { label: 'Child Care', href: '#programs' },
  { label: 'Bible Study', href: '#programs' },
  { label: 'Community Support', href: '#programs' },
]

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
]

export default function Footer() {
  const handleNavClick = (href: string) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="bg-navy-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1 - Logo & Description */}
          <div>
            <img src="/logo.png" alt="Elia's Hope Community" className="h-10 w-auto mb-4" />
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Elia&apos;s Hope Community is a registered NGO dedicated to transforming the lives 
              of vulnerable children and families in Mwanza, Tanzania through education, nutrition, 
              faith, and community empowerment.
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
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
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
            <h3 className="font-bold text-lg mb-4">Programs</h3>
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
            <h3 className="font-bold text-lg mb-4">Contact Info</h3>
            <div className="space-y-3 text-sm text-white/60">
              <p>Mwanza, Tanzania</p>
              <p>+255 754 208 639</p>
              <p>elianixsonl27@gmail.com</p>
              <div className="pt-2">
                <p className="text-white/40 text-xs">Registration: ooNGO/R/6243</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
            <p>Copyright &copy; 2025 Elia&apos;s Hope Community. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-orange transition-colors">Privacy Policy</a>
              <span>|</span>
              <a href="#" className="hover:text-orange transition-colors">Terms &amp; Conditions</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
