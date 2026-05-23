"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Inbox,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  DollarSign,
  TrendingUp,
  Loader2,
  Eye,
  Image as ImageIcon,
} from "lucide-react"

interface Submission {
  id: string
  garmentId: string
  designName: string
  garmentType: string
  artistName: string
  artistRating: number
  retailPrice: number
  depositAmount: number
  complexity: string
  submittedAt: string
  status: "pending" | "accepted" | "declined" | "in_production"
  priority: string
  mockupImages: string[]
  designPlacement: any
  productDesignId: string
}

interface Stats {
  pendingReview: number
  acceptedThisMonth: number
  totalEarned: number
  avgResponseTime: string
}

export default function ManufacturerDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [stats, setStats] = useState<Stats>({
    pendingReview: 0,
    acceptedThisMonth: 0,
    totalEarned: 0,
    avgResponseTime: "—",
  })

  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [respondAction, setRespondAction] = useState<"accept" | "decline" | null>(null)
  const [respondLoading, setRespondLoading] = useState(false)
  const [declineReason, setDeclineReason] = useState("")
  const [quoteCost, setQuoteCost] = useState("")
  const [quoteSetup, setQuoteSetup] = useState("")
  const [quoteTurnaround, setQuoteTurnaround] = useState("")

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/manufacturer/submissions", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load submissions")
      const data = await res.json()
      setSubmissions(data.submissions || [])
      setStats(data.stats || { pendingReview: 0, acceptedThisMonth: 0, totalEarned: 0, avgResponseTime: "—" })
    } catch (err) {
      console.error("Error loading dashboard:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async () => {
    if (!selectedSubmission || !respondAction) return
    setRespondLoading(true)
    try {
      const payload: any = { action: respondAction }
      if (respondAction === "decline") {
        payload.declineReason = declineReason.trim()
      }
      if (respondAction === "accept") {
        payload.quote = {
          costPerUnit: Number(quoteCost || 0) * 100,
          setupFee: Number(quoteSetup || 0) * 100,
          turnaroundDays: Number(quoteTurnaround || 0) || undefined,
        }
      }

      const res = await fetch(`/api/manufacturer/submissions/${selectedSubmission.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || "Failed to respond")
        return
      }

      // Refresh
      setRespondAction(null)
      setSelectedSubmission(null)
      setDeclineReason("")
      setQuoteCost("")
      setQuoteSetup("")
      setQuoteTurnaround("")
      await loadDashboardData()
    } catch (err) {
      console.error("Respond error:", err)
      alert("Failed to respond")
    } finally {
      setRespondLoading(false)
    }
  }

  const pendingSubmissions = submissions.filter((s) => s.status === "pending")
  const acceptedSubmissions = submissions.filter((s) => s.status === "accepted" || s.status === "in_production")

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center texture-grain">
        <Loader2 className="h-12 w-12 text-[#4ade80] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 texture-grain">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-[#e8f5e8]">
              MANUFACTURER DASHBOARD
            </h1>
            <p className="text-[#6b8e6b] mt-1">
              Review and accept garment production requests
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-4">
              <Clock className="h-5 w-5 text-[#fbbf24] mb-2" />
              <p className="text-3xl font-black text-[#e8f5e8]">{stats.pendingReview}</p>
              <p className="text-xs font-mono text-[#6b8e6b]">PENDING REVIEW</p>
            </CardContent>
          </Card>
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-4">
              <CheckCircle className="h-5 w-5 text-[#4ade80] mb-2" />
              <p className="text-3xl font-black text-[#e8f5e8]">{stats.acceptedThisMonth}</p>
              <p className="text-xs font-mono text-[#6b8e6b]">ACCEPTED THIS MONTH</p>
            </CardContent>
          </Card>
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-4">
              <DollarSign className="h-5 w-5 text-[#60a5fa] mb-2" />
              <p className="text-3xl font-black text-[#e8f5e8]">${stats.totalEarned.toLocaleString()}</p>
              <p className="text-xs font-mono text-[#6b8e6b]">TOTAL EARNED</p>
            </CardContent>
          </Card>
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-4">
              <TrendingUp className="h-5 w-5 text-[#a78bfa] mb-2" />
              <p className="text-3xl font-black text-[#e8f5e8]">{stats.avgResponseTime}</p>
              <p className="text-xs font-mono text-[#6b8e6b]">AVG RESPONSE</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Submissions */}
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-black tracking-tighter flex items-center gap-2 text-[#e8f5e8]">
              <Inbox className="h-5 w-5 text-[#4ade80]" />
              PENDING SUBMISSIONS
              {stats.pendingReview > 0 && (
                <Badge className="bg-[#dc2626] text-white rounded-none">
                  {stats.pendingReview}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingSubmissions.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#1a2e1a]">
                <CheckCircle className="h-12 w-12 text-[#6b8e6b] mx-auto mb-4" />
                <h3 className="text-xl font-black tracking-tighter text-[#e8f5e8] mb-2">
                  ALL CAUGHT UP!
                </h3>
                <p className="text-[#6b8e6b] font-mono text-sm">
                  No pending submissions to review. New requests will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingSubmissions.map((sub) => (
                  <div key={sub.id} className="p-4 bg-[#050805] border border-[#1a2e1a]">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-black text-[#e8f5e8]">{sub.designName}</h3>
                          <Badge className="rounded-none text-xs bg-[#fbbf24] text-black">
                            {sub.complexity.toUpperCase()}
                          </Badge>
                          {sub.priority === "rush" && (
                            <Badge className="rounded-none text-xs bg-[#dc2626] text-white">
                              RUSH
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#6b8e6b]">{sub.garmentType}</p>
                        <p className="text-xs text-[#6b8e6b] mt-1">
                          By {sub.artistName} • Retail ${sub.retailPrice.toFixed(2)} • Deposit ${sub.depositAmount.toFixed(2)}
                        </p>
                        {sub.mockupImages && sub.mockupImages.length > 0 && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-[#6b8e6b]">
                            <ImageIcon className="h-3 w-3" />
                            {sub.mockupImages.length} mockup image(s)
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none border-[#1a2e1a] text-[#e8f5e8]"
                          asChild
                        >
                          <Link href={`/artist/garments/${sub.productDesignId}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            VIEW
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none border-[#dc2626] text-[#dc2626]"
                          onClick={() => {
                            setSelectedSubmission(sub)
                            setRespondAction("decline")
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          DECLINE
                        </Button>
                        <Button
                          size="sm"
                          className="rounded-none bg-[#4ade80] text-black"
                          onClick={() => {
                            setSelectedSubmission(sub)
                            setRespondAction("accept")
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          ACCEPT
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Jobs */}
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardHeader>
            <CardTitle className="font-black tracking-tighter flex items-center gap-2 text-[#e8f5e8]">
              <Package className="h-5 w-5 text-[#60a5fa]" />
              ACTIVE JOBS
            </CardTitle>
          </CardHeader>
          <CardContent>
            {acceptedSubmissions.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-[#1a2e1a]">
                <Package className="h-10 w-10 text-[#6b8e6b] mx-auto mb-3" />
                <p className="text-[#6b8e6b] font-mono text-sm">
                  No active jobs. Accept submissions to start production.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {acceptedSubmissions.map((sub) => (
                  <div key={sub.id} className="p-4 bg-[#050805] border border-[#1a2e1a]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-black text-[#e8f5e8]">{sub.designName}</h3>
                        <p className="text-sm text-[#6b8e6b]">{sub.artistName}</p>
                      </div>
                      <Badge className="rounded-none bg-[#4ade80] text-black">
                        {sub.status === "in_production" ? "IN PRODUCTION" : "ACCEPTED"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accept Dialog */}
      <Dialog
        open={respondAction === "accept" && !!selectedSubmission}
        onOpenChange={(open) => {
          if (!open) {
            setRespondAction(null)
            setSelectedSubmission(null)
          }
        }}
      >
        <DialogContent className="bg-[#0a0f0a] border-[#1a2e1a] text-[#e8f5e8] rounded-none">
          <DialogHeader>
            <DialogTitle className="font-black tracking-tighter">ACCEPT SUBMISSION</DialogTitle>
            <DialogDescription className="text-[#6b8e6b]">
              Provide a quote for <span className="text-[#e8f5e8]">{selectedSubmission?.designName}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-mono">COST PER UNIT ($)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={quoteCost}
                  onChange={(e) => setQuoteCost(e.target.value)}
                  className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8]"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-mono">SETUP FEE ($)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={quoteSetup}
                  onChange={(e) => setQuoteSetup(e.target.value)}
                  className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8]"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-mono">TURNAROUND (DAYS)</Label>
              <Input
                type="number"
                min={1}
                value={quoteTurnaround}
                onChange={(e) => setQuoteTurnaround(e.target.value)}
                className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8]"
                placeholder="7"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRespondAction(null)
                setSelectedSubmission(null)
              }}
              className="rounded-none border-[#1a2e1a] text-[#e8f5e8]"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleRespond}
              disabled={respondLoading || !quoteCost}
              className="rounded-none bg-[#4ade80] text-black"
            >
              {respondLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "CONFIRM ACCEPT"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog
        open={respondAction === "decline" && !!selectedSubmission}
        onOpenChange={(open) => {
          if (!open) {
            setRespondAction(null)
            setSelectedSubmission(null)
          }
        }}
      >
        <DialogContent className="bg-[#0a0f0a] border-[#1a2e1a] text-[#e8f5e8] rounded-none">
          <DialogHeader>
            <DialogTitle className="font-black tracking-tighter">DECLINE SUBMISSION</DialogTitle>
            <DialogDescription className="text-[#6b8e6b]">
              Let the artist know why you&apos;re declining <span className="text-[#e8f5e8]">{selectedSubmission?.designName}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8]"
              placeholder="e.g., Too complex for our equipment, minimum order not met..."
              rows={4}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRespondAction(null)
                setSelectedSubmission(null)
              }}
              className="rounded-none border-[#1a2e1a] text-[#e8f5e8]"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleRespond}
              disabled={respondLoading}
              className="rounded-none bg-[#dc2626] text-white"
            >
              {respondLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "CONFIRM DECLINE"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
