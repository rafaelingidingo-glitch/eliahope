'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useLanguage } from '@/lib/i18n'

const partners = [
  'Mwanza City Council',
  'Tanzania Churches United',
  'Hope Foundation International',
  'Save The Children Fund',
  'Global Education Initiative',
  'Community Health Partners',
]

export default function Partners() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const { t } = useLanguage()

  return (
    <section id="partners" ref={ref} className="py-20 md:py-28 bg-[#fbf9f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-orange font-semibold text-sm uppercase tracking-wider mb-3">
            {t.partners.subtitle}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            {t.partners.title}
          </h2>
          <div className="w-16 h-1 bg-orange mx-auto rounded-full mb-4" />
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t.partners.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((partner, i) => (
            <motion.div
              key={partner}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group bg-white rounded-xl p-6 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-navy/10 group-hover:bg-orange/20 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-navy group-hover:text-orange font-bold text-lg transition-colors">
                    {partner.charAt(0)}
                  </span>
                </div>
                <p className="text-xs font-medium text-text-secondary group-hover:text-navy transition-colors leading-tight">
                  {partner}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
