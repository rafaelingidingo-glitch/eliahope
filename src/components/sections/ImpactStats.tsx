'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { GraduationCap, UtensilsCrossed, Users, Heart, Home } from 'lucide-react'
import AnimatedCounter from './AnimatedCounter'

const stats = [
  { icon: GraduationCap, value: 500, suffix: '+', label: 'Children Supported' },
  { icon: UtensilsCrossed, value: 15000, suffix: '+', label: 'Meals Served' },
  { icon: Users, value: 25, suffix: '+', label: 'Volunteers' },
  { icon: Heart, value: 10, suffix: '+', label: 'Community Programs' },
  { icon: Home, value: 100, suffix: '+', label: 'Families Assisted' },
]

export default function ImpactStats() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="relative bg-navy py-20 md:py-28 overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 1px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 1px, transparent 1px)',
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Our <span className="text-orange">Impact</span>
          </h2>
          <div className="w-16 h-1 bg-orange mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition-colors"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-orange/20 p-3 rounded-full">
                    <Icon className="h-7 w-7 text-orange" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-white/70 text-sm">{stat.label}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
