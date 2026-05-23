"use client"

import React, { useState, useCallback } from "react"
import { Download, Check, AlertCircle, Loader2 } from "lucide-react"

import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ============== TYPES ==============

export interface DownloadButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  /**
   * Function that generates the download URL
   * Returns a Promise that resolves to the data URL or blob URL
   */
  onGenerate: () => Promise<string>
  
  /**
   * Optional filename for the download
   * If not provided, will use the URL's filename or generate one
   */
  fileName?: string
  
  /**
   * Button size variant
   * @default "default"
   */
  size?: "sm" | "default" | "lg"
  
  /**
   * Button style variant
   * @default "default"
   */
  variant?: "default" | "outline" | "ghost" | "secondary"
  
  /**
   * Text to display on the button
   * @default "Download"
   */
  label?: string
  
  /**
   * Text to display during generation
   * @default "Generating..."
   */
  loadingLabel?: string
  
  /**
   * Text to display on success
   * @default "Downloaded!"
   */
  successLabel?: string
  
  /**
   * Text to display on error
   * @default "Retry"
   */
  errorLabel?: string
  
  /**
   * Timeout for success state reset (ms)
   * @default 2000
   */
  successTimeout?: number
  
  /**
   * Callback when download starts
   */
  onDownloadStart?: () => void
  
  /**
   * Callback when download completes successfully
   */
  onDownloadComplete?: () => void
  
  /**
   * Callback when download fails
   */
  onDownloadError?: (error: Error) => void
  
  /**
   * Additional CSS classes
   */
  className?: string
}

type DownloadState = "idle" | "generating" | "success" | "error"

// ============== COMPONENT ==============

export function DownloadButton({
  onGenerate,
  fileName,
  size = "default",
  variant = "default",
  label = "Download",
  loadingLabel = "Generating...",
  successLabel = "Downloaded!",
  errorLabel = "Retry",
  successTimeout = 2000,
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
  className,
  disabled,
  ...props
}: DownloadButtonProps) {
  // ============== STATE ==============
  
  const [state, setState] = useState<DownloadState>("idle")
  
  // ============== HANDLERS ==============
  
  const handleDownload = useCallback(async () => {
    if (state === "generating") return
    
    setState("generating")
    onDownloadStart?.()
    
    try {
      // Generate the URL
      const url = await onGenerate()
      
      // Create download link
      const link = document.createElement("a")
      link.href = url
      
      // Set filename
      if (fileName) {
        link.download = fileName
      } else {
        // Try to extract filename from URL
        try {
          const urlObj = new URL(url)
          const pathParts = urlObj.pathname.split("/")
          const extractedName = pathParts[pathParts.length - 1]
          if (extractedName && extractedName !== "") {
            link.download = extractedName
          }
        } catch {
          // Fallback: generate timestamped filename
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
          link.download = `download_${timestamp}.png`
        }
      }
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up blob URL if it is one
      if (url.startsWith("blob:")) {
        // Delay cleanup to ensure download starts
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
      
      // Success state
      setState("success")
      onDownloadComplete?.()
      
      // Reset after timeout
      setTimeout(() => {
        setState("idle")
      }, successTimeout)
      
    } catch (error) {
      setState("error")
      onDownloadError?.(error instanceof Error ? error : new Error("Download failed"))
    }
  }, [
    state,
    onGenerate,
    fileName,
    onDownloadStart,
    onDownloadComplete,
    onDownloadError,
    successTimeout,
  ])
  
  // ============== RENDER HELPERS ==============
  
  const getButtonContent = () => {
    switch (state) {
      case "generating":
        return (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {loadingLabel}
          </>
        )
      
      case "success":
        return (
          <>
            <Check className="h-4 w-4 mr-2" />
            {successLabel}
          </>
        )
      
      case "error":
        return (
          <>
            <AlertCircle className="h-4 w-4 mr-2" />
            {errorLabel}
          </>
        )
      
      default:
        return (
          <>
            <Download className="h-4 w-4 mr-2" />
            {label}
          </>
        )
    }
  }
  
  const getButtonStyles = () => {
    switch (state) {
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white border-transparent"
      case "error":
        return "bg-red-600 hover:bg-red-700 text-white border-transparent"
      default:
        return ""
    }
  }
  
  // ============== RENDER ==============
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={disabled || state === "generating"}
      className={cn(
        "transition-all duration-200",
        getButtonStyles(),
        className
      )}
      {...props}
    >
      {getButtonContent()}
    </Button>
  )
}

// ============== VARIANTS ==============

export interface QuickDownloadButtonProps extends Omit<DownloadButtonProps, "onGenerate"> {
  /**
   * The data URL or blob URL to download
   */
  url: string
  
  /**
   * Whether to revoke the blob URL after download
   * Set to true for blob URLs, false for data URLs
   * @default false
   */
  revokeUrl?: boolean
}

/**
 * Simplified download button for when you already have the URL
 */
export function QuickDownloadButton({
  url,
  fileName,
  revokeUrl = false,
  ...props
}: QuickDownloadButtonProps) {
  const handleGenerate = useCallback(async () => {
    return url
  }, [url])
  
  const handleComplete = useCallback(() => {
    if (revokeUrl && url.startsWith("blob:")) {
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
  }, [revokeUrl, url])
  
  return (
    <DownloadButton
      onGenerate={handleGenerate}
      fileName={fileName}
      onDownloadComplete={handleComplete}
      {...props}
    />
  )
}

// ============== BATCH DOWNLOAD ==============

export interface BatchDownloadButtonProps extends Omit<DownloadButtonProps, "onGenerate" | "label"> {
  /**
   * Array of items to download
   */
  items: Array<{
    url: string
    filename: string
  }>
  
  /**
   * Delay between downloads (ms)
   * @default 100
   */
  downloadDelay?: number
  
  /**
   * Label showing number of items
   * @default "Download All"
   */
  label?: string
}

/**
 * Download button for batch downloads with rate limiting
 */
export function BatchDownloadButton({
  items,
  downloadDelay = 100,
  label = "Download All",
  loadingLabel = "Downloading...",
  ...props
}: BatchDownloadButtonProps) {
  const handleGenerate = useCallback(async (): Promise<string> => {
    // Download all items with delay
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const link = document.createElement("a")
      link.href = item.url
      link.download = item.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Delay between downloads (except for last item)
      if (i < items.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, downloadDelay))
      }
    }
    
    // Return empty string - downloads already triggered
    return ""
  }, [items, downloadDelay])
  
  const buttonLabel = items.length > 0 
    ? `${label} (${items.length})` 
    : label
  
  return (
    <DownloadButton
      onGenerate={handleGenerate}
      label={buttonLabel}
      loadingLabel={loadingLabel}
      disabled={items.length === 0}
      {...props}
    />
  )
}
