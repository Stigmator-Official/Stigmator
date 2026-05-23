"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Droplets, 
  TrendingUp, 
  CheckCircle, 
  Loader2, 
  Paintbrush, 
  ArrowRight, 
  Hash,
  AlertCircle,
  X,
  AlertTriangle,
  Copy,
  Info,
  DollarSign,
  Users
} from "lucide-react"
import { useToast } from "@/components/toast/toast-context"
import { 
  redeemPartnershipCode, 
  getUserPartnerships, 
  type DesignPartnership 
} from "@/lib/api/partnerships"
import { getUserEarningsSummary } from "@/lib/api/revenue"
import { OptimizedImage } from "@/components/ui/optimized-image"

type ActivationState = "idle" | "validating" | "success" | "error" | "already-activated"

export default function PartnerPage() {
  const { success, error: showError } = useToast()
  const [code, setCode] = useState("")
  const [activationState, setActivationState] = useState<ActivationState>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [partnerships, setPartnerships] = useState<DesignPartnership[]>([])
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    attributionCount: 0,
  })

  useEffect(() => {
    loadPartnerData()
  }, [])

  const loadPartnerData = async () => {
    setLoading(true)
    try {
      // Load partnerships
      const userPartnerships = await getUserPartnerships()
      setPartnerships(userPartnerships)
      
      // Load real earnings from API
      const res = await fetch("/api/partner/earnings")
      if (res.ok) {
        const data = await res.json()
        setStats({
          totalEarnings: data.totalEarnings || 0,
          pendingEarnings: data.pendingEarnings || 0,
          paidEarnings: data.paidEarnings || 0,
          attributionCount: userPartnerships.length,
        })
      } else {
        // Fallback to partnership totals
        const totalEarnings = userPartnerships.reduce((sum, p) => sum + (p.total_earnings || 0), 0)
        setStats({
          totalEarnings,
          pendingEarnings: totalEarnings,
          paidEarnings: 0,
          attributionCount: userPartnerships.length,
        })
      }
    } catch {
      showError("Failed to load data", "Please try refreshing the page")
    } finally {
      setLoading(false)
    }
  }

  const validateCode = (value: string): string | null => {
    if (!value.trim()) return "Please enter a partnership code"
    if (value.length < 8) return "Code must be at least 8 characters"
    if (!/^INK-[A-Z0-9]+-[0-9]{4}-[A-Z0-9]+$/i.test(value)) {
      return "Invalid code format. Expected: INK-XXXX-YYYY-ZZZZ"
    }
    return null
  }

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateCode(code)
    if (validationError) {
      setActivationState("error")
      setErrorMessage(validationError)
      return
    }

    setIsSubmitting(true)
    setActivationState("validating")
    setErrorMessage("")

    try {
      await redeemPartnershipCode(code)
      
      setActivationState("success")
      success("Partnership activated!", "This tattoo has been added to your Ink Portfolio.")
      await loadPartnerData()
    } catch (err: any) {
      setActivationState("error")
      setErrorMessage(err.message || "Invalid or expired code. Please check and try again.")
      showError("Activation failed", err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setActivationState("idle")
    setCode("")
    setErrorMessage("")
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    success("Copied!", "Code copied to clipboard")
  }

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#050805]">
      {/* Hero */}
      <div className="px-4 sm:px-8 lg:px-16 py-16 border-b border-[#1a2e1a]">
        <div className="max-w-[1800px] mx-auto">
          <div className="max-w-4xl">
            <span className="font-mono text-xs tracking-widest text-[#fbbf24] mb-4 block">
              [EQUITY INK PROTOCOL]
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter mb-8 text-[#e8f5e8]">
              ACTIVATE
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] to-[#dc2626]">
                YOUR INK
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-[#6b8e6b] max-w-2xl leading-relaxed">
              Got tattooed by a Stigmator artist? Enter your partnership code to add 
              the design to your <span className="text-[#fbbf24]">Ink Portfolio</span> and 
              earn royalties on every merchandise sale.
            </p>
          </div>
        </div>
      </div>

      {/* Redeem Code Section */}
      <div className="px-4 sm:px-8 lg:px-16 py-16 border-b border-[#1a2e1a]">
        <div className="max-w-[1800px] mx-auto">
          <div className="max-w-xl">
            {activationState === "success" ? (
              <div className="bg-[#4ade80]/10 border border-[#4ade80] p-8 text-center animate-in zoom-in">
                <div className="w-16 h-16 bg-[#4ade80] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-2xl font-black tracking-tighter mb-2 text-[#e8f5e8]">
                  PARTNERSHIP ACTIVATED
                </h3>
                <p className="text-[#6b8e6b] font-mono text-sm mb-6">
                  This tattoo has been added to your Ink Portfolio. You&apos;re now earning 
                  royalties from all sales of this design.
                </p>
                
                <div className="bg-[#050805] border border-[#1a2e1a] p-4 mb-6">
                  <p className="text-xs font-mono text-[#6b8e6b] mb-2">ACTIVATED CODE</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-lg font-mono text-[#4ade80]">{code}</code>
                    <button 
                      onClick={copyCode}
                      className="p-1 text-[#6b8e6b] hover:text-[#e8f5e8]"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="rounded-none border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8]"
                  >
                    ACTIVATE ANOTHER
                  </Button>
                </div>
              </div>
            ) : activationState === "error" ? (
              <div className="bg-[#dc2626]/10 border border-[#dc2626] p-8 text-center animate-in zoom-in">
                <div className="w-16 h-16 bg-[#dc2626] flex items-center justify-center mx-auto mb-4">
                  <X className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-black tracking-tighter mb-2 text-[#e8f5e8]">
                  ACTIVATION FAILED
                </h3>
                <p className="text-[#6b8e6b] font-mono text-sm mb-6">
                  {errorMessage}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleReset}
                    className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-none font-black"
                  >
                    TRY AGAIN
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black tracking-tighter mb-2 text-[#e8f5e8]">
                  ENTER PARTNERSHIP CODE
                </h2>
                <p className="text-[#6b8e6b] font-mono text-sm mb-6">
                  Enter the code your artist gave you to activate revenue sharing.
                </p>
                
                <form onSubmit={handleRedeem} className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6b8e6b]" />
                      <Input
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value.toUpperCase())
                          // Reset error state when user types
                          setActivationState("idle")
                        }}
                        placeholder="INK-XXXX-YYYY-ZZZZ"
                        disabled={isSubmitting}
                        className={`bg-[#0a0f0a] border rounded-none h-14 pl-10 font-mono text-lg tracking-wider uppercase text-[#e8f5e8] transition-colors ${
                          (activationState as ActivationState) === "error"
                            ? "border-[#dc2626] focus:border-[#dc2626]"
                            : "border-[#1a2e1a] focus:border-[#fbbf24]"
                        }`}
                      />
                    </div>
                    <Button 
                      type="submit"
                      disabled={isSubmitting || code.length < 8}
                      className="bg-[#fbbf24] hover:bg-[#d97706] rounded-none font-black tracking-wider h-14 px-8 text-black disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          ACTIVATE
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex items-start gap-2 text-xs font-mono text-[#6b8e6b]">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p>
                      Code format: INK-[ARTIST]-[YEAR]-[CODE]. 
                      Can&apos;t find your code? Contact your artist.
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Ink Portfolio Stats */}
      <div className="px-4 sm:px-8 lg:px-16 py-16 border-b border-[#1a2e1a]">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#fbbf24]/10 border border-[#fbbf24]/30 flex items-center justify-center">
              <Paintbrush className="h-5 w-5 text-[#fbbf24]" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter text-[#e8f5e8]">
              YOUR INK PORTFOLIO
            </h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-[#fbbf24] animate-spin" />
            </div>
          ) : partnerships.length === 0 ? (
            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardContent className="p-12 text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-[#fbbf24]/5 border border-[#fbbf24]/20 flex items-center justify-center">
                    <Droplets className="h-10 w-10 text-[#fbbf24]" />
                  </div>
                </div>
                <h3 className="text-xl font-black tracking-tighter mb-2 text-[#e8f5e8]">
                  NO PARTNERSHIPS YET
                </h3>
                <p className="text-[#6b8e6b] font-mono text-sm max-w-md mx-auto mb-6">
                  Your Ink Portfolio is where partnerships will appear. 
                  When an artist tattoos you, they can create a revenue-sharing partnership.
                </p>
                <p className="text-xs text-[#6b8e6b] mb-6">
                  Ask your tattoo artist for their Stigmator partnership code.
                </p>
                <Link href="/artists">
                  <Button
                    variant="outline"
                    className="rounded-none border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8]"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    FIND ARTISTS
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid md:grid-cols-4 gap-4 mb-12">
                <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-mono tracking-wider text-[#6b8e6b]">
                      TOTAL EARNINGS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-black text-[#4ade80]">
                        {formatCurrency(stats.totalEarnings)}
                      </span>
                      <TrendingUp className="h-4 w-4 text-[#4ade80]" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-mono tracking-wider text-[#6b8e6b]">
                      PENDING
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-[#fbbf24]">
                      {formatCurrency(stats.pendingEarnings)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-mono tracking-wider text-[#6b8e6b]">
                      PARTNERSHIPS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-[#e8f5e8]">
                      {stats.attributionCount}
                    </div>
                    <p className="text-xs text-[#6b8e6b]">
                      TATTOOS IN YOUR PORTFOLIO
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-mono tracking-wider text-[#6b8e6b]">
                      YOUR SHARE
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-[#e8f5e8]">
                      {partnerships[0]?.client_share || 0}%
                    </div>
                    <span className="text-xs font-mono text-[#6b8e6b]">
                      AVERAGE REVENUE SHARE
                    </span>
                  </CardContent>
                </Card>
              </div>

              {/* Portfolio Table */}
              <div className="border border-[#1a2e1a] overflow-x-auto">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#1a2e1a] bg-[#0a0f0a] font-mono text-xs tracking-wider text-[#6b8e6b] min-w-[600px]">
                  <div className="col-span-4">DESIGN</div>
                  <div className="col-span-2">STATUS</div>
                  <div className="col-span-2">YOUR SHARE</div>
                  <div className="col-span-2">EARNINGS</div>
                  <div className="col-span-2 text-right">ACTIONS</div>
                </div>
                
                {partnerships.map((item) => (
                  <div 
                    key={item.id} 
                    className="grid grid-cols-12 gap-4 p-4 border-b border-[#1a2e1a] hover:bg-[#0a0f0a] transition-colors items-center min-w-[600px]"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#050805] border border-[#1a2e1a] overflow-hidden">
                        <OptimizedImage
                          src={item.design?.images?.[0] || "/placeholder.png"}
                          alt=""
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <p className="font-black tracking-tighter text-[#e8f5e8]">
                          {item.design?.title || "Design"}
                        </p>
                        <p className="text-xs text-[#6b8e6b]">
                          Partner: {item.partner?.display_name}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className={`text-xs px-2 py-1 ${
                        item.verification_status === "verified" 
                          ? "bg-[#4ade80]/20 text-[#4ade80]" 
                          : item.verification_status === "pending"
                            ? "bg-[#fbbf24]/20 text-[#fbbf24]"
                            : "bg-[#dc2626]/20 text-[#dc2626]"
                      }`}>
                        {item.verification_status.toUpperCase()}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#fbbf24] font-black">{item.client_share}%</span>
                    </div>
                    <div className="col-span-2 font-black text-[#4ade80]">
                      {formatCurrency(item.total_earnings || 0)}
                    </div>
                    <div className="col-span-2 text-right">
                      <Link href={`/dashboard/partnerships/${item.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8]"
                        >
                          DETAILS
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="px-4 sm:px-8 lg:px-16 py-16">
        <div className="max-w-[1800px] mx-auto">
          <h2 className="text-2xl font-black tracking-tighter mb-12 text-[#e8f5e8]">
            THE EQUITY INK FLOW
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "GET TATTOOED",
                desc: "Receive original art from a verified Stigmator artist",
              },
              {
                step: "02",
                title: "RECEIVE CODE",
                desc: "Artist generates unique partnership code for your design",
              },
              {
                step: "03",
                title: "ACTIVATE",
                desc: "Enter code on Stigmator. Revenue share is locked in",
              },
              {
                step: "04",
                title: "EARN FOREVER",
                desc: "Every sale of that design on merchandise pays you",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-black text-[#1a2e1a] mb-4">
                  {item.step}
                </div>
                <h3 className="font-black tracking-tighter text-xl mb-2 text-[#e8f5e8]">
                  {item.title}
                </h3>
                <p className="text-sm text-[#6b8e6b]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
