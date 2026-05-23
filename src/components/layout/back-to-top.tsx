"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Back to top button component
 * 
 * Shows when user scrolls past 400px
 * Brutalist styling with sharp edges
 */
export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400)
    }

    window.addEventListener("scroll", toggleVisibility, { passive: true })
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={cn(
        "fixed bottom-8 right-8 z-40",
        "w-12 h-12",
        "bg-[#dc2626] hover:bg-[#b91c1c]",
        "text-white",
        "border-2 border-[#dc2626]",
        "flex items-center justify-center",
        "transition-all duration-300",
        "hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]",
        "active:scale-95",
        "rounded-none",
        isVisible 
          ? "opacity-100 translate-y-0 pointer-events-auto" 
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}
