"use client"

import React, { useState, useEffect } from "react"
import { Monitor, ExternalLink, AlertTriangle, Chrome, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export interface WebGLFallbackProps {
  children: React.ReactNode
}

interface WebGLSupport {
  supported: boolean
  version: number | null
  extensions: string[]
  errorMessage?: string
}

function checkWebGLSupport(): WebGLSupport {
  if (typeof window === "undefined") {
    return { supported: false, version: null, extensions: [] }
  }

  const canvas = document.createElement("canvas")
  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null
  let version: number | null = null

  // Try WebGL 2.0 first
  gl = canvas.getContext("webgl2")
  if (gl) {
    version = 2
  } else {
    // Fall back to WebGL 1.0
    gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null
    if (gl) {
      version = 1
    }
  }

  if (!gl) {
    return {
      supported: false,
      version: null,
      extensions: [],
      errorMessage: "WebGL is not supported in your browser",
    }
  }

  // Get supported extensions
  const extensions = gl.getSupportedExtensions() || []

  // Check for required extensions for 3D rendering
  const requiredExtensions = [
    "OES_texture_float_linear",
    "EXT_shader_texture_lod",
  ]

  const missingExtensions = requiredExtensions.filter(
    (ext) => !extensions.includes(ext)
  )

  if (missingExtensions.length > 0 && version === 1) {
    return {
      supported: true,
      version,
      extensions,
      errorMessage: `Some advanced features may not be available. Missing: ${missingExtensions.join(", ")}`,
    }
  }

  return {
    supported: true,
    version,
    extensions,
  }
}

function getBrowserInfo(): { name: string; version: string } {
  if (typeof window === "undefined") {
    return { name: "unknown", version: "unknown" }
  }

  const userAgent = navigator.userAgent
  let name = "unknown"
  let version = "unknown"

  if (userAgent.indexOf("Chrome") > -1) {
    name = "Chrome"
    const match = userAgent.match(/Chrome\/(\d+)/)
    if (match) version = match[1]
  } else if (userAgent.indexOf("Firefox") > -1) {
    name = "Firefox"
    const match = userAgent.match(/Firefox\/(\d+)/)
    if (match) version = match[1]
  } else if (userAgent.indexOf("Safari") > -1) {
    name = "Safari"
    const match = userAgent.match(/Version\/(\d+)/)
    if (match) version = match[1]
  } else if (userAgent.indexOf("Edge") > -1) {
    name = "Edge"
    const match = userAgent.match(/Edge\/(\d+)/)
    if (match) version = match[1]
  }

  return { name, version }
}

export function WebGLFallback({ children }: WebGLFallbackProps): React.ReactNode {
  const [webglSupport, setWebglSupport] = useState<WebGLSupport | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkSupport = () => {
      const support = checkWebGLSupport()
      setWebglSupport(support)
      setIsChecking(false)
    }

    checkSupport()
  }, [])

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">
          Checking 3D support...
        </div>
      </div>
    )
  }

  if (!webglSupport || !webglSupport.supported) {
    return <WebGLUnsupportedFallback />
  }

  if (webglSupport.errorMessage) {
    return (
      <div className="space-y-4">
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Limited 3D Support</AlertTitle>
          <AlertDescription>{webglSupport.errorMessage}</AlertDescription>
        </Alert>
        {children}
      </div>
    )
  }

  return <>{children}</>
}

export function WebGLUnsupportedFallback(): React.ReactNode {
  const browser = getBrowserInfo()
  const isOldBrowser =
    (browser.name === "Chrome" && parseInt(browser.version) < 60) ||
    (browser.name === "Firefox" && parseInt(browser.version) < 55) ||
    (browser.name === "Safari" && parseInt(browser.version) < 12)

  const handleUsePrintful = () => {
    window.open("https://www.printful.com/mockup-generator", "_blank")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-muted/50 rounded-lg">
      <div className="flex flex-col items-center max-w-lg text-center space-y-6">
        {/* Icon */}
        <div className="p-4 bg-yellow-500/10 rounded-full">
          <Monitor className="w-12 h-12 text-yellow-500" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">
            3D Viewer Not Supported
          </h2>
          <p className="text-sm text-muted-foreground">
            Your browser doesn&apos;t support WebGL, which is required for our 3D mockup generator.
          </p>
        </div>

        {/* Browser Info */}
        <div className="text-sm text-muted-foreground">
          Detected browser: <strong>{browser.name} {browser.version}</strong>
        </div>

        {/* Upgrade Suggestions */}
        {isOldBrowser ? (
          <Alert className="text-left">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Browser Update Recommended</AlertTitle>
            <AlertDescription>
              Your browser version is outdated. Please update to the latest version for the best experience.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-2 gap-4 w-full">
            <a
              href="https://www.google.com/chrome/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <Chrome className="w-5 h-5" />
              <span className="text-sm font-medium">Get Chrome</span>
            </a>
            <a
              href="https://www.mozilla.org/firefox/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">Get Firefox</span>
            </a>
          </div>
        )}

        {/* Alternative */}
        <div className="pt-4 border-t border-border w-full">
          <p className="text-sm text-muted-foreground mb-3">
            Alternatively, you can use an external mockup service:
          </p>
          <Button
            onClick={handleUsePrintful}
            variant="outline"
            className="w-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Use Printful Mockup Generator
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground">
          If you believe this is an error, please check that hardware acceleration is enabled in your browser settings.
        </p>
      </div>
    </div>
  )
}

// Hook for components to check WebGL support
export function useWebGLSupport(): WebGLSupport & { isChecking: boolean } {
  const [support, setSupport] = useState<WebGLSupport>({
    supported: false,
    version: null,
    extensions: [],
  })
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkSupport = () => {
      setSupport(checkWebGLSupport())
      setIsChecking(false)
    }

    checkSupport()
  }, [])

  return { ...support, isChecking }
}

export default WebGLFallback
