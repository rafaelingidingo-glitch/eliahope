'use client'

import { useRef, useState, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'

const stories = [
  {
    name: 'Grace',
    title: "Grace's Journey",
    quote: 'Before Elia\'s Hope, I didn\'t know if I would ever go to school. Now I am top of my class and dreaming of becoming a doctor.',
    before: 'Grace was a struggling orphan living in extreme poverty with no access to education or regular meals. Her future seemed bleak, and hope was fading.',
    after: 'Through the education and feeding programs at Elia\'s Hope, Grace now attends school regularly, receives nutritious meals, and has risen to the top of her class. She dreams of becoming a doctor to help other children like herself.',
    image: '/success-story.png',
    featured: true,
  },
  {
    name: 'Joseph',
    title: "Joseph's Story",
    quote: 'The feeding program saved my life. Now I am strong enough to go to school and help my family.',
    before: 'Joseph was severely malnourished and unable to attend school. His family struggled to provide even one meal a day.',
    after: 'After joining the feeding program, Joseph received daily nutritious meals. His health improved dramatically, and he is now an active student who also helps his younger siblings with their homework.',
    image: '/success-story.png',
    featured: false,
  },
  {
    name: 'Maria',
    title: "Maria's Hope",
    quote: 'From the streets to a safe home — I never imagined I would have a bed to sleep in and books to read.',
    before: 'Maria lived on the streets after losing her parents. She had no shelter, no food, and no one to care for her.',
    after: 'Elia\'s Hope Community took Maria in, providing her with a safe home, education, and a loving community. Today, Maria is thriving and has become a mentor to younger children in the program.',
    image: '/success-story.png',
    featured: false,
  },
]

export default function SuccessStories() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => setCurrent((p) => (p + 1) % stories.length), [])
  const prev = useCallback(() => setCurrent((p) => (p - 1 + stories.length) % stories.length), [])

  const story = stories[current]

  return (
    <section id="stories" ref={ref} className="py-20 md:py-28 bg-[#f5f3ef]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-orange font-semibold text-sm uppercase tracking-wider mb-3">
            Real Lives, Real Change
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Success Stories
          </h2>
          <div className="w-16 h-1 bg-orange mx-auto rounded-full mb-4" />
          <p className="text-text-secondary max-w-2xl mx-auto">
            Every child has a story of hope and transformation. Meet the children whose lives have been 
            changed through our programs.
          </p>
        </motion.div>

        {/* Featured Story Card */}
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="grid md:grid-cols-2">
            {/* Image */}
            <div className="relative h-64 md:h-auto min-h-[320px]">
              <img
                src={story.image}
                alt={story.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 md:bg-gradient-to-l md:from-transparent md:to-white/10" />
              <div className="absolute top-4 left-4 bg-orange text-white px-3 py-1 rounded-full text-sm font-semibold">
                Featured Story
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-bold text-navy mb-4">{story.title}</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400">Before</span>
                  <p className="text-text-secondary text-sm mt-1">{story.before}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-green-500">After</span>
                  <p className="text-text-secondary text-sm mt-1">{story.after}</p>
                </div>
              </div>

              <div className="bg-orange/5 border-l-4 border-orange rounded-r-lg p-4 mb-6">
                <Quote className="h-5 w-5 text-orange mb-2" />
                <p className="text-navy italic text-sm leading-relaxed">{story.quote}</p>
                <p className="text-orange font-semibold mt-2 text-sm">— {story.name}</p>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prev}
                    className="rounded-none border-navy/20 hover:bg-navy hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={next}
                    className="rounded-none border-navy/20 hover:bg-navy hover:text-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  {stories.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i === current ? 'bg-orange w-6' : 'bg-navy/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
