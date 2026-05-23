"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Factory, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  Package,
  AlertCircle,
  Filter,
  ArrowRight,
  Zap,
  Search,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

interface ProductionJob {
  id: string
  garmentId: string
  designTitle: string
  garmentType: string
  status: "pending" | "in_production" | "completed"
  submittedAt: string
  artistId: string
  artistName: string
  manufacturerId: string
  quantity?: number
  deadline?: string
  value?: number
}

interface JobQueueTabProps {
  jobs: ProductionJob[]
  onAcceptJob?: (jobId: string) => void
  onRejectJob?: (jobId: string) => void
  onCompleteJob?: (jobId: string) => void
}

type JobFilter = "all" | "pending" | "in_production" | "completed"

export function JobQueueTab({ 
  jobs, 
  onAcceptJob, 
  onRejectJob, 
  onCompleteJob 
}: JobQueueTabProps) {
  const [filter, setFilter] = useState<JobFilter>("all")

  const filteredJobs = jobs.filter((job) => {
    if (filter === "all") return true
    return job.status === filter
  })

  const pendingCount = jobs.filter(j => j.status === "pending").length
  const inProductionCount = jobs.filter(j => j.status === "in_production").length
  const completedCount = jobs.filter(j => j.status === "completed").length

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-[#fbbf24] text-black",
          icon: Clock,
          label: "PENDING"
        }
      case "in_production":
        return {
          color: "bg-[#60a5fa] text-black",
          icon: Factory,
          label: "IN PRODUCTION"
        }
      case "completed":
        return {
          color: "bg-[#4ade80] text-black",
          icon: CheckCircle,
          label: "COMPLETED"
        }
      default:
        return {
          color: "bg-[#6b8e6b] text-[#e8f5e8]",
          icon: Package,
          label: status.toUpperCase()
        }
    }
  }

  // Empty state: No jobs at all
  if (jobs.length === 0) {
    return <EmptyJobQueue />
  }

  return (
    <div className="space-y-6">
      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card 
          className={`bg-[#0a0f0a] border-[#1a2e1a] rounded-none cursor-pointer transition-all ${
            filter === "all" ? "ring-1 ring-[#fbbf24]" : ""
          }`}
          onClick={() => setFilter("all")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Package className="h-5 w-5 text-[#fbbf24]" />
              <span className="text-2xl font-black text-[#e8f5e8]">{jobs.length}</span>
            </div>
            <p className="text-xs text-[#6b8e6b] font-mono mt-2">TOTAL JOBS</p>
          </CardContent>
        </Card>

        <Card 
          className={`bg-[#0a0f0a] border-[#1a2e1a] rounded-none cursor-pointer transition-all ${
            filter === "pending" ? "ring-1 ring-[#fbbf24]" : ""
          }`}
          onClick={() => setFilter("pending")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Clock className="h-5 w-5 text-[#fbbf24]" />
              <span className="text-2xl font-black text-[#fbbf24]">{pendingCount}</span>
            </div>
            <p className="text-xs text-[#6b8e6b] font-mono mt-2">PENDING</p>
          </CardContent>
        </Card>

        <Card 
          className={`bg-[#0a0f0a] border-[#1a2e1a] rounded-none cursor-pointer transition-all ${
            filter === "in_production" ? "ring-1 ring-[#60a5fa]" : ""
          }`}
          onClick={() => setFilter("in_production")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Factory className="h-5 w-5 text-[#60a5fa]" />
              <span className="text-2xl font-black text-[#60a5fa]">{inProductionCount}</span>
            </div>
            <p className="text-xs text-[#6b8e6b] font-mono mt-2">IN PRODUCTION</p>
          </CardContent>
        </Card>

        <Card 
          className={`bg-[#0a0f0a] border-[#1a2e1a] rounded-none cursor-pointer transition-all ${
            filter === "completed" ? "ring-1 ring-[#4ade80]" : ""
          }`}
          onClick={() => setFilter("completed")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <CheckCircle className="h-5 w-5 text-[#4ade80]" />
              <span className="text-2xl font-black text-[#4ade80]">{completedCount}</span>
            </div>
            <p className="text-xs text-[#6b8e6b] font-mono mt-2">COMPLETED</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 border-b border-[#1a2e1a] pb-4">
        <Filter className="h-4 w-4 text-[#6b8e6b]" />
        <span className="text-xs text-[#6b8e6b] font-mono mr-2">FILTER:</span>
        {(["all", "pending", "in_production", "completed"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className={`rounded-none text-xs font-black ${
              filter === f
                ? "bg-[#fbbf24] text-black hover:bg-[#f59e0b]"
                : "border-[#1a2e1a] text-[#6b8e6b]"
            }`}
          >
            {f === "in_production" ? "IN PROD" : f.toUpperCase()}
          </Button>
        ))}
        <div className="flex-1" />
        <span className="text-xs text-[#6b8e6b] font-mono">
          SHOWING {filteredJobs.length} OF {jobs.length}
        </span>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-12 text-center">
            <Factory className="h-12 w-12 text-[#6b8e6b] mx-auto mb-4" />
            <h3 className="text-xl font-black tracking-tighter text-[#e8f5e8] mb-2">
              NO {filter === "all" ? "" : filter.replace("_", " ").toUpperCase()} JOBS
            </h3>
            <p className="text-[#6b8e6b] font-mono text-sm">
              {filter === "all" 
                ? "No production jobs available at the moment." 
                : `No jobs with "${filter.replace("_", " ")}" status found.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const statusConfig = getStatusConfig(job.status)
            const StatusIcon = statusConfig.icon

            return (
              <Card 
                key={job.id} 
                className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Job Info */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-[#6b8e6b]">
                              #{job.id.slice(0, 8).toUpperCase()}
                            </span>
                            <Badge className={`rounded-none text-[10px] ${statusConfig.color}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <h4 className="font-black text-[#e8f5e8] text-lg">
                            {job.designTitle}
                          </h4>
                          <p className="text-sm text-[#6b8e6b]">
                            {job.garmentType} • Qty: {job.quantity || 1}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-[#fbbf24] text-lg">
                            ${(job.value || 0).toLocaleString()}
                          </div>
                          <p className="text-xs text-[#6b8e6b] font-mono">
                            JOB VALUE
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-[#6b8e6b]">
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          <span>Artist: <span className="text-[#e8f5e8]">{job.artistName}</span></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Submitted: {new Date(job.submittedAt).toLocaleDateString()}</span>
                        </div>
                        {job.deadline && (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            <span>Due: {new Date(job.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t md:border-t-0 md:border-l border-[#1a2e1a] p-4 bg-[#050805]">
                      {job.status === "pending" && (
                        <div className="flex md:flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => onAcceptJob?.(job.id)}
                            className="flex-1 bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black text-xs"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            ACCEPT
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onRejectJob?.(job.id)}
                            className="flex-1 rounded-none border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626]/10 text-xs font-black"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            REJECT
                          </Button>
                        </div>
                      )}

                      {job.status === "in_production" && (
                        <div className="flex md:flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => onCompleteJob?.(job.id)}
                            className="flex-1 bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black text-xs"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            COMPLETE
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 rounded-none border-[#1a2e1a] text-[#6b8e6b] text-xs font-black"
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            DETAILS
                          </Button>
                        </div>
                      )}

                      {job.status === "completed" && (
                        <div className="flex md:flex-col gap-2 h-full items-center justify-center">
                          <div className="text-center">
                            <CheckCircle className="h-8 w-8 text-[#4ade80] mx-auto mb-2" />
                            <p className="text-xs text-[#6b8e6b] font-mono">COMPLETED</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Empty State: No jobs in queue
function EmptyJobQueue() {
  return (
    <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none overflow-hidden">
      <CardContent className="p-12 md:p-16 text-center">
        {/* Icon */}
        <div className="relative inline-block mb-8">
          <div className="w-28 h-28 bg-[#050805] border-2 border-[#1a2e1a] flex items-center justify-center">
            <Factory className="h-12 w-12 text-[#6b8e6b]" />
          </div>
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#050805] border border-[#60a5fa]/30 flex items-center justify-center">
            <Zap className="h-5 w-5 text-[#60a5fa]" />
          </div>
        </div>

        <h3 className="text-3xl font-black tracking-tighter text-[#e8f5e8] mb-4">
          JOB QUEUE IS EMPTY
        </h3>

        <p className="text-[#6b8e6b] font-mono text-sm max-w-lg mx-auto mb-3">
          The job queue shows production orders from artists that need fulfillment. 
          When artists create garments from their designs, they appear here for you to produce.
        </p>

        <p className="text-xs text-[#6b8e6b] max-w-md mx-auto mb-10">
          Accept jobs, produce high-quality garments, and earn from every order you fulfill.
        </p>

        {/* Stats Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left max-w-2xl mx-auto">
          <div className="p-5 bg-[#050805] border border-[#1a2e1a]">
            <div className="w-10 h-10 bg-[#fbbf24]/10 border border-[#fbbf24]/30 flex items-center justify-center mb-3">
              <Search className="h-5 w-5 text-[#fbbf24]" />
            </div>
            <p className="text-sm text-[#e8f5e8] font-black mb-1">BROWSE JOBS</p>
            <p className="text-xs text-[#6b8e6b]">
              New orders appear here when artists create garments
            </p>
          </div>
          <div className="p-5 bg-[#050805] border border-[#1a2e1a]">
            <div className="w-10 h-10 bg-[#60a5fa]/10 border border-[#60a5fa]/30 flex items-center justify-center mb-3">
              <Factory className="h-5 w-5 text-[#60a5fa]" />
            </div>
            <p className="text-sm text-[#e8f5e8] font-black mb-1">PRODUCE</p>
            <p className="text-xs text-[#6b8e6b]">
              Accept jobs and manufacture garments to spec
            </p>
          </div>
          <div className="p-5 bg-[#050805] border border-[#1a2e1a]">
            <div className="w-10 h-10 bg-[#4ade80]/10 border border-[#4ade80]/30 flex items-center justify-center mb-3">
              <TrendingUp className="h-5 w-5 text-[#4ade80]" />
            </div>
            <p className="text-sm text-[#e8f5e8] font-black mb-1">EARN</p>
            <p className="text-xs text-[#6b8e6b]">
              Get paid for every garment you produce and ship
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            className="rounded-none border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] font-black"
          >
            <Search className="h-4 w-4 mr-2" />
            BROWSE AVAILABLE WORK
          </Button>
          <Link href="/manufacturer/dashboard">
            <Button
              className="bg-[#60a5fa] hover:bg-[#3b82f6] text-black rounded-none font-black"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              VIEW PERFORMANCE
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
