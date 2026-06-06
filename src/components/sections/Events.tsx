'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Calendar, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const events = [
  {
    title: 'Annual Charity Gala',
    date: 'Dec 15, 2025',
    location: 'Mwanza Convention Center',
    description:
      'Join us for an evening of celebration, fundraising, and community as we reflect on the year and look ahead to new opportunities to serve.',
    image: '/event-sample.png',
  },
  {
    title: 'Community Health Camp',
    date: 'Jan 20, 2026',
    location: 'Nyamagana District',
    description:
      'A free health screening and wellness camp for children and families in the Nyamagana district, including vaccinations and nutrition guidance.',
    image: '/event-sample.png',
  },
  {
    title: 'Back to School Drive',
    date: 'Feb 1, 2026',
    location: "Elia's Hope School",
    description:
      'Helping children start the school year right with new uniforms, school supplies, and backpacks. Volunteer or donate to support this initiative.',
    image: '/event-sample.png',
  },
]

export default function Events() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="events" ref={ref} className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-orange font-semibold text-sm uppercase tracking-wider mb-3">
            Get Involved
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Upcoming Events
          </h2>
          <div className="w-16 h-1 bg-orange mx-auto rounded-full mb-4" />
          <p className="text-text-secondary max-w-2xl mx-auto">
            Join us at our upcoming events and be part of the change. Your participation 
            makes a difference in the lives of children and families.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-navy text-white rounded-xl px-3 py-2 text-center shadow-lg">
                  <Calendar className="h-4 w-4 mx-auto mb-1 text-orange" />
                  <span className="text-xs font-semibold">{event.date}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-navy mb-2">{event.title}</h3>
                <div className="flex items-center gap-2 text-text-secondary text-sm mb-3">
                  <MapPin className="h-4 w-4 text-orange shrink-0" />
                  <span>{event.location}</span>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  {event.description}
                </p>
                <Button className="w-full bg-navy hover:bg-navy-light text-white font-semibold rounded-lg">
                  Register
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
