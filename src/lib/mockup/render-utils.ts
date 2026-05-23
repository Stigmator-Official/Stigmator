/**
 * Rendering Utilities for Stigmator
 * 
 * Helper functions for canvas capture, image processing, batch rendering,
 * and output optimization.
 */

import * as THREE from 'three';
import type { RenderOptions } from './high-res-renderer';

// Canvas capture options
export interface CaptureOptions {
  format: 'png' | 'jpg' | 'webp';
  quality: number;
  backgroundColor?: string;
}

// Image resize options
export interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
  filter?: 'nearest' | 'linear' | 'bicubic';
}

// Watermark options
export interface WatermarkOptions {
  text: string;
  position: 'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  opacity?: number;
  padding?: number;
}

// Optimization options
export interface OptimizeOptions {
  maxSizeKB: number;
  format?: 'png' | 'jpg' | 'webp';
  minQuality?: number;
  maxIterations?: number;
}

// Default values
const DEFAULT_CAPTURE_QUALITY = 0.95;
const DEFAULT_MAX_SIZE_KB = 500;
const DEFAULT_MIN_QUALITY = 0.3;

/**
 * Capture current canvas as data URL
 * 
 * @param canvas - The canvas element to capture
 * @param options - Capture options
 * @returns Data URL string
 */
export function captureCanvas(
  canvas: HTMLCanvasElement,
  options: CaptureOptions
): string {
  const mimeType = `image/${options.format}`;
  
  // For JPEG, fill background if transparent
  if (options.format === 'jpg') {
    const ctx = canvas.getContext('2d');
    if (ctx && options.backgroundColor) {
      // Create temporary canvas to composite background
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        tempCtx.fillStyle = options.backgroundColor;
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(canvas, 0, 0);
        return tempCanvas.toDataURL(mimeType, options.quality);
      }
    }
  }
  
  return canvas.toDataURL(mimeType, options.quality);
}

/**
 * Convert data URL to Blob
 * 
 * @param dataURL - The data URL to convert
 * @returns Blob object
 */
export function dataURLToBlob(dataURL: string): Blob {
  const parts = dataURL.split(',');
  const byteString = parts[0].includes('base64')
    ? atob(parts[1])
    : decodeURIComponent(parts[1]);
  
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
  
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeType });
}

/**
 * Convert Blob to data URL
 * 
 * @param blob - The blob to convert
 * @returns Promise resolving to data URL
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Load an image from a data URL
 * 
 * @param imageData - Data URL or image source
 * @returns Promise resolving to HTMLImageElement
 */
export function loadImage(imageData: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageData;
  });
}

/**
 * Resize an image while maintaining aspect ratio
 * 
 * @param imageData - Source image data URL
 * @param options - Resize options
 * @returns Promise resolving to resized data URL
 */
export async function resizeImage(
  imageData: string,
  options: ResizeOptions
): Promise<string> {
  const img = await loadImage(imageData);
  
  let { width, height } = img;
  const { maxWidth, maxHeight, maintainAspectRatio = true } = options;
  
  if (maintainAspectRatio) {
    const aspectRatio = width / height;
    
    if (maxWidth && width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    
    if (maxHeight && height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
  } else {
    if (maxWidth) width = maxWidth;
    if (maxHeight) height = maxHeight;
  }
  
  // Create canvas and draw resized image
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Apply filter quality
  switch (options.filter) {
    case 'nearest':
      ctx.imageSmoothingEnabled = false;
      break;
    case 'bicubic':
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      break;
    case 'linear':
    default:
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
      break;
  }
  
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  // Determine output format from input
  const format = imageData.includes('image/jpeg')
    ? 'jpg'
    : imageData.includes('image/webp')
    ? 'webp'
    : 'png';
  
  return canvas.toDataURL(`image/${format}`, DEFAULT_CAPTURE_QUALITY);
}

/**
 * Generate multiple angles at once
 * 
 * Rotates the camera around the target and renders at each angle.
 * 
 * @param scene - Three.js scene
 * @param baseCamera - Base camera configuration
 * @param angles - Array of rotation angles in degrees
 * @param options - Render options
 * @returns Promise resolving to array of data URLs
 */
export async function renderAngleSeries(
  scene: THREE.Scene,
  baseCamera: THREE.Camera,
  angles: number[],
  options: RenderOptions
): Promise<string[]> {
  const results: string[] = [];
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    preserveDrawingBuffer: true 
  });
  renderer.setSize(options.width, options.height);
  renderer.setPixelRatio(1);
  
  // Get camera position for orbit calculation
  let orbitCenter: THREE.Vector3 | undefined;
  let orbitRadius: number | undefined;
  let orbitHeight: number | undefined;
  
  if (baseCamera instanceof THREE.PerspectiveCamera || 
      baseCamera instanceof THREE.OrthographicCamera) {
    const position = baseCamera.position;
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(baseCamera.quaternion);
    
    // Estimate orbit center at some distance
    const distance = 10; // Default distance
    orbitCenter = position.clone().add(direction.multiplyScalar(distance));
    orbitRadius = position.distanceTo(orbitCenter);
    orbitHeight = position.y;
  }
  
  try {
    for (let i = 0; i < angles.length; i++) {
      const angleDeg = angles[i];
      const angleRad = (angleDeg * Math.PI) / 180;
      
      // Clone camera for this angle
      const camera = baseCamera.clone();
      
      if (orbitCenter && orbitRadius !== undefined && orbitHeight !== undefined) {
        // Calculate new position on orbit
        const x = orbitCenter.x + Math.cos(angleRad) * orbitRadius;
        const z = orbitCenter.z + Math.sin(angleRad) * orbitRadius;
        
        camera.position.set(x, orbitHeight, z);
        camera.lookAt(orbitCenter);
        
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.updateProjectionMatrix();
        }
      } else {
        // Fallback: rotate camera around Y axis at its position
        const position = camera.position.clone();
        camera.position.x = position.x * Math.cos(angleRad) - position.z * Math.sin(angleRad);
        camera.position.z = position.x * Math.sin(angleRad) + position.z * Math.cos(angleRad);
        camera.lookAt(0, 0, 0);
      }
      
      // Render
      renderer.render(scene, camera);
      
      // Capture
      const dataURL = renderer.domElement.toDataURL(
        `image/${options.format}`,
        options.format === 'jpg' ? 0.95 : undefined
      );
      
      results.push(dataURL);
    }
  } finally {
    renderer.dispose();
  }
  
  return results;
}

/**
 * Optimize image for web by reducing quality until size requirement is met
 * 
 * @param imageData - Source image data URL
 * @param options - Optimization options
 * @returns Promise resolving to optimized data URL
 */
export async function optimizeForWeb(
  imageData: string,
  options: OptimizeOptions
): Promise<string> {
  const { maxSizeKB, format = 'jpg', minQuality = DEFAULT_MIN_QUALITY, maxIterations = 10 } = options;
  const maxSizeBytes = maxSizeKB * 1024;
  
  // Determine best output format
  const outputFormat = format === 'webp' && !supportsWebP() ? 'jpg' : format;
  
  let currentQuality = 0.95;
  let currentData = imageData;
  let iterations = 0;
  
  while (iterations < maxIterations) {
    // Convert to target format with current quality
    const img = await loadImage(currentData);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    ctx.drawImage(img, 0, 0);
    currentData = canvas.toDataURL(`image/${outputFormat}`, currentQuality);
    
    // Check size
    const blob = dataURLToBlob(currentData);
    
    if (blob.size <= maxSizeBytes) {
      return currentData;
    }
    
    // Reduce quality for next iteration
    currentQuality = Math.max(minQuality, currentQuality - 0.1);
    iterations++;
  }
  
  // If still too large, try reducing dimensions
  const blob = dataURLToBlob(currentData);
  
  if (blob.size > maxSizeBytes) {
    const img = await loadImage(currentData);
    const scale = Math.sqrt(maxSizeBytes / blob.size) * 0.9; // Slightly under target
    
    currentData = await resizeImage(currentData, {
      maxWidth: Math.floor(img.width * scale),
      maxHeight: Math.floor(img.height * scale),
      maintainAspectRatio: true,
    });
  }
  
  return currentData;
}

/**
 * Add watermark to an image
 * 
 * @param imageData - Source image data URL
 * @param options - Watermark options
 * @returns Promise resolving to watermarked data URL
 */
export async function addWatermark(
  imageData: string,
  options: WatermarkOptions
): Promise<string> {
  const img = await loadImage(imageData);
  
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Draw original image
  ctx.drawImage(img, 0, 0);
  
  // Configure text
  const fontSize = options.fontSize || Math.max(12, Math.floor(canvas.height / 30));
  const fontFamily = options.fontFamily || 'Arial, sans-serif';
  const color = options.color || 'rgba(255, 255, 255, 0.5)';
  const opacity = options.opacity ?? 0.5;
  const padding = options.padding || 20;
  
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;
  
  // Measure text
  const metrics = ctx.measureText(options.text);
  const textWidth = metrics.width;
  const textHeight = fontSize;
  
  // Calculate position
  let x: number;
  let y: number;
  
  switch (options.position) {
    case 'center':
      x = (canvas.width - textWidth) / 2;
      y = (canvas.height + textHeight) / 2;
      break;
    case 'bottom-left':
      x = padding;
      y = canvas.height - padding;
      break;
    case 'top-right':
      x = canvas.width - textWidth - padding;
      y = padding + textHeight;
      break;
    case 'top-left':
      x = padding;
      y = padding + textHeight;
      break;
    case 'bottom-right':
    default:
      x = canvas.width - textWidth - padding;
      y = canvas.height - padding;
      break;
  }
  
  // Add subtle background for readability
  ctx.save();
  ctx.globalAlpha = opacity * 0.5;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(x - 5, y - textHeight - 2, textWidth + 10, textHeight + 8);
  ctx.restore();
  
  // Draw text
  ctx.fillText(options.text, x, y);
  
  // Reset alpha
  ctx.globalAlpha = 1;
  
  // Determine output format
  const format = imageData.includes('image/jpeg')
    ? 'jpg'
    : imageData.includes('image/webp')
    ? 'webp'
    : 'png';
  
  return canvas.toDataURL(`image/${format}`, DEFAULT_CAPTURE_QUALITY);
}

/**
 * Create a sprite sheet from multiple images
 * 
 * @param images - Array of image data URLs
 * @param columns - Number of columns in the sprite sheet
 * @returns Promise resolving to sprite sheet data URL
 */
export async function createSpriteSheet(
  images: string[],
  columns: number = 4
): Promise<string> {
  if (images.length === 0) {
    throw new Error('No images provided');
  }
  
  const loadedImages = await Promise.all(images.map(loadImage));
  
  // Use first image dimensions (assume all same size)
  const cellWidth = loadedImages[0].width;
  const cellHeight = loadedImages[0].height;
  
  const rows = Math.ceil(images.length / columns);
  
  const canvas = document.createElement('canvas');
  canvas.width = cellWidth * columns;
  canvas.height = cellHeight * rows;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Draw each image
  loadedImages.forEach((img, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    ctx.drawImage(img, col * cellWidth, row * cellHeight);
  });
  
  return canvas.toDataURL('image/png');
}

/**
 * Check if WebP format is supported
 */
export function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  try {
    return canvas.toDataURL('image/webp').includes('data:image/webp');
  } catch {
    return false;
  }
}

/**
 * Check if AVIF format is supported
 */
export function supportsAVIF(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  try {
    return canvas.toDataURL('image/avif').includes('data:image/avif');
  } catch {
    return false;
  }
}

/**
 * Get optimal format for the browser
 */
export function getOptimalFormat(): 'webp' | 'png' | 'jpg' {
  if (supportsWebP()) return 'webp';
  return 'png';
}

/**
 * Get image dimensions from data URL without loading full image
 * 
 * @param dataURL - Image data URL
 * @returns Promise resolving to dimensions
 */
export function getImageDimensions(dataURL: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    
    // Use blob URL for better performance
    const blob = dataURLToBlob(dataURL);
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Calculate file size of a data URL in KB
 */
export function getDataURLSizeKB(dataURL: string): number {
  const base64 = dataURL.split(',')[1];
  if (!base64) return 0;
  
  const bytes = atob(base64).length;
  return bytes / 1024;
}

/**
 * Composite multiple images together
 * 
 * @param layers - Array of image data URLs with positions
 * @param width - Output width
 * @param height - Output height
 * @returns Promise resolving to composited image data URL
 */
export async function compositeImages(
  layers: Array<{
    image: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    opacity?: number;
  }>,
  width: number,
  height: number
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  for (const layer of layers) {
    const img = await loadImage(layer.image);
    
    ctx.save();
    ctx.globalAlpha = layer.opacity ?? 1;
    
    const drawWidth = layer.width ?? img.width;
    const drawHeight = layer.height ?? img.height;
    
    ctx.drawImage(img, layer.x, layer.y, drawWidth, drawHeight);
    ctx.restore();
  }
  
  return canvas.toDataURL('image/png');
}

/**
 * Create a thumbnail from an image
 * 
 * @param imageData - Source image data URL
 * @param size - Thumbnail size (width and height)
 * @returns Promise resolving to thumbnail data URL
 */
export async function createThumbnail(
  imageData: string,
  size: number = 200
): Promise<string> {
  return resizeImage(imageData, {
    maxWidth: size,
    maxHeight: size,
    maintainAspectRatio: true,
    filter: 'bicubic',
  });
}

/**
 * Apply crop to an image
 * 
 * @param imageData - Source image data URL
 * @param crop - Crop rectangle (normalized 0-1 or pixels)
 * @param normalized - Whether crop values are normalized
 * @returns Promise resolving to cropped image data URL
 */
export async function cropImage(
  imageData: string,
  crop: { x: number; y: number; width: number; height: number },
  normalized: boolean = false
): Promise<string> {
  const img = await loadImage(imageData);
  
  let { x, y, width, height } = crop;
  
  if (normalized) {
    x *= img.width;
    y *= img.height;
    width *= img.width;
    height *= img.height;
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  ctx.drawImage(
    img,
    Math.round(x),
    Math.round(y),
    Math.round(width),
    Math.round(height),
    0,
    0,
    canvas.width,
    canvas.height
  );
  
  const format = imageData.includes('image/jpeg')
    ? 'jpg'
    : imageData.includes('image/webp')
    ? 'webp'
    : 'png';
  
  return canvas.toDataURL(`image/${format}`, DEFAULT_CAPTURE_QUALITY);
}

/**
 * Compare two images and return similarity score (0-1)
 * 
 * @param imageData1 - First image
 * @param imageData2 - Second image
 * @returns Promise resolving to similarity score
 */
export async function compareImages(
  imageData1: string,
  imageData2: string
): Promise<number> {
  const [img1, img2] = await Promise.all([loadImage(imageData1), loadImage(imageData2)]);
  
  // Create small canvases for comparison
  const size = 32; // Compare at 32x32
  
  const canvas1 = document.createElement('canvas');
  const canvas2 = document.createElement('canvas');
  canvas1.width = canvas2.width = size;
  canvas1.height = canvas2.height = size;
  
  const ctx1 = canvas1.getContext('2d');
  const ctx2 = canvas2.getContext('2d');
  
  if (!ctx1 || !ctx2) {
    throw new Error('Could not get canvas context');
  }
  
  ctx1.drawImage(img1, 0, 0, size, size);
  ctx2.drawImage(img2, 0, 0, size, size);
  
  const data1 = ctx1.getImageData(0, 0, size, size).data;
  const data2 = ctx2.getImageData(0, 0, size, size).data;
  
  let diff = 0;
  
  for (let i = 0; i < data1.length; i += 4) {
    const r1 = data1[i];
    const g1 = data1[i + 1];
    const b1 = data1[i + 2];
    
    const r2 = data2[i];
    const g2 = data2[i + 1];
    const b2 = data2[i + 2];
    
    // Perceptual difference
    diff += Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
  }
  
  const maxDiff = size * size * 3 * 255;
  const similarity = 1 - diff / maxDiff;
  
  return Math.max(0, Math.min(1, similarity));
}
