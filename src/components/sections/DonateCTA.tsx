'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { CreditCard, Building2, Heart, GraduationCap, Users, Baby } from 'lucide-react'
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

export default function DonateCTA() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [donationType, setDonationType] = useState<'one-time' | 'monthly'>('one-time')
  const [amount, setAmount] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  return (
    <section id="donate" ref={ref} className="py-20 bg-[#f5f3ef]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-[#ff8928] font-bold text-xs uppercase tracking-widest mb-4 block">
            WHY DONATE?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#031632] mb-4">
            Why Your Support Matters
          </h2>
          <p className="text-[#44474d] max-w-2xl mx-auto">
            Every contribution, no matter the size, makes a real difference. Help us provide education, 
            nutrition, and hope to children in need.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left - Donation Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-3xl soft-shadow p-8 lg:p-10 border border-gray-200/10">
              {/* One-time / Monthly Toggle */}
              <div className="flex p-1 bg-[#f5f3ef] rounded-full mb-8">
                <button
                  onClick={() => setDonationType('one-time')}
                  className={`flex-1 py-3 rounded-full text-sm font-semibold transition-all ${
                    donationType === 'one-time'
                      ? 'bg-[#031632] text-white shadow-md'
                      : 'text-[#44474d] hover:text-[#031632]'
                  }`}
                >
                  One-Time
                </button>
                <button
                  onClick={() => setDonationType('monthly')}
                  className={`flex-1 py-3 rounded-full text-sm font-semibold transition-all ${
                    donationType === 'monthly'
                      ? 'bg-[#031632] text-white shadow-md'
                      : 'text-[#44474d] hover:text-[#031632]'
                  }`}
                >
                  Monthly
                </button>
              </div>

              {/* Amount Input */}
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#44474d] font-semibold text-sm">TSh</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value)
                  }}
                  className="w-full pl-14 pr-4 py-3.5 border-2 border-[#c5c6ce] rounded-xl text-[#031632] font-semibold text-lg focus:outline-none focus:border-[#ff8928] transition-colors"
                  placeholder="Enter amount"
                />
              </div>

              {/* Name and Email */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
                  placeholder="Your Name"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
                  placeholder="Your Email"
                />
              </div>

              {/* Donate Now Button */}
              <button className="w-full py-5 bg-[#031632] text-white rounded-2xl shadow-xl font-semibold text-lg hover:bg-[#1a2b48] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <Heart className="h-5 w-5" />
                Donate Now
              </button>
            </div>

            {/* Payment Methods */}
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div className="bg-white rounded-2xl p-5 border border-gray-200/10 soft-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-500/10 p-2 rounded-lg">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-[#031632] font-bold text-sm">M-Pesa</h3>
                </div>
                <div className="text-[#44474d] text-xs space-y-1">
                  <p><span className="font-medium text-[#031632]">Paybill:</span> 123456</p>
                  <p><span className="font-medium text-[#031632]">Account:</span> Elia&apos;s Hope Community</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-200/10 soft-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-500/10 p-2 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-[#031632] font-bold text-sm">CRDB Bank</h3>
                </div>
                <div className="text-[#44474d] text-xs space-y-1">
                  <p><span className="font-medium text-[#031632]">Account Name:</span> Elia&apos;s Hope Community</p>
                  <p><span className="font-medium text-[#031632]">Account No:</span> 0150234567890</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Campaign Progress */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-[#031632] font-bold text-xl mb-6">Active Campaigns</h3>
            {campaigns.map((campaign, i) => {
              const Icon = campaign.icon
              const percentage = Math.round((campaign.raised / campaign.goal) * 100)
              return (
                <motion.div
                  key={campaign.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  className="bg-white rounded-2xl p-5 border border-gray-200/10 soft-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-[#ff8928]" />
                      <h4 className="text-[#031632] font-semibold text-sm">{campaign.title}</h4>
                    </div>
                    <span className="text-[#ff8928] font-bold text-sm">{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-2 mb-3 [&>div]:bg-[#ff8928]" />
                  <div className="flex items-center justify-between text-xs text-[#44474d]">
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
