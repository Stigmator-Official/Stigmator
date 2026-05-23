/**
 * Export Formats Configuration for Stigmator 3D Mockup Generator
 * Handles format-specific export logic and platform presets
 */

import * as THREE from 'three'

// ============== FORMAT CONFIGURATION ==============

export type ExportFormat = 'png' | 'jpg' | 'webp'

export interface FormatConfig {
  mimeType: string
  extension: string
  supportsTransparency: boolean
  maxQuality: number
  recommendedQuality: number
}

export const FORMATS: Record<ExportFormat, FormatConfig> = {
  png: {
    mimeType: 'image/png',
    extension: 'png',
    supportsTransparency: true,
    maxQuality: 100,
    recommendedQuality: 95,
  },
  jpg: {
    mimeType: 'image/jpeg',
    extension: 'jpg',
    supportsTransparency: false,
    maxQuality: 100,
    recommendedQuality: 90,
  },
  webp: {
    mimeType: 'image/webp',
    extension: 'webp',
    supportsTransparency: true,
    maxQuality: 100,
    recommendedQuality: 85,
  },
}

// ============== EXPORT OPTIONS ==============

export interface ExportOptions {
  width: number
  height: number
  format: ExportFormat
  quality: number
  transparent?: boolean
  maintainAspectRatio?: boolean
}

export interface ExportResult {
  blob: Blob
  url: string
  filename: string
  format: ExportFormat
  width: number
  height: number
  size: number
}

export interface ExportPreset {
  id: string
  name: string
  description: string
  options: ExportOptions
  recommendedFor: string[]
}

// ============== PLATFORM EXPORTS ==============

export interface PlatformExport {
  width: number
  height: number
  format: ExportFormat
}

export const PLATFORM_EXPORTS: Record<string, PlatformExport> = {
  stigmator: { width: 1200, height: 1200, format: 'webp' },
  instagram: { width: 1080, height: 1080, format: 'jpg' },
  instagram_story: { width: 1080, height: 1920, format: 'jpg' },
  facebook: { width: 1200, height: 630, format: 'jpg' },
  twitter: { width: 1600, height: 900, format: 'jpg' },
  pinterest: { width: 1000, height: 1500, format: 'jpg' },
  tiktok: { width: 1080, height: 1920, format: 'jpg' },
  linkedin: { width: 1200, height: 627, format: 'jpg' },
  youtube_thumbnail: { width: 1280, height: 720, format: 'jpg' },
  print_300dpi_a4: { width: 2480, height: 3508, format: 'png' },
  print_300dpi_letter: { width: 2550, height: 3300, format: 'png' },
}

// ============== CAMERA ANGLES ==============

export type CameraAngleId = 'front' | 'back' | 'three-quarter-left' | 'three-quarter-right' | 'side-left' | 'side-right'

export interface CameraAngleConfig {
  id: CameraAngleId
  name: string
  theta: number // Azimuthal angle (horizontal)
  phi: number // Polar angle (vertical)
  icon?: string
}

export const CAMERA_ANGLES: Record<CameraAngleId, CameraAngleConfig> = {
  front: {
    id: 'front',
    name: 'Front',
    theta: 0,
    phi: Math.PI / 3,
    icon: 'FrontView',
  },
  back: {
    id: 'back',
    name: 'Back',
    theta: Math.PI,
    phi: Math.PI / 3,
    icon: 'BackView',
  },
  'three-quarter-left': {
    id: 'three-quarter-left',
    name: '3/4 Left',
    theta: Math.PI / 4,
    phi: Math.PI / 3,
    icon: 'ThreeQuarterLeft',
  },
  'three-quarter-right': {
    id: 'three-quarter-right',
    name: '3/4 Right',
    theta: -Math.PI / 4,
    phi: Math.PI / 3,
    icon: 'ThreeQuarterRight',
  },
  'side-left': {
    id: 'side-left',
    name: 'Side Left',
    theta: Math.PI / 2,
    phi: Math.PI / 3,
    icon: 'SideLeft',
  },
  'side-right': {
    id: 'side-right',
    name: 'Side Right',
    theta: -Math.PI / 2,
    phi: Math.PI / 3,
    icon: 'SideRight',
  },
}

// ============== EXPORT UTILITIES ==============

/**
 * Get MIME type for a given export format
 */
export function getMimeType(format: ExportFormat): string {
  return FORMATS[format].mimeType
}

/**
 * Get file extension for a given export format
 */
export function getExtension(format: ExportFormat): string {
  return FORMATS[format].extension
}

/**
 * Check if a format supports transparency
 */
export function supportsTransparency(format: ExportFormat): boolean {
  return FORMATS[format].supportsTransparency
}

/**
 * Clamp quality value to valid range for format
 */
export function clampQuality(format: ExportFormat, quality: number): number {
  const config = FORMATS[format]
  return Math.max(0, Math.min(config.maxQuality, quality))
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * Estimate file size based on dimensions, format, and quality
 * This is a rough estimate - actual size varies by image content
 */
export function estimateFileSize(
  width: number,
  height: number,
  format: ExportFormat,
  quality: number
): number {
  const pixels = width * height
  
  // Base bytes per pixel for each format (rough estimates)
  const bytesPerPixel: Record<ExportFormat, number> = {
    png: 2.5, // PNG varies significantly by content, this is avg
    jpg: 0.15 + (quality / 100) * 0.35, // JPG quality affects size
    webp: 0.08 + (quality / 100) * 0.22, // WebP is more efficient
  }
  
  // Alpha channel adds ~25% for formats that support it
  const alphaMultiplier = supportsTransparency(format) ? 1.25 : 1
  
  return Math.round(pixels * bytesPerPixel[format] * alphaMultiplier)
}

/**
 * Generate filename based on garment type, design name, and timestamp
 */
export function generateFilename(
  garmentType: string,
  designName: string,
  format: ExportFormat,
  angle?: string
): string {
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '')
  const sanitizedGarment = garmentType.toLowerCase().replace(/\s+/g, '-')
  const sanitizedDesign = designName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const angleSuffix = angle ? `_${angle.toLowerCase().replace(/\s+/g, '-')}` : ''
  const extension = getExtension(format)
  
  return `${sanitizedGarment}_${sanitizedDesign}${angleSuffix}_${timestamp}.${extension}`
}

// ============== CANVAS CAPTURE ==============

export interface CanvasCaptureOptions {
  width: number
  height: number
  format: ExportFormat
  quality: number
  transparent?: boolean
  backgroundColor?: string
}

/**
 * Capture a WebGL renderer to a blob with specified options
 */
export async function captureRendererToBlob(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: CanvasCaptureOptions
): Promise<Blob> {
  const { width, height, format, quality, transparent, backgroundColor } = options
  
  // Store original state
  const originalSize = new THREE.Vector2()
  renderer.getSize(originalSize)
  const originalPixelRatio = renderer.getPixelRatio()
  const originalAlpha = renderer.getClearAlpha()
  const originalBg = renderer.getClearColor(new THREE.Color())
  
  try {
    // Set capture resolution
    renderer.setSize(width, height, false)
    renderer.setPixelRatio(1)
    
    // Configure background
    if (!transparent && !supportsTransparency(format)) {
      renderer.setClearAlpha(1)
      renderer.setClearColor(backgroundColor ? new THREE.Color(backgroundColor) : new THREE.Color(0x0a0f0a))
    } else {
      renderer.setClearAlpha(0)
    }
    
    // Render
    renderer.render(scene, camera)
    
    // Capture
    const mimeType = getMimeType(format)
    const qualityValue = format === 'png' ? undefined : quality / 100
    
    return new Promise<Blob>((resolve, reject) => {
      renderer.domElement.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to capture canvas to blob'))
          }
        },
        mimeType,
        qualityValue
      )
    })
  } finally {
    // Restore original state
    renderer.setSize(originalSize.x, originalSize.y, false)
    renderer.setPixelRatio(originalPixelRatio)
    renderer.setClearAlpha(originalAlpha)
    renderer.setClearColor(originalBg)
  }
}

/**
 * Export scene for a specific platform
 */
export async function exportForPlatform(
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  platform: keyof typeof PLATFORM_EXPORTS
): Promise<Blob> {
  const config = PLATFORM_EXPORTS[platform]
  
  return captureRendererToBlob(renderer, scene, camera, {
    width: config.width,
    height: config.height,
    format: config.format,
    quality: FORMATS[config.format].recommendedQuality,
    transparent: supportsTransparency(config.format),
  })
}

// ============== MULTI-ANGLE EXPORTS ==============

export interface MultiAngleExportOptions extends ExportOptions {
  angles: CameraAngleId[]
  radius?: number
}

export interface MultiAngleResult {
  angle: CameraAngleId
  blob: Blob
  url: string
  filename: string
}

/**
 * Export scene from multiple camera angles
 */
export async function exportFromMultipleAngles(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  options: MultiAngleExportOptions,
  onProgress?: (completed: number, total: number) => void
): Promise<MultiAngleResult[]> {
  const { angles, radius = 5 } = options
  
  // Store original camera state
  const originalPosition = camera.position.clone()
  const originalTarget = new THREE.Vector3(0, 0, 0)
  
  const results: MultiAngleResult[] = []
  
  for (let i = 0; i < angles.length; i++) {
    const angleId = angles[i]
    const angleConfig = CAMERA_ANGLES[angleId]
    
    // Position camera for this angle
    const theta = angleConfig.theta
    const phi = angleConfig.phi
    
    camera.position.x = radius * Math.sin(phi) * Math.sin(theta)
    camera.position.y = radius * Math.cos(phi)
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta)
    camera.lookAt(originalTarget)
    camera.updateProjectionMatrix()
    
    // Capture
    const blob = await captureRendererToBlob(renderer, scene, camera, options)
    const url = URL.createObjectURL(blob)
    
    results.push({
      angle: angleId,
      blob,
      url,
      filename: generateFilename('mockup', 'export', options.format, angleConfig.name),
    })
    
    onProgress?.(i + 1, angles.length)
  }
  
  // Restore original camera position
  camera.position.copy(originalPosition)
  camera.lookAt(originalTarget)
  camera.updateProjectionMatrix()
  
  return results
}

// ============== WATERMARK ==============

export interface WatermarkOptions {
  text: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  fontSize?: number
  color?: string
  opacity?: number
}

/**
 * Apply watermark to a canvas
 */
export function applyWatermark(
  canvas: HTMLCanvasElement,
  options: WatermarkOptions
): HTMLCanvasElement {
  const { text, position, fontSize = 24, color = '#ffffff', opacity = 0.5 } = options
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.font = `${fontSize}px sans-serif`
  ctx.fillStyle = color
  ctx.textBaseline = 'middle'
  
  const metrics = ctx.measureText(text)
  const padding = 20
  
  let x = padding
  let y = padding
  
  switch (position) {
    case 'top-right':
      x = canvas.width - metrics.width - padding
      break
    case 'bottom-left':
      y = canvas.height - padding
      break
    case 'bottom-right':
      x = canvas.width - metrics.width - padding
      y = canvas.height - padding
      break
    case 'center':
      x = (canvas.width - metrics.width) / 2
      y = canvas.height / 2
      break
    case 'top-left':
    default:
      break
  }
  
  ctx.fillText(text, x, y)
  ctx.restore()
  
  return canvas
}

// ============== VALIDATION ==============

export interface ExportValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate export options
 */
export function validateExportOptions(options: ExportOptions): ExportValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Validate dimensions
  if (options.width < 100 || options.width > 8000) {
    errors.push('Width must be between 100 and 8000 pixels')
  }
  if (options.height < 100 || options.height > 8000) {
    errors.push('Height must be between 100 and 8000 pixels')
  }
  
  // Validate quality
  if (options.quality < 1 || options.quality > 100) {
    errors.push('Quality must be between 1 and 100')
  }
  
  // Validate format
  if (!FORMATS[options.format]) {
    errors.push(`Invalid format: ${options.format}`)
  }
  
  // Warnings
  if (options.transparent && !supportsTransparency(options.format)) {
    warnings.push(`${options.format} does not support transparency, background will be applied`)
  }
  
  const estimatedSize = estimateFileSize(options.width, options.height, options.format, options.quality)
  if (estimatedSize > 50 * 1024 * 1024) {
    warnings.push('Estimated file size exceeds 50MB')
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}
