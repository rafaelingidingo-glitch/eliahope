'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ShieldCheck } from 'lucide-react'

export default function About() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="about" ref={ref} className="py-20 bg-[#fbf9f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 lg:p-16 soft-shadow border border-gray-200/10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left side - Image */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              {/* Orange blur decoration */}
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#ffdcc6]/30 rounded-full blur-3xl pointer-events-none" />
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group">
                <img
                  src="/about-image.png"
                  alt="About Elia's Hope Community"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Overlay stat card */}
                <div className="absolute bottom-6 left-6 right-6 p-6 bg-[#031632]/95 backdrop-blur-sm rounded-xl text-white">
                  <div className="text-4xl font-bold">100+</div>
                  <div className="text-[#ff8928] font-medium">Children Empowered</div>
                </div>
              </div>
            </motion.div>

            {/* Right side - Content */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <span className="text-[#ff8928] font-bold text-xs uppercase tracking-widest mb-4 block">
                OUR STORY
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#031632] mb-6">
                Supporting Vulnerable Children in Mwanza
              </h2>
              <p className="text-[#44474d] leading-relaxed mb-4">
                Elia&apos;s Hope Community is a registered non-governmental organization based in Mwanza, Tanzania, 
                dedicated to transforming the lives of vulnerable children and families. Founded with a deep commitment 
                to child welfare, we provide holistic support encompassing education, nutrition, spiritual development, 
                and community empowerment.
              </p>
              <p className="text-[#44474d] leading-relaxed mb-8">
                Through the generosity of our sponsors, volunteers, and partners, we continue 
                to create lasting change and build a brighter future for the next generation. Every child deserves 
                the chance to thrive, and we work tirelessly to make that a reality.
              </p>

              {/* NGO Registration Badge */}
              <div className="inline-flex items-center gap-4 p-5 bg-[#f5f3ef] rounded-2xl border border-[#c5c6ce]/40">
                <div className="w-12 h-12 bg-[#031632] rounded-xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-6 w-6 text-[#ff8928]" />
                </div>
                <div>
                  <div className="text-[#031632] font-bold text-sm">Registered NGO</div>
                  <div className="text-[#44474d] text-xs">Reg No: ooNGO/R/6243 | Mwanza, Tanzania</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
