'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { GraduationCap, UtensilsCrossed, Heart, BookOpen, Users, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'

export default function Programs() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const { t } = useLanguage()

  return (
    <section id="programs" ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-[#ff8928] font-bold text-xs uppercase tracking-widest mb-4 block">
            {t.programs.ourPrograms}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#031632] mb-4">
            {t.programs.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          {/* Education Card - 3 cols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-1 lg:col-span-3 bg-white p-8 lg:p-12 rounded-3xl soft-shadow border border-gray-200/10 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          >
            <div className="w-14 h-14 bg-[#ffdcc6]/50 rounded-2xl flex items-center justify-center mb-6">
              <GraduationCap className="h-7 w-7 text-[#ff8928]" />
            </div>
            <h3 className="text-2xl font-bold text-[#031632] mb-3">{t.programs.education}</h3>
            <p className="text-[#44474d] leading-relaxed mb-6">
              {t.programs.educationDescription}
            </p>
            <div className="overflow-hidden rounded-2xl aspect-video">
              <img
                src="/program-education.png"
                alt="Education Program"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 text-[#ff8928] font-semibold text-sm mt-6 hover:gap-2.5 transition-all duration-300"
            >
              {t.programs.learnMore}
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>

          {/* Feeding Program Card - 3 cols, Navy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-1 lg:col-span-3 bg-[#031632] text-white p-8 lg:p-12 rounded-3xl hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          >
            <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
              <UtensilsCrossed className="h-7 w-7 text-[#ff8928]" />
            </div>
            <h3 className="text-2xl font-bold mb-3">{t.programs.feedingProgram}</h3>
            <p className="text-white/80 leading-relaxed mb-6">
              {t.programs.feedingDescription}
            </p>
            <div className="overflow-hidden rounded-2xl aspect-video mb-6">
              <img
                src="/program-feeding.png"
                alt="Feeding Program"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Stat Cards */}
            <div className="flex gap-4">
              <div className="bg-white/10 p-5 rounded-2xl flex-1 border border-white/10">
                <div className="text-3xl font-bold text-[#ff8928]">300+</div>
                <div className="text-white/80 text-sm mt-1">{t.programs.weeklyMeals}</div>
              </div>
              <div className="bg-white/10 p-5 rounded-2xl flex-1 border border-white/10">
                <div className="text-3xl font-bold text-[#ff8928]">{t.programs.nutritious}</div>
                <div className="text-white/80 text-sm mt-1">{t.programs.healthyDiet}</div>
              </div>
            </div>
            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 text-[#ff8928] font-semibold text-sm mt-6 hover:gap-2.5 transition-all duration-300"
            >
              {t.programs.learnMore}
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>

          {/* Child Care - 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-1 lg:col-span-2 bg-white p-8 rounded-3xl soft-shadow border border-gray-200/10 border-l-4 border-l-[#ff8928] hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="overflow-hidden rounded-xl w-20 h-20 shrink-0">
                <img
                  src="/program-childcare.png"
                  alt={t.programs.childCareImageAlt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-12 h-12 bg-[#ffdcc6]/50 rounded-2xl flex items-center justify-center shrink-0">
                <Heart className="h-6 w-6 text-[#ff8928]" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#031632] mb-3">{t.programs.childCare}</h3>
            <p className="text-[#44474d] text-sm leading-relaxed mb-4">
              {t.programs.childCareDescription}
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 text-[#ff8928] font-semibold text-sm hover:gap-2.5 transition-all duration-300"
            >
              {t.programs.learnMore}
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>

          {/* Bible Study - 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:col-span-1 lg:col-span-2 bg-white p-8 rounded-3xl soft-shadow border border-gray-200/10 border-l-4 border-l-[#031632] hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="overflow-hidden rounded-xl w-20 h-20 shrink-0">
                <img
                  src="/program-bible.png"
                  alt={t.programs.bibleStudyImageAlt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-12 h-12 bg-[#031632]/10 rounded-2xl flex items-center justify-center shrink-0">
                <BookOpen className="h-6 w-6 text-[#031632]" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#031632] mb-3">{t.programs.bibleStudy}</h3>
            <p className="text-[#44474d] text-sm leading-relaxed mb-4">
              {t.programs.bibleStudyDescription}
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 text-[#031632] font-semibold text-sm hover:gap-2.5 transition-all duration-300"
            >
              {t.programs.learnMore}
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>

          {/* Community Support - 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="md:col-span-1 lg:col-span-2 bg-white p-8 rounded-3xl soft-shadow border border-gray-200/10 border-l-4 border-l-green-500 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="overflow-hidden rounded-xl w-20 h-20 shrink-0">
                <img
                  src="/program-community.png"
                  alt={t.programs.communitySupportImageAlt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#031632] mb-3">{t.programs.communitySupport}</h3>
            <p className="text-[#44474d] text-sm leading-relaxed mb-4">
              {t.programs.communitySupportDescription}
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 text-green-600 font-semibold text-sm hover:gap-2.5 transition-all duration-300"
            >
              {t.programs.learnMore}
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
