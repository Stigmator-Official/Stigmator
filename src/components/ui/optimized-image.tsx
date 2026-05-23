"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  containerClassName?: string
  priority?: boolean
  sizes?: string
  quality?: number
  transform?: {
    width?: number
    height?: number
    resize?: "cover" | "contain" | "fill"
  }
}

// Check if URL is from Supabase Storage
function isSupabaseUrl(url: string): boolean {
  return url.includes("supabase.co") || url.includes("supabase.in")
}

// Add Supabase transform parameters
function getOptimizedUrl(
  url: string, 
  transform?: { width?: number; height?: number; resize?: string }
): string {
  if (!isSupabaseUrl(url) || !transform) return url
  
  const params = new URLSearchParams()
  
  if (transform.width) params.append("width", String(transform.width))
  if (transform.height) params.append("height", String(transform.height))
  if (transform.resize) params.append("resize", transform.resize)
  
  params.append("format", "webp")
  params.append("quality", "80")
  
  const separator = url.includes("?") ? "&" : "?"
  return `${url}${separator}${params.toString()}`
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  containerClassName,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 80,
  transform,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const optimizedSrc = getOptimizedUrl(src, transform)
  
  // Fallback for external images or errors
  if (error || (!src.startsWith("/") && !isSupabaseUrl(src))) {
    return (
      <div 
        className={cn(
          "bg-[#1a2e1a] flex items-center justify-center",
          fill ? "w-full h-full" : "",
          containerClassName
        )}
        style={!fill ? { width, height } : undefined}
      >
        <span className="text-[#6b8e6b] text-sm">{alt}</span>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        fill ? "w-full h-full" : "",
        containerClassName
      )}
      style={!fill ? { width, height } : undefined}
    >
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#1a2e1a] animate-pulse" />
      )}
      
      <Image
        src={optimizedSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        sizes={sizes}
        quality={quality}
        className={cn(
          "object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setError(true)
        }}
      />
    </div>
  )
}

// Lazy loaded version for below-fold images
export function LazyImage(props: Omit<OptimizedImageProps, "priority">) {
  return <OptimizedImage {...props} priority={false} />
}

// Avatar variant
interface AvatarProps {
  src: string | null
  alt: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
}

export function OptimizedAvatar({ src, alt, size = "md", className }: AvatarProps) {
  const sizePx = sizeMap[size]
  const initial = alt.charAt(0).toUpperCase()

  if (!src) {
    return (
      <div 
        className={cn(
          "bg-[#2a3e2a] flex items-center justify-center rounded-full",
          className
        )}
        style={{ width: sizePx, height: sizePx }}
      >
        <span className="text-[#4ade80] font-black text-lg">{initial}</span>
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={sizePx}
      height={sizePx}
      className={cn("rounded-full", className)}
      transform={{ width: sizePx, height: sizePx, resize: "cover" }}
    />
  )
}
