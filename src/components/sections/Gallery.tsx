'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
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

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const lightboxPrev = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + filtered.length) % filtered.length)
  }, [lightboxIndex, filtered.length])

  const lightboxNext = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % filtered.length)
  }, [lightboxIndex, filtered.length])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') lightboxPrev()
      if (e.key === 'ArrowRight') lightboxNext()
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, lightboxPrev, lightboxNext])

  const selectedItem = lightboxIndex !== null ? filtered[lightboxIndex] : null

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
          <p className="text-navy/50 text-sm font-medium mt-2">
            {galleryItems.length} {t.gallery.photos}
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categoryOrder.map((key) => {
            const label = t.gallery[categoryLabels[key]]
            const isAll = key === 'all'
            return (
              <Button
                key={key}
                variant={activeCategory === key ? 'default' : 'outline'}
                size={isAll ? 'default' : 'sm'}
                onClick={() => setActiveCategory(key)}
                className={`rounded-none font-medium transition-all ${
                  isAll ? 'px-6 h-10 text-sm' : 'px-4 text-sm'
                } ${
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
                onClick={() => openLightbox(i)}
              >
                <div className="relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/40 transition-colors duration-300 flex items-end">
                    <div className="p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-1">
                      <p className="text-white font-semibold text-sm">{item.title}</p>
                      <p className="text-white/70 text-xs">{t.gallery[categoryLabels[item.categoryKey]]}</p>
                    </div>
                    {/* Zoom icon overlay */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                        <ZoomIn className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => { if (!open) closeLightbox() }}>
        <DialogContent className="max-w-3xl p-0 bg-black border-none overflow-hidden">
          <DialogTitle className="sr-only">{selectedItem?.title || 'Gallery Image'}</DialogTitle>
          {selectedItem && (
            <div className="relative">
              <img
                src={selectedItem.src}
                alt={selectedItem.title}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              {/* Left arrow */}
              <button
                onClick={(e) => { e.stopPropagation(); lightboxPrev() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
                aria-label={t.gallery.previousImage}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {/* Right arrow */}
              <button
                onClick={(e) => { e.stopPropagation(); lightboxNext() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
                aria-label={t.gallery.nextImage}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              {/* Bottom info bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <p className="text-white font-semibold">{selectedItem.title}</p>
                <p className="text-white/60 text-sm">{t.gallery[categoryLabels[selectedItem.categoryKey]]}</p>
                <p className="text-white/40 text-xs mt-1">{(lightboxIndex ?? 0) + 1} / {filtered.length}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
