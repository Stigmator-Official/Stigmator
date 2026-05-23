import { createClientBrowser } from '@/lib/supabase/client'

export interface UploadOptions {
  bucket: 'designs' | 'mockups' | 'temp' | 'product-mockups' | 'design-uploads'
  path?: string  // Custom path, otherwise auto-generated
  contentType?: string
  upsert?: boolean
}

export interface UploadResult {
  path: string
  publicUrl: string
  size: number
}

const supabase = createClientBrowser()

/**
 * Main upload function with progress tracking
 */
export async function uploadFile(
  file: File | Blob,
  options: UploadOptions,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  const bucket = options.bucket
  const filePath = options.path || generateFilePath(bucket, 'upload')
  const contentType = options.contentType || (file instanceof File ? file.type : 'application/octet-stream')

  // Simulate progress for now - Supabase doesn't have native upload progress
  if (onProgress) {
    onProgress(0)
  }

  try {
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(filePath, file, {
        contentType,
        upsert: options.upsert ?? false,
      })

    if (onProgress) {
      onProgress(50)
    }

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    const { data: urlData } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(data.path)

    if (onProgress) {
      onProgress(100)
    }

    return {
      path: data.path,
      publicUrl: urlData.publicUrl,
      size: file.size,
    }
  } catch (error) {
    if (onProgress) {
      onProgress(0)
    }
    throw error
  }
}

/**
 * Upload from dataURL (useful for canvas screenshots)
 */
export async function uploadDataURL(
  dataURL: string,
  options: UploadOptions & { fileName?: string }
): Promise<UploadResult> {
  // Convert dataURL to blob
  const base64Data = dataURL.split(',')[1]
  const mimeMatch = dataURL.match(/data:([^;]+);/)
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png'
  
  const byteCharacters = atob(base64Data)
  const byteNumbers = new Array(byteCharacters.length)
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: mimeType })
  
  const extension = mimeType.split('/')[1] || 'png'
  const fileName = options.fileName || `capture-${Date.now()}.${extension}`
  const path = options.path || generateFilePath(options.bucket, fileName)
  
  return uploadFile(blob, {
    ...options,
    path,
    contentType: mimeType,
  })
}

/**
 * Upload image with automatic compression
 */
/**
 * Upload design image specifically for artist designs
 */
export async function uploadDesignImage(
  file: File,
  artistId: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  const path = generateFilePath('designs', file.name, artistId)
  
  return uploadImageWithCompression(file, {
    bucket: 'designs',
    path,
    maxWidth: 4096,
    maxHeight: 4096,
    quality: 0.95,
  }, onProgress)
}

export async function uploadImageWithCompression(
  file: File,
  options: UploadOptions & { maxWidth?: number; maxHeight?: number; quality?: number },
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 0.9,
    ...uploadOptions
  } = options

  // Check if image needs compression
  const needsCompression = await checkNeedsCompression(file, maxWidth, maxHeight)
  
  if (!needsCompression) {
    return uploadFile(file, uploadOptions)
  }

  // Compress image
  const compressedBlob = await compressImage(file, maxWidth, maxHeight, quality)
  
  // Preserve original filename but update extension if format changed
  const compressedFile = new File([compressedBlob], file.name, {
    type: compressedBlob.type,
    lastModified: file.lastModified,
  })

  return uploadFile(compressedFile, uploadOptions)
}

/**
 * Generate unique file path
 */
export function generateFilePath(
  bucket: string,
  fileName: string,
  userId?: string
): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 10)
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  
  const parts: string[] = []
  
  if (userId) {
    parts.push('users', userId)
  }
  
  parts.push(`${timestamp}-${random}-${sanitizedFileName}`)
  
  return parts.join('/')
}

// Helper functions

async function checkNeedsCompression(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<boolean> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(false)
      return
    }

    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img.width > maxWidth || img.height > maxHeight)
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(false)
    }
    
    img.src = url
  })
}

async function compressImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      
      let { width, height } = img
      
      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }
      
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }
      
      // Use better quality scaling
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      ctx.drawImage(img, 0, 0, width, height)
      
      // Determine output format
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      const outputQuality = outputType === 'image/png' ? undefined : quality
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Canvas toBlob failed'))
          }
        },
        outputType,
        outputQuality
      )
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image for compression'))
    }
    
    img.src = url
  })
}
