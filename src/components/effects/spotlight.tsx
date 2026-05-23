"use client"

import { useEffect, useRef, useState } from "react"

export function Spotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null)
  const haloRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const rafIdRef = useRef<number>()
  const positionRef = useRef({ x: 0, y: 0 })

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
    // Skip heavy animations if user prefers reduced motion
    if (reducedMotion) {
      setIsVisible(false)
      return
    }

    let lastUpdate = 0
    const throttleMs = 16 // ~60fps

    const handleMouseMove = (e: MouseEvent) => {
      positionRef.current = { x: e.clientX, y: e.clientY }
      
      if (!isVisible) setIsVisible(true)
      
      const now = Date.now()
      if (now - lastUpdate < throttleMs) return
      lastUpdate = now

      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
      
      rafIdRef.current = requestAnimationFrame(() => {
        if (spotlightRef.current) {
          spotlightRef.current.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`
        }
        if (haloRef.current) {
          haloRef.current.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`
        }
      })
    }

    const handleMouseLeave = () => setIsVisible(false)

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    document.body.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.body.removeEventListener("mouseleave", handleMouseLeave)
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
    }
  }, [isVisible, reducedMotion])

  // Don't render spotlight if user prefers reduced motion
  if (reducedMotion) return null

  return (
    <>
      <div
        ref={spotlightRef}
        className="fixed pointer-events-none z-[9990] will-change-transform"
        style={{ 
          left: 0, 
          top: 0, 
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s ease"
        }}
        aria-hidden="true"
      >
        <div
          className="w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background: `radial-gradient(ellipse at center, rgba(74, 222, 128, 0.05) 0%, rgba(74, 222, 128, 0.02) 30%, transparent 60%)`,
          }}
        />
      </div>

      <div
        ref={haloRef}
        className="fixed pointer-events-none z-[9989] will-change-transform"
        style={{ 
          left: 0, 
          top: 0, 
          opacity: isVisible ? 0.4 : 0,
          transition: "opacity 0.5s ease"
        }}
        aria-hidden="true"
      >
        <div
          className="w-[900px] h-[900px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background: `radial-gradient(ellipse at center, rgba(220, 38, 38, 0.02) 0%, transparent 50%)`,
          }}
        />
      </div>

      <div
        className="fixed top-0 w-full h-[2px] pointer-events-none z-[9999] animate-scan-line motion-reduce:animate-none"
        style={{ background: `linear-gradient(to bottom, transparent, rgba(74, 222, 128, 0.08), transparent)` }}
        aria-hidden="true"
      />
    </>
  )
}
