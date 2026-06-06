'use client'

import { useState } from 'react'
import Navbar from '@/components/sections/Navbar'
import Hero from '@/components/sections/Hero'
import ImpactStats from '@/components/sections/ImpactStats'
import About from '@/components/sections/About'
import Programs from '@/components/sections/Programs'
import SuccessStories from '@/components/sections/SuccessStories'
import Events from '@/components/sections/Events'
import Gallery from '@/components/sections/Gallery'
import Testimonials from '@/components/sections/Testimonials'
import Partners from '@/components/sections/Partners'
import DonateCTA from '@/components/sections/DonateCTA'
import Newsletter from '@/components/sections/Newsletter'
import Contact from '@/components/sections/Contact'
import Footer from '@/components/sections/Footer'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default function Home() {
  const [adminOpen, setAdminOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onAdminClick={() => setAdminOpen(true)} />
      <main className="flex-1">
        <Hero />
        <ImpactStats />
        <About />
        <Programs />
        <SuccessStories />
        <Events />
        <Gallery />
        <Testimonials />
        <Partners />
        <DonateCTA />
        <Newsletter />
        <Contact />
      </main>
      <Footer />
      <AdminDashboard isOpen={adminOpen} onClose={() => setAdminOpen(false)} />
    </div>
  )
}
