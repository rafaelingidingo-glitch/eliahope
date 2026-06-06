'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { GraduationCap, UtensilsCrossed, Heart, BookOpen, Users } from 'lucide-react'

export default function Programs() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

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
            OUR PROGRAMS
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#031632] mb-4">
            Nurturing Growth in Five Key Areas
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {/* Education Card - 3 cols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-3 bg-white p-8 lg:p-12 rounded-3xl soft-shadow border border-gray-200/10"
          >
            <div className="w-14 h-14 bg-[#ffdcc6]/50 rounded-2xl flex items-center justify-center mb-6">
              <GraduationCap className="h-7 w-7 text-[#ff8928]" />
            </div>
            <h3 className="text-2xl font-bold text-[#031632] mb-3">Education</h3>
            <p className="text-[#44474d] leading-relaxed mb-6">
              Providing quality education, school supplies, and tuition support to ensure every child 
              has the opportunity to learn and succeed academically.
            </p>
            <div className="overflow-hidden rounded-2xl aspect-video">
              <img
                src="/program-education.png"
                alt="Education Program"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </motion.div>

          {/* Feeding Program Card - 3 cols, Navy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-3 bg-[#031632] text-white p-8 lg:p-12 rounded-3xl"
          >
            <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
              <UtensilsCrossed className="h-7 w-7 text-[#ff8928]" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Feeding Program</h3>
            <p className="text-white/80 leading-relaxed mb-6">
              Ensuring no child goes hungry by providing nutritious daily meals to vulnerable children 
              and families in our community.
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
                <div className="text-white/80 text-sm mt-1">Weekly Meals</div>
              </div>
              <div className="bg-white/10 p-5 rounded-2xl flex-1 border border-white/10">
                <div className="text-3xl font-bold text-[#ff8928]">Nutritious</div>
                <div className="text-white/80 text-sm mt-1">Healthy Diet</div>
              </div>
            </div>
          </motion.div>

          {/* Child Care - 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-2 bg-white p-8 rounded-3xl soft-shadow border border-gray-200/10"
          >
            <div className="w-14 h-14 bg-[#ffdcc6]/50 rounded-2xl flex items-center justify-center mb-6">
              <Heart className="h-7 w-7 text-[#ff8928]" />
            </div>
            <h3 className="text-xl font-bold text-[#031632] mb-3">Child Care</h3>
            <p className="text-[#44474d] text-sm leading-relaxed">
              Creating a safe and nurturing environment for children, protecting them from abuse, 
              neglect, and exploitation.
            </p>
          </motion.div>

          {/* Bible Study - 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:col-span-2 bg-white p-8 rounded-3xl soft-shadow border border-gray-200/10"
          >
            <div className="w-14 h-14 bg-[#ffdcc6]/50 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="h-7 w-7 text-[#ff8928]" />
            </div>
            <h3 className="text-xl font-bold text-[#031632] mb-3">Bible Study</h3>
            <p className="text-[#44474d] text-sm leading-relaxed">
              Nurturing the spiritual growth of children and families through Bible study, 
              prayer, and faith-based mentorship programs.
            </p>
          </motion.div>

          {/* Community Support - 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="md:col-span-2 bg-white p-8 rounded-3xl soft-shadow border border-gray-200/10"
          >
            <div className="w-14 h-14 bg-[#ffdcc6]/50 rounded-2xl flex items-center justify-center mb-6">
              <Users className="h-7 w-7 text-[#ff8928]" />
            </div>
            <h3 className="text-xl font-bold text-[#031632] mb-3">Community Support</h3>
            <p className="text-[#44474d] text-sm leading-relaxed">
              Empowering families and communities through skills training, health education, 
              and sustainable livelihood programs.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
