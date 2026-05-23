"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Factory, 
  RotateCw, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  XCircle,
  CreditCard,
  ArrowRight,
  RefreshCw
} from "lucide-react"

interface Manufacturer {
  id: string
  name: string
  specialty: string[]
  rating: number
  location: string
  turnaroundDays: number
}

interface SubmissionStatus {
  id: string
  garmentName: string
  status: "pending" | "reviewing" | "accepted" | "declined" | "rerouted"
  manufacturer: Manufacturer | null
  submittedAt: string
  declineCount: number
  declineReasons: string[]
  nextManufacturer: Manufacturer | null
  depositStatus: "held" | "credited" | "charged"
  creditAmount: number
}

// Mock manufacturers
const MOCK_MANUFACTURERS: Manufacturer[] = [
  { id: "m1", name: "Stitch & Stone Mfg", specialty: ["Hoodies", "Crewnecks"], rating: 4.9, location: "Los Angeles, CA", turnaroundDays: 7 },
  { id: "m2", name: "Organic Print Co", specialty: ["T-Shirts", "Tank Tops"], rating: 4.7, location: "Portland, OR", turnaroundDays: 5 },
  { id: "m3", name: "Fast Stitch Labs", specialty: ["All Types"], rating: 4.5, location: "Austin, TX", turnaroundDays: 4 },
  { id: "m4", name: "Premium Threads", specialty: ["Hoodies", "Long Sleeve"], rating: 4.8, location: "New York, NY", turnaroundDays: 8 },
  { id: "m5", name: "West Coast Apparel", specialty: ["T-Shirts", "Crop Tops"], rating: 4.6, location: "Seattle, WA", turnaroundDays: 6 },
]

// Mock submission data
const MOCK_SUBMISSION: SubmissionStatus = {
  id: "sub-001",
  garmentName: "SERPENT COIL Hoodie",
  status: "rerouted",
  manufacturer: MOCK_MANUFACTURERS[1], // Currently with Organic Print Co
  submittedAt: "2025-01-15",
  declineCount: 1,
  declineReasons: ["Color matching complexity exceeds current capacity"],
  nextManufacturer: MOCK_MANUFACTURERS[3], // Will go to Premium Threads next
  depositStatus: "credited",
  creditAmount: 80
}

export function ManufacturingWorkflow() {
  const [submission, setSubmission] = useState<SubmissionStatus>(MOCK_SUBMISSION)
  const [showCreditInfo, setShowCreditInfo] = useState(true)
  const [isReviewing, setIsReviewing] = useState(false)

  // Status configurations
  const statusConfig = {
    pending: { color: "#fbbf24", icon: Clock, label: "PENDING ASSIGNMENT" },
    reviewing: { color: "#60a5fa", icon: Factory, label: "UNDER REVIEW" },
    accepted: { color: "#4ade80", icon: CheckCircle2, label: "ACCEPTED" },
    declined: { color: "#dc2626", icon: XCircle, label: "DECLINED" },
    rerouted: { color: "#a78bfa", icon: RotateCw, label: "REROUTED" }
  }

  const config = statusConfig[submission.status]
  const StatusIcon = config.icon

  // Calculate remaining manufacturers
  const remainingManufacturers = 3 - submission.declineCount
  const isFinalChance = remainingManufacturers === 1

  const handleReviewAndResubmit = () => {
    setIsReviewing(true)
    // Simulate review process
    setTimeout(() => {
      setSubmission({
        ...submission,
        status: "pending",
        declineCount: 0,
        declineReasons: [],
        manufacturer: null,
        nextManufacturer: MOCK_MANUFACTURERS[0]
      })
      setIsReviewing(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Credit Notification */}
      {showCreditInfo && submission.depositStatus === "credited" && (
        <div className="p-4 bg-[#4ade80]/10 border border-[#4ade80] relative">
          <button 
            onClick={() => setShowCreditInfo(false)}
            className="absolute top-2 right-2 text-[#6b8e6b] hover:text-[#e8f5e8]"
          >
            ×
          </button>
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-[#4ade80] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-[#4ade80]">DEPOSIT CREDITED</p>
              <p className="text-sm text-[#e8f5e8]">
                Your ${submission.creditAmount} deposit has been credited to your account 
                since the manufacturer declined. This credit will be used for your next submission 
                - no new deposit required until a manufacturer accepts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Status Card */}
      <div className="bg-[#0a0f0a] border-2 p-6" style={{ borderColor: config.color }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <Badge 
              className="rounded-none font-black text-xs mb-2"
              style={{ backgroundColor: config.color, color: "#000" }}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
            <h3 className="font-black text-xl text-[#e8f5e8]">
              {submission.garmentName}
            </h3>
            <p className="text-xs text-[#6b8e6b] font-mono mt-1">
              Submitted {submission.submittedAt} • ID: {submission.id}
            </p>
          </div>
          
          {/* Strike Counter */}
          <div className="text-right">
            <div className="text-xs font-mono text-[#6b8e6b]">DECLINES</div>
            <div className={`text-2xl font-black ${
              submission.declineCount >= 2 ? "text-[#dc2626]" : "text-[#e8f5e8]"
            }`}>
              {submission.declineCount}/3
            </div>
          </div>
        </div>

        {/* Current Manufacturer */}
        {submission.manufacturer && (
          <div className="p-4 bg-[#050805] border border-[#1a2e1a] mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-[#6b8e6b]">CURRENT MANUFACTURER</p>
                <p className="font-black text-lg text-[#e8f5e8]">{submission.manufacturer.name}</p>
                <p className="text-xs text-[#6b8e6b]">
                  {submission.manufacturer.location} • {submission.manufacturer.turnaroundDays} day turnaround
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-[#fbbf24]">
                  <span>★</span>
                  <span className="font-black">{submission.manufacturer.rating}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Decline History */}
        {submission.declineReasons.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-xs font-mono text-[#6b8e6b]">PREVIOUS DECLINE REASONS:</p>
            {submission.declineReasons.map((reason, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-[#e8f5e8]">
                <XCircle className="h-4 w-4 text-[#dc2626] flex-shrink-0 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        )}

        {/* Auto-Reroute Info */}
        {submission.status === "rerouted" && submission.nextManufacturer && (
          <div className="p-4 bg-[#a78bfa]/10 border border-[#a78bfa]/30">
            <div className="flex items-start gap-3">
              <RefreshCw className="h-5 w-5 text-[#a78bfa] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-[#a78bfa]">AUTO-REROUTING IN PROGRESS</p>
                <p className="text-sm text-[#e8f5e8] mt-1">
                  Your design is being automatically sent to the next available manufacturer:
                </p>
                <p className="text-sm font-black text-[#e8f5e8] mt-2">
                  {submission.nextManufacturer.name} ({submission.nextManufacturer.location})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Strike Warning */}
        {isFinalChance && submission.status !== "accepted" && (
          <div className="mt-4 p-4 bg-[#dc2626]/10 border border-[#dc2626]">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-[#dc2626]">FINAL CHANCE</p>
                <p className="text-sm text-[#e8f5e8]">
                  If this manufacturer declines, your design will require manual review before 
                  it can be submitted again. Please ensure your design files meet quality standards.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3-Strike Rule Info */}
      <div className="bg-[#050805] border border-[#1a2e1a] p-6">
        <h4 className="font-black tracking-tighter text-sm text-[#e8f5e8] mb-4">
          HOW THE MANUFACTURING QUEUE WORKS
        </h4>
        
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-[#4ade80] flex items-center justify-center font-black text-black flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-black text-[#e8f5e8]">SUBMIT YOUR DESIGN</p>
              <p className="text-sm text-[#6b8e6b]">
                No deposit charged yet. Your submission enters the manufacturer queue.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-[#60a5fa] flex items-center justify-center font-black text-black flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-black text-[#e8f5e8]">MANUFACTURER REVIEW</p>
              <p className="text-sm text-[#6b8e6b]">
                First available manufacturer reviews your design. If declined, 
                auto-rerouted to next manufacturer (up to 3 times).
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4">
            <div className={`w-8 h-8 flex items-center justify-center font-black flex-shrink-0 ${
              submission.declineCount > 0 ? "bg-[#fbbf24] text-black" : "bg-[#1a2e1a] text-[#6b8e6b]"
            }`}>
              3
            </div>
            <div>
              <p className="font-black text-[#e8f5e8]">3-STRIKE RULE</p>
              <p className="text-sm text-[#6b8e6b]">
                After 3 declines, your design requires manual review. You'll need to 
                address feedback before resubmitting.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-[#4ade80] flex items-center justify-center font-black text-black flex-shrink-0">
              4
            </div>
            <div>
              <p className="font-black text-[#e8f5e8]">DEPOSIT ONLY ON ACCEPT</p>
              <p className="text-sm text-[#6b8e6b]">
                Your deposit is only charged when a manufacturer ACCEPTS. 
                Declines = automatic credit to your account. No money lost on declines.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {submission.status === "declined" && submission.declineCount >= 3 && (
        <div className="bg-[#dc2626]/10 border border-[#dc2626] p-6">
          <h4 className="font-black tracking-tighter text-[#dc2626] mb-2">
            MANUAL REVIEW REQUIRED
          </h4>
          <p className="text-sm text-[#e8f5e8] mb-4">
            Your design has been declined by 3 manufacturers. Please review the feedback 
            and make necessary adjustments before resubmitting.
          </p>
          <Button
            onClick={handleReviewAndResubmit}
            disabled={isReviewing}
            className="bg-[#4ade80] hover:bg-[#22c55e] text-black rounded-none font-black"
          >
            {isReviewing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                REVIEWING...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                I&apos;VE REVIEWED - RESUBMIT
              </>
            )}
          </Button>
        </div>
      )}

      {/* Deposit Credit Summary */}
      <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-[#6b8e6b]">ACCOUNT CREDIT</p>
            <p className="text-2xl font-black text-[#4ade80]">${submission.creditAmount}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-[#6b8e6b]">STATUS</p>
            <Badge className="bg-[#4ade80] text-black rounded-none font-mono">
              AVAILABLE
            </Badge>
          </div>
        </div>
        <p className="text-xs text-[#6b8e6b] mt-3">
          This credit will be automatically applied to your next submission. 
          No additional deposit needed until a manufacturer accepts your design.
        </p>
      </div>
    </div>
  )
}
