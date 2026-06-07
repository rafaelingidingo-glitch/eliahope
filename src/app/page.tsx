'use client'

import { useState } from 'react'
import Navbar from '@/components/sections/Navbar'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import VisionMission from '@/components/sections/VisionMission'
import Programs from '@/components/sections/Programs'
import ImpactStats from '@/components/sections/ImpactStats'
import Events from '@/components/sections/Events'
import SuccessStories from '@/components/sections/SuccessStories'
import Gallery from '@/components/sections/Gallery'
import TakeAction from '@/components/sections/TakeAction'
import Newsletter from '@/components/sections/Newsletter'
import Contact from '@/components/sections/Contact'
import Footer from '@/components/sections/Footer'
import AdminDashboard from '@/components/admin/AdminDashboard'
import AdminLogin from '@/components/admin/AdminLogin'
import DonationModal from '@/components/DonationModal'
import CampaignNotification from '@/components/CampaignNotification'

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [donateOpen, setDonateOpen] = useState(false)
  const [donateCampaignId, setDonateCampaignId] = useState<string | undefined>(undefined)
  const [donateAmount, setDonateAmount] = useState<string | undefined>(undefined)

  const handleAdminClick = () => {
    setLoginOpen(true)
  }

  const handleLoginSuccess = (token: string) => {
    setLoginOpen(false)
    setAdminOpen(true)
  }

  const handleAdminClose = () => {
    setAdminOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setAdminOpen(false)
  }

  const handleDonateClick = (campaignId?: string, amount?: string) => {
    setDonateCampaignId(campaignId)
    setDonateAmount(amount)
    setDonateOpen(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onAdminClick={handleAdminClick} onDonateClick={handleDonateClick} />
      <main className="flex-1">
        <Hero onDonateClick={handleDonateClick} />
        <About />
        <VisionMission />
        <Programs />
        <ImpactStats onDonateClick={() => handleDonateClick()} />
        <Events onDonateClick={handleDonateClick} />
        <SuccessStories />
        <Gallery />
        <TakeAction onDonateClick={handleDonateClick} />
        <Newsletter />
        <Contact />
      </main>
      <Footer onDonateClick={handleDonateClick} />
      <DonationModal isOpen={donateOpen} onClose={() => setDonateOpen(false)} preselectedCampaignId={donateCampaignId} prefilledAmount={donateAmount} />
      <AdminLogin isOpen={loginOpen} onClose={() => setLoginOpen(false)} onLogin={handleLoginSuccess} />
      <AdminDashboard isOpen={adminOpen} onClose={handleAdminClose} onLogout={handleLogout} />
      <CampaignNotification onDonateClick={handleDonateClick} />
    </div>
  )
}
