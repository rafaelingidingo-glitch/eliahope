'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, ArrowRight, Lock } from 'lucide-react'

export default function Hero() {
  const [amount, setAmount] = useState('50000')
  const [presetActive, setPresetActive] = useState(50000)

  const handleScrollTo = (id: string) => {
    const el = document.querySelector(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <img
        src="/hero-bg.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Overlay */}
      <div className="hero-overlay absolute inset-0" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28 pb-20 lg:pt-36 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Headline */}
            <h1 className="text-[44px] sm:text-[48px] lg:text-[64px] lg:leading-[1.1] mb-6 drop-shadow-lg font-bold text-white">
              Giving Hope, Education, and a Brighter Future
            </h1>

            {/* Description */}
            <p className="text-white/80 text-lg sm:text-xl leading-relaxed mb-10 max-w-lg">
              We empower vulnerable children and families in Mwanza, Tanzania through education, healthcare, and community-driven support programs.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <button
                onClick={() => handleScrollTo('#take-action')}
                className="bg-[#ff8928] text-white px-8 py-4 rounded-full font-semibold flex items-center gap-2 hover:bg-[#964900] shadow-xl active:scale-95 transition-all"
              >
                <Heart className="h-5 w-5" />
                How You Can Help
              </button>
              <button
                onClick={() => handleScrollTo('#about')}
                className="group inline-flex items-center gap-2 text-white font-bold hover:text-[#ffdcc6] transition-colors py-4"
              >
                Learn More
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Right Column - Donation Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="bg-white/95 backdrop-blur-md p-8 md:p-10 rounded-[2rem] shadow-2xl border border-white/20 w-full max-w-md">
              <h3 className="text-[#031632] text-2xl font-bold mb-2">Help Us Today</h3>
              <p className="text-[#44474d] text-sm mb-6">
                Your support provides meals and school fees for children in need.
              </p>

              {/* Amount Input */}
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#44474d] font-semibold text-sm">TSh</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value)
                    setPresetActive(0)
                  }}
                  className="w-full pl-14 pr-4 py-3.5 border-2 border-[#c5c6ce] rounded-xl text-[#031632] font-semibold text-lg focus:outline-none focus:border-[#ff8928] transition-colors bg-white"
                  placeholder="Enter amount"
                />
              </div>

              {/* Preset Amounts */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[10000, 50000, 100000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setAmount(String(preset))
                      setPresetActive(preset)
                    }}
                    className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                      presetActive === preset
                        ? 'bg-[#ff8928] text-white shadow-md'
                        : 'bg-[#f5f3ef] text-[#44474d] hover:bg-[#ffdcc6]/40'
                    }`}
                  >
                    TSh {preset.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Give Now Button */}
              <button
                onClick={() => handleScrollTo('#donate')}
                className="w-full py-4 bg-[#031632] text-white rounded-xl font-semibold shadow-lg hover:bg-[#1a2b48] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Heart className="h-5 w-5" />
                Give Now
              </button>

              {/* Secure Badge */}
              <div className="flex items-center justify-center gap-2 mt-5 text-[#44474d] text-xs">
                <Lock className="h-3.5 w-3.5" />
                <span>Secure &amp; Transparent Donation</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
