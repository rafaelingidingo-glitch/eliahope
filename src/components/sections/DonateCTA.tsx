'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { CreditCard, Building2, Heart, GraduationCap, Users, Baby } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

const campaigns = [
  {
    title: 'School Feeding Program',
    raised: 4500000,
    goal: 10000000,
    icon: GraduationCap,
  },
  {
    title: 'Classroom Construction',
    raised: 8200000,
    goal: 15000000,
    icon: Building2,
  },
  {
    title: 'Orphan Support Fund',
    raised: 2100000,
    goal: 5000000,
    icon: Baby,
  },
]

const donationTypes = [
  { id: 'one-time', label: 'One-Time', icon: CreditCard },
  { id: 'monthly', label: 'Monthly', icon: Heart },
  { id: 'sponsor', label: 'Sponsor a Child', icon: Users },
]

export default function DonateCTA() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [activeTab, setActiveTab] = useState('one-time')

  return (
    <section id="donate" ref={ref} className="relative py-20 md:py-28 bg-navy overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-orange font-semibold text-sm uppercase tracking-wider mb-3">
            Make a Difference
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your Support Can Change a Child&apos;s Future
          </h2>
          <div className="w-16 h-1 bg-orange mx-auto rounded-full mb-4" />
          <p className="text-white/70 max-w-2xl mx-auto">
            Every contribution, no matter the size, makes a real difference. Help us provide education, 
            nutrition, and hope to children in need.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left - Donation Methods & Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Donation Type Tabs */}
            <div className="flex gap-2 mb-6">
              {donationTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => setActiveTab(type.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                      activeTab === type.id
                        ? 'bg-orange text-white shadow-lg'
                        : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{type.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Payment Methods */}
            <div className="space-y-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-500/20 p-2 rounded-lg">
                    <CreditCard className="h-5 w-5 text-green-400" />
                  </div>
                  <h3 className="text-white font-bold">M-Pesa</h3>
                </div>
                <div className="text-white/70 text-sm space-y-1">
                  <p><span className="font-medium text-white/90">Paybill:</span> 123456</p>
                  <p><span className="font-medium text-white/90">Account:</span> Elia&apos;s Hope Community</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="text-white font-bold">CRDB Bank</h3>
                </div>
                <div className="text-white/70 text-sm space-y-1">
                  <p><span className="font-medium text-white/90">Account Name:</span> Elia&apos;s Hope Community</p>
                  <p><span className="font-medium text-white/90">Account Number:</span> 0150234567890</p>
                  <p><span className="font-medium text-white/90">Branch:</span> Mwanza</p>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-orange hover:bg-orange-dark text-white font-bold rounded-xl py-6 text-lg shadow-lg"
            >
              Donate Now
            </Button>
          </motion.div>

          {/* Right - Campaign Progress */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-white font-bold text-xl mb-6">Active Campaigns</h3>
            {campaigns.map((campaign, i) => {
              const Icon = campaign.icon
              const percentage = Math.round((campaign.raised / campaign.goal) * 100)
              return (
                <motion.div
                  key={campaign.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-orange" />
                      <h4 className="text-white font-semibold text-sm">{campaign.title}</h4>
                    </div>
                    <span className="text-orange font-bold text-sm">{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-2 mb-3 [&>div]:bg-orange" />
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>TZS {campaign.raised.toLocaleString()} raised</span>
                    <span>Goal: TZS {campaign.goal.toLocaleString()}</span>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
