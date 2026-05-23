"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { Upload, X, RefreshCw, ExternalLink, ImageIcon, AlertTriangle, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

// ============================================================================
// Types & Interfaces
// ============================================================================

interface DesignUploaderProps {
  onUpload: (file: File, previewUrl: string) => void
  onError: (error: string) => void
  acceptedFormats?: string[]
  maxSizeMB?: number
  currentDesign?: {
    url: string
    name: string
    dimensions: { width: number; height: number }
  }
  onClear?: () => void
}

interface DesignFile {
  file: File
  previewUrl: string
  dimensions: { width: number; height: number }
  fileSize: number
  hasTransparency: boolean
  colorMode?: string
  dominantColors?: string[]
  hash?: string
}

interface ValidationWarning {
  type: "transparency" | "colorMode" | "resolution"
  message: string
}

interface UploadState {
  status: "idle" | "dragging" | "uploading" | "preview" | "error"
  progress: number
  fileName?: string
  error?: string
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_ACCEPTED_FORMATS = [".png", ".jpg", ".jpeg", ".webp"]
const DEFAULT_MAX_SIZE_MB = 10
const MAX_DIMENSIONS = { width: 8000, height: 8000 }
const RESIZE_THRESHOLD = 4096
const THUMBNAIL_SIZE = 300

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Generate a simple hash for duplicate detection
 */
async function generateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

/**
 * Load image and get dimensions
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Check if image has transparency
 */
function checkTransparency(img: HTMLImageElement): boolean {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return false

  canvas.width = Math.min(img.width, 100)
  canvas.height = Math.min(img.height, 100)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true
  }
  return false
}

/**
 * Extract dominant colors from image
 */
function extractDominantColors(img: HTMLImageElement): string[] {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return []

  const size = 50
  canvas.width = size
  canvas.height = size
  ctx.drawImage(img, 0, 0, size, size)

  const imageData = ctx.getImageData(0, 0, size, size)
  const data = imageData.data
  const colorMap: Map<string, number> = new Map()

  for (let i = 0; i < data.length; i += 4) {
    const r = Math.round(data[i] / 32) * 32
    const g = Math.round(data[i + 1] / 32) * 32
    const b = Math.round(data[i + 2] / 32) * 32
    const key = `${r},${g},${b}`
    colorMap.set(key, (colorMap.get(key) || 0) + 1)
  }

  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([color]) => `rgb(${color})`)

  return sortedColors
}

/**
 * Resize image if exceeds threshold while maintaining aspect ratio
 */
function resizeImageIfNeeded(
  img: HTMLImageElement,
  maxDimension: number = RESIZE_THRESHOLD
): { width: number; height: number } {
  let { width, height } = img

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width)
      width = maxDimension
    } else {
      width = Math.round((width * maxDimension) / height)
      height = maxDimension
    }
  }

  return { width, height }
}

/**
 * Generate thumbnail from image
 */
function generateThumbnail(img: HTMLImageElement): string {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""

  const { width, height } = resizeImageIfNeeded(img, THUMBNAIL_SIZE)
  canvas.width = width
  canvas.height = height
  ctx.drawImage(img, 0, 0, width, height)

  return canvas.toDataURL("image/webp", 0.85)
}

/**
 * Convert image to WebP format
 */
function convertToWebP(img: HTMLImageElement, quality: number = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      reject(new Error("Canvas context not available"))
      return
    }

    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error("Failed to convert to WebP"))
        }
      },
      "image/webp",
      quality
    )
  })
}

// ============================================================================
// Main Component
// ============================================================================

export function DesignUploader({
  onUpload,
  onError,
  acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  currentDesign,
  onClear,
}: DesignUploaderProps) {
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropzoneRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // State
  const [state, setState] = useState<UploadState>({
    status: currentDesign ? "preview" : "idle",
    progress: 0,
  })
  const [designFile, setDesignFile] = useState<DesignFile | null>(null)
  const [warnings, setWarnings] = useState<ValidationWarning[]>([])
  const [thumbnail, setThumbnail] = useState<string | null>(null)

  // Derived values
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  const acceptAttribute = acceptedFormats.map((ext) => MIME_TYPES[ext] || `image/${ext.slice(1)}`).join(",")

  // ============================================================================
  // Validation
  // ============================================================================

  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string; warnings: ValidationWarning[] } => {
      const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`
      const validationWarnings: ValidationWarning[] = []

      // Check file type
      if (!acceptedFormats.includes(fileExt)) {
        return {
          valid: false,
          error: `Invalid format. Accepted: ${acceptedFormats.join(", ")}`,
          warnings: [],
        }
      }

      // Check file size
      if (file.size > maxSizeBytes) {
        return {
          valid: false,
          error: `File too large. Maximum size: ${maxSizeMB}MB`,
          warnings: [],
        }
      }

      return { valid: true, warnings: validationWarnings }
    },
    [acceptedFormats, maxSizeBytes, maxSizeMB]
  )

  // ============================================================================
  // File Processing
  // ============================================================================

  const processFile = useCallback(
    async (file: File) => {
      // Validate
      const validation = validateFile(file)
      if (!validation.valid) {
        setState((prev) => ({ ...prev, status: "error", error: validation.error }))
        onError(validation.error || "Validation failed")
        return
      }

      setWarnings(validation.warnings)
      setState({ status: "uploading", progress: 0, fileName: file.name })

      abortControllerRef.current = new AbortController()

      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setState((prev) => {
            if (prev.status !== "uploading") return prev
            const newProgress = Math.min(prev.progress + Math.random() * 15, 90)
            return { ...prev, progress: newProgress }
          })
        }, 200)

        // Load and process image
        const img = await loadImage(file)
        const previewUrl = img.src

        // Check dimensions
        if (img.width > MAX_DIMENSIONS.width || img.height > MAX_DIMENSIONS.height) {
          clearInterval(progressInterval)
          throw new Error(`Image dimensions exceed maximum (${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height})`)
        }

        // Check transparency for PNGs
        const hasTransparency = file.name.toLowerCase().endsWith(".png") ? checkTransparency(img) : false

        if (file.name.toLowerCase().endsWith(".png") && !hasTransparency) {
          setWarnings((prev) => [
            ...prev,
            {
              type: "transparency",
              message: "PNG doesn't have transparency. Consider using JPG for smaller file size.",
            },
          ])
        }

        // Generate thumbnail
        const thumb = generateThumbnail(img)
        setThumbnail(thumb)

        // Extract dominant colors
        const dominantColors = extractDominantColors(img)

        // Resize if needed
        const dimensions = resizeImageIfNeeded(img)

        // Generate hash for duplicate detection
        const hash = await generateFileHash(file)

        clearInterval(progressInterval)

        // Create design file object
        const designData: DesignFile = {
          file,
          previewUrl,
          dimensions,
          fileSize: file.size,
          hasTransparency,
          dominantColors,
          hash,
        }

        setDesignFile(designData)
        setState({ status: "preview", progress: 100, fileName: file.name })

        // Call onUpload callback
        onUpload(file, previewUrl)
      } catch (error) {
        setState({
          status: "error",
          progress: 0,
          error: error instanceof Error ? error.message : "Failed to process image",
        })
        onError(error instanceof Error ? error.message : "Failed to process image")
      }
    },
    [onUpload, onError, validateFile]
  )

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setState((prev) => ({ ...prev, status: "dragging" }))
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setState((prev) => ({
      ...prev,
      status: prev.status === "dragging" ? "idle" : prev.status,
    }))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const files = e.dataTransfer.files
      if (files.length > 0) {
        processFile(files[0])
      } else {
        setState({ status: "idle", progress: 0 })
      }
    },
    [processFile]
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        processFile(files[0])
      }
    },
    [processFile]
  )

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleClear = useCallback(() => {
    if (designFile?.previewUrl) {
      URL.revokeObjectURL(designFile.previewUrl)
    }
    setDesignFile(null)
    setThumbnail(null)
    setWarnings([])
    setState({ status: "idle", progress: 0 })
    onClear?.()
  }, [designFile, onClear])

  const handleCancel = useCallback(() => {
    abortControllerRef.current?.abort()
    setState({ status: "idle", progress: 0 })
  }, [])

  const handleReplace = useCallback(() => {
    handleClear()
    setTimeout(() => {
      fileInputRef.current?.click()
    }, 0)
  }, [handleClear])

  // ============================================================================
  // Clipboard Support
  // ============================================================================

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile()
          if (blob) {
            const file = new File([blob], `pasted-image-${Date.now()}.png`, { type: item.type })
            processFile(file)
          }
          break
        }
      }
    }

    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [processFile])

  // ============================================================================
  // Cleanup
  // ============================================================================

  useEffect(() => {
    return () => {
      if (designFile?.previewUrl) {
        URL.revokeObjectURL(designFile.previewUrl)
      }
    }
  }, [designFile])

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const renderEmptyState = () => (
    <Card
      ref={dropzoneRef}
      className={cn(
        "relative cursor-pointer transition-all duration-200",
        "border-2 border-dashed",
        state.status === "dragging"
          ? "border-[#4ade80] bg-[#4ade80]/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50"
      )}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div
          className={cn(
            "mb-4 rounded-full p-4 transition-colors",
            state.status === "dragging" ? "bg-[#4ade80]/20 text-[#4ade80]" : "bg-muted text-muted-foreground"
          )}
        >
          <Upload className="h-8 w-8" />
        </div>
        <p className="mb-2 text-lg font-medium">
          {state.status === "dragging" ? "Drop to upload" : "Drop your design here or click to browse"}
        </p>
        <p className="mb-4 text-sm text-muted-foreground">
          Supported formats: {acceptedFormats.join(", ").toUpperCase()}
        </p>
        <p className="text-xs text-muted-foreground">Maximum file size: {maxSizeMB}MB</p>
        <p className="mt-2 text-xs text-muted-foreground/60">Tip: You can also paste an image (Ctrl+V)</p>
      </CardContent>
    </Card>
  )

  const renderUploadingState = () => (
    <Card className="border border-muted">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm truncate max-w-[200px]">{state.fileName}</p>
              <p className="text-xs text-muted-foreground">Uploading...</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
        <Progress value={state.progress} className="h-2" />
        <p className="mt-2 text-right text-xs text-muted-foreground">{Math.round(state.progress)}%</p>
      </CardContent>
    </Card>
  )

  const renderPreviewState = () => {
    const displayUrl = thumbnail || designFile?.previewUrl || currentDesign?.url
    const displayName = designFile?.file.name || currentDesign?.name || "Unknown"
    const displayDimensions = designFile?.dimensions || currentDesign?.dimensions
    const displaySize = designFile?.fileSize

    return (
      <Card className="border border-muted">
        <CardContent className="p-6">
          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="mb-4 space-y-2">
              {warnings.map((warning, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-500"
                >
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{warning.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Preview */}
          <div className="flex gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-muted">
              {displayUrl ? (
                <img
                  src={displayUrl}
                  alt={displayName}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate" title={displayName}>
                {displayName}
              </p>
              {displayDimensions && (
                <p className="text-sm text-muted-foreground">
                  {displayDimensions.width} × {displayDimensions.height} px
                </p>
              )}
              {displaySize && (
                <p className="text-sm text-muted-foreground">{formatFileSize(displaySize)}</p>
              )}

              {/* Dominant Colors */}
              {designFile?.dominantColors && designFile.dominantColors.length > 0 && (
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-xs text-muted-foreground mr-1">Colors:</span>
                  {designFile.dominantColors.slice(0, 4).map((color, index) => (
                    <div
                      key={index}
                      className="h-4 w-4 rounded-full border border-white/20"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClear} title="Remove">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleReplace}>
              <RefreshCw className="h-4 w-4" />
              Replace
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" asChild>
              <a href="https://www.photopea.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Edit in external tool
              </a>
            </Button>
          </div>

          {/* Properties */}
          {designFile && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                {designFile.hasTransparency ? (
                  <>
                    <Check className="h-3 w-3 text-green-500" />
                    <span>Has transparency</span>
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3 text-muted-foreground/50" />
                    <span>No transparency</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-500" />
                <span>RGB color mode</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderErrorState = () => (
    <Card className="border border-destructive/50">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <p className="font-medium">{state.error || "An error occurred"}</p>
        </div>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => setState({ status: "idle", progress: 0 })}>
          Try Again
        </Button>
      </CardContent>
    </Card>
  )

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptAttribute}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {state.status === "idle" && renderEmptyState()}
      {state.status === "dragging" && renderEmptyState()}
      {state.status === "uploading" && renderUploadingState()}
      {state.status === "preview" && renderPreviewState()}
      {state.status === "error" && renderErrorState()}
    </div>
  )
}

// ============================================================================
// Hook for programmatic access
// ============================================================================

export function useDesignUploader() {
  const [uploadedDesign, setUploadedDesign] = useState<DesignFile | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setUploadedDesign(null)
    setIsUploading(false)
    setError(null)
  }, [])

  return {
    uploadedDesign,
    isUploading,
    error,
    setUploadedDesign,
    setIsUploading,
    setError,
    reset,
  }
}

export type { DesignUploaderProps, DesignFile, ValidationWarning, UploadState }
