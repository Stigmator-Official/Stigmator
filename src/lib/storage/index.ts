// Upload utilities
export {
  uploadFile,
  uploadDataURL,
  uploadImageWithCompression,
  generateFilePath,
  type UploadOptions,
  type UploadResult,
} from './upload'

// Download utilities
export {
  downloadFile,
  downloadAsDataURL,
  downloadWithCache,
  createDownloadLink,
  triggerDownload,
  downloadAndSave,
  clearDownloadCache,
  removeFromCache,
  type DownloadOptions,
} from './download'

// Delete utilities
export {
  deleteFile,
  deleteFiles,
  deleteFolder,
  safeDelete,
  deleteWithProgress,
  moveFile,
  copyFile,
  type DeleteOptions,
} from './delete'

// URL utilities
export {
  getPublicUrl,
  getSignedUrl,
  getSignedUrls,
  transformImageUrl,
  getThumbnailUrl,
  generateSrcSet,
  isSupabaseStorageUrl,
  parseStorageUrl,
  getOptimizedUrl,
} from './urls'

// Quota utilities
export {
  getArtistQuota,
  checkQuota,
  getStorageBreakdown,
  cleanupTempFiles,
  getBucketSizeLimit,
  validateFileSize,
  formatBytes,
  subscribeToQuotaUpdates,
  type QuotaInfo,
} from './quota'

// Storage configuration
export const STORAGE_BUCKETS = {
  DESIGNS: 'designs',
  MOCKUPS: 'mockups',
  TEMP: 'temp',
  MODELS: 'garment-models',
} as const

// Max file sizes (in bytes)
export const STORAGE_LIMITS = {
  MAX_DESIGN_SIZE: 10 * 1024 * 1024,      // 10MB
  MAX_MOCKUP_SIZE: 5 * 1024 * 1024,       // 5MB
  MAX_MODEL_SIZE: 50 * 1024 * 1024,       // 50MB
  TOTAL_ARTIST_QUOTA: 500 * 1024 * 1024,  // 500MB per artist
} as const

// Bucket configurations
export const BUCKET_CONFIG = {
  [STORAGE_BUCKETS.DESIGNS]: {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
    maxFileSize: STORAGE_LIMITS.MAX_DESIGN_SIZE,
  },
  [STORAGE_BUCKETS.MOCKUPS]: {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    maxFileSize: STORAGE_LIMITS.MAX_MOCKUP_SIZE,
  },
  [STORAGE_BUCKETS.TEMP]: {
    public: false,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    fileSizeLimit: STORAGE_LIMITS.MAX_DESIGN_SIZE,
  },
  [STORAGE_BUCKETS.MODELS]: {
    public: false,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'application/octet-stream'],
    fileSizeLimit: STORAGE_LIMITS.MAX_MODEL_SIZE,
  },
} as const

// Storage error codes
export const STORAGE_ERRORS = {
  BUCKET_NOT_FOUND: 'Bucket not found',
  FILE_NOT_FOUND: 'File not found',
  FILE_TOO_LARGE: 'File exceeds size limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  QUOTA_EXCEEDED: 'Storage quota exceeded',
  UPLOAD_FAILED: 'Upload failed',
  DOWNLOAD_FAILED: 'Download failed',
  DELETE_FAILED: 'Delete failed',
  UNAUTHORIZED: 'Unauthorized access',
} as const

// Helper to check if a file type is allowed in a bucket
export function isFileTypeAllowed(bucket: string, mimeType: string): boolean {
  const config = BUCKET_CONFIG[bucket as keyof typeof BUCKET_CONFIG]
  
  if (!config) {
    return false
  }
  
  return (config.allowedMimeTypes as readonly string[]).includes(mimeType)
}

// Helper to get allowed file types for a bucket
export function getAllowedFileTypes(bucket: string): string[] {
  const config = BUCKET_CONFIG[bucket as keyof typeof BUCKET_CONFIG]
  
  return [...(config?.allowedMimeTypes || [])]
}
