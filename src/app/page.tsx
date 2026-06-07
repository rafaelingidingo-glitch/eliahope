'use client'

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
import CampaignNotification from '@/components/CampaignNotification'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
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
        <Newsletter />
        <Contact />
      </main>
      <Footer />
      <CampaignNotification />
    </div>
  )
}
