"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  DollarSign, 
  Star, 
  Clock,
  CheckCircle,
  Package,
  Factory,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Minus,
  Award,
  Zap,
  Target
} from "lucide-react"

interface PerformanceTabProps {
  stats: {
    totalJobs: number
    completedJobs: number
    totalEarnings: number
    inkEarnings: number
    tattooCount: number
  }
}

// Mock reviews data
const MOCK_REVIEWS = [
  {
    id: "1",
    artistName: "Dark Matter Studio",
    rating: 5,
    comment: "Excellent quality and fast turnaround. The prints came out perfect!",
    date: "2024-03-15",
    jobType: "T-Shirt Batch",
  },
  {
    id: "2",
    artistName: "Ghost Ink Collective",
    rating: 5,
    comment: "Professional work. Will definitely order again.",
    date: "2024-03-10",
    jobType: "Hoodie Production",
  },
  {
    id: "3",
    artistName: "Sacred Skin Designs",
    rating: 4,
    comment: "Great quality, slightly delayed but worth the wait.",
    date: "2024-03-05",
    jobType: "Tank Top Run",
  },
  {
    id: "4",
    artistName: "Bloodline Art",
    rating: 5,
    comment: "Flawless execution. Colors are vibrant and durable.",
    date: "2024-02-28",
    jobType: "Long Sleeve Batch",
  },
]

// Mock monthly stats
const MONTHLY_STATS = [
  { month: "JAN", jobs: 12, earnings: 450 },
  { month: "FEB", jobs: 18, earnings: 720 },
  { month: "MAR", jobs: 15, earnings: 580 },
  { month: "APR", jobs: 22, earnings: 890 },
  { month: "MAY", jobs: 28, earnings: 1120 },
  { month: "JUN", jobs: 24, earnings: 950 },
]

export function PerformanceTab({ stats }: PerformanceTabProps) {
  const completionRate = stats.totalJobs > 0 
    ? Math.round((stats.completedJobs / stats.totalJobs) * 100) 
    : 0

  const averageRating = MOCK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / MOCK_REVIEWS.length

  const getRatingTrend = (rating: number) => {
    if (rating >= 4.5) return { icon: ChevronUp, color: "text-[#4ade80]", label: "EXCELLENT" }
    if (rating >= 4.0) return { icon: Minus, color: "text-[#fbbf24]", label: "GOOD" }
    return { icon: ChevronDown, color: "text-[#dc2626]", label: "NEEDS WORK" }
  }

  const ratingTrend = getRatingTrend(averageRating)
  const TrendIcon = ratingTrend.icon

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#0a0f0a] border-[#fbbf24]/30 rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#fbbf24]/10 border border-[#fbbf24]/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-[#fbbf24]" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#fbbf24]">{completionRate}%</div>
            <p className="text-xs text-[#6b8e6b] font-mono mt-1">COMPLETION RATE</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0f0a] border-[#4ade80]/30 rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#4ade80]/10 border border-[#4ade80]/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-[#4ade80]" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#4ade80]">
              ${stats.totalEarnings.toLocaleString()}
            </div>
            <p className="text-xs text-[#6b8e6b] font-mono mt-1">TOTAL EARNINGS</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0f0a] border-[#60a5fa]/30 rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#60a5fa]/10 border border-[#60a5fa]/30 flex items-center justify-center">
                <Star className="h-5 w-5 text-[#60a5fa]" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#60a5fa]">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-[#6b8e6b] font-mono mt-1">AVG RATING</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0f0a] border-[#a78bfa]/30 rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#a78bfa]/10 border border-[#a78bfa]/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-[#a78bfa]" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#a78bfa]">2.3</div>
            <p className="text-xs text-[#6b8e6b] font-mono mt-1">AVG DAYS</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1fr,400px] gap-6">
        {/* Left Column - Charts & Stats */}
        <div className="space-y-6">
          {/* Monthly Performance Chart */}
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardHeader>
              <CardTitle className="font-black tracking-tighter flex items-center gap-2 text-[#e8f5e8]">
                <Factory className="h-5 w-5 text-[#fbbf24]" />
                MONTHLY PERFORMANCE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MONTHLY_STATS.map((month) => {
                  const maxJobs = Math.max(...MONTHLY_STATS.map(m => m.jobs))
                  const barWidth = (month.jobs / maxJobs) * 100
                  
                  return (
                    <div key={month.month} className="flex items-center gap-4">
                      <span className="text-xs font-mono text-[#6b8e6b] w-10">
                        {month.month}
                      </span>
                      <div className="flex-1 h-8 bg-[#050805] border border-[#1a2e1a] relative">
                        <div 
                          className="absolute top-0 left-0 bottom-0 bg-[#fbbf24]/20 border-r border-[#fbbf24]"
                          style={{ width: `${barWidth}%` }}
                        />
                        <div className="absolute inset-0 flex items-center px-3">
                          <span className="text-xs font-black text-[#e8f5e8]">
                            {month.jobs} jobs
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-[#4ade80] w-16 text-right">
                        ${month.earnings}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardHeader>
              <CardTitle className="font-black tracking-tighter flex items-center gap-2 text-[#e8f5e8]">
                <Target className="h-5 w-5 text-[#4ade80]" />
                PERFORMANCE METRICS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#6b8e6b]">On-Time Delivery</span>
                  <span className="text-sm font-black text-[#4ade80]">94%</span>
                </div>
                <Progress value={94} className="h-2 bg-[#1a2e1a]" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#6b8e6b]">Quality Score</span>
                  <span className="text-sm font-black text-[#60a5fa]">4.8/5</span>
                </div>
                <Progress value={96} className="h-2 bg-[#1a2e1a]" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#6b8e6b]">Acceptance Rate</span>
                  <span className="text-sm font-black text-[#fbbf24]">87%</span>
                </div>
                <Progress value={87} className="h-2 bg-[#1a2e1a]" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#6b8e6b]">Customer Satisfaction</span>
                  <span className="text-sm font-black text-[#a78bfa]">92%</span>
                </div>
                <Progress value={92} className="h-2 bg-[#1a2e1a]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Reviews & Achievements */}
        <div className="space-y-6">
          {/* Rating Summary */}
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardHeader>
              <CardTitle className="font-black tracking-tighter flex items-center gap-2 text-[#e8f5e8]">
                <Award className="h-5 w-5 text-[#fbbf24]" />
                MAKER RATING
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 border-b border-[#1a2e1a] mb-4">
                <div className="text-5xl font-black text-[#fbbf24] mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-5 w-5 ${
                        star <= Math.round(averageRating) 
                          ? "text-[#fbbf24] fill-[#fbbf24]" 
                          : "text-[#1a2e1a]"
                      }`} 
                    />
                  ))}
                </div>
                <div className={`flex items-center justify-center gap-1 ${ratingTrend.color}`}>
                  <TrendIcon className="h-4 w-4" />
                  <span className="text-xs font-black">{ratingTrend.label}</span>
                </div>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = MOCK_REVIEWS.filter(r => r.rating === stars).length
                  const percentage = (count / MOCK_REVIEWS.length) * 100
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-xs text-[#6b8e6b] w-8">{stars}★</span>
                      <div className="flex-1 h-2 bg-[#1a2e1a] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#fbbf24]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#6b8e6b] w-8 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardHeader>
              <CardTitle className="font-black tracking-tighter flex items-center gap-2 text-[#e8f5e8]">
                <Star className="h-5 w-5 text-[#60a5fa]" />
                RECENT REVIEWS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_REVIEWS.map((review) => (
                <div 
                  key={review.id} 
                  className="p-3 bg-[#050805] border border-[#1a2e1a]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-black text-[#e8f5e8] text-sm">
                        {review.artistName}
                      </h4>
                      <p className="text-xs text-[#6b8e6b]">{review.jobType}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-[#fbbf24] fill-[#fbbf24]" />
                      <span className="text-xs font-black text-[#fbbf24]">
                        {review.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#6b8e6b] italic">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                  <p className="text-[10px] text-[#6b8e6b] font-mono mt-2">
                    {new Date(review.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardHeader>
              <CardTitle className="font-black tracking-tighter flex items-center gap-2 text-[#e8f5e8]">
                <Zap className="h-5 w-5 text-[#a78bfa]" />
                ACHIEVEMENTS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-[#4ade80]/5 border border-[#4ade80]/30">
                <CheckCircle className="h-5 w-5 text-[#4ade80]" />
                <div className="flex-1">
                  <p className="text-sm font-black text-[#e8f5e8]">Speed Demon</p>
                  <p className="text-xs text-[#6b8e6b]">Complete 10 jobs in under 24h</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#60a5fa]/5 border border-[#60a5fa]/30">
                <Star className="h-5 w-5 text-[#60a5fa]" />
                <div className="flex-1">
                  <p className="text-sm font-black text-[#e8f5e8]">Top Rated</p>
                  <p className="text-xs text-[#6b8e6b]">Maintain 4.5+ rating for 30 days</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#fbbf24]/5 border border-[#fbbf24]/30 opacity-50">
                <Package className="h-5 w-5 text-[#fbbf24]" />
                <div className="flex-1">
                  <p className="text-sm font-black text-[#e8f5e8]">Volume King</p>
                  <p className="text-xs text-[#6b8e6b]">Process 100+ items in a month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
