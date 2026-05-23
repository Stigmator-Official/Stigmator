"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function Alert({ 
  children, 
  className,
  variant = "default"
}: { 
  children: React.ReactNode
  className?: string
  variant?: "default" | "destructive" | "warning"
}) {
  return (
    <div
      className={cn(
        "relative w-full rounded-lg border p-4",
        variant === "default" && "bg-[#0a0f0a] border-[#1a2e1a] text-[#e8f5e8]",
        variant === "destructive" && "bg-red-950/30 border-red-900/50 text-red-200",
        variant === "warning" && "bg-amber-950/30 border-amber-900/50 text-amber-200",
        className
      )}
    >
      {children}
    </div>
  )
}

export function AlertTitle({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)}>
      {children}
    </h5>
  )
}

export function AlertDescription({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("text-sm opacity-70", className)}>
      {children}
    </div>
  )
}
