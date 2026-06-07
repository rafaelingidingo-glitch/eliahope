'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileEdit,
  Calendar,
  Image,
  DollarSign,
  Users,
  Baby,
  Mail,
  Newspaper,
  BarChart3,
  ArrowLeft,
  X,
  Menu,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useLanguage } from '@/lib/i18n'
import DashboardOverview from './sections/DashboardOverview'
import ContentManagement from './sections/ContentManagement'
import EventManagement from './sections/EventManagement'
import GalleryManagement from './sections/GalleryManagement'
import DonationManagement from './sections/DonationManagement'
import VolunteerManagement from './sections/VolunteerManagement'
import SponsorChildModule from './sections/SponsorChildModule'
import NewsletterManagement from './sections/NewsletterManagement'
import BlogManagement from './sections/BlogManagement'
import ReportsModule from './sections/ReportsModule'

interface AdminDashboardProps {
  isOpen: boolean
  onClose: () => void
  onLogout?: () => void
}

type SectionKey =
  | 'dashboard'
  | 'content'
  | 'events'
  | 'gallery'
  | 'donations'
  | 'volunteers'
  | 'sponsor-child'
  | 'newsletter'
  | 'blog'
  | 'reports'

function useNavItems() {
  const { t } = useLanguage()
  return [
    { key: 'dashboard' as SectionKey, label: t.adminDashboard.dashboard, icon: LayoutDashboard },
    { key: 'content' as SectionKey, label: t.adminDashboard.content, icon: FileEdit },
    { key: 'events' as SectionKey, label: t.adminDashboard.events, icon: Calendar },
    { key: 'gallery' as SectionKey, label: t.adminDashboard.gallery, icon: Image },
    { key: 'donations' as SectionKey, label: t.adminDashboard.donations, icon: DollarSign },
    { key: 'volunteers' as SectionKey, label: t.adminDashboard.volunteers, icon: Users },
    { key: 'sponsor-child' as SectionKey, label: t.adminDashboard.sponsorChild, icon: Baby },
    { key: 'newsletter' as SectionKey, label: t.adminDashboard.newsletter, icon: Mail },
    { key: 'blog' as SectionKey, label: t.adminDashboard.blog, icon: Newspaper },
    { key: 'reports' as SectionKey, label: t.adminDashboard.reports, icon: BarChart3 },
  ]
}

interface SidebarContentProps {
  activeSection: SectionKey
  onNavClick: (key: SectionKey) => void
  onClose: () => void
  onLogout?: () => void
}

function SidebarContent({ activeSection, onNavClick, onClose, onLogout }: SidebarContentProps) {
  const { t } = useLanguage()
  const navItems = useNavItems()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <img src="/logo.jpeg" alt="Elia's Hope" className="h-9 w-9 rounded-full object-cover" />
        <div className="hidden lg:block">
          <h2 className="text-white font-bold text-sm leading-tight">Elia&apos;s Hope</h2>
          <p className="text-white/60 text-xs">{t.adminDashboard.adminPanel}</p>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.key
            return (
              <button
                key={item.key}
                onClick={() => onNavClick(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-orange text-white shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="hidden lg:inline">{item.label}</span>
                {isActive && (
                  <ChevronRight className="h-4 w-4 ml-auto hidden lg:inline" />
                )}
              </button>
            )
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-white/10" />

      {/* Back to Website */}
      <div className="p-3">
        <button
          onClick={onClose}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="h-5 w-5 flex-shrink-0" />
          <span className="hidden lg:inline">{t.adminDashboard.backToWebsite}</span>
        </button>
      </div>

      {/* User Info */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-orange text-white text-xs">AD</AvatarFallback>
          </Avatar>
          <div className="hidden lg:block flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{t.adminDashboard.adminUser}</p>
            <p className="text-white/50 text-xs truncate">admin@eliashope.org</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout ?? undefined}
            className="hidden lg:flex h-8 w-8 text-white/50 hover:text-white hover:bg-white/10"
            title={t.adminDashboard.logout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard({ isOpen, onClose, onLogout }: AdminDashboardProps) {
  const navItems = useNavItems()
  const [activeSection, setActiveSection] = useState<SectionKey>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const handleNavClick = (key: SectionKey) => {
    setActiveSection(key)
    setMobileSidebarOpen(false)
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview onNavigate={(section) => handleNavClick(section as SectionKey)} onClose={onClose} />
      case 'content':
        return <ContentManagement />
      case 'events':
        return <EventManagement />
      case 'gallery':
        return <GalleryManagement />
      case 'donations':
        return <DonationManagement />
      case 'volunteers':
        return <VolunteerManagement />
      case 'sponsor-child':
        return <SponsorChildModule />
      case 'newsletter':
        return <NewsletterManagement />
      case 'blog':
        return <BlogManagement />
      case 'reports':
        return <ReportsModule />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-50 flex"
        >
          {/* Desktop Sidebar */}
          <div className="hidden md:flex">
            <div
              className={`bg-[#0F2D5C] transition-all duration-300 ${
                sidebarOpen ? 'w-64' : 'w-16'
              } flex-shrink-0`}
            >
              <SidebarContent activeSection={activeSection} onNavClick={handleNavClick} onClose={onClose} onLogout={onLogout} />
            </div>
          </div>

          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {mobileSidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-40 md:hidden"
                  onClick={() => setMobileSidebarOpen(false)}
                />
                <motion.div
                  initial={{ x: -280 }}
                  animate={{ x: 0 }}
                  exit={{ x: -280 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed left-0 top-0 bottom-0 w-64 bg-[#0F2D5C] z-50 md:hidden"
                >
                  <SidebarContent activeSection={activeSection} onNavClick={handleNavClick} onClose={onClose} onLogout={onLogout} />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
            {/* Top Bar */}
            <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 sticky top-0 z-30">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-[#0F2D5C]">
                  {navItems.find((item) => item.key === activeSection)?.label || 'Dashboard'}
                </h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </header>

            {/* Section Content */}
            <main className="flex-1 overflow-y-auto">
              <div className="p-4 md:p-6">
                {renderSection()}
              </div>
            </main>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
