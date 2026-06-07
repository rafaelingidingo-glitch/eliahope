'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, TrendingUp, ArrowRight } from 'lucide-react'
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

export default function CampaignNotification({ onDonateClick }: CampaignNotificationProps) {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [dismissed, setDismissed] = useState(false)

  const fetchLatestCampaign = useCallback(async () => {
    try {
      const res = await fetch('/api/donate/campaigns')
      if (res.ok) {
        const data = await res.json()
        const campaigns: Campaign[] = data.campaigns || []
        // Pick the most recent active campaign
        if (campaigns.length > 0) {
          setCampaign(campaigns[0])
        }
      }
    } catch {
      // Silent fail
    }
  }, [])

  useEffect(() => {
    // Check if already dismissed in this session
    const wasDismissed = sessionStorage.getItem(SESSION_KEY)
    if (wasDismissed) {
      setDismissed(true)
      return
    }

    // Fetch campaigns and show notification after delay
    fetchLatestCampaign()
  }, [fetchLatestCampaign])

  useEffect(() => {
    if (!campaign || dismissed) return

    const timer = setTimeout(() => {
      setVisible(true)
    }, NOTIFICATION_DELAY)

    return () => clearTimeout(timer)
  }, [campaign, dismissed])

  const handleDismiss = () => {
    setVisible(false)
    setDismissed(true)
    sessionStorage.setItem(SESSION_KEY, 'true')
  }

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
          className="fixed bottom-4 right-4 z-[60] w-[340px] max-w-[calc(100vw-2rem)] shadow-2xl"
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

              {/* Footer note */}
              <p className="text-center text-[#44474d] text-[10px] mt-2">
                {t.notification.everyContribution}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
