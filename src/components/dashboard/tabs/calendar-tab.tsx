"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Factory,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Package
} from "lucide-react"
import { Button } from "@/components/ui/button"

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
  deadline?: string
}

interface CalendarTabProps {
  jobs: ProductionJob[]
}

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

export function CalendarTab({ jobs }: CalendarTabProps) {
  // Get current month data
  const today = new Date()
  const currentMonth = today.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  
  // Get jobs with deadlines for the upcoming days
  const upcomingJobs = jobs
    .filter(job => job.status !== "completed")
    .slice(0, 5)

  // Generate mock calendar days
  const generateCalendarDays = () => {
    const days = []
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay()
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    
    // Empty cells for days before start of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }
    
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    
    return days
  }

  const calendarDays = generateCalendarDays()
  const currentDay = today.getDate()

  // Mock assignments for demo
  const getDayAssignments = (day: number) => {
    const assignments = []
    if (day % 5 === 0) assignments.push({ type: "deadline", count: 1 })
    if (day % 3 === 0) assignments.push({ type: "production", count: 2 })
    return assignments
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#fbbf24]/10 border border-[#fbbf24]/30 flex items-center justify-center">
            <CalendarIcon className="h-6 w-6 text-[#fbbf24]" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tighter text-[#e8f5e8]">
              PRODUCTION SCHEDULE
            </h3>
            <p className="text-xs text-[#6b8e6b] font-mono">
              Manage deadlines and production assignments
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-none border-[#1a2e1a] text-[#6b8e6b]">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-black text-[#e8f5e8] px-4">
            {currentMonth.toUpperCase()}
          </span>
          <Button variant="outline" size="icon" className="rounded-none border-[#1a2e1a] text-[#6b8e6b]">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,380px] gap-6">
        {/* Calendar Grid */}
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(day => (
                <div key={day} className="text-center py-2 text-xs font-black text-[#6b8e6b]">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return (
                    <div 
                      key={`empty-${index}`} 
                      className="aspect-square bg-[#050805]/50 border border-[#1a2e1a]/30"
                    />
                  )
                }

                const isToday = day === currentDay
                const assignments = getDayAssignments(day)
                const hasDeadline = assignments.some(a => a.type === "deadline")
                const hasProduction = assignments.some(a => a.type === "production")

                return (
                  <div
                    key={day}
                    className={`aspect-square border p-2 relative ${
                      isToday 
                        ? "bg-[#fbbf24]/10 border-[#fbbf24]" 
                        : "bg-[#050805] border-[#1a2e1a] hover:border-[#6b8e6b]"
                    }`}
                  >
                    <span className={`text-sm font-black ${
                      isToday ? "text-[#fbbf24]" : "text-[#e8f5e8]"
                    }`}>
                      {day}
                    </span>

                    {/* Assignment Indicators */}
                    <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                      {hasDeadline && (
                        <div className="w-2 h-2 bg-[#dc2626]" title="Deadline" />
                      )}
                      {hasProduction && (
                        <div className="w-2 h-2 bg-[#60a5fa]" title="In Production" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#1a2e1a]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#dc2626]" />
                <span className="text-xs text-[#6b8e6b]">Deadline</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#60a5fa]" />
                <span className="text-xs text-[#6b8e6b]">In Production</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#fbbf24]/30 border border-[#fbbf24]" />
                <span className="text-xs text-[#6b8e6b]">Today</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <div className="space-y-4">
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardHeader>
              <CardTitle className="font-black tracking-tighter flex items-center gap-2 text-[#e8f5e8]">
                <Clock className="h-5 w-5 text-[#fbbf24]" />
                UPCOMING DEADLINES
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingJobs.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-[#1a2e1a]">
                  <AlertCircle className="h-8 w-8 text-[#6b8e6b] mx-auto mb-2" />
                  <p className="text-xs text-[#6b8e6b] font-mono">NO UPCOMING DEADLINES</p>
                </div>
              ) : (
                upcomingJobs.map((job, index) => (
                  <div 
                    key={job.id} 
                    className="p-3 bg-[#050805] border border-[#1a2e1a]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-black text-[#e8f5e8] text-sm">
                          {job.designTitle}
                        </h4>
                        <p className="text-xs text-[#6b8e6b]">
                          {job.garmentType}
                        </p>
                      </div>
                      <Badge className={`rounded-none text-[10px] ${
                        job.status === "pending" 
                          ? "bg-[#fbbf24] text-black" 
                          : "bg-[#60a5fa] text-black"
                      }`}>
                        {job.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#6b8e6b]">
                      <Factory className="h-3 w-3" />
                      <span>{job.artistName}</span>
                    </div>
                    {job.deadline && (
                      <div className="mt-2 pt-2 border-t border-[#1a2e1a] flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-[#dc2626]" />
                        <span className="text-xs text-[#dc2626] font-mono">
                          Due: {new Date(job.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardHeader>
              <CardTitle className="font-black tracking-tighter text-sm text-[#e8f5e8]">
                THIS WEEK
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#050805] border border-[#1a2e1a]">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#6b8e6b]" />
                  <span className="text-sm text-[#6b8e6b]">Jobs Due</span>
                </div>
                <span className="font-black text-[#e8f5e8]">
                  {jobs.filter(j => j.status !== "completed").length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#050805] border border-[#1a2e1a]">
                <div className="flex items-center gap-2">
                  <Factory className="h-4 w-4 text-[#60a5fa]" />
                  <span className="text-sm text-[#6b8e6b]">In Production</span>
                </div>
                <span className="font-black text-[#60a5fa]">
                  {jobs.filter(j => j.status === "in_production").length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#050805] border border-[#1a2e1a]">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#fbbf24]" />
                  <span className="text-sm text-[#6b8e6b]">Pending Review</span>
                </div>
                <span className="font-black text-[#fbbf24]">
                  {jobs.filter(j => j.status === "pending").length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
