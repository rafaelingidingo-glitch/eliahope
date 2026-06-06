'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Calendar } from 'lucide-react'

const events = [
  {
    title: 'Annual Charity Gala',
    date: 'Aug 15, 2026',
    description:
      'Join us for an evening of celebration, fundraising, and community as we reflect on the year and look ahead to new opportunities to serve.',
    image: '/event-sample.png',
  },
  {
    title: 'Community Health Camp',
    date: 'Sep 20, 2026',
    description:
      'A free health screening and wellness camp for children and families in the Nyamagana district, including vaccinations and nutrition guidance.',
    image: '/event-sample.png',
  },
]

interface EventsProps {
  onDonateClick?: (campaignId?: string, amount?: string) => void
}

export default function Events({ onDonateClick }: EventsProps) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="events" ref={ref} className="py-20 bg-[#fbf9f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-[#ff8928] font-bold text-xs uppercase tracking-widest mb-4 block">
            GET INVOLVED
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#031632] mb-4">
            Upcoming Events
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {events.map((event, i) => (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-white rounded-3xl overflow-hidden soft-shadow border border-gray-200/10"
            >
              {/* Image */}
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              {/* Content */}
              <div className="p-10">
                {/* Date Badge */}
                <div className="inline-flex items-center gap-2 text-[#ff8928] px-3 py-1 bg-[#ffdcc6]/30 rounded-lg mb-4">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-semibold">{event.date}</span>
                </div>
                <h3 className="text-xl font-bold text-[#031632] mb-3">{event.title}</h3>
                <p className="text-[#44474d] text-sm leading-relaxed mb-6">
                  {event.description}
                </p>
                <button
                  onClick={() => onDonateClick?.()}
                  className="w-full py-4 border-2 border-[#031632] text-[#031632] font-bold rounded-xl hover:bg-[#031632] hover:text-white transition-all"
                >
                  Donate Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
