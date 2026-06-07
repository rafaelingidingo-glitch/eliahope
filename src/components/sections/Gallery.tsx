'use client'

import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'

const categories = [
  'All',
  'Education',
  'Feeding Program',
  'Community Outreach',
  'Bible Studies',
  'Volunteers',
  'Events',
]

const galleryItems = [
  { src: '/program-education.png', category: 'Education', title: 'Children learning in class' },
  { src: '/program-feeding.png', category: 'Feeding Program', title: 'Serving nutritious meals' },
  { src: '/program-childcare.png', category: 'Community Outreach', title: 'Child care activities' },
  { src: '/program-bible.png', category: 'Bible Studies', title: 'Bible study session' },
  { src: '/program-community.png', category: 'Community Outreach', title: 'Community support programs' },
  { src: '/event-sample.png', category: 'Events', title: 'Annual charity gala' },
  { src: '/about-image.png', category: 'Volunteers', title: 'Our dedicated volunteers' },
  { src: '/success-story.png', category: 'Education', title: 'Success story celebration' },
  { src: '/hero-bg.png', category: 'Community Outreach', title: 'Community outreach day' },
  { src: '/program-education.png', category: 'Volunteers', title: 'Volunteers teaching children' },
  { src: '/program-feeding.png', category: 'Feeding Program', title: 'Meal distribution' },
  { src: '/program-bible.png', category: 'Bible Studies', title: 'Sunday school program' },
]

export default function Gallery() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedImage, setSelectedImage] = useState<typeof galleryItems[0] | null>(null)

  const filtered =
    activeCategory === 'All'
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory)

  return (
    <section id="gallery" ref={ref} className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-orange font-semibold text-sm uppercase tracking-wider mb-3">
            Visual Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Our Gallery
          </h2>
          <div className="w-16 h-1 bg-orange mx-auto rounded-full mb-4" />
          <p className="text-text-secondary max-w-2xl mx-auto">
            A glimpse into the lives we touch and the communities we serve through our programs.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-none px-4 text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-navy text-white hover:bg-navy-light'
                  : 'border-navy/20 text-navy hover:bg-navy hover:text-white'
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Masonry Grid */}
        <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <motion.div
                key={item.src + item.title}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="break-inside-avoid group cursor-pointer"
                onClick={() => setSelectedImage(item)}
              >
                <div className="relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/40 transition-colors duration-300 flex items-end">
                    <div className="p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white font-semibold text-sm">{item.title}</p>
                      <p className="text-white/70 text-xs">{item.category}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => { if (!open) setSelectedImage(null) }}>
        <DialogContent className="max-w-3xl p-0 bg-black border-none overflow-hidden">
          <DialogTitle className="sr-only">{selectedImage?.title || 'Gallery Image'}</DialogTitle>
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <p className="text-white font-semibold">{selectedImage.title}</p>
                <p className="text-white/60 text-sm">{selectedImage.category}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
