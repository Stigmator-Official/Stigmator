// STIGMATOR Storage Service
// Handles file uploads, image optimization, and asset management

import { createBrowserClient } from "@/lib/database/browser";
import { createAdminClient } from "@/lib/database/server";

// ============================================
// CONFIGURATION
// ============================================

const STORAGE_BUCKETS = {
  DESIGN_UPLOADS: "design-uploads",
  PRODUCT_MOCKUPS: "product-mockups",
  AVATARS: "avatars",
  TEMP: "temp",
} as const;

const IMAGE_VARIANTS = {
  THUMBNAIL: { width: 300, height: 300 },
  PREVIEW: { width: 800, height: 800 },
  FULL: { width: 2400, height: 2400 },
} as const;

// ============================================
// TYPES
// ============================================

export interface UploadResult {
  path: string;
  publicUrl: string;
  variantUrls: {
    thumbnail: string;
    preview: string;
    full: string;
  };
}

export interface UploadOptions {
  userId: string;
  fileName: string;
  contentType: string;
  onProgress?: (progress: number) => void;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}

// ============================================
// BUCKET SETUP
// ============================================

/**
 * Ensure storage buckets exist
 * Run this once during app initialization
 */
export async function setupStorageBuckets(): Promise<void> {
  const supabase = createAdminClient();

  for (const bucketName of Object.values(STORAGE_BUCKETS)) {
    try {
      const { data: existingBucket } = await supabase.storage.getBucket(bucketName);
      
      if (!existingBucket) {
        await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
        });
        
        console.log(`[Storage] Created bucket: ${bucketName}`);
      }
    } catch (error) {
      console.error(`[Storage] Error setting up bucket ${bucketName}:`, error);
    }
  }
}

// ============================================
// FILE UPLOAD
// ============================================

/**
 * Upload a design file with automatic variant generation
 */
export async function uploadDesign(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const supabase = createBrowserClient();
  
  // Generate unique path
  const timestamp = Date.now();
  const sanitizedName = options.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `${options.userId}/${timestamp}_${sanitizedName}`;
  
  // Upload original file
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.DESIGN_UPLOADS)
    .upload(path, file, {
      contentType: options.contentType,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Get public URL for original
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKETS.DESIGN_UPLOADS)
    .getPublicUrl(path);

  // Generate variant URLs (using Supabase Image Transformations)
  const variantUrls = {
    thumbnail: getImageTransformationUrl(publicUrl, IMAGE_VARIANTS.THUMBNAIL),
    preview: getImageTransformationUrl(publicUrl, IMAGE_VARIANTS.PREVIEW),
    full: publicUrl,
  };

  return {
    path: uploadData.path,
    publicUrl,
    variantUrls,
  };
}

/**
 * Get transformed image URL using Supabase's Image Transformation API
 */
function getImageTransformationUrl(
  originalUrl: string,
  dimensions: { width: number; height: number }
): string {
  const url = new URL(originalUrl);
  url.searchParams.set("width", dimensions.width.toString());
  url.searchParams.set("height", dimensions.height.toString());
  url.searchParams.set("resize", "contain");
  url.searchParams.set("format", "webp");
  return url.toString();
}

// ============================================
// FILE MANAGEMENT
// ============================================

/**
 * Delete a design file and its variants
 */
export async function deleteDesignFile(path: string): Promise<void> {
  const supabase = createBrowserClient();
  
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.DESIGN_UPLOADS)
    .remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Move a file to a different location
 */
export async function moveDesignFile(
  oldPath: string,
  newPath: string
): Promise<void> {
  const supabase = createAdminClient();
  
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.DESIGN_UPLOADS)
    .move(oldPath, newPath);

  if (error) {
    throw new Error(`Move failed: ${error.message}`);
  }
}

// ============================================
// IMAGE OPTIMIZATION
// ============================================

/**
 * Client-side image compression before upload
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: "jpeg" | "webp";
  } = {}
): Promise<Blob> {
  const {
    maxWidth = 2400,
    maxHeight = 2400,
    quality = 0.85,
    format = "webp",
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // Create canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Compression failed"));
          }
        },
        `image/${format}`,
        quality
      );
    };
    
    img.onerror = () => reject(new Error("Failed to load image"));
  });
}

/**
 * Get image dimensions before upload
 */
export function getImageDimensions(file: File): Promise<ImageMetadata> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve({
        width: img.width,
        height: img.height,
        format: file.type.split("/")[1],
        size: file.size,
      });
    };
    
    img.onerror = () => reject(new Error("Failed to load image"));
  });
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Upload multiple files in parallel
 */
export async function uploadMultipleDesigns(
  files: File[],
  baseOptions: Omit<UploadOptions, "fileName" | "contentType">
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file, index) =>
    uploadDesign(file, {
      ...baseOptions,
      fileName: file.name,
      contentType: file.type,
    })
  );

  return Promise.all(uploadPromises);
}

// ============================================
// VALIDATION
// ============================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a file before upload
 */
export function validateDesignFile(file: File): ValidationResult {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Please upload JPG, PNG, WebP, or SVG.",
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: "File too large. Maximum size is 10MB.",
    };
  }

  return { valid: true };
}

// ============================================
// URL HELPERS
// ============================================

/**
 * Get a signed URL for private files
 */
export async function getSignedUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = createBrowserClient();
  
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.DESIGN_UPLOADS)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Check if a file exists
 */
export async function fileExists(path: string): Promise<boolean> {
  const supabase = createBrowserClient();
  
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.DESIGN_UPLOADS)
    .list(path.split("/").slice(0, -1).join("/"));

  if (error) return false;

  const fileName = path.split("/").pop();
  return data.some(item => item.name === fileName);
}
