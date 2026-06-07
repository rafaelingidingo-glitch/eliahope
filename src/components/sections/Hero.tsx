'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, ArrowRight, ShieldCheck } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'

/** Quick-preset donation amounts in TZS */
const QUICK_AMOUNTS = [
  { label: '5K', value: 5000 },
  { label: '10K', value: 10000 },
  { label: '25K', value: 25000 },
  { label: '50K', value: 50000 },
  { label: '100K', value: 100000 },
]

/** Generate floating particle data once so it doesn't change on re-renders */
function useParticles(count: number) {
  return useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 8 + 10,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.3 + 0.1,
    }))
  }, [count])
}

export default function Hero() {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const { t } = useLanguage()
  const particles = useParticles(18)

  const handleQuickAmount = (value: number) => {
    setAmount(String(value))
  }

  const handleDonate = (donateAmount?: string) => {
    const params = new URLSearchParams()
    if (donateAmount || amount) {
      params.set('amount', donateAmount || amount)
    }
    const query = params.toString()
    router.push(query ? `/donate?${query}` : '/donate')
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

      {/* Animated Gradient Layer */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(ellipse 80% 60% at 20% 40%, rgba(255,137,40,0.12) 0%, transparent 70%)',
              'radial-gradient(ellipse 80% 60% at 70% 60%, rgba(3,22,50,0.15) 0%, transparent 70%)',
              'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,137,40,0.10) 0%, transparent 70%)',
              'radial-gradient(ellipse 80% 60% at 20% 40%, rgba(255,137,40,0.12) 0%, transparent 70%)',
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white/30"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [p.opacity, p.opacity * 1.8, p.opacity],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

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
              <span className="text-[#ff8928]">{t.hero.headlineHighlight}</span>{t.hero.headlineRest}
            </h1>

            {/* Description */}
            <p className="text-white/80 text-lg sm:text-xl leading-relaxed mb-10 max-w-lg">
              {t.hero.description}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <button
                onClick={() => handleDonate(amount)}
                className="bg-[#ff8928] text-white px-8 py-4 rounded-[5px] font-semibold flex items-center gap-2 hover:bg-[#964900] shadow-xl active:scale-95 transition-all"
              >
                <Heart className="h-5 w-5" />
                {t.hero.donateNow}
              </button>
              {/* Outlined Learn More Button */}
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="group inline-flex items-center gap-2 text-white font-semibold py-4 px-8 border-2 border-white/60 rounded-[5px] hover:bg-white/10 hover:border-white active:scale-95 transition-all"
              >
                {t.hero.learnMore}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>

          {/* Right Column - Donation Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="bg-white/95 backdrop-blur-md p-8 md:p-10 rounded-[5px] shadow-2xl border border-white/20 w-full max-w-md">
              <h3 className="text-[#031632] text-2xl font-bold mb-2">{t.hero.helpUsToday}</h3>
              <p className="text-[#44474d] text-sm mb-6">
                {t.hero.helpUsDescription}
              </p>

              {/* Amount Input */}
              <div className="relative mb-3">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#44474d] font-semibold text-sm">TSh</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-14 pr-4 py-3.5 border-2 border-[#c5c6ce] rounded-[5px] text-[#031632] font-semibold text-lg focus:outline-none focus:border-[#ff8928] transition-colors bg-white"
                  placeholder={t.hero.enterAmount}
                  min="1"
                />
              </div>

              {/* Quick Amount Presets */}
              <div className="flex gap-2 mb-5">
                {QUICK_AMOUNTS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handleQuickAmount(preset.value)}
                    className={`flex-1 py-2 rounded-[5px] text-sm font-semibold transition-all border-2 ${
                      amount === String(preset.value)
                        ? 'bg-[#ff8928] text-white border-[#ff8928] shadow-md'
                        : 'bg-white text-[#031632] border-[#c5c6ce] hover:border-[#ff8928] hover:text-[#ff8928]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Give Now Button */}
              <button
                onClick={() => handleDonate(amount)}
                className="w-full py-4 bg-[#031632] text-white rounded-[5px] font-semibold shadow-lg hover:bg-[#1a2b48] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Heart className="h-5 w-5" />
                {t.hero.giveNow}
              </button>

              {/* Secure Badge - Enhanced */}
              <div className="flex items-center justify-center gap-2 mt-5 bg-emerald-50 border border-emerald-200 rounded-[5px] py-2.5 px-4">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-700 text-xs font-semibold">{t.hero.secureDonation}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </section>
  )
}
