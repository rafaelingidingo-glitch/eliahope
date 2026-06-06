'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'

const testimonials = [
  {
    name: 'Amina Juma',
    role: 'Parent',
    quote:
      'My children are thriving thanks to the feeding program. They come home happy, healthy, and eager to share what they learned. Elia\'s Hope has been a blessing to our family.',
    rating: 5,
  },
  {
    name: 'David Kimaro',
    role: 'Volunteer',
    quote:
      'Volunteering at Elia\'s Hope changed my life. Seeing the joy on the children\'s faces when they receive a meal or learn something new is the most rewarding experience.',
    rating: 5,
  },
  {
    name: 'Sarah Anderson',
    role: 'Sponsor',
    quote:
      'Knowing my contribution helps a child get education and nutritious meals gives me so much joy. The transparency and dedication of this organization is truly commendable.',
    rating: 5,
  },
  {
    name: 'Chief Richard Mwita',
    role: 'Community Leader',
    quote:
      'This organization has transformed our community. Children who had no hope are now excelling in school, and families are being empowered to build better lives.',
    rating: 5,
  },
]

export default function Testimonials() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [current, setCurrent] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const next = useCallback(() => setCurrent((p) => (p + 1) % testimonials.length), [])
  const prev = useCallback(() => setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length), [])

  useEffect(() => {
    if (!isAutoPlaying) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [isAutoPlaying, next])

  const handleManualNav = (direction: 'next' | 'prev') => {
    setIsAutoPlaying(false)
    if (direction === 'next') next()
    else prev()
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  return (
    <section ref={ref} className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-orange font-semibold text-sm uppercase tracking-wider mb-3">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            What People Say
          </h2>
          <div className="w-16 h-1 bg-orange mx-auto rounded-full mb-4" />
          <p className="text-text-secondary max-w-2xl mx-auto">
            Hear from the people whose lives have been touched by our work — parents, volunteers, 
            sponsors, and community leaders.
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-light-gray rounded-2xl p-8 md:p-12 text-center relative"
          >
            <Quote className="h-10 w-10 text-orange/20 mx-auto mb-6" />

            <p className="text-navy text-lg md:text-xl leading-relaxed mb-8 max-w-3xl mx-auto italic">
              &ldquo;{testimonials[current].quote}&rdquo;
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-1 mb-4">
              {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                <Star key={i} className="h-5 w-5 text-orange fill-orange" />
              ))}
            </div>

            {/* Avatar placeholder */}
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-navy flex items-center justify-center text-white font-bold text-lg">
                {testimonials[current].name.charAt(0)}
              </div>
            </div>

            <p className="text-navy font-bold">{testimonials[current].name}</p>
            <p className="text-text-secondary text-sm">{testimonials[current].role}</p>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleManualNav('prev')}
              className="rounded-full border-navy/20 hover:bg-navy hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrent(i); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 10000) }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === current ? 'bg-orange w-6' : 'bg-navy/20 hover:bg-navy/40'
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleManualNav('next')}
              className="rounded-full border-navy/20 hover:bg-navy hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
