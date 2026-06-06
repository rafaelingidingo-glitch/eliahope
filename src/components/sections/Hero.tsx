'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChevronDown, Check, MapPin, Shield, Users } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
}

export default function Hero() {
  const handleScrollTo = (id: string) => {
    const el = document.querySelector(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 gradient-hero-overlay" />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center"
      >
        <motion.h1
          variants={itemVariants}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
        >
          Giving Hope, Education, and a{' '}
          <span className="text-orange">Brighter Future</span> to Children
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          Supporting vulnerable children and families through education, nutrition, faith, and community empowerment.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Button
            asChild
            size="lg"
            className="bg-orange hover:bg-orange-dark text-white font-semibold rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <a href="#donate" onClick={(e) => { e.preventDefault(); handleScrollTo('#donate') }}>
              Donate Now
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-2 border-white text-white hover:bg-white hover:text-navy font-semibold rounded-full px-8 py-6 text-lg transition-all"
          >
            <a href="#programs" onClick={(e) => { e.preventDefault(); handleScrollTo('#programs') }}>
              Sponsor a Child
            </a>
          </Button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-white/70 text-sm"
        >
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange" />
            <span>Registered NGO</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-orange" />
            <span>Mwanza, Tanzania</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-orange" />
            <span>Child-Focused Programs</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="cursor-pointer"
          onClick={() => handleScrollTo('#about')}
        >
          <ChevronDown className="h-8 w-8 text-white/60 hover:text-orange transition-colors" />
        </motion.div>
      </motion.div>
    </section>
  )
}
