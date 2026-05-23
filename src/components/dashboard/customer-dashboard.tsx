"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingBag,
  Package,
  Paintbrush,
  Bell,
  LogOut,
  DollarSign,
  Users,
  Sparkles,
} from "lucide-react"
import Link from "next/link"

// Tab components
import { ShopTab, OrdersTab, InkEarningsTab } from "./tabs"

// Demo data generators
import { CustomerStats, InkedTattoo, Order } from "@/lib/demo-data/generator"
import { supabaseBrowser } from "@/lib/supabase/client"

type TabId = "shop" | "orders" | "ink"

interface Tab {
  id: TabId
  label: string
  icon: React.ElementType
  color: string
}

const tabs: Tab[] = [
  { id: "shop", label: "SHOP", icon: ShoppingBag, color: "#60a5fa" },
  { id: "orders", label: "ORDERS", icon: Package, color: "#4ade80" },
  { id: "ink", label: "INK PORTFOLIO", icon: Paintbrush, color: "#fbbf24" },
]

export function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("shop")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // Data states
  const [orders, setOrders] = useState<Order[]>([])
  const [inkPortfolio, setInkPortfolio] = useState<InkedTattoo[]>([])
  const [stats, setStats] = useState<CustomerStats>({
    totalOrders: 0,
    totalSpent: 0,
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
          setOrders([])
          setInkPortfolio([])
          setStats({
            totalOrders: 0,
            totalSpent: 0,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050805] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#60a5fa] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[#6b8e6b] font-mono">LOADING COLLECTOR DASHBOARD...</p>
        </div>
      </div>
    )
  }

  const ActiveIcon = tabs.find((t) => t.id === activeTab)?.icon || ShoppingBag

  return (
    <div className="min-h-screen bg-[#050805]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#050805]/95 backdrop-blur border-b border-[#1a2e1a]">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#60a5fa] flex items-center justify-center">
              <span className="font-black text-black text-lg">S</span>
            </div>
            <span className="font-black tracking-tighter text-[#e8f5e8]">
              STIGMATOR
            </span>
            <Badge className="bg-[#60a5fa] text-black rounded-none text-[10px] font-black ml-2">
              COLLECTOR
            </Badge>
          </Link>

          {/* Center - Quick Stats Bar */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs text-[#6b8e6b] font-mono">ORDERS</div>
              <div className="font-black text-[#e8f5e8]">{stats.totalOrders}</div>
            </div>
            <div className="w-px h-8 bg-[#1a2e1a]" />
            <div className="text-center">
              <div className="text-xs text-[#6b8e6b] font-mono">SPENT</div>
              <div className="font-black text-[#60a5fa]">${stats.totalSpent.toLocaleString()}</div>
            </div>
            <div className="w-px h-8 bg-[#1a2e1a]" />
            <div className="text-center">
              <div className="text-xs text-[#6b8e6b] font-mono">INK EARNINGS</div>
              <div className="font-black text-[#4ade80]">${stats.inkEarnings.toLocaleString()}</div>
            </div>
            <div className="w-px h-8 bg-[#1a2e1a]" />
            <div className="text-center">
              <div className="text-xs text-[#6b8e6b] font-mono">INK PORTFOLIO</div>
              <div className="font-black text-[#fbbf24]">{stats.tattooCount}</div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-[#6b8e6b] hover:text-[#e8f5e8]">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="w-px h-6 bg-[#1a2e1a]" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#60a5fa]/20 flex items-center justify-center">
                <span className="font-black text-[#60a5fa] text-sm">
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

      {/* Mobile Quick Stats - Only visible on smaller screens */}
      <div className="lg:hidden bg-[#0a0f0a] border-b border-[#1a2e1a]">
        <div className="max-w-[1800px] mx-auto px-4 py-3">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-[#050805] border border-[#1a2e1a]">
              <div className="text-[10px] text-[#6b8e6b] font-mono">ORDERS</div>
              <div className="font-black text-[#e8f5e8] text-sm">{stats.totalOrders}</div>
            </div>
            <div className="p-2 bg-[#050805] border border-[#1a2e1a]">
              <div className="text-[10px] text-[#6b8e6b] font-mono">SPENT</div>
              <div className="font-black text-[#60a5fa] text-sm">${stats.totalSpent}</div>
            </div>
            <div className="p-2 bg-[#050805] border border-[#1a2e1a]">
              <div className="text-[10px] text-[#6b8e6b] font-mono">EARNINGS</div>
              <div className="font-black text-[#4ade80] text-sm">${stats.inkEarnings}</div>
            </div>
            <div className="p-2 bg-[#050805] border border-[#1a2e1a]">
              <div className="text-[10px] text-[#6b8e6b] font-mono">INK</div>
              <div className="font-black text-[#fbbf24] text-sm">{stats.tattooCount}</div>
            </div>
          </div>
        </div>
      </div>

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
                    layoutId="activeCollectorTab"
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
          {activeTab === "shop" && <ShopTab />}
          
          {activeTab === "orders" && <OrdersTab orders={orders} />}
          
          {activeTab === "ink" && (
            <>
              {inkPortfolio.length === 0 ? (
                <EmptyCollectorInkPortfolio />
              ) : (
                <InkEarningsTab
                  givenTattoos={[]}
                  receivedTattoos={inkPortfolio.map((tattoo) => ({
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
            </>
          )}
        </motion.div>
      </main>
    </div>
  )
}

// Empty State: Collector with no Ink Portfolio
function EmptyCollectorInkPortfolio() {
  return (
    <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none overflow-hidden">
      <CardContent className="p-12 md:p-16 text-center">
        {/* Icon */}
        <div className="relative inline-block mb-8">
          <div className="w-28 h-28 bg-[#fbbf24]/5 border-2 border-[#fbbf24]/20 flex items-center justify-center">
            <Paintbrush className="h-12 w-12 text-[#fbbf24]" />
          </div>
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#050805] border border-[#4ade80]/30 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-[#4ade80]" />
          </div>
        </div>

        <h3 className="text-3xl font-black tracking-tighter text-[#e8f5e8] mb-4">
          YOUR INK PORTFOLIO IS EMPTY
        </h3>

        <p className="text-[#6b8e6b] font-mono text-sm max-w-lg mx-auto mb-3">
          Your Ink Portfolio holds tattoos attributed TO you by artists you&apos;ve worked with. 
          When an artist tattoos you, they can attribute that design to your account.
        </p>

        <p className="text-xs text-[#6b8e6b] max-w-md mx-auto mb-10">
          Each attributed tattoo earns you passive income when the design sells on merchandise. 
          Your body becomes a walking billboard—and you get paid for it.
        </p>

        {/* How it Works */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left max-w-2xl mx-auto">
          <div className="p-5 bg-[#050805] border border-[#1a2e1a]">
            <div className="text-[#fbbf24] font-black text-lg mb-1">01</div>
            <p className="text-sm text-[#e8f5e8] font-black mb-1">GET TATTOOED</p>
            <p className="text-xs text-[#6b8e6b]">
              Visit a Stigmator-verified artist and get original artwork.
            </p>
          </div>
          <div className="p-5 bg-[#050805] border border-[#1a2e1a]">
            <div className="text-[#fbbf24] font-black text-lg mb-1">02</div>
            <p className="text-sm text-[#e8f5e8] font-black mb-1">GET YOUR CODE</p>
            <p className="text-xs text-[#6b8e6b]">
              Your artist generates a unique attribution code for your tattoo.
            </p>
          </div>
          <div className="p-5 bg-[#050805] border border-[#1a2e1a]">
            <div className="text-[#fbbf24] font-black text-lg mb-1">03</div>
            <p className="text-sm text-[#e8f5e8] font-black mb-1">ACTIVATE & EARN</p>
            <p className="text-xs text-[#6b8e6b]">
              Enter the code to add to your portfolio and start earning royalties.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/partner">
            <Button
              size="lg"
              className="bg-[#fbbf24] hover:bg-[#f59e0b] text-black rounded-none font-black tracking-wider px-8"
            >
              <Paintbrush className="h-5 w-5 mr-2" />
              ACTIVATE YOUR FIRST TATTOO
            </Button>
          </Link>
          <Link href="/artists">
            <Button
              variant="outline"
              size="lg"
              className="rounded-none border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] font-black"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              BROWSE ARTISTS
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
