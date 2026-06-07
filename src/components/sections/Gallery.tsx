'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { useLanguage } from '@/lib/i18n'

type CategoryKey = 'all' | 'education' | 'feedingProgram' | 'communityOutreach' | 'bibleStudies' | 'volunteers' | 'events'

const categoryLabels: Record<CategoryKey, string> = {
  all: 'all',
  education: 'education',
  feedingProgram: 'feedingProgram',
  communityOutreach: 'communityOutreach',
  bibleStudies: 'bibleStudies',
  volunteers: 'volunteers',
  events: 'events',
}

const categoryOrder: CategoryKey[] = ['all', 'education', 'feedingProgram', 'communityOutreach', 'bibleStudies', 'volunteers', 'events']

export default function Gallery() {
  const { t } = useLanguage()
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all')

  const [selectedImage, setSelectedImage] = useState<{ src: string; categoryKey: CategoryKey; title: string } | null>(null)

  const galleryItems: { src: string; categoryKey: CategoryKey; title: string }[] = [
    { src: '/program-education.png', categoryKey: 'education', title: t.gallery.childrenLearning },
    { src: '/program-feeding.png', categoryKey: 'feedingProgram', title: t.gallery.servingMeals },
    { src: '/program-childcare.png', categoryKey: 'communityOutreach', title: t.gallery.childcareActivities },
    { src: '/program-bible.png', categoryKey: 'bibleStudies', title: t.gallery.bibleStudySession },
    { src: '/program-community.png', categoryKey: 'communityOutreach', title: t.gallery.communitySupportPrograms },
    { src: '/event-sample.png', categoryKey: 'events', title: t.gallery.annualCharityGala },
    { src: '/about-image.png', categoryKey: 'volunteers', title: t.gallery.dedicatedVolunteers },
    { src: '/success-story.png', categoryKey: 'education', title: t.gallery.successCelebration },
    { src: '/hero-bg.png', categoryKey: 'communityOutreach', title: t.gallery.outreachDay },
    { src: '/program-education.png', categoryKey: 'volunteers', title: t.gallery.volunteersTeaching },
    { src: '/program-feeding.png', categoryKey: 'feedingProgram', title: t.gallery.mealDistribution },
    { src: '/program-bible.png', categoryKey: 'bibleStudies', title: t.gallery.sundaySchool },
  ]

  const filtered =
    activeCategory === 'all'
      ? galleryItems
      : galleryItems.filter((item) => item.categoryKey === activeCategory)

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
            {t.gallery.subtitle}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            {t.gallery.title}
          </h2>
          <div className="w-16 h-1 bg-orange mx-auto rounded-full mb-4" />
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t.gallery.description}
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categoryOrder.map((key) => {
            const label = t.gallery[categoryLabels[key]]
            return (
              <Button
                key={key}
                variant={activeCategory === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(key)}
                className={`rounded-none px-4 text-sm font-medium transition-all ${
                  activeCategory === key
                    ? 'bg-navy text-white hover:bg-navy-light'
                    : 'border-navy/20 text-navy hover:bg-navy hover:text-white'
                }`}
              >
                {label}
              </Button>
            )
          })}
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
                      <p className="text-white/70 text-xs">{t.gallery[categoryLabels[item.categoryKey]]}</p>
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
                <p className="text-white/60 text-sm">{t.gallery[categoryLabels[selectedImage.categoryKey]]}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
