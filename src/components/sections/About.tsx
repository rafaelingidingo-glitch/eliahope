'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Heart, Shield, Sparkles, UserCheck, Users, Eye, GraduationCap } from 'lucide-react'

const coreValues = [
  { icon: Heart, label: 'Love and Compassion' },
  { icon: Shield, label: 'Integrity and Accountability' },
  { icon: Sparkles, label: 'Faith and Hope' },
  { icon: UserCheck, label: 'Child Protection' },
  { icon: Users, label: 'Community Service' },
  { icon: Eye, label: 'Transparency' },
  { icon: GraduationCap, label: 'Excellence in Education' },
]

export default function About() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="about" ref={ref} className="py-20 md:py-28 bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/about-image.png"
                alt="About Elia's Hope Community"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/30 to-transparent" />
            </div>
            {/* Accent decoration */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange/20 rounded-2xl -z-10" />
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-navy/10 rounded-xl -z-10" />
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="inline-block text-orange font-semibold text-sm uppercase tracking-wider mb-3">
              About Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
              About Elia&apos;s Hope Community
            </h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              Elia&apos;s Hope Community is a registered non-governmental organization based in Mwanza, Tanzania, 
              dedicated to transforming the lives of vulnerable children and families. Founded with a deep commitment 
              to child welfare, we provide holistic support encompassing education, nutrition, spiritual development, 
              and community empowerment. Through the generosity of our sponsors, volunteers, and partners, we continue 
              to create lasting change and build a brighter future for the next generation.
            </p>

            {/* Mission & Vision */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-navy font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange rounded-full" />
                  Our Mission
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  To provide hope, education, and support to vulnerable children and families, empowering them to 
                  reach their full potential through compassionate care and community development.
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-navy font-bold text-lg mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange rounded-full" />
                  Our Vision
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  A world where every child has access to education, nutrition, safety, and the opportunity to thrive 
                  within a supportive community rooted in faith and love.
                </p>
              </div>
            </div>

            {/* Core Values */}
            <h3 className="text-navy font-bold text-lg mb-4">Our Core Values</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {coreValues.map((value, i) => {
                const Icon = value.icon
                return (
                  <motion.div
                    key={value.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.05 }}
                    className="bg-white rounded-lg p-3 flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow border border-gray-50"
                  >
                    <div className="bg-orange/10 p-1.5 rounded-md shrink-0">
                      <Icon className="h-4 w-4 text-orange" />
                    </div>
                    <span className="text-xs font-medium text-navy leading-tight">{value.label}</span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
