'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { GraduationCap, UtensilsCrossed, Heart, BookOpen, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

const programs = [
  {
    title: 'Education',
    image: '/program-education.png',
    icon: GraduationCap,
    description:
      'Providing quality education, school supplies, and tuition support to ensure every child has the opportunity to learn and succeed academically.',
  },
  {
    title: 'Feeding Program',
    image: '/program-feeding.png',
    icon: UtensilsCrossed,
    description:
      'Ensuring no child goes hungry by providing nutritious daily meals to vulnerable children and families in our community.',
  },
  {
    title: 'Child Care & Protection',
    image: '/program-childcare.png',
    icon: Heart,
    description:
      'Creating a safe and nurturing environment for children, protecting them from abuse, neglect, and exploitation.',
  },
  {
    title: 'Bible Study & Spiritual Development',
    image: '/program-bible.png',
    icon: BookOpen,
    description:
      'Nurturing the spiritual growth of children and families through Bible study, prayer, and faith-based mentorship programs.',
  },
  {
    title: 'Community Support',
    image: '/program-community.png',
    icon: Users,
    description:
      'Empowering families and communities through skills training, health education, and sustainable livelihood programs.',
  },
]

export default function Programs() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="programs" ref={ref} className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-orange font-semibold text-sm uppercase tracking-wider mb-3">
            What We Do
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Our Programs
          </h2>
          <div className="w-16 h-1 bg-orange mx-auto rounded-full mb-4" />
          <p className="text-text-secondary max-w-2xl mx-auto">
            Through our comprehensive programs, we address the holistic needs of children and families, 
            creating pathways to a brighter future.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program, i) => {
            const Icon = program.icon
            return (
              <motion.div
                key={program.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 bg-orange p-2.5 rounded-full shadow-lg">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-navy mb-2">{program.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed mb-4">
                    {program.description}
                  </p>
                  <Button
                    variant="link"
                    className="text-orange hover:text-orange-dark p-0 font-semibold text-sm"
                  >
                    Learn More →
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
