'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Eye, Flag } from 'lucide-react'

export default function VisionMission() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-20 bg-[#f5f3ef]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Vision Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="bg-[#1a2b48] text-white p-10 lg:p-14 rounded-3xl shadow-xl relative overflow-hidden"
          >
            {/* Decorative blur */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#ff8928]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
                <Eye className="h-8 w-8 text-[#ff8928]" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">Our Vision</h3>
              <p className="text-white/80 leading-relaxed">
                A world where every child has access to education, nutrition, safety, and the opportunity 
                to thrive within a supportive community rooted in faith and love. We envision communities 
                where no child is left behind and every family has the resources they need to flourish.
              </p>
            </div>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-[#031632] text-white p-10 lg:p-14 rounded-3xl shadow-xl relative overflow-hidden"
          >
            {/* Decorative blur */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#ff8928]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
                <Flag className="h-8 w-8 text-[#ff8928]" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">Our Mission</h3>
              <p className="text-white/80 leading-relaxed">
                To provide hope, education, and support to vulnerable children and families, empowering 
                them to reach their full potential through compassionate care and community development. 
                We are committed to holistic transformation that addresses physical, spiritual, and educational needs.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
