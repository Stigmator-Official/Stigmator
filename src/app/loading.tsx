"use client"

import { Container } from "@/components/layout/container"

/**
 * Global Loading Page
 * 
 * Displays while page content is loading
 * Brutalist design with animated loading indicators
 */
export default function LoadingPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 texture-grain flex items-center justify-center">
      <Container size="small" className="w-full">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          {/* Loading animation */}
          <div className="relative mb-8">
            {/* Outer ring */}
            <div className="w-24 h-24 border-2 border-[#1a2e1a] animate-pulse" />
            
            {/* Inner animated element */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-2 border-t-[#4ade80] border-r-[#4ade80] border-b-transparent border-l-transparent animate-spin" />
            </div>
            
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-[#dc2626] animate-pulse" />
            </div>
          </div>

          {/* Loading text */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-black tracking-tighter text-[#e8f5e8]">
              LOADING
            </h2>
            <p className="font-mono text-xs text-[#6b8e6b] tracking-widest">
              INITIALIZING SYSTEM
            </p>
          </div>

          {/* Progress bars */}
          <div className="w-64 mt-8 space-y-2">
            <div className="h-1 bg-[#1a2e1a] overflow-hidden">
              <div className="h-full bg-[#4ade80] animate-[loading-bar_1.5s_ease-in-out_infinite]" />
            </div>
            <div className="h-1 bg-[#1a2e1a] overflow-hidden">
              <div className="h-full bg-[#dc2626] animate-[loading-bar_2s_ease-in-out_infinite_0.3s]" />
            </div>
          </div>

          {/* Loading tips */}
          <div className="mt-12 text-center">
            <p className="text-xs text-[#6b8e6b] font-mono animate-pulse">
              [ESTABLISHING CONNECTION...]
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}
