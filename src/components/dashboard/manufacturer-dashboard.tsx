"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Factory,
  Package,
  DollarSign,
  Paintbrush,
  Calendar,
  TrendingUp,
  CheckCircle,
  LogOut,
  Bell,
  Inbox,
  Clock,
  Briefcase,
  Star,
} from "lucide-react"
import Link from "next/link"

// Tab components
import { JobQueueTab, CalendarTab, PerformanceTab, InkEarningsTab } from "./tabs"

// Demo data generator
import { ManufacturerStats, ProductionJob, InkedTattoo } from "@/lib/demo-data/generator"
import { supabaseBrowser } from "@/lib/supabase/client"

type TabId = "jobs" | "calendar" | "performance" | "ink"

interface Tab {
  id: TabId
  label: string
  shortLabel: string
  icon: React.ElementType
  color: string
}

const tabs: Tab[] = [
  { id: "jobs", label: "JOB QUEUE", shortLabel: "JOBS", icon: Briefcase, color: "#fbbf24" },
  { id: "calendar", label: "CALENDAR", shortLabel: "SCHEDULE", icon: Calendar, color: "#60a5fa" },
  { id: "performance", label: "PERFORMANCE", shortLabel: "STATS", icon: TrendingUp, color: "#4ade80" },
  { id: "ink", label: "INK & EARNINGS", shortLabel: "INK", icon: Paintbrush, color: "#a78bfa" },
]

export function ManufacturerDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("jobs")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // Data states
  const [jobs, setJobs] = useState<ProductionJob[]>([])
  const [inkPortfolio, setInkPortfolio] = useState<InkedTattoo[]>([])
  const [stats, setStats] = useState<ManufacturerStats>({
    totalJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    inkEarnings: 0,
    tattooCount: 0,
  })

  useEffect(() => {
    // Load real user from Supabase
    const loadUser = async () => {
      try {
        const supabase = supabaseBrowser()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
            email: session.user.email,
          })
          // Initialize with empty real data — no demo data in production
          setJobs([])
          setInkPortfolio([])
          setStats({
            totalJobs: 0,
            completedJobs: 0,
            totalEarnings: 0,
            inkEarnings: 0,
            tattooCount: 0,
          })
        }
      } catch {
        // Silently fail — no sensitive data logged
      }
      setLoading(false)
    }
    loadUser()
  }, [])

  // Job management handlers
  const handleAcceptJob = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: "in_production" as const } : job
    ))
  }

  const handleRejectJob = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId))
    // Update stats
    setStats(prev => ({
      ...prev,
      totalJobs: prev.totalJobs - 1,
    }))
  }

  const handleCompleteJob = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: "completed" as const } : job
    ))
    // Update stats
    setStats(prev => ({
      ...prev,
      completedJobs: prev.completedJobs + 1,
      totalEarnings: prev.totalEarnings + Math.floor(Math.random() * 50) + 25,
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050805] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#fbbf24] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6b8e6b] font-mono">LOADING WORKSPACE...</p>
        </div>
      </div>
    )
  }

  const ActiveIcon = tabs.find((t) => t.id === activeTab)?.icon || Briefcase

  // Calculate quick stats
  const pendingCount = jobs.filter(j => j.status === "pending").length
  const completedCount = jobs.filter(j => j.status === "completed").length

  return (
    <div className="min-h-screen bg-[#050805] touch-manipulation">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#050805]/95 backdrop-blur border-b border-[#1a2e1a]">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 bg-[#fbbf24] flex items-center justify-center">
              <span className="font-black text-black text-lg">S</span>
            </div>
            <span className="font-black tracking-tighter text-[#e8f5e8] hidden sm:block">
              STIGMATOR
            </span>
            <Badge className="bg-[#fbbf24] text-black rounded-none text-[10px] font-black ml-2">
              MAKER
            </Badge>
          </Link>

          {/* Center - Quick Stats Bar - Desktop Only */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs text-[#6b8e6b] font-mono">TOTAL JOBS</div>
              <div className="font-black text-[#fbbf24]">
                {stats.totalJobs}
              </div>
            </div>
            <div className="w-px h-8 bg-[#1a2e1a]" />
            <div className="text-center">
              <div className="text-xs text-[#6b8e6b] font-mono">COMPLETED</div>
              <div className="font-black text-[#4ade80]">
                {completedCount}
              </div>
            </div>
            <div className="w-px h-8 bg-[#1a2e1a]" />
            <div className="text-center">
              <div className="text-xs text-[#6b8e6b] font-mono">EARNINGS</div>
              <div className="font-black text-[#e8f5e8]">
                ${stats.totalEarnings.toLocaleString()}
              </div>
            </div>
            <div className="w-px h-8 bg-[#1a2e1a]" />
            <div className="text-center">
              <div className="text-xs text-[#6b8e6b] font-mono">INK EARNINGS</div>
              <div className="font-black text-[#a78bfa]">
                ${stats.inkEarnings.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-[#6b8e6b] hover:text-[#e8f5e8] h-11 w-11 touch-manipulation active:scale-95 transition-transform"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <div className="w-px h-6 bg-[#1a2e1a] hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#1a2e1a] rounded-full flex items-center justify-center">
                <span className="font-black text-[#e8f5e8] text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden sm:block text-sm font-black text-[#e8f5e8]">
                {user?.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Quick Stats (visible only on small screens) */}
      <div className="md:hidden bg-[#0a0f0a] border-b border-[#1a2e1a]">
        <div className="max-w-[1800px] mx-auto px-3 py-3">
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2 bg-[#050805] border border-[#1a2e1a] text-center min-h-[60px] flex flex-col justify-center">
              <div className="text-[10px] text-[#6b8e6b] font-mono mb-1">JOBS</div>
              <div className="font-black text-[#fbbf24] text-sm">{stats.totalJobs}</div>
            </div>
            <div className="p-2 bg-[#050805] border border-[#1a2e1a] text-center min-h-[60px] flex flex-col justify-center">
              <div className="text-[10px] text-[#6b8e6b] font-mono mb-1">DONE</div>
              <div className="font-black text-[#4ade80] text-sm">{completedCount}</div>
            </div>
            <div className="p-2 bg-[#050805] border border-[#1a2e1a] text-center min-h-[60px] flex flex-col justify-center">
              <div className="text-[10px] text-[#6b8e6b] font-mono mb-1">PAID</div>
              <div className="font-black text-[#e8f5e8] text-sm">${stats.totalEarnings}</div>
            </div>
            <div className="p-2 bg-[#050805] border border-[#1a2e1a] text-center min-h-[60px] flex flex-col justify-center">
              <div className="text-[10px] text-[#6b8e6b] font-mono mb-1">INK</div>
              <div className="font-black text-[#a78bfa] text-sm">${stats.inkEarnings}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {/* Tab Navigation - Scrollable on mobile */}
        <div className="mb-6 border-b border-[#1a2e1a] pb-1 overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex gap-1 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 sm:px-6 py-3 sm:py-4 font-black tracking-tighter text-sm transition-all touch-manipulation active:scale-95 select-none min-h-[48px] sm:min-h-[56px] flex items-center justify-center ${
                    isActive ? "text-[#e8f5e8]" : "text-[#6b8e6b] hover:text-[#e8f5e8]"
                  }`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <span className="flex items-center gap-2">
                    <Icon 
                      className="h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0" 
                      style={{ color: isActive ? tab.color : undefined }}
                    />
                    {/* Show short label on mobile, full label on sm+ */}
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="makerActiveTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: tab.color }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "jobs" && (
            <JobQueueTab 
              jobs={jobs.map(job => ({
                ...job,
                quantity: Math.floor(Math.random() * 50) + 10,
                value: Math.floor(Math.random() * 500) + 100,
              }))}
              onAcceptJob={handleAcceptJob}
              onRejectJob={handleRejectJob}
              onCompleteJob={handleCompleteJob}
            />
          )}
          
          {activeTab === "calendar" && (
            <CalendarTab jobs={jobs} />
          )}
          
          {activeTab === "performance" && (
            <PerformanceTab stats={stats} />
          )}
          
          {activeTab === "ink" && (
            <InkEarningsTab
              givenTattoos={[]}
              receivedTattoos={inkPortfolio.map(tattoo => ({
                id: tattoo.id,
                designId: tattoo.designId,
                designTitle: tattoo.designTitle,
                designImage: undefined,
                artistName: tattoo.artistName,
                artistId: tattoo.artistId,
                location: tattoo.location,
                royaltyPercentage: tattoo.royaltyPercentage,
                totalSales: tattoo.totalSales,
                totalEarned: tattoo.totalEarned,
                dateInked: tattoo.dateInked,
                status: tattoo.status,
              }))}
              totalGivenEarnings={0}
              totalReceivedEarnings={stats.inkEarnings}
            />
          )}
        </motion.div>
      </main>
    </div>
  )
}
