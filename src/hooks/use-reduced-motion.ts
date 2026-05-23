"use client"

import { useState, useEffect } from "react"

/**
 * Hook to detect prefers-reduced-motion setting
 * Returns true if the user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mediaQuery.matches)

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return reducedMotion
}

/**
 * Hook to get animation settings based on user preference
 * Returns animation config that respects reduced motion
 */
export function useAnimationConfig() {
  const reducedMotion = useReducedMotion()

  return {
    // Disable animations if user prefers reduced motion
    enabled: !reducedMotion,
    
    // Duration values
    duration: {
      fast: reducedMotion ? 0 : 0.15,
      normal: reducedMotion ? 0 : 0.3,
      slow: reducedMotion ? 0 : 0.5,
    },
    
    // Spring configs for Framer Motion
    spring: {
      stiff: reducedMotion 
        ? { duration: 0 } 
        : { type: "spring", stiffness: 400, damping: 30 },
      gentle: reducedMotion 
        ? { duration: 0 } 
        : { type: "spring", stiffness: 200, damping: 25 },
      bouncy: reducedMotion 
        ? { duration: 0 } 
        : { type: "spring", stiffness: 300, damping: 20 },
    },
    
    // Transition presets
    transition: {
      fade: reducedMotion 
        ? { duration: 0 } 
        : { duration: 0.3, ease: "easeOut" },
      slide: reducedMotion 
        ? { duration: 0 } 
        : { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
      scale: reducedMotion 
        ? { duration: 0 } 
        : { duration: 0.2, ease: "easeOut" },
    },
    
    // CSS classes
    classes: {
      transition: reducedMotion ? "" : "transition-all duration-300",
      transform: reducedMotion ? "" : "transform",
      animate: reducedMotion ? "motion-reduce:animate-none" : "",
    },
  }
}
