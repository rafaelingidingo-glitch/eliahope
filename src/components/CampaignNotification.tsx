'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, TrendingUp, ArrowRight, Clock } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useLanguage } from '@/lib/i18n'

interface Campaign {
  id: string
  title: string
  description: string
  goal: number
  raised: number
  percentage: number
  remaining: number
  status: string
}

interface CampaignNotificationProps {
  onDonateClick: (campaignId?: string, amount?: string) => void
}

const NOTIFICATION_DELAY = 3000 // 3 seconds after page load
const SESSION_KEY = 'elia_hope_campaign_dismissed'
const SNOOZE_KEY = 'elia_hope_campaign_snoozed_until'
const AUTO_DISMISS_MS = 15000 // 15 seconds
const SNOOZE_DURATION_MS = 5 * 60 * 1000 // 5 minutes

export default function CampaignNotification({ onDonateClick }: CampaignNotificationProps) {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pausedElapsedRef = useRef<number>(0)

  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem(SESSION_KEY)) return true
      const snoozedUntil = localStorage.getItem(SNOOZE_KEY)
      if (snoozedUntil && Date.now() < parseInt(snoozedUntil, 10)) return true
    }
    return false
  })

  useEffect(() => {
    if (dismissed) return

    let cancelled = false
    async function loadCampaign() {
      try {
        const res = await fetch('/api/donate/campaigns')
        if (res.ok && !cancelled) {
          const data = await res.json()
          const campaigns: Campaign[] = data.campaigns || []
          if (campaigns.length > 0) {
            setCampaign(campaigns[0])
          }
        }
      } catch {
        // Silent fail
      }
    }
    loadCampaign()
    return () => { cancelled = true }
  }, [dismissed])

  useEffect(() => {
    if (!campaign || dismissed) return

    const timer = setTimeout(() => {
      setVisible(true)
    }, NOTIFICATION_DELAY)

    return () => clearTimeout(timer)
  }, [campaign, dismissed])

  const handleDismiss = useCallback(() => {
    setVisible(false)
    setDismissed(true)
    sessionStorage.setItem(SESSION_KEY, 'true')
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current)
      dismissTimerRef.current = null
    }
  }, [])

  const handleRemindLater = useCallback(() => {
    setVisible(false)
    const snoozeUntil = Date.now() + SNOOZE_DURATION_MS
    localStorage.setItem(SNOOZE_KEY, snoozeUntil.toString())
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current)
      dismissTimerRef.current = null
    }
    setTimeout(() => {
      setDismissed(false)
      localStorage.removeItem(SNOOZE_KEY)
    }, SNOOZE_DURATION_MS)
  }, [])

  // Auto-dismiss timer — pauses when hovered
  useEffect(() => {
    if (!visible) return

    pausedElapsedRef.current = 0
    const startTime = Date.now()

    const scheduleDismiss = (remainingMs: number) => {
      dismissTimerRef.current = setTimeout(() => {
        handleDismiss()
      }, remainingMs)
    }

    scheduleDismiss(AUTO_DISMISS_MS)

    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current)
        dismissTimerRef.current = null
      }
    }
  }, [visible, handleDismiss])

  // Handle hover pause/resume for the auto-dismiss timer
  useEffect(() => {
    if (!visible) return

    if (isHovered) {
      // Pause: clear the timer and record how much time has elapsed
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current)
        dismissTimerRef.current = null
      }
      // We track paused elapsed via a ref set on the next resume
      pausedElapsedRef.current = pausedElapsedRef.current || 0
    } else {
      // Resume: calculate remaining time and reschedule
      // Since we can't easily know exact elapsed, we use a simple approach:
      // Track total paused time and adjust
      if (!dismissTimerRef.current) {
        const remainingMs = Math.max(0, AUTO_DISMISS_MS - pausedElapsedRef.current)
        if (remainingMs > 0) {
          dismissTimerRef.current = setTimeout(() => {
            handleDismiss()
          }, remainingMs)
        } else {
          // Use setTimeout to avoid calling setState synchronously in the effect
          setTimeout(handleDismiss, 0)
        }
      }
    }
  }, [isHovered, visible, handleDismiss])

  const handleDonate = () => {
    setVisible(false)
    if (campaign) {
      onDonateClick(campaign.id)
    } else {
      onDonateClick()
    }
  }

  // Don't render if no campaign or already dismissed
  if (!campaign) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80, x: 0, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, x: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="fixed bottom-6 right-6 z-[60] w-[340px] max-w-[calc(100vw-3rem)] md:max-w-[340px] max-md:left-1/2 max-md:right-auto max-md:-translate-x-1/2 max-md:bottom-6 shadow-2xl"
        >
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_20px_60px_-15px_rgba(3,22,50,0.3)]">
            {/* Orange accent bar at top */}
            <div className="h-1.5 bg-gradient-to-r from-[#ff8928] to-[#ff6b00]" />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>

            {/* Content */}
            <div className="p-4 pt-3">
              {/* Header with icon and label */}
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="w-8 h-8 bg-[#ff8928] rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <Heart className="h-4 w-4 text-white fill-white" />
                </motion.div>
                <div>
                  <p className="text-[#ff8928] text-[10px] font-bold uppercase tracking-wider">
                    {t.notification.newCampaign}
                  </p>
                  <h4 className="text-[#031632] font-bold text-sm leading-tight line-clamp-1 pr-6">
                    {campaign.title}
                  </h4>
                </div>
              </div>

              {/* Description */}
              <p className="text-[#44474d] text-xs leading-relaxed mb-3 line-clamp-2">
                {campaign.description}
              </p>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3 text-[#ff8928]" />
                    <span className="text-[#031632] text-xs font-bold">
                      TZS {campaign.raised.toLocaleString()}
                    </span>
                    <span className="text-[#44474d] text-[10px]">{t.notification.raised}</span>
                  </div>
                  <span className="text-[#ff8928] text-xs font-bold">
                    {campaign.percentage}%
                  </span>
                </div>
                <Progress
                  value={campaign.percentage}
                  className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-[#ff8928] [&>div]:to-[#ff6b00]"
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[#44474d] text-[10px]">
                    {t.notification.goal}: TZS {campaign.goal.toLocaleString()}
                  </span>
                  <span className="text-[#44474d] text-[10px]">
                    {campaign.remaining > 0
                      ? `TZS ${campaign.remaining.toLocaleString()} ${t.notification.toGo}`
                      : t.notification.goalReached}
                  </span>
                </div>
              </div>

              {/* Donate button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDonate}
                className="w-full py-2.5 bg-[#031632] text-white rounded-none font-semibold text-sm hover:bg-[#1a2b48] transition-colors flex items-center justify-center gap-2"
              >
                <Heart className="h-4 w-4" />
                {t.notification.donateNow}
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.button>

              {/* Footer with remind me later */}
              <div className="flex items-center justify-between mt-2">
                <p className="text-[#44474d] text-[10px]">
                  {t.notification.everyContribution}
                </p>
                <button
                  onClick={handleRemindLater}
                  className="text-[#44474d] hover:text-[#ff8928] text-[10px] flex items-center gap-1 transition-colors"
                >
                  <Clock className="h-3 w-3" />
                  {t.notification.remindMeLater}
                </button>
              </div>
            </div>

            {/* Auto-dismiss progress bar — CSS animation, pauses on hover */}
            <div className="h-1 bg-gray-100 relative overflow-hidden">
              <div
                className="h-full bg-[#ff8928]/40 origin-left"
                style={{
                  animation: `notificationCountdown ${AUTO_DISMISS_MS}ms linear forwards`,
                  animationPlayState: isHovered ? 'paused' : 'running',
                }}
              />
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                    @keyframes notificationCountdown {
                      from { transform: scaleX(1); }
                      to { transform: scaleX(0); }
                    }
                  `,
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
