import { createClientBrowser } from '@/lib/supabase/client'

const supabase = createClientBrowser()

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

/**
 * Get signed URL (temporary access)
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600  // 1 hour default
): Promise<string> {
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * Get multiple signed URLs at once
 */
export async function getSignedUrls(
  bucket: string,
  paths: string[],
  expiresIn: number = 3600
): Promise<Array<{ path: string; signedUrl: string }>> {
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .createSignedUrls(paths, expiresIn)

  if (error) {
    throw new Error(`Failed to create signed URLs: ${error.message}`)
  }

  return data || []
}

/**
 * Transform image URL using Supabase Image Transformations
 */
export function transformImageUrl(
  publicUrl: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'jpg' | 'png'
    resize?: 'cover' | 'contain' | 'fill'
  }
): string {
  const url = new URL(publicUrl)
  
  // Supabase Image Transformations use query parameters
  if (options.width) {
    url.searchParams.set('width', options.width.toString())
  }
  
  if (options.height) {
    url.searchParams.set('height', options.height.toString())
  }
  
  if (options.quality) {
    url.searchParams.set('quality', options.quality.toString())
  }
  
  if (options.format) {
    url.searchParams.set('format', options.format)
  }
  
  if (options.resize) {
    url.searchParams.set('resize', options.resize)
  }

  return url.toString()
}

/**
 * Generate thumbnail URL with predefined size
 */
export function getThumbnailUrl(
  bucket: string,
  path: string,
  size: number = 300
): string {
  const publicUrl = getPublicUrl(bucket, path)
  
  return transformImageUrl(publicUrl, {
    width: size,
    height: size,
    resize: 'cover',
    format: 'webp',
    quality: 80,
  })
}

/**
 * Generate responsive image srcset
 */
export function generateSrcSet(
  bucket: string,
  path: string,
  sizes: number[] = [300, 600, 900, 1200]
): string {
  const publicUrl = getPublicUrl(bucket, path)
  
  return sizes
    .map(size => {
      const transformed = transformImageUrl(publicUrl, {
        width: size,
        format: 'webp',
        quality: 85,
      })
      return `${transformed} ${size}w`
    })
    .join(', ')
}

/**
 * Check if URL is a valid Supabase storage URL
 */
export function isSupabaseStorageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    // Check for common Supabase storage patterns
    return parsed.pathname.includes('/storage/v1/object/public/') ||
           parsed.pathname.includes('/storage/v1/object/sign/')
  } catch {
    return false
  }
}

/**
 * Extract bucket and path from Supabase storage URL
 */
export function parseStorageUrl(url: string): { bucket: string; path: string } | null {
  try {
    const parsed = new URL(url)
    const match = parsed.pathname.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)/)
    
    if (match) {
      return {
        bucket: match[1],
        path: match[2],
      }
    }
    
    return null
  } catch {
    return null
  }
}

/**
 * Get optimized URL for specific use case
 */
export function getOptimizedUrl(
  bucket: string,
  path: string,
  useCase: 'thumbnail' | 'preview' | 'full' | 'download'
): string {
  const publicUrl = getPublicUrl(bucket, path)
  
  switch (useCase) {
    case 'thumbnail':
      return transformImageUrl(publicUrl, {
        width: 300,
        height: 300,
        resize: 'cover',
        format: 'webp',
        quality: 75,
      })
      
    case 'preview':
      return transformImageUrl(publicUrl, {
        width: 1200,
        format: 'webp',
        quality: 85,
      })
      
    case 'full':
      return transformImageUrl(publicUrl, {
        format: 'webp',
        quality: 90,
      })
      
    case 'download':
    default:
      return publicUrl
  }
}
