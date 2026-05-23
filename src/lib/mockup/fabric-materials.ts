/**
 * Physically-Based Fabric Materials
 * 
 * Procedural fabric material generation with customizable properties
 * for different fabric types commonly used in garment printing.
 */

import * as THREE from 'three';

export interface FabricType {
  name: string;
  description: string;
  roughness: number;
  metalness: number;
  sheen: number;
  sheenColor: THREE.Color;
  sheenRoughness: number;
  normalScale: number;
  clearcoat: number;
  clearcoatRoughness: number;
  transmission: number;
  thickness: number;
  // Procedural texture generation parameters
  weavePattern: 'plain' | 'jersey' | 'fleece' | 'interlock' | 'rib';
  weaveScale: number;
  bumpIntensity: number;
}

// Fabric type definitions with physically-based properties
export const FABRICS: Record<string, FabricType> = {
  cotton: {
    name: '100% Cotton',
    description: 'Classic jersey knit cotton, soft and breathable',
    roughness: 0.9,
    metalness: 0.0,
    sheen: 0.1,
    sheenColor: new THREE.Color(0xf5f5f5),
    sheenRoughness: 0.8,
    normalScale: 0.3,
    clearcoat: 0.0,
    clearcoatRoughness: 0.5,
    transmission: 0.0,
    thickness: 0.0,
    weavePattern: 'jersey',
    weaveScale: 512,
    bumpIntensity: 0.02
  },
  
  ringspun: {
    name: 'Ringspun Cotton',
    description: 'Smoother, softer cotton with refined surface',
    roughness: 0.85,
    metalness: 0.0,
    sheen: 0.15,
    sheenColor: new THREE.Color(0xffffff),
    sheenRoughness: 0.7,
    normalScale: 0.25,
    clearcoat: 0.0,
    clearcoatRoughness: 0.5,
    transmission: 0.0,
    thickness: 0.0,
    weavePattern: 'jersey',
    weaveScale: 512,
    bumpIntensity: 0.015
  },
  
  polyester: {
    name: 'Polyester',
    description: 'Smooth synthetic with slight sheen',
    roughness: 0.6,
    metalness: 0.05,
    sheen: 0.3,
    sheenColor: new THREE.Color(0xe8e8e8),
    sheenRoughness: 0.5,
    normalScale: 0.15,
    clearcoat: 0.1,
    clearcoatRoughness: 0.3,
    transmission: 0.0,
    thickness: 0.0,
    weavePattern: 'interlock',
    weaveScale: 512,
    bumpIntensity: 0.01
  },
  
  triblend: {
    name: 'Tri-Blend',
    description: 'Cotton/polyester/rayon blend with heathered texture',
    roughness: 0.8,
    metalness: 0.02,
    sheen: 0.2,
    sheenColor: new THREE.Color(0xd0d0d0),
    sheenRoughness: 0.6,
    normalScale: 0.35,
    clearcoat: 0.0,
    clearcoatRoughness: 0.5,
    transmission: 0.0,
    thickness: 0.0,
    weavePattern: 'jersey',
    weaveScale: 512,
    bumpIntensity: 0.025
  },
  
  fleece: {
    name: 'Fleece',
    description: 'Soft, warm, slightly fuzzy surface',
    roughness: 0.95,
    metalness: 0.0,
    sheen: 0.05,
    sheenColor: new THREE.Color(0x888888),
    sheenRoughness: 0.9,
    normalScale: 0.5,
    clearcoat: 0.0,
    clearcoatRoughness: 0.8,
    transmission: 0.0,
    thickness: 0.02,
    weavePattern: 'fleece',
    weaveScale: 512,
    bumpIntensity: 0.04
  },
  
  premium: {
    name: 'Premium Cotton',
    description: 'High-quality combed cotton with refined finish',
    roughness: 0.75,
    metalness: 0.0,
    sheen: 0.2,
    sheenColor: new THREE.Color(0xffffff),
    sheenRoughness: 0.6,
    normalScale: 0.2,
    clearcoat: 0.05,
    clearcoatRoughness: 0.4,
    transmission: 0.0,
    thickness: 0.0,
    weavePattern: 'jersey',
    weaveScale: 512,
    bumpIntensity: 0.012
  },
  
  athletic: {
    name: 'Athletic Mesh',
    description: 'Performance fabric with visible mesh structure',
    roughness: 0.7,
    metalness: 0.03,
    sheen: 0.25,
    sheenColor: new THREE.Color(0xc0c0c0),
    sheenRoughness: 0.5,
    normalScale: 0.4,
    clearcoat: 0.05,
    clearcoatRoughness: 0.3,
    transmission: 0.02,
    thickness: 0.01,
    weavePattern: 'interlock',
    weaveScale: 512,
    bumpIntensity: 0.03
  },
  
  canvas: {
    name: 'Heavy Canvas',
    description: 'Durable, coarse weave for heavy-duty garments',
    roughness: 0.98,
    metalness: 0.0,
    sheen: 0.02,
    sheenColor: new THREE.Color(0x666666),
    sheenRoughness: 0.95,
    normalScale: 0.6,
    clearcoat: 0.0,
    clearcoatRoughness: 1.0,
    transmission: 0.0,
    thickness: 0.0,
    weavePattern: 'plain',
    weaveScale: 512,
    bumpIntensity: 0.05
  }
};

// Cache for generated textures
const textureCache: Map<string, THREE.DataTexture> = new Map();

/**
 * Generate weave pattern data
 */
function generateWeavePattern(
  width: number,
  height: number,
  pattern: FabricType['weavePattern']
): Uint8Array {
  const size = width * height * 4;
  const data = new Uint8Array(size);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      
      // Normalized coordinates
      const nx = x / width;
      const ny = y / height;
      
      let value = 0.5;
      
      switch (pattern) {
        case 'plain':
          // Simple basket weave pattern
          value = ((Math.floor(nx * 32) + Math.floor(ny * 32)) % 2 === 0) ? 0.55 : 0.45;
          break;
          
        case 'jersey':
          // Jersey knit pattern (diagonal lines)
          const jerseyPhase = (nx * 64 + ny * 32) % 16;
          value = 0.5 + Math.sin(jerseyPhase * Math.PI / 8) * 0.08;
          break;
          
        case 'fleece':
          // Fleece fuzzy pattern (noise-based)
          const noise1 = Math.sin(nx * 100) * Math.cos(ny * 100);
          const noise2 = Math.sin(nx * 143 + ny * 97) * 0.5;
          value = 0.5 + (noise1 + noise2) * 0.1;
          break;
          
        case 'interlock':
          // Interlock pattern (double jersey)
          const interlockPhase = (nx * 48) % 12;
          const interlockY = (ny * 48) % 24;
          value = 0.5 + Math.sin(interlockPhase * Math.PI / 6) * 
                        Math.cos(interlockY * Math.PI / 12) * 0.06;
          break;
          
        case 'rib':
          // Rib knit pattern (vertical lines)
          const ribPhase = (nx * 80) % 8;
          value = 0.5 + Math.sin(ribPhase * Math.PI / 4) * 0.1;
          break;
      }
      
      // Clamp to 0-255
      const pixelValue = Math.floor(Math.max(0, Math.min(1, value)) * 255);
      
      data[i] = pixelValue;     // R
      data[i + 1] = pixelValue; // G
      data[i + 2] = pixelValue; // B
      data[i + 3] = 255;        // A
    }
  }
  
  return data;
}

/**
 * Generate normal map from height data
 */
function heightToNormal(heightData: Uint8Array, width: number, height: number, strength: number): Uint8Array {
  const normalData = new Uint8Array(width * height * 4);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      
      // Sample neighboring pixels
      const left = heightData[(y * width + Math.max(0, x - 1)) * 4] / 255;
      const right = heightData[(y * width + Math.min(width - 1, x + 1)) * 4] / 255;
      const up = heightData[(Math.max(0, y - 1) * width + x) * 4] / 255;
      const down = heightData[(Math.min(height - 1, y + 1) * width + x) * 4] / 255;
      
      // Calculate normal
      const dx = (right - left) * strength;
      const dy = (down - up) * strength;
      
      const normal = new THREE.Vector3(-dx, -dy, 1).normalize();
      
      // Pack to 0-255 range
      normalData[i] = Math.floor((normal.x * 0.5 + 0.5) * 255);
      normalData[i + 1] = Math.floor((normal.y * 0.5 + 0.5) * 255);
      normalData[i + 2] = Math.floor((normal.z * 0.5 + 0.5) * 255);
      normalData[i + 3] = 255;
    }
  }
  
  return normalData;
}

/**
 * Generate procedural normal map for fabric
 */
export function generateNormalMap(fabricType: string): THREE.DataTexture {
  const cacheKey = `normal_${fabricType}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }
  
  const fabric = FABRICS[fabricType] || FABRICS.cotton;
  const size = fabric.weaveScale;
  
  // Generate height map first
  const heightData = generateWeavePattern(size, size, fabric.weavePattern);
  
  // Convert to normal map
  const normalData = heightToNormal(heightData, size, size, fabric.normalScale * 2);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const texture = new THREE.DataTexture(normalData as any, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.needsUpdate = true;
  
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Generate procedural roughness map for fabric
 */
export function generateRoughnessMap(fabricType: string): THREE.DataTexture {
  const cacheKey = `roughness_${fabricType}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }
  
  const fabric = FABRICS[fabricType] || FABRICS.cotton;
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  
  const baseRoughness = fabric.roughness;
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      
      // Add subtle variation based on weave pattern
      const weaveValue = Math.sin(x * 0.5) * Math.cos(y * 0.3) * 0.05;
      const roughness = Math.max(0, Math.min(1, baseRoughness + weaveValue));
      
      const pixelValue = Math.floor(roughness * 255);
      
      data[i] = pixelValue;
      data[i + 1] = pixelValue;
      data[i + 2] = pixelValue;
      data[i + 3] = 255;
    }
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const texture = new THREE.DataTexture(data as any, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.needsUpdate = true;
  
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Generate bump map for fabric surface detail
 */
export function generateBumpMap(fabricType: string): THREE.DataTexture {
  const cacheKey = `bump_${fabricType}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }
  
  const fabric = FABRICS[fabricType] || FABRICS.cotton;
  const size = fabric.weaveScale;
  
  const data = generateWeavePattern(size, size, fabric.weavePattern);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const texture = new THREE.DataTexture(data as any, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.needsUpdate = true;
  
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Create a physically-based fabric material
 */
export function createFabricMaterial(
  fabricType: string,
  color: string | number | THREE.Color = 0xffffff,
  options: {
    useNormalMap?: boolean;
    useRoughnessMap?: boolean;
    useBumpMap?: boolean;
    doubleSided?: boolean;
  } = {}
): THREE.MeshPhysicalMaterial {
  const {
    useNormalMap = true,
    useRoughnessMap = true,
    useBumpMap = true,
    doubleSided = true
  } = options;
  
  const fabric = FABRICS[fabricType] || FABRICS.cotton;
  const colorObj = new THREE.Color(color);
  
  const material = new THREE.MeshPhysicalMaterial({
    color: colorObj,
    roughness: fabric.roughness,
    metalness: fabric.metalness,
    sheen: fabric.sheen,
    sheenColor: fabric.sheenColor,
    sheenRoughness: fabric.sheenRoughness,
    clearcoat: fabric.clearcoat,
    clearcoatRoughness: fabric.clearcoatRoughness,
    transmission: fabric.transmission,
    thickness: fabric.thickness,
    side: doubleSided ? THREE.DoubleSide : THREE.FrontSide,
    bumpScale: useBumpMap ? fabric.bumpIntensity : 0
  });
  
  // Apply procedural textures
  if (useNormalMap) {
    material.normalMap = generateNormalMap(fabricType);
    material.normalScale = new THREE.Vector2(fabric.normalScale, fabric.normalScale);
  }
  
  if (useRoughnessMap) {
    material.roughnessMap = generateRoughnessMap(fabricType);
  }
  
  if (useBumpMap) {
    material.bumpMap = generateBumpMap(fabricType);
  }
  
  return material;
}

/**
 * Create a simple fabric material (lighter weight for basic usage)
 */
export function createSimpleFabricMaterial(
  fabricType: string,
  color: string | number | THREE.Color = 0xffffff
): THREE.MeshStandardMaterial {
  const fabric = FABRICS[fabricType] || FABRICS.cotton;
  const colorObj = new THREE.Color(color);
  
  const material = new THREE.MeshStandardMaterial({
    color: colorObj,
    roughness: fabric.roughness,
    metalness: fabric.metalness,
    bumpMap: generateBumpMap(fabricType),
    bumpScale: fabric.bumpIntensity,
    side: THREE.DoubleSide
  });
  
  return material;
}

/**
 * Get fabric information for UI display
 */
export function getFabricInfo(fabricType: string): {
  name: string;
  description: string;
  properties: string[];
} | null {
  const fabric = FABRICS[fabricType];
  if (!fabric) return null;
  
  const properties: string[] = [];
  
  if (fabric.roughness > 0.9) properties.push('Matte finish');
  if (fabric.roughness < 0.7) properties.push('Smooth finish');
  if (fabric.sheen > 0.2) properties.push('Subtle sheen');
  if (fabric.metalness > 0) properties.push('Synthetic blend');
  if (fabric.clearcoat > 0) properties.push('Slight gloss');
  if (fabric.weavePattern === 'fleece') properties.push('Soft & warm');
  
  return {
    name: fabric.name,
    description: fabric.description,
    properties
  };
}

/**
 * List all available fabric types
 */
export function listFabrics(): { id: string; name: string }[] {
  return Object.entries(FABRICS).map(([id, fabric]) => ({
    id,
    name: fabric.name
  }));
}

/**
 * Clear texture cache to free memory
 */
export function clearTextureCache(): void {
  textureCache.forEach(texture => texture.dispose());
  textureCache.clear();
}
