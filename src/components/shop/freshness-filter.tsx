"use client"

import { useState } from "react"

type FreshnessStatus = "ALL" | "FIRE" | "HOT" | "FRESH" | "STALE" | "VINTAGE"

interface FreshnessFilterProps {
  onFilterChange: (status: FreshnessStatus) => void
  activeFilter: FreshnessStatus
  counts: {
    all: number
    fire: number
    hot: number
    fresh: number
    stale: number
    vintage: number
  }
}

const FILTERS = [
  { 
    id: "FIRE" as FreshnessStatus, 
    emoji: "🔥", 
    label: "FIRE",
    description: "Selling out fast - viral momentum",
    color: "#dc2626",
    gradient: "from-[#dc2626] to-[#f97316]"
  },
  { 
    id: "HOT" as FreshnessStatus, 
    emoji: "🌶️", 
    label: "HOT",
    description: "Trending designs gaining traction",
    color: "#f97316",
    gradient: "from-[#f97316] to-[#fbbf24]"
  },
  { 
    id: "FRESH" as FreshnessStatus, 
    emoji: "✨", 
    label: "FRESH",
    description: "New drops from top artists",
    color: "#4ade80",
    gradient: "from-[#4ade80] to-[#22c55e]"
  },
  { 
    id: "ALL" as FreshnessStatus, 
    emoji: "🎨", 
    label: "ALL",
    description: "Browse everything",
    color: "#6b8e6b",
    gradient: "from-[#6b8e6b] to-[#4ade80]"
  },
  { 
    id: "STALE" as FreshnessStatus, 
    emoji: "🧊", 
    label: "STALE",
    description: "Hidden gems - rare finds",
    color: "#60a5fa",
    gradient: "from-[#60a5fa] to-[#3b82f6]"
  },
  { 
    id: "VINTAGE" as FreshnessStatus, 
    emoji: "🏛️", 
    label: "VINTAGE",
    description: "Rediscovered classics",
    color: "#a78bfa",
    gradient: "from-[#a78bfa] to-[#8b5cf6]"
  },
]

export function FreshnessFilter({ onFilterChange, activeFilter, counts }: FreshnessFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="w-full">
      {/* Mobile: Horizontal Scroll */}
      <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`flex-shrink-0 px-4 py-3 font-black tracking-tighter border-2 transition-all ${
              activeFilter === filter.id
                ? "border-[#4ade80] bg-[#4ade80]/10"
                : "border-[#1a2e1a] hover:border-[#4ade80]/50"
            }`}
          >
            <span style={{ color: filter.color }}>{filter.emoji}</span>
            <span className="ml-2 text-[#e8f5e8]">{filter.label}</span>
            <span className="ml-2 text-xs text-[#6b8e6b]">
              ({counts[filter.id.toLowerCase() as keyof typeof counts]})
            </span>
          </button>
        ))}
      </div>

      {/* Desktop: Full Cards */}
      <div className="hidden lg:grid grid-cols-6 gap-3">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.id
          const count = counts[filter.id.toLowerCase() as keyof typeof counts]
          
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`group relative p-4 border-2 text-left transition-all overflow-hidden ${
                isActive
                  ? "border-[#4ade80]"
                  : "border-[#1a2e1a] hover:border-[#4ade80]/50"
              }`}
            >
              {/* Gradient background on hover/active */}
              <div 
                className={`absolute inset-0 opacity-0 transition-opacity ${
                  isActive ? "opacity-20" : "group-hover:opacity-10"
                } bg-gradient-to-br ${filter.gradient}`}
              />
              
              <div className="relative">
                {/* Icon & Label */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{filter.emoji}</span>
                  {isActive && (
                    <div className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#4ade80] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]"></span>
                    </div>
                  )}
                </div>
                
                <div 
                  className="font-black text-lg tracking-tighter"
                  style={{ color: isActive ? filter.color : "#e8f5e8" }}
                >
                  {filter.label}
                </div>
                
                <div className="text-xs text-[#6b8e6b] mt-1">
                  {count} items
                </div>
                
                <div className="text-[10px] text-[#6b8e6b] mt-2 leading-tight">
                  {filter.description}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Active Filter Info Bar */}
      {activeFilter !== "ALL" && (
        <div 
          className="mt-4 p-3 border-l-4"
          style={{ 
            borderLeftColor: FILTERS.find(f => f.id === activeFilter)?.color || "#4ade80",
            backgroundColor: (FILTERS.find(f => f.id === activeFilter)?.color || "#4ade80") + "10"
          }}
        >
          <p className="text-sm text-[#e8f5e8]">
            <strong>Showing:</strong>{" "}
            {activeFilter === "FIRE" && "🔥 Viral designs selling fast - grab them before they're gone"}
            {activeFilter === "HOT" && "🌶️ Trending designs gaining momentum this week"}
            {activeFilter === "FRESH" && "✨ Brand new drops from your favorite artists"}
            {activeFilter === "STALE" && "🧊 Hidden gems from the archives - rare finds"}
            {activeFilter === "VINTAGE" && "🏛️ Rediscovered classics with timeless appeal"}
          </p>
        </div>
      )}
    </div>
  )
}

// Freshness badge for product cards
interface FreshnessBadgeProps {
  status: "FIRE" | "HOT" | "FRESH" | "STALE" | "VINTAGE"
  size?: "sm" | "md" | "lg"
}

export function FreshnessBadge({ status, size = "md" }: FreshnessBadgeProps) {
  const config = {
    FIRE: { emoji: "🔥", color: "#dc2626", label: "FIRE" },
    HOT: { emoji: "🌶️", color: "#f97316", label: "HOT" },
    FRESH: { emoji: "✨", color: "#4ade80", label: "FRESH" },
    STALE: { emoji: "🧊", color: "#60a5fa", label: "STALE" },
    VINTAGE: { emoji: "🏛️", color: "#a78bfa", label: "VINTAGE" },
  }[status]

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5"
  }

  return (
    <span 
      className={`inline-flex items-center gap-1 font-black rounded-none ${sizeClasses[size]}`}
      style={{ 
        backgroundColor: config.color + "20",
        color: config.color,
        border: `1px solid ${config.color}40`
      }}
    >
      {size !== "sm" && <span>{config.emoji}</span>}
      <span>{config.label}</span>
    </span>
  )
}
