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
import DonateCTA from '@/components/sections/DonateCTA'
import Newsletter from '@/components/sections/Newsletter'
import Contact from '@/components/sections/Contact'
import Footer from '@/components/sections/Footer'
import AdminDashboard from '@/components/admin/AdminDashboard'
import AdminLogin from '@/components/admin/AdminLogin'

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)

  const handleAdminClick = () => {
    setLoginOpen(true)
  }

  const handleLoginSuccess = () => {
    setLoginOpen(false)
    setAdminOpen(true)
  }

  const handleAdminClose = () => {
    setAdminOpen(false)
  }

  const handleLogout = () => {
    setAdminOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onAdminClick={handleAdminClick} />
      <main className="flex-1">
        <Hero />
        <About />
        <VisionMission />
        <Programs />
        <ImpactStats />
        <Events />
        <SuccessStories />
        <Gallery />
        <TakeAction />
        <DonateCTA />
        <Newsletter />
        <Contact />
      </main>
      <Footer />
      <AdminLogin isOpen={loginOpen} onClose={() => setLoginOpen(false)} onLogin={handleLoginSuccess} />
      <AdminDashboard isOpen={adminOpen} onClose={handleAdminClose} onLogout={handleLogout} />
    </div>
  )
}
