"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

interface StencilRevealProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
}

export function StencilReveal({ src, alt, className = "", priority = false }: StencilRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mediaQuery.matches)

    const handleMotionPreferenceChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleMotionPreferenceChange)
    return () => mediaQuery.removeEventListener("change", handleMotionPreferenceChange)
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      // Immediately show image if reduced motion is preferred
      setIsRevealed(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setIsRevealed(true), 200)
          }
        })
      },
      { threshold: 0.3 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [reducedMotion])

  return (
    <div ref={containerRef} className={`stencil-container relative overflow-hidden ${className}`}>
      {/* Stencil overlay - hidden immediately for reduced motion */}
      <div
        className={`stencil-overlay absolute inset-0 z-10 ${
          reducedMotion 
            ? "opacity-0" 
            : `transition-all duration-1000 ${isRevealed ? "opacity-0 -translate-y-4" : "opacity-100"}`
        }`}
        style={{ background: `linear-gradient(135deg, #1a237e 0%, #0d1642 50%, #000 100%)` }}
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-blue-300/30 font-mono text-xs tracking-widest rotate-45">
            STENCIL TRANSFER • PEEL TO REVEAL
          </div>
        </div>
      </div>

      {/* Image with reveal effect */}
      <div 
        className={`stencil-image ${
          reducedMotion 
            ? "opacity-100" 
            : `transition-all duration-1000 ${isRevealed ? "opacity-100 blur-0" : "opacity-0 blur-sm"}`
        }`}
      >
        <Image 
          src={src} 
          alt={alt} 
          fill 
          className="object-cover" 
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Gradient overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent pointer-events-none ${
          reducedMotion 
            ? "opacity-100" 
            : `transition-opacity duration-1000 ${isRevealed ? "opacity-100" : "opacity-0"}`
        }`} 
      />
    </div>
  )
}
