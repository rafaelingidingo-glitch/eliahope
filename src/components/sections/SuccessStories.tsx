'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote, Share2, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n'

interface SuccessStoriesProps {
  onDonateClick?: () => void
}

export default function SuccessStories({ onDonateClick }: SuccessStoriesProps) {
  const { t } = useLanguage()
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const stories = [
    {
      name: 'Grace',
      title: t.stories.graceTitle,
      quote: t.stories.graceQuote,
      before: t.stories.graceBefore,
      after: t.stories.graceAfter,
      image: '/success-story.png',
      featured: true,
    },
    {
      name: 'Joseph',
      title: t.stories.josephTitle,
      quote: t.stories.josephQuote,
      before: t.stories.josephBefore,
      after: t.stories.josephAfter,
      image: '/success-story.png',
      featured: false,
    },
    {
      name: 'Maria',
      title: t.stories.mariaTitle,
      quote: t.stories.mariaQuote,
      before: t.stories.mariaBefore,
      after: t.stories.mariaAfter,
      image: '/success-story.png',
      featured: false,
    },
  ]

  const next = useCallback(() => setCurrent((p) => (p + 1) % stories.length), [stories.length])
  const prev = useCallback(() => setCurrent((p) => (p - 1 + stories.length) % stories.length), [stories.length])

  // Auto-play: advance every 6 seconds, pause on hover
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      next()
    }, 6000)
    return () => clearInterval(timer)
  }, [isPaused, next])

  const handleShare = async () => {
    const story = stories[current]
    const shareText = t.stories.shareText.replace('{name}', story.name)
    const shareData = {
      title: story.title,
      text: shareText,
      url: typeof window !== 'undefined' ? window.location.href : '',
    }
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareData.url}`)
      } catch {
        // Clipboard not available
      }
    }
  }

  const story = stories[current]

  return (
    <section
      id="stories"
      ref={ref}
      className="py-20 md:py-28 bg-[#f5f3ef]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-orange font-semibold text-sm uppercase tracking-wider mb-3">
            {t.stories.subtitle}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            {t.stories.title}
          </h2>
          <div className="w-16 h-1 bg-orange mx-auto rounded-full mb-4" />
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t.stories.description}
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
                {t.stories.featuredStory}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-bold text-navy mb-4">{story.title}</h3>

              <div className="space-y-3 mb-6">
                <div className="bg-red-50 border-l-4 border-red-300 rounded-r-lg p-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-500">{t.stories.before}</span>
                  <p className="text-text-secondary text-sm mt-1">{story.before}</p>
                </div>
                <div className="bg-green-50 border-l-4 border-green-400 rounded-r-lg p-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-green-600">{t.stories.after}</span>
                  <p className="text-text-secondary text-sm mt-1">{story.after}</p>
                </div>
              </div>

              <div className="bg-orange/5 border-l-4 border-orange rounded-r-lg p-4 mb-6">
                <Quote className="h-5 w-5 text-orange mb-2" />
                <p className="text-navy italic text-sm leading-relaxed">{story.quote}</p>
                <p className="text-orange font-semibold mt-2 text-sm">— {story.name}</p>
              </div>

              {/* Navigation + Share */}
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
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="rounded-none border-orange/30 text-orange hover:bg-orange hover:text-white text-xs gap-1.5"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    {t.stories.shareStory}
                  </Button>
                  <div className="flex gap-2.5">
                    {stories.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        aria-label={`Go to story ${i + 1}`}
                        className={`h-3 rounded-full transition-all ${
                          i === current ? 'bg-orange w-8' : 'bg-navy/20 w-3'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicator Bar */}
          <div className="h-1 bg-navy/5 w-full">
            <div className="h-full bg-orange transition-all duration-500 ease-out" style={{ width: `${((current + 1) / stories.length) * 100}%` }} />
          </div>
        </motion.div>

        {/* Help More Children CTA */}
        {onDonateClick && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 text-center"
          >
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-md border border-orange/10 inline-block max-w-lg">
              <Heart className="h-8 w-8 text-orange mx-auto mb-3" />
              <h3 className="text-xl font-bold text-navy mb-2">{t.stories.helpMoreChildren}</h3>
              <p className="text-text-secondary text-sm mb-4">{t.stories.helpMoreChildrenDesc}</p>
              <Button
                onClick={onDonateClick}
                className="bg-orange hover:bg-orange/90 text-white font-semibold rounded-none px-8 h-12"
              >
                {t.stories.helpMoreChildren}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
