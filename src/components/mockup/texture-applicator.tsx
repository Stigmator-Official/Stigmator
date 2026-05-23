"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

/**
 * Blend mode for texture application
 * - "normal": Standard texture overlay on fabric
 * - "multiply": Multiplies texture with fabric for vintage/distressed looks
 */
export type BlendMode = "normal" | "multiply";

/**
 * Transform data for saving to database
 */
export interface TextureTransform {
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  blendMode: BlendMode;
}

/**
 * Props for the TextureApplicator component
 */
export interface TextureApplicatorProps {
  /** URL to artist's PNG design */
  designUrl: string;
  /** The garment mesh to apply texture to */
  targetMesh: THREE.Mesh;
  /** UV offset (-1 to 1) */
  position: { x: number; y: number };
  /** Scale factor (0.1 to 2.0) */
  scale: number;
  /** Rotation in degrees */
  rotation: number;
  /** Blend mode for texture application */
  blendMode?: BlendMode;
  /** Alpha test value for clean edges (0 to 1) */
  alphaTest?: number;
  /** Whether to preserve original material's maps */
  preserveOriginalMaps?: boolean;
  /** Callback when texture is applied */
  onApplied?: (texture: THREE.Texture, transform: TextureTransform) => void;
  /** Callback when texture loading fails */
  onError?: (error: Error) => void;
}

/**
 * Store original materials to restore later
 */
const originalMaterials = new WeakMap<THREE.Mesh, THREE.Material | THREE.Material[]>();

/**
 * TextureApplicator - Applies artist designs to 3D garment meshes
 * 
 * This component handles:
 * - Loading design PNGs as Three.js textures
 * - UV mapping with position, scale, and rotation transforms
 * - Material creation with blend modes
 * - Performance optimization through texture disposal
 * 
 * @requires three - Run: npm install three @types/three
 * 
 * @example
 * ```tsx
 * <TextureApplicator
 *   designUrl="/designs/artwork.png"
 *   targetMesh={garmentMesh}
 *   position={{ x: 0, y: 0 }}
 *   scale={1.0}
 *   rotation={0}
 *   blendMode="normal"
 *   onApplied={(texture, transform) => console.log('Applied:', transform)}
 * />
 * ```
 */
export function TextureApplicator({
  designUrl,
  targetMesh,
  position,
  scale,
  rotation,
  blendMode = "normal",
  alphaTest = 0.1,
  preserveOriginalMaps = true,
  onApplied,
  onError,
}: TextureApplicatorProps) {
  const textureRef = useRef<THREE.Texture | null>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial | null>(null);
  const isProcessingRef = useRef(false);

  /**
   * Dispose of old texture to free GPU memory
   */
  const disposeTexture = useCallback(() => {
    if (textureRef.current) {
      textureRef.current.dispose();
      textureRef.current = null;
    }
  }, []);

  /**
   * Dispose of created material
   */
  const disposeMaterial = useCallback(() => {
    if (materialRef.current) {
      materialRef.current.dispose();
      materialRef.current = null;
    }
  }, []);

  /**
   * Store original material before modification
   */
  const storeOriginalMaterial = useCallback((mesh: THREE.Mesh) => {
    if (!originalMaterials.has(mesh)) {
      originalMaterials.set(mesh, mesh.material);
    }
  }, []);

  /**
   * Restore original material to mesh
   */
  const restoreOriginalMaterial = useCallback((mesh: THREE.Mesh) => {
    const original = originalMaterials.get(mesh);
    if (original) {
      mesh.material = original;
    }
  }, []);

  /**
   * Create UV transform matrix for texture positioning
   */
  const createUVTransform = useCallback(() => {
    // Convert rotation from degrees to radians
    const rotationRad = (rotation * Math.PI) / 180;

    // Create transformation matrix for UV coordinates
    // Order: translate to center -> rotate -> scale -> translate back -> apply position offset
    const centerOffset = 0.5;
    
    const matrix = new THREE.Matrix3();
    
    // Start with identity
    matrix.identity();
    
    // Translate by position offset (convert -1..1 to UV space)
    const offsetX = position.x * 0.5;
    const offsetY = position.y * 0.5;
    
    // Build transformation: T(offset) * T(center) * R * S * T(-center)
    // This applies transformations in reverse order of multiplication
    
    // 1. Translate to center
    matrix.translate(centerOffset, centerOffset);
    
    // 2. Scale
    matrix.scale(scale, scale);
    
    // 3. Rotate
    matrix.rotate(rotationRad);
    
    // 4. Translate back from center
    matrix.translate(-centerOffset, -centerOffset);
    
    // 5. Apply position offset
    matrix.translate(offsetX, offsetY);
    
    return matrix;
  }, [position, scale, rotation]);

  /**
   * Load texture from URL
   */
  const loadTexture = useCallback(
    async (url: string): Promise<THREE.Texture> => {
      return new Promise((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        
        loader.load(
          url,
          (texture) => {
            // Configure texture settings
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.needsUpdate = true;
            
            // Enable anisotropic filtering for better quality at oblique angles
            const maxAnisotropy = 16;
            texture.anisotropy = maxAnisotropy;
            
            // Set wrapping modes
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            
            // Apply UV transform
            texture.matrixAutoUpdate = false;
            texture.matrix = createUVTransform();
            
            resolve(texture);
          },
          undefined, // onProgress callback (optional)
          (error: any) => {
            reject(new Error(`Failed to load texture: ${error?.message || 'Unknown error'}`));
          }
        );
      });
    },
    [createUVTransform]
  );

  /**
   * Get original material properties to preserve
   */
  const getOriginalMaterialProperties = useCallback((mesh: THREE.Mesh) => {
    const original = mesh.material;
    const defaults = {
      roughness: 0.8,
      metalness: 0.1,
      color: new THREE.Color(0xffffff),
      bumpMap: null as THREE.Texture | null,
      bumpScale: 0.01,
      normalMap: null as THREE.Texture | null,
      normalScale: new THREE.Vector2(1, 1),
      aoMap: null as THREE.Texture | null,
      aoMapIntensity: 1.0,
    };

    if (original) {
      const mat = original as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
      return {
        roughness: mat.roughness ?? defaults.roughness,
        metalness: mat.metalness ?? defaults.metalness,
        color: mat.color?.clone() ?? defaults.color,
        bumpMap: preserveOriginalMaps ? (mat as THREE.MeshStandardMaterial).bumpMap ?? defaults.bumpMap : defaults.bumpMap,
        bumpScale: (mat as THREE.MeshStandardMaterial).bumpScale ?? defaults.bumpScale,
        normalMap: preserveOriginalMaps ? (mat as THREE.MeshStandardMaterial).normalMap ?? defaults.normalMap : defaults.normalMap,
        normalScale: (mat as THREE.MeshStandardMaterial).normalScale?.clone() ?? defaults.normalScale,
        aoMap: preserveOriginalMaps ? (mat as THREE.MeshStandardMaterial).aoMap ?? defaults.aoMap : defaults.aoMap,
        aoMapIntensity: (mat as THREE.MeshStandardMaterial).aoMapIntensity ?? defaults.aoMapIntensity,
      };
    }

    return defaults;
  }, [preserveOriginalMaps]);

  /**
   * Create material with applied texture
   */
  const createMaterial = useCallback(
    (texture: THREE.Texture, mesh: THREE.Mesh) => {
      const props = getOriginalMaterialProperties(mesh);

      // Choose material type based on requirements
      // MeshPhysicalMaterial for better fabric simulation
      const material = new THREE.MeshPhysicalMaterial({
        // Base properties from original material
        roughness: props.roughness,
        metalness: props.metalness,
        color: props.color,
        
        // Original fabric maps
        bumpMap: props.bumpMap,
        bumpScale: props.bumpScale,
        normalMap: props.normalMap,
        normalScale: props.normalScale,
        aoMap: props.aoMap,
        aoMapIntensity: props.aoMapIntensity,
        
        // Design texture
        map: texture,
        
        // Alpha handling for transparent PNGs
        alphaMap: blendMode === "multiply" ? null : texture,
        alphaTest: alphaTest,
        transparent: true,
        side: THREE.DoubleSide,
        
        // Physical material properties for fabric realism
        sheen: 0.1,
        sheenRoughness: 0.5,
        sheenColor: new THREE.Color(0xffffff),
        clearcoat: 0.0,
        clearcoatRoughness: 0.1,
      });

      // Configure blend mode
      if (blendMode === "multiply") {
        // For multiply blend, we use custom blending
        material.blending = THREE.CustomBlending;
        // @ts-ignore - MultiplyOperation works at runtime
        material.blendEquation = THREE.MultiplyOperation;
        material.blendSrc = THREE.OneFactor;
        material.blendDst = THREE.OneMinusSrcAlphaFactor;
        
        // Disable alpha map in multiply mode as we're multiplying colors
        material.alphaMap = null;
        material.transparent = false;
      } else {
        // Normal blend mode - standard alpha blending
        material.blending = THREE.NormalBlending;
        material.depthWrite = false; // Prevent z-fighting with transparent textures
      }

      return material;
    },
    [getOriginalMaterialProperties, blendMode, alphaTest]
  );

  /**
   * Apply texture to mesh
   */
  const applyTexture = useCallback(async () => {
    if (!targetMesh || isProcessingRef.current) return;

    isProcessingRef.current = true;

    try {
      // Store original material if not already stored
      storeOriginalMaterial(targetMesh);

      // Dispose old texture and material
      disposeTexture();
      disposeMaterial();

      // Load new texture
      const texture = await loadTexture(designUrl);
      textureRef.current = texture;

      // Create material with texture
      const material = createMaterial(texture, targetMesh);
      materialRef.current = material;

      // Apply to mesh
      targetMesh.material = material;

      // Update texture transform in case props changed during load
      texture.matrix = createUVTransform();
      texture.needsUpdate = true;

      // Notify callback
      const transform: TextureTransform = {
        position,
        scale,
        rotation,
        blendMode,
      };

      onApplied?.(texture, transform);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error("[TextureApplicator] Failed to apply texture:", err);
      onError?.(err);
    } finally {
      isProcessingRef.current = false;
    }
  }, [
    targetMesh,
    designUrl,
    position,
    scale,
    rotation,
    blendMode,
    loadTexture,
    createMaterial,
    createUVTransform,
    disposeTexture,
    disposeMaterial,
    storeOriginalMaterial,
    onApplied,
    onError,
  ]);

  /**
   * Update texture transform when props change (without reloading texture)
   */
  useEffect(() => {
    if (textureRef.current && !isProcessingRef.current) {
      textureRef.current.matrix = createUVTransform();
      textureRef.current.needsUpdate = true;
    }
  }, [position, scale, rotation, createUVTransform]);

  /**
   * Apply texture when design URL or target mesh changes
   */
  useEffect(() => {
    applyTexture();

    // Cleanup function
    return () => {
      if (targetMesh) {
        restoreOriginalMaterial(targetMesh);
      }
      disposeMaterial();
      disposeTexture();
    };
  }, [designUrl, targetMesh, applyTexture, disposeMaterial, disposeTexture, restoreOriginalMaterial]);

  /**
   * Update material when blend mode changes
   */
  useEffect(() => {
    if (materialRef.current && textureRef.current && !isProcessingRef.current) {
      // Recreate material with new blend mode
      disposeMaterial();
      const material = createMaterial(textureRef.current, targetMesh);
      materialRef.current = material;
      targetMesh.material = material;
    }
  }, [blendMode, targetMesh, createMaterial, disposeMaterial]);

  // This component doesn't render any DOM elements
  return null;
}

/**
 * Hook to use texture application functionality outside of React component tree
 */
export function useTextureApplicator() {
  const textureRef = useRef<THREE.Texture | null>(null);

  /**
   * Apply texture directly to a mesh
   */
  const applyTextureToMesh = useCallback(async (
    mesh: THREE.Mesh,
    designUrl: string,
    transform: Partial<TextureTransform> = {}
  ): Promise<{ texture: THREE.Texture; material: THREE.Material }> => {
    const {
      position = { x: 0, y: 0 },
      scale = 1.0,
      rotation = 0,
      blendMode = "normal",
    } = transform;

    // Load texture
    const loader = new THREE.TextureLoader();
    const texture = await new Promise<THREE.Texture>((resolve, reject) => {
      loader.load(
        designUrl,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.needsUpdate = true;
          tex.anisotropy = 16;
          tex.wrapS = THREE.ClampToEdgeWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
          resolve(tex);
        },
        undefined,
        (error: any) => reject(new Error(`Failed to load texture: ${error?.message || 'Unknown error'}`))
      );
    });

    textureRef.current?.dispose();
    textureRef.current = texture;

    // Calculate UV transform
    const rotationRad = (rotation * Math.PI) / 180;
    const matrix = new THREE.Matrix3();
    matrix.identity();
    matrix.translate(0.5, 0.5);
    matrix.scale(scale, scale);
    matrix.rotate(rotationRad);
    matrix.translate(-0.5, -0.5);
    matrix.translate(position.x * 0.5, position.y * 0.5);
    
    texture.matrixAutoUpdate = false;
    texture.matrix = matrix;

    // Get original properties
    const original = mesh.material as THREE.MeshStandardMaterial;
    const material = new THREE.MeshPhysicalMaterial({
      roughness: original?.roughness ?? 0.8,
      metalness: original?.metalness ?? 0.1,
      color: original?.color?.clone() ?? new THREE.Color(0xffffff),
      map: texture,
      transparent: blendMode !== "multiply",
      alphaTest: 0.1,
      side: THREE.DoubleSide,
      blending: blendMode === "multiply" ? THREE.CustomBlending : THREE.NormalBlending,
      // @ts-ignore - MultiplyOperation works at runtime
      blendEquation: blendMode === "multiply" ? THREE.MultiplyOperation : undefined,
    });

    mesh.material = material;

    return { texture, material };
  }, []);

  /**
   * Dispose texture
   */
  const dispose = useCallback(() => {
    textureRef.current?.dispose();
    textureRef.current = null;
  }, []);

  return {
    applyTextureToMesh,
    dispose,
    texture: textureRef.current,
  };
}

/**
 * Utility to restore original material to a mesh
 */
export function restoreMeshMaterial(mesh: THREE.Mesh): void {
  const original = originalMaterials.get(mesh);
  if (original) {
    mesh.material = original;
  }
}

/**
 * Utility to create a compressed texture variant
 * Note: Requires additional setup with compressed texture formats (KTX2, Basis, etc.)
 */
export async function createCompressedTexture(
  imageUrl: string,
  format: "webp" | "avif" = "webp"
): Promise<Blob> {
  // This is a placeholder for texture compression
  // In production, you'd use libraries like:
  // - @gfx-js/gfx-texture-compress
  // - basis_universal
  // - KTX2Loader from Three.js
  
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  
  // Return original blob (implement compression based on your pipeline)
  return blob;
}

export default TextureApplicator;
