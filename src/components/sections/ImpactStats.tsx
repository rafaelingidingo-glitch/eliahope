'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Heart } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'
import AnimatedCounter from '@/components/sections/AnimatedCounter'

export default function ImpactStats() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const { t } = useLanguage()
  const router = useRouter()

  const checklistItems = [
    {
      title: t.impact.transitionRate,
      description: t.impact.transitionRateDesc,
    },
    {
      title: t.impact.reducedMalnutrition,
      description: t.impact.reducedMalnutritionDesc,
    },
    {
      title: t.impact.childrenSupported,
      description: t.impact.childrenSupportedDesc,
    },
    {
      title: t.impact.mealsServed,
      description: t.impact.mealsServedDesc,
    },
  ]

  return (
    <section id="impact" ref={ref} className="py-20 bg-[#fbf9f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl soft-shadow border border-gray-200/10 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="p-8 lg:p-12"
            >
              <span className="text-[#ff8928] font-bold text-xs uppercase tracking-widest mb-4 block">
                {t.impact.ourImpact}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#031632] mb-8">
                {t.impact.title}
              </h2>

              {/* Checklist Items */}
              <div className="space-y-5 mb-8">
                {checklistItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : {}}
                      transition={{ duration: 0.3, delay: 0.3 + i * 0.1, type: 'spring', stiffness: 300 }}
                    >
                      <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                    </motion.div>
                    <div>
                      <div className="text-[#031632] font-bold text-sm">{item.title}</div>
                      <div className="text-[#44474d] text-sm">{item.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Education Goal Progress Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="p-6 bg-[#f5f3ef] rounded-3xl border border-[#c5c6ce]/30 mb-4"
              >
                <div className="text-[#44474d] text-xs font-semibold uppercase tracking-wider mb-1">
                  {t.impact.educationGoal}
                </div>
                <div className="text-[#031632] font-bold mb-4">
                  {t.impact.educationGoalDescription}
                </div>
                <div className="text-[#ff8928] text-5xl font-bold mb-4">
                  <AnimatedCounter end={75} suffix="%" duration={2} />
                </div>
                <div className="w-full h-4 bg-white rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: '75%' } : {}}
                    transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
                    className="h-full bg-[#ff8928] rounded-full"
                  />
                </div>
              </motion.div>

              {/* Feeding Goal Progress Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="p-6 bg-[#f5f3ef] rounded-3xl border border-[#c5c6ce]/30"
              >
                <div className="text-[#44474d] text-xs font-semibold uppercase tracking-wider mb-1">
                  {t.impact.feedingGoal}
                </div>
                <div className="text-[#031632] font-bold mb-4">
                  {t.impact.feedingGoalDescription}
                </div>
                <div className="text-green-600 text-5xl font-bold mb-4">
                  <AnimatedCounter end={85} suffix="%" duration={2} />
                </div>
                <div className="w-full h-4 bg-white rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: '85%' } : {}}
                    transition={{ duration: 1.2, delay: 1.0, ease: 'easeOut' }}
                    className="h-full bg-green-500 rounded-full"
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative p-8 lg:p-12 flex flex-col items-center justify-between"
            >
              <div className="relative w-full">
                <div className="rounded-3xl overflow-hidden aspect-[4/3]">
                  <img
                    src="/success-story.png"
                    alt="Our Impact - Children Success Stories"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* White frame overlay decoration */}
                <div className="absolute -top-4 -right-4 w-full h-full border-4 border-white rounded-3xl -z-10" />
              </div>

              {/* CTA Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 1.0 }}
                onClick={() => router.push('/donate')}
                className="mt-8 w-full bg-[#ff8928] hover:bg-[#e67a1e] text-white font-bold py-4 px-8 rounded-[5px] transition-colors duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Heart className="h-5 w-5" />
                {t.impact.supportOurMission}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
