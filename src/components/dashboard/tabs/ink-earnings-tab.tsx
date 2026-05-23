"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Paintbrush,
  User,
  DollarSign,
  Hash,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Share2,
  Search,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// ATTRIBUTIONS: Designs you created that are attributed to partners (they're your canvas)
interface GivenTattoo {
  id: string
  designId: string
  designTitle: string
  designImage?: string
  partnerName: string
  partnerId: string
  location: string
  royaltyPercentage: number
  totalSales: number
  partnerEarnings: number
  artistEarnings: number
  dateAttributed: string
}

// INK PORTFOLIO: Tattoos attributed TO you from other artists (you're their canvas)
interface ReceivedTattoo {
  id: string
  designId: string
  designTitle: string
  designImage?: string
  artistName: string
  artistId: string
  location: string
  royaltyPercentage: number
  totalSales: number
  totalEarned: number
  dateInked: string
  status: "active" | "pending" | "inactive"
}

interface InkEarningsTabProps {
  givenTattoos: GivenTattoo[]
  receivedTattoos: ReceivedTattoo[]
  totalGivenEarnings: number
  totalReceivedEarnings: number
}

export function InkEarningsTab({
  givenTattoos,
  receivedTattoos,
  totalGivenEarnings,
  totalReceivedEarnings,
}: InkEarningsTabProps) {
  const [activationCode, setActivationCode] = useState("")
  const [isActivating, setIsActivating] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState("received")

  const handleActivate = () => {
    if (!activationCode.trim()) return
    setIsActivating(true)
    // Simulate activation
    setTimeout(() => {
      setIsActivating(false)
      setActivationCode("")
      alert(`Tattoo activated with code: ${activationCode}`)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* INK PORTFOLIO: Earnings from tattoos attributed TO you */}
        <Card className="bg-[#0a0f0a] border-[#4ade80]/30 rounded-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4ade80]/10 rounded-full blur-2xl" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#4ade80]/10 border border-[#4ade80]/30 flex items-center justify-center">
                <Paintbrush className="h-5 w-5 text-[#4ade80]" />
              </div>
              <div>
                <p className="text-xs text-[#6b8e6b] font-mono">INK PORTFOLIO EARNINGS</p>
                <p className="text-xs text-[#6b8e6b]">
                  Tattoos attributed to you (you&apos;re the canvas)
                </p>
              </div>
            </div>
            <div className="text-3xl font-black text-[#4ade80]">
              ${totalReceivedEarnings.toLocaleString()}
            </div>
            <p className="text-xs text-[#6b8e6b] mt-1">
              {receivedTattoos.length} tattoo
              {receivedTattoos.length !== 1 ? "s" : ""} in your ink portfolio
            </p>
          </CardContent>
        </Card>

        {/* PARTNERS: Earnings from partners who have your designs */}
        <Card className="bg-[#0a0f0a] border-[#fbbf24]/30 rounded-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#fbbf24]/10 rounded-full blur-2xl" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#fbbf24]/10 border border-[#fbbf24]/30 flex items-center justify-center">
                <User className="h-5 w-5 text-[#fbbf24]" />
              </div>
              <div>
                <p className="text-xs text-[#6b8e6b] font-mono">PARTNER ATTRIBUTION EARNINGS</p>
                <p className="text-xs text-[#6b8e6b]">
                  Sales from designs attributed to your partners
                </p>
              </div>
            </div>
            <div className="text-3xl font-black text-[#fbbf24]">
              ${totalGivenEarnings.toLocaleString()}
            </div>
            <p className="text-xs text-[#6b8e6b] mt-1">
              {givenTattoos.length} partner attribution
              {givenTattoos.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inner Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="w-full bg-[#050805] border border-[#1a2e1a] rounded-none p-0 h-auto">
          <TabsTrigger
            value="received"
            className="flex-1 rounded-none py-3 data-[state=active]:bg-[#4ade80] data-[state=active]:text-black font-black text-xs"
          >
            <Paintbrush className="h-4 w-4 mr-2" />
            INK PORTFOLIO ({receivedTattoos.length})
          </TabsTrigger>
          <TabsTrigger
            value="given"
            className="flex-1 rounded-none py-3 data-[state=active]:bg-[#fbbf24] data-[state=active]:text-black font-black text-xs"
          >
            <User className="h-4 w-4 mr-2" />
            YOUR PARTNERS ({givenTattoos.length})
          </TabsTrigger>
        </TabsList>

        {/* INK PORTFOLIO: Tattoos attributed TO you */}
        <TabsContent value="received" className="mt-6 space-y-6">
          {/* Activation Section */}
          <Card className="bg-[#050805] border-[#1a2e1a] rounded-none">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1">
                  <h4 className="font-black text-[#e8f5e8] flex items-center gap-2">
                    <Plus className="h-4 w-4 text-[#4ade80]" />
                    ACTIVATE NEW ATTRIBUTION
                  </h4>
                  <p className="text-xs text-[#6b8e6b]">
                    Got inked? Enter the code from your artist to add to your Ink Portfolio.
                  </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-48">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
                    <Input
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value)}
                      placeholder="INK-XXXX-XXXX"
                      className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none pl-10 font-mono text-sm uppercase"
                    />
                  </div>
                  <Button
                    onClick={handleActivate}
                    disabled={!activationCode.trim() || isActivating}
                    className="bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black"
                  >
                    {isActivating ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <>
                        ACTIVATE
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ink Portfolio List - Empty State */}
          {receivedTattoos.length === 0 ? (
            <EmptyInkPortfolio />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {receivedTattoos.map((tattoo) => (
                <Card
                  key={tattoo.id}
                  className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none overflow-hidden"
                >
                  <div className="flex">
                    {/* Design Image */}
                    <div className="w-24 h-24 bg-[#050805] flex-shrink-0 relative">
                      {tattoo.designImage ? (
                        <Image
                          src={tattoo.designImage}
                          alt={tattoo.designTitle}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Paintbrush className="h-8 w-8 text-[#1a2e1a]" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <CardContent className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-black text-[#e8f5e8] text-sm">
                            {tattoo.designTitle}
                          </h4>
                          <p className="text-xs text-[#6b8e6b]">
                            by {tattoo.artistName}
                          </p>
                          <p className="text-xs text-[#6b8e6b] mt-1">
                            {tattoo.location} • {new Date(tattoo.dateInked).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          className={`rounded-none text-[10px] ${
                            tattoo.status === "active"
                              ? "bg-[#4ade80] text-black"
                              : "bg-[#fbbf24] text-black"
                          }`}
                        >
                          {tattoo.status.toUpperCase()}
                        </Badge>
                      </div>

                      {/* Earnings */}
                      <div className="mt-3 flex items-center justify-between pt-3 border-t border-[#1a2e1a]">
                        <div className="text-xs text-[#6b8e6b]">
                          Royalty: <span className="text-[#4ade80] font-black">{tattoo.royaltyPercentage}%</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-[#6b8e6b]">EARNED</div>
                          <div className="font-black text-[#4ade80]">
                            ${tattoo.totalEarned.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* YOUR PARTNERS: Designs you attributed to others */}
        <TabsContent value="given" className="mt-6 space-y-6">
          {givenTattoos.length === 0 ? (
            <EmptyPartners />
          ) : (
            <div className="space-y-4">
              {givenTattoos.map((tattoo) => (
                <Card
                  key={tattoo.id}
                  className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Design Image */}
                      <div className="w-full md:w-32 h-24 bg-[#050805] flex-shrink-0 relative">
                        {tattoo.designImage ? (
                          <Image
                            src={tattoo.designImage}
                            alt={tattoo.designTitle}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Paintbrush className="h-8 w-8 text-[#1a2e1a]" />
                          </div>
                        )}
                      </div>

                      {/* Main Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-black text-[#e8f5e8]">
                              {tattoo.designTitle}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <User className="h-3 w-3 text-[#fbbf24]" />
                              <span className="text-sm text-[#6b8e6b]">
                                Partner: <span className="text-[#e8f5e8]">{tattoo.partnerName}</span>
                              </span>
                            </div>
                            <p className="text-xs text-[#6b8e6b] mt-1">
                              {tattoo.location} • Attributed {new Date(tattoo.dateAttributed).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 md:w-64">
                        <div className="text-center p-2 bg-[#050805] border border-[#1a2e1a]">
                          <div className="text-[10px] text-[#6b8e6b]">ROYALTY</div>
                          <div className="font-black text-[#fbbf24]">{tattoo.royaltyPercentage}%</div>
                        </div>
                        <div className="text-center p-2 bg-[#050805] border border-[#1a2e1a]">
                          <div className="text-[10px] text-[#6b8e6b]">SALES</div>
                          <div className="font-black text-[#e8f5e8]">{tattoo.totalSales}</div>
                        </div>
                        <div className="text-center p-2 bg-[#050805] border border-[#1a2e1a]">
                          <div className="text-[10px] text-[#6b8e6b]">PARTNER</div>
                          <div className="font-black text-[#4ade80]">
                            ${tattoo.partnerEarnings.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Your Earnings from this */}
                    <div className="mt-4 pt-3 border-t border-[#1a2e1a] flex items-center justify-between">
                      <div className="text-xs text-[#6b8e6b]">
                        Your earnings from this attribution:{" "}
                        <span className="font-black text-[#e8f5e8]">
                          ${tattoo.artistEarnings.toLocaleString()}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none border-[#1a2e1a] text-[#6b8e6b] text-xs"
                      >
                        VIEW DETAILS
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Empty State: No tattoos in Ink Portfolio
function EmptyInkPortfolio() {
  return (
    <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none overflow-hidden">
      <CardContent className="p-12 text-center">
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 bg-[#4ade80]/5 border border-[#4ade80]/20 flex items-center justify-center">
            <Paintbrush className="h-10 w-10 text-[#4ade80]" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#050805] border border-[#4ade80]/30 flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-[#4ade80]" />
          </div>
        </div>
        
        <h3 className="text-2xl font-black tracking-tighter text-[#e8f5e8] mb-3">
          YOUR INK PORTFOLIO IS EMPTY
        </h3>
        
        <p className="text-[#6b8e6b] font-mono text-sm max-w-md mx-auto mb-2">
          Your Ink Portfolio holds tattoos attributed TO you by artists. 
          When an artist tattoos you, they can attribute the design to your account.
        </p>
        
        <p className="text-xs text-[#6b8e6b] max-w-md mx-auto mb-8">
          Each attributed tattoo earns you royalties when the design sells on merchandise.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/shop">
            <Button
              variant="outline"
              className="rounded-none border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] font-black"
            >
              <Search className="h-4 w-4 mr-2" />
              FIND ARTISTS
            </Button>
          </Link>
          <Button
            className="bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black"
            onClick={() => {
              // Scroll to activation section
              document.querySelector('input[placeholder="INK-XXXX-XXXX"]')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            ACTIVATE ATTRIBUTION
          </Button>
        </div>

        <div className="mt-8 pt-8 border-t border-[#1a2e1a]">
          <p className="text-xs text-[#6b8e6b] font-mono">
            Already have a code from your artist? Enter it above to activate.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Empty State: No partners attributed
function EmptyPartners() {
  return (
    <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none overflow-hidden">
      <CardContent className="p-12 text-center">
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 bg-[#fbbf24]/5 border border-[#fbbf24]/20 flex items-center justify-center">
            <User className="h-10 w-10 text-[#fbbf24]" />
          </div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-[#050805] border border-[#fbbf24]/30 flex items-center justify-center">
            <Share2 className="h-3 w-3 text-[#fbbf24]" />
          </div>
        </div>
        
        <h3 className="text-2xl font-black tracking-tighter text-[#e8f5e8] mb-3">
          NO PARTNERS ATTRIBUTED
        </h3>
        
        <p className="text-[#6b8e6b] font-mono text-sm max-w-md mx-auto mb-2">
          Partners are people who have your designs tattooed on them. 
          When you attribute a design to a partner, they earn royalties from sales.
        </p>
        
        <p className="text-xs text-[#6b8e6b] max-w-md mx-auto mb-8">
          Partners become walking billboards for your work—and you both profit.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/artist/designs/upload">
            <Button
              className="bg-[#fbbf24] hover:bg-[#f59e0b] text-black rounded-none font-black"
            >
              <Plus className="h-4 w-4 mr-2" />
              UPLOAD DESIGN & ATTRIBUTE
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-[#1a2e1a] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
              <div className="text-[#fbbf24] font-black text-lg mb-1">01</div>
              <p className="text-xs text-[#e8f5e8] font-black">TATTOO</p>
              <p className="text-xs text-[#6b8e6b]">Apply your design to a willing canvas</p>
            </div>
            <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
              <div className="text-[#fbbf24] font-black text-lg mb-1">02</div>
              <p className="text-xs text-[#e8f5e8] font-black">ATTRIBUTE</p>
              <p className="text-xs text-[#6b8e6b]">Link the design to their Stigmator account</p>
            </div>
            <div className="p-4 bg-[#050805] border border-[#1a2e1a]">
              <div className="text-[#fbbf24] font-black text-lg mb-1">03</div>
              <p className="text-xs text-[#e8f5e8] font-black">EARN TOGETHER</p>
              <p className="text-xs text-[#6b8e6b]">Both profit from every merchandise sale</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
