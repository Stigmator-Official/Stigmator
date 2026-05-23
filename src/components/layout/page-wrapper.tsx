"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { BackToTop } from "./back-to-top"

interface PageWrapperProps {
  children: ReactNode
  className?: string
  withBackToTop?: boolean
  withGrain?: boolean
}

/**
 * Standard page wrapper with consistent styling
 * 
 * Ensures all pages have:
 * - min-h-screen for full height
 * - pt-24 for navbar spacing (navbar is h-20 + buffer)
 * - pb-12 for bottom spacing
 * - texture-grain for consistent background
 */
export function PageWrapper({
  children,
  className,
  withBackToTop = true,
  withGrain = true,
}: PageWrapperProps) {
  return (
    <div className={cn(
      "min-h-screen pt-24 pb-12",
      withGrain && "texture-grain",
      className
    )}>
      {children}
      {withBackToTop && <BackToTop />}
    </div>
  )
}
