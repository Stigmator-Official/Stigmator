"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface ContainerProps {
  children: ReactNode
  className?: string
  size?: "default" | "small" | "large" | "full"
}

const sizeClasses = {
  default: "max-w-[1800px]",
  small: "max-w-[1400px]",
  large: "max-w-[1920px]",
  full: "max-w-none",
}

/**
 * Standardized container component for consistent layout
 * 
 * Design spec:
 * - max-width: 1800px (default), 1400px (small), 1920px (large)
 * - padding: px-4 sm:px-6 lg:px-8
 * - centered with mx-auto
 */
export function Container({ 
  children, 
  className,
  size = "default"
}: ContainerProps) {
  return (
    <div className={cn(
      "mx-auto px-4 sm:px-6 lg:px-8",
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  )
}

interface SectionProps {
  children: ReactNode
  className?: string
  containerClassName?: string
  size?: "default" | "small" | "large" | "full"
  border?: boolean
  borderTop?: boolean
  borderBottom?: boolean
  background?: "default" | "muted" | "dark"
}

const backgroundClasses = {
  default: "bg-transparent",
  muted: "bg-[#0a0f0a]",
  dark: "bg-[#050805]",
}

/**
 * Standardized section component with consistent padding and borders
 */
export function Section({
  children,
  className,
  containerClassName,
  size = "default",
  border = false,
  borderTop = false,
  borderBottom = false,
  background = "default",
}: SectionProps) {
  return (
    <section className={cn(
      backgroundClasses[background],
      (border || borderTop) && "border-t border-[#1a2e1a]",
      borderBottom && "border-b border-[#1a2e1a]",
      className
    )}>
      <Container size={size} className={containerClassName}>
        {children}
      </Container>
    </section>
  )
}
