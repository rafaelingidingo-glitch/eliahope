'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Heart, UserCheck, HandHeart, Handshake } from 'lucide-react'

const actions = [
  {
    icon: Heart,
    title: 'Donate',
    description: 'Your financial contribution provides meals, school fees, and essential supplies for children in need.',
    iconBg: 'bg-[#ff8928]',
    cta: 'Donate Now',
    href: '#donate',
  },
  {
    icon: UserCheck,
    title: 'Sponsor',
    description: 'Sponsor a child\'s education and wellbeing, giving them the opportunity for a brighter future.',
    iconBg: 'bg-[#031632]',
    cta: 'Sponsor a Child',
    href: '#donate',
  },
  {
    icon: HandHeart,
    title: 'Volunteer',
    description: 'Share your time and skills to directly impact the lives of children and families in our community.',
    iconBg: 'bg-[#1a2b48]',
    cta: 'Volunteer Now',
    href: '#contact',
  },
  {
    icon: Handshake,
    title: 'Partner',
    description: 'Partner with us to create sustainable change and expand our reach across Mwanza and beyond.',
    iconBg: 'bg-[#8b4513]',
    cta: 'Become a Partner',
    href: '#contact',
  },
]

interface TakeActionProps {
  onDonateClick?: (campaignId?: string, amount?: string) => void
}

export default function TakeAction({ onDonateClick }: TakeActionProps) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const handleScrollTo = (id: string) => {
    const el = document.querySelector(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="take-action" ref={ref} className="py-20 bg-[#031632] relative overflow-hidden">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-[#ff8928] font-bold text-xs uppercase tracking-widest mb-4 block">
            TAKE ACTION
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Become Part of the Hope
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map((action, i) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-3xl p-8 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300 soft-shadow"
              >
                <div className={`w-16 h-16 ${action.iconBg} rounded-2xl flex items-center justify-center mb-6`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#031632] mb-3">{action.title}</h3>
                <p className="text-[#44474d] text-sm leading-relaxed mb-6">
                  {action.description}
                </p>
                <button
                  onClick={() => {
                    if (action.href === '#donate') {
                      onDonateClick?.()
                    } else {
                      handleScrollTo(action.href)
                    }
                  }}
                  className="mt-auto px-6 py-3 bg-[#031632] text-white font-semibold rounded-xl hover:bg-[#1a2b48] transition-colors text-sm"
                >
                  {action.cta}
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
