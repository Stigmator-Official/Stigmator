"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield,
  Globe,
  Search,
  Settings,
  UserPlus
} from "lucide-react"

interface PlatformStats {
  totalRevenue: number
  revenueChange: number
  totalOrders: number
  ordersChange: number
  activeArtists: number
  artistsChange: number
  totalUsers: number
  usersChange: number
  pendingApprovals: number
  disputes: number
  serverStatus: string
}

interface ArtistApplication {
  id: string
  name: string
  status: string
  applied: string
}

export function AdminDashboard() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<PlatformStats>({
    totalRevenue: 0,
    revenueChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    activeArtists: 0,
    artistsChange: 0,
    totalUsers: 0,
    usersChange: 0,
    pendingApprovals: 0,
    disputes: 0,
    serverStatus: "operational",
  })
  const [recentApplications, setRecentApplications] = useState<ArtistApplication[]>([])

  useEffect(() => {
    setMounted(true)
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    // TODO: Fetch from API
    setStats({
      totalRevenue: 0,
      revenueChange: 0,
      totalOrders: 0,
      ordersChange: 0,
      activeArtists: 0,
      artistsChange: 0,
      totalUsers: 0,
      usersChange: 0,
      pendingApprovals: 0,
      disputes: 0,
      serverStatus: "operational",
    })
    setRecentApplications([])
    setLoading(false)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen pt-20 pb-12 texture-grain">
      {/* Header */}
      <div className="bg-[#0a0f0a] border-b border-[#1a2e1a]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs text-[#6b8e6b] tracking-widest">ADMIN DASHBOARD</span>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#e8f5e8] mt-1">
                PLATFORM CONTROL
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-[#4ade80] text-black rounded-none font-mono">
                <CheckCircle className="h-3 w-3 mr-1" />
                SYSTEM ONLINE
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "TOTAL REVENUE", value: loading ? "—" : `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "#4ade80" },
            { label: "TOTAL ORDERS", value: loading ? "—" : stats.totalOrders, icon: BarChart3, color: "#60a5fa" },
            { label: "ACTIVE ARTISTS", value: loading ? "—" : stats.activeArtists, icon: Users, color: "#fbbf24" },
            { label: "TOTAL USERS", value: loading ? "—" : stats.totalUsers, icon: Globe, color: "#a78bfa" },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
                <CardContent className="p-4">
                  <Icon className="h-5 w-5 mb-2" style={{ color: stat.color }} />
                  <div className="text-2xl font-black text-[#e8f5e8]">{stat.value}</div>
                  <div className="text-xs font-mono text-[#6b8e6b]">{stat.label}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-[1fr,380px] gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Artist Applications */}
            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-black tracking-tighter flex items-center gap-2 text-[#e8f5e8]">
                  <UserPlus className="h-5 w-5 text-[#4ade80]" />
                  ARTIST APPLICATIONS
                  {stats.pendingApprovals > 0 && (
                    <Badge className="bg-[#dc2626] text-white rounded-none ml-2">
                      {stats.pendingApprovals} PENDING
                    </Badge>
                  )}
                </CardTitle>
                <Link href="/admin/artists">
                  <Button variant="outline" className="rounded-none border-[#1a2e1a] text-[#6b8e6b] text-xs font-mono">
                    VIEW ALL
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-[#1a2e1a] animate-pulse" />
                    ))}
                  </div>
                ) : recentApplications.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-[#1a2e1a]">
                    <CheckCircle className="h-10 w-10 text-[#6b8e6b] mx-auto mb-3" />
                    <p className="text-[#6b8e6b] font-mono text-sm">
                      No pending applications. All caught up!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentApplications.map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-[#050805] border border-[#1a2e1a]">
                        <div>
                          <p className="font-black text-[#e8f5e8]">{app.name}</p>
                          <p className="text-xs text-[#6b8e6b]">Applied {app.applied}</p>
                        </div>
                        <Badge className={`rounded-none ${
                          app.status === "pending" ? "bg-[#fbbf24] text-black" :
                          app.status === "approved" ? "bg-[#4ade80] text-black" :
                          "bg-[#dc2626] text-white"
                        }`}>
                          {app.status.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardHeader>
                <CardTitle className="font-black tracking-tighter text-[#e8f5e8]">
                  ADMIN ACTIONS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/artists">
                  <Button className="w-full bg-[#4ade80] hover:bg-[#3ec46e] text-black font-black rounded-none">
                    <Users className="h-4 w-4 mr-2" />
                    MANAGE ARTISTS
                  </Button>
                </Link>
                <Link href="/admin/orders">
                  <Button variant="outline" className="w-full rounded-none border-[#1a2e1a] text-[#6b8e6b]">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    VIEW ORDERS
                  </Button>
                </Link>
                <Link href="/admin/settings">
                  <Button variant="outline" className="w-full rounded-none border-[#1a2e1a] text-[#6b8e6b]">
                    <Settings className="h-4 w-4 mr-2" />
                    PLATFORM SETTINGS
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardHeader>
                <CardTitle className="font-black tracking-tighter flex items-center gap-2 text-[#e8f5e8]">
                  <Shield className="h-5 w-5 text-[#4ade80]" />
                  SYSTEM STATUS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#050805] border border-[#1a2e1a]">
                    <span className="text-sm text-[#6b8e6b]">Platform</span>
                    <Badge className="bg-[#4ade80] text-black rounded-none">
                      OPERATIONAL
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#050805] border border-[#1a2e1a]">
                    <span className="text-sm text-[#6b8e6b]">Database</span>
                    <Badge className="bg-[#4ade80] text-black rounded-none">
                      HEALTHY
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#050805] border border-[#1a2e1a]">
                    <span className="text-sm text-[#6b8e6b]">Payments</span>
                    <Badge className="bg-[#4ade80] text-black rounded-none">
                      ACTIVE
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
