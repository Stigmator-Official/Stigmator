"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ImageIcon,
  Package,
  Paintbrush,
  Upload,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Users,
  LogOut,
  Bell,
} from "lucide-react"
import Link from "next/link"

// Tab components - imported via barrel
import { PortfolioTab, GarmentsTab, InkEarningsTab, UploadTab } from "./tabs"

// Demo data generators
import { ArtistStats } from "@/lib/demo-data/generator"
import { supabaseBrowser } from "@/lib/supabase/client"

type TabId = "portfolio" | "garments" | "ink" | "upload"

interface Tab {
  id: TabId
  label: string
  icon: React.ElementType
  color: string
}

const tabs: Tab[] = [
  { id: "portfolio", label: "PORTFOLIO", icon: ImageIcon, color: "#4ade80" },
  { id: "garments", label: "GARMENTS", icon: Package, color: "#dc2626" },
  { id: "ink", label: "INK & EARNINGS", icon: Paintbrush, color: "#fbbf24" },
  { id: "upload", label: "UPLOAD", icon: Upload, color: "#60a5fa" },
]

export function ArtistDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("portfolio")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // Data states
  const [designs, setDesigns] = useState<any[]>([])
  const [garments, setGarments] = useState<any[]>([])
  const [givenTattoos, setGivenTattoos] = useState<any[]>([])
  const [receivedTattoos, setReceivedTattoos] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalSales: 0,
    designCount: 0,
    partnerCount: 0,
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
          setDesigns([])
          setGarments([])
          setGivenTattoos([])
          setReceivedTattoos([])
          setStats({
            totalEarnings: 0,
            totalSales: 0,
            designCount: 0,
            partnerCount: 0,
          })
        }
      } catch {
        // Silently fail — no sensitive data logged
      }
      setLoading(false)
    }
    loadUser()
  }, [])

  const handleUpload = (data: any) => {
    // Add new design to list
    const newDesign = {
      id: `design_${Date.now()}`,
      title: data.title,
      image: data.image,
      status: "pending" as const,
      partnerName: data.partnerName,
      partnerId: data.partnerId,
      royaltySplit: data.royaltyPercentage,
      sales: 0,
      earnings: 0,
      createdAt: new Date().toISOString(),
    }
    setDesigns([newDesign, ...designs])
    
    // If partner was attributed, add to given tattoos (partner attributions)
    if (data.partnerId) {
      const newGivenTattoo = {
        id: newDesign.id,
        designId: newDesign.id,
        designTitle: data.title,
        designImage: data.image,
        partnerName: data.partnerName,
        partnerId: data.partnerId,
        location: "Unknown",
        royaltyPercentage: data.royaltyPercentage,
        totalSales: 0,
        partnerEarnings: 0,
        artistEarnings: 0,
        dateAttributed: new Date().toISOString(),
      }
      setGivenTattoos([newGivenTattoo, ...givenTattoos])
    }
    
    // Switch to portfolio tab
    setActiveTab("portfolio")
  }

  const handleCreateGarment = (designId: string) => {
    // In real app, would open modal or navigate
    console.log("Create garment from design:", designId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050805] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#4ade80] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6b8e6b] font-mono">LOADING STUDIO...</p>
        </div>
      </div>
    )
  }

  const ActiveIcon = tabs.find((t) => t.id === activeTab)?.icon || ImageIcon

  return (
    <div className="min-h-screen bg-[#050805]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#050805]/95 backdrop-blur border-b border-[#1a2e1a]">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#4ade80] flex items-center justify-center">
              <span className="font-black text-black text-lg">S</span>
            </div>
            <span className="font-black tracking-tighter text-[#e8f5e8]">
              STIGMATOR
            </span>
            <Badge className="bg-[#4ade80] text-black rounded-none text-[10px] font-black ml-2">
              STUDIO
            </Badge>
          </Link>

          {/* Center - Quick Stats */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs text-[#6b8e6b] font-mono">EARNINGS</div>
              <div className="font-black text-[#4ade80]">
                ${stats.totalEarnings.toLocaleString()}
              </div>
            </div>
            <div className="w-px h-8 bg-[#1a2e1a]" />
            <div className="text-center">
              <div className="text-xs text-[#6b8e6b] font-mono">SALES</div>
              <div className="font-black text-[#e8f5e8]">{stats.totalSales}</div>
            </div>
            <div className="w-px h-8 bg-[#1a2e1a]" />
            <div className="text-center">
              <div className="text-xs text-[#6b8e6b] font-mono">DESIGNS</div>
              <div className="font-black text-[#e8f5e8]">{stats.designCount}</div>
            </div>
            <div className="w-px h-8 bg-[#1a2e1a]" />
            <div className="text-center">
              <div className="text-xs text-[#6b8e6b] font-mono">ATTRIBUTIONS</div>
              <div className="font-black text-[#fbbf24]">{stats.partnerCount}</div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-[#6b8e6b] hover:text-[#e8f5e8]">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="w-px h-6 bg-[#1a2e1a]" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#1a2e1a] rounded-full flex items-center justify-center">
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

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 mb-6 border-b border-[#1a2e1a] pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-4 font-black tracking-tighter text-sm transition-all ${
                  isActive ? "text-[#e8f5e8]" : "text-[#6b8e6b] hover:text-[#e8f5e8]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon 
                    className="h-4 w-4" 
                    style={{ color: isActive ? tab.color : undefined }}
                  />
                  {tab.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: tab.color }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "portfolio" && (
            <PortfolioTab 
              designs={designs} 
              onCreateGarment={handleCreateGarment}
            />
          )}
          
          {activeTab === "garments" && (
            <GarmentsTab garments={garments} />
          )}
          
          {activeTab === "ink" && (
            <InkEarningsTab
              givenTattoos={givenTattoos}
              receivedTattoos={receivedTattoos}
              totalGivenEarnings={givenTattoos.reduce((sum, t) => sum + t.artistEarnings, 0)}
              totalReceivedEarnings={receivedTattoos.reduce((sum, t) => sum + t.totalEarned, 0)}
            />
          )}
          
          {activeTab === "upload" && (
            <UploadTab onUpload={handleUpload} />
          )}
        </motion.div>
      </main>
    </div>
  )
}
