import { createClientBrowser } from '@/lib/supabase/client'

export interface DownloadOptions {
  bucket: string
  path: string
}

interface CacheEntry {
  blob: Blob
  timestamp: number
}

const downloadCache = new Map<string, CacheEntry>()
const supabase = createClientBrowser()

/**
 * Download file as blob
 */
export async function downloadFile(
  options: DownloadOptions
): Promise<Blob> {
  const { bucket, path } = options

  const { data, error } = await supabase
    .storage
    .from(bucket)
    .download(path)

  if (error) {
    throw new Error(`Download failed: ${error.message}`)
  }

  if (!data) {
    throw new Error('Download returned no data')
  }

  return data
}

/**
 * Download file as dataURL
 */
export async function downloadAsDataURL(
  options: DownloadOptions
): Promise<string> {
  const blob = await downloadFile(options)
  return blobToDataURL(blob)
}

/**
 * Download with caching
 */
export async function downloadWithCache(
  options: DownloadOptions,
  cacheDuration: number = 5 * 60 * 1000  // 5 minutes default
): Promise<Blob> {
  const cacheKey = `${options.bucket}/${options.path}`
  const cached = downloadCache.get(cacheKey)

  // Check if cached entry is still valid
  if (cached && Date.now() - cached.timestamp < cacheDuration) {
    return cached.blob
  }

  // Download fresh copy
  const blob = await downloadFile(options)

  // Store in cache
  downloadCache.set(cacheKey, {
    blob,
    timestamp: Date.now(),
  })

  return blob
}

/**
 * Create temporary download link for a blob
 */
export function createDownloadLink(
  blob: Blob,
  fileName: string
): string {
  const url = URL.createObjectURL(blob)
  return url
}

/**
 * Trigger file download in browser
 */
export function triggerDownload(
  url: string,
  fileName: string
): void {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link)
    // Only revoke if it's a blob URL (not a regular URL)
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }, 100)
}

/**
 * Download and immediately trigger save dialog
 */
export async function downloadAndSave(
  options: DownloadOptions,
  fileName: string
): Promise<void> {
  const blob = await downloadFile(options)
  const url = createDownloadLink(blob, fileName)
  triggerDownload(url, fileName)
}

/**
 * Clear the download cache
 */
export function clearDownloadCache(): void {
  downloadCache.clear()
}

/**
 * Remove specific entry from cache
 */
export function removeFromCache(options: DownloadOptions): void {
  const cacheKey = `${options.bucket}/${options.path}`
  downloadCache.delete(cacheKey)
}

// Helper function

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
