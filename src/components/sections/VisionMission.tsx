'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Eye, Flag, ArrowRight, Sparkles, Heart } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'

export default function VisionMission() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const { t } = useLanguage()

  const scrollToAbout = () => {
    const el = document.getElementById('about')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="vision-mission" ref={ref} className="py-20 bg-[#f5f3ef]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Vision Card — slightly taller for visual asymmetry */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="group relative bg-[#1a2b48] text-white p-10 lg:p-14 pb-16 lg:pb-20 rounded-3xl shadow-xl overflow-hidden"
          >
            {/* Animated gradient border on hover */}
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-[#ff8928]/60 transition-all duration-500 pointer-events-none z-20" />

            {/* Dot pattern overlay */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-0">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 50% 50%, #ff8928 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
            </div>

            {/* Decorative blur */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#ff8928]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Watermark icon */}
            <div className="absolute top-6 right-6 opacity-[0.06] pointer-events-none">
              <Eye className="h-28 w-28" />
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-[5px] flex items-center justify-center mb-6">
                <Eye className="h-8 w-8 text-[#ff8928]" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">{t.visionMission.ourVision}</h3>
              <p className="text-white/80 leading-relaxed">
                {t.visionMission.visionDescription}
              </p>
            </div>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="group relative bg-[#031632] text-white p-10 lg:p-14 rounded-3xl shadow-xl overflow-hidden"
          >
            {/* Animated gradient border on hover */}
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-[#ff8928]/60 transition-all duration-500 pointer-events-none z-20" />

            {/* Dot pattern overlay */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-0">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 50% 50%, #ff8928 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
            </div>

            {/* Decorative blur */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#ff8928]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Watermark icon */}
            <div className="absolute top-6 right-6 opacity-[0.06] pointer-events-none">
              <Flag className="h-28 w-28" />
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-[5px] flex items-center justify-center mb-6">
                <Flag className="h-8 w-8 text-[#ff8928]" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">{t.visionMission.ourMission}</h3>
              <p className="text-white/80 leading-relaxed">
                {t.visionMission.missionDescription}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Read Our Story link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-10"
        >
          <button
            onClick={scrollToAbout}
            className="inline-flex items-center gap-2 text-[#ff8928] hover:text-[#ff6b00] font-semibold transition-colors group/link"
          >
            <Sparkles className="h-4 w-4" />
            {t.visionMission.readOurStory}
            <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}
