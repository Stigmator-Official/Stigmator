"use client"

import { useEffect, useState, useCallback } from "react"

interface InkBlob {
  id: number
  x: number
  y: number
}

export function NeedleCursor() {
  const [mounted, setMounted] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)
  const [inkBlobs, setInkBlobs] = useState<InkBlob[]>([])
  const [isClicking, setIsClicking] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check for touch device once on mount
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0)
  }, [])

  useEffect(() => {
    if (!mounted || isTouchDevice) return

    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      if (!visible) setVisible(true)
    }
    
    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)
    
    window.addEventListener("mousemove", onMove, { passive: true })
    document.body.addEventListener("mouseleave", onLeave)
    document.body.addEventListener("mouseenter", onEnter)
    
    return () => {
      window.removeEventListener("mousemove", onMove)
      document.body.removeEventListener("mouseleave", onLeave)
      document.body.removeEventListener("mouseenter", onEnter)
    }
  }, [mounted, isTouchDevice, visible])

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (isTouchDevice) return
    
    setIsClicking(true)
    
    const id = Date.now()
    setInkBlobs(prev => [...prev, { id, x: e.clientX, y: e.clientY }])
    
    setTimeout(() => {
      setInkBlobs(prev => prev.filter(b => b.id !== id))
    }, 600)
    
    setTimeout(() => setIsClicking(false), 150)
  }, [isTouchDevice])

  useEffect(() => {
    if (!mounted || isTouchDevice) return
    
    window.addEventListener("mousedown", handleMouseDown, { passive: true })
    return () => window.removeEventListener("mousedown", handleMouseDown)
  }, [handleMouseDown, mounted, isTouchDevice])

  // Don't render until mounted, and never on touch devices
  if (!mounted || isTouchDevice) return null

  return (
    <>
      {/* INK BLOBS - Black ink splat at click position */}
      {inkBlobs.map(blob => (
        <div
          key={blob.id}
          className="fixed pointer-events-none"
          style={{
            left: blob.x - 15,
            top: blob.y - 15,
            width: 30,
            height: 30,
            zIndex: 9999998,
          }}
          aria-hidden="true"
        >
          {/* Main black blob */}
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "radial-gradient(circle, #1a1a1a 0%, #000000 70%)",
              borderRadius: "50%",
              animation: "ink-blob-expand 0.5s ease-out forwards",
              boxShadow: "0 0 15px rgba(0,0,0,0.6)",
            }}
          />
          {/* Ink splatter dots */}
          <div
            style={{
              position: "absolute",
              top: -10,
              left: 8,
              width: 5,
              height: 5,
              background: "#000",
              borderRadius: "40% 60% 70% 30%",
              animation: "ink-splat 0.4s ease-out forwards",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 22,
              left: -8,
              width: 4,
              height: 4,
              background: "#000",
              borderRadius: "60% 40% 30% 70%",
              animation: "ink-splat 0.4s ease-out 0.05s forwards",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 28,
              width: 6,
              height: 6,
              background: "#000",
              borderRadius: "30% 70% 60% 40%",
              animation: "ink-splat 0.4s ease-out 0.1s forwards",
            }}
          />
        </div>
      ))}

      {/* NEEDLE CURSOR - POINTING DOWN */}
      <div
        className="fixed pointer-events-none"
        style={{
          left: pos.x - 2,
          top: pos.y - 32,
          width: 4,
          height: 32,
          zIndex: 9999999,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.1s ease",
          transform: isClicking ? "translateY(-2px)" : "translateY(0)",
        }}
        aria-hidden="true"
      >
        {/* Needle body - extends UP from the tip */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            width: 4,
            height: 28,
            marginLeft: -2,
            background: "linear-gradient(0deg, #ffffff 0%, #4ade80 15%, #22c55e 50%, #16a34a 100%)",
            clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)",
            boxShadow: "0 0 10px rgba(74, 222, 128, 0.9), 0 0 20px rgba(74, 222, 128, 0.5)",
          }}
        />
        
        {/* Needle tip - at the bottom */}
        <div
          style={{
            position: "absolute",
            bottom: -1,
            left: "50%",
            width: 4,
            height: 4,
            marginLeft: -2,
            background: "#ffffff",
            borderRadius: "50%",
            boxShadow: "0 0 6px #ffffff, 0 0 12px #4ade80, 0 0 18px rgba(74, 222, 128, 0.8)",
          }}
        />
        
        {/* Glow at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            width: 10,
            height: 10,
            marginLeft: -5,
            background: "#4ade80",
            borderRadius: "50%",
            filter: "blur(4px)",
            opacity: 0.6,
          }}
        />
      </div>
    </>
  )
}
