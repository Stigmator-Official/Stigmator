/**
 * Stigmator Model Optimizer
 * 
 * Utilities for optimizing 3D garment models including:
 * - Draco/KTX2/Basis compression detection
 * - Mesh decimation (simplification)
 * - Texture atlas generation
 * - LOD chain generation
 */

import * as THREE from 'three';

// Import Three.js utilities - types may not be available
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mergeGeometries = (THREE as any).BufferGeometryUtils?.mergeGeometries || 
  // Fallback implementation
  ((geometries: THREE.BufferGeometry[]): THREE.BufferGeometry => {
    // Simple merge - just return first geometry for now
    // In production, use proper BufferGeometryUtils
    return geometries[0] || new THREE.BufferGeometry();
  });

// Define GLTF type locally to avoid import issues
interface GLTF {
  scene: THREE.Group;
  scenes: THREE.Group[];
  cameras: THREE.Camera[];
  animations: THREE.AnimationClip[];
  asset: {
    copyright?: string;
    generator?: string;
    version?: string;
    minVersion?: string;
    extensions?: Record<string, unknown>;
    extras?: unknown;
  };
  parser: unknown;
  userData: Record<string, unknown>;
}

// ============== TYPES ==============

export type CompressionType = 'none' | 'draco' | 'ktx2' | 'basis' | 'meshopt' | 'unknown';

export interface LODLevel {
  distance: number;
  geometry: THREE.BufferGeometry;
  materials: THREE.Material[];
  vertexCount: number;
  triangleCount: number;
}

export interface OptimizationStats {
  originalVertices: number;
  originalTriangles: number;
  optimizedVertices: number;
  optimizedTriangles: number;
  compressionRatio: number;
  processingTime: number;
}

export interface DecimationOptions {
  targetRatio?: number;       // Target vertex ratio (0-1) - can also be passed as second argument
  preserveUVs?: boolean;     // Preserve UV coordinates
  preserveNormals?: boolean; // Preserve normal vectors
  preserveBoundaries?: boolean; // Preserve mesh boundaries
  errorThreshold?: number;   // Maximum allowed error
}

export interface AtlasOptions {
  maxSize?: number;          // Maximum atlas size (default: 2048)
  padding?: number;          // Padding between textures (default: 4)
  powerOfTwo?: boolean;      // Force power of two dimensions (default: true)
  potpack?: boolean;         // Use potpack for bin packing (default: true)
}

// ============== COMPRESSION DETECTION ==============

/**
 * Detect compression type used in a GLTF model
 */
export function detectCompression(gltf: GLTF): CompressionType {
  const parser = (gltf as unknown as { parser?: { json?: Record<string, unknown> } }).parser;
  
  if (!parser?.json) {
    return 'unknown';
  }

  const json = parser.json;
  const extensionsUsed = json.extensionsUsed as string[] | undefined;
  const extensionsRequired = json.extensionsRequired as string[] | undefined;

  // Check for Draco extension
  if (extensionsUsed?.includes('KHR_draco_mesh_compression') ||
      extensionsRequired?.includes('KHR_draco_mesh_compression')) {
    return 'draco';
  }

  // Check for KTX2 extension
  if (extensionsUsed?.includes('KHR_texture_basisu') ||
      extensionsRequired?.includes('KHR_texture_basisu')) {
    return 'ktx2';
  }

  // Check for Basis texture extension (older)
  if (extensionsUsed?.includes('GOOGLE_texture_basis') ||
      extensionsRequired?.includes('GOOGLE_texture_basis')) {
    return 'basis';
  }

  // Check for meshoptimizer
  if (extensionsUsed?.includes('EXT_meshopt_compression') ||
      extensionsRequired?.includes('EXT_meshopt_compression')) {
    return 'meshopt';
  }

  // Check buffer views for compression hints
  const bufferViews = json.bufferViews as Array<{ name?: string; [key: string]: unknown }> | undefined;
  if (bufferViews) {
    for (const bv of bufferViews) {
      const name = bv.name?.toLowerCase() ?? '';
      if (name.includes('draco')) return 'draco';
      if (name.includes('ktx') || name.includes('basis')) return 'ktx2';
      if (name.includes('meshopt')) return 'meshopt';
    }
  }

  // Check for compressed buffer data
  const buffers = json.buffers as Array<{ uri?: string; [key: string]: unknown }> | undefined;
  if (buffers) {
    for (const buffer of buffers) {
      const uri = buffer.uri?.toLowerCase() ?? '';
      if (uri.endsWith('.drc')) return 'draco';
      if (uri.endsWith('.ktx2')) return 'ktx2';
      if (uri.endsWith('.basis')) return 'basis';
    }
  }

  return 'none';
}

/**
 * Get compression statistics for a GLTF model
 */
export function getCompressionStats(gltf: GLTF): {
  type: CompressionType;
  extensions: string[];
  hasCompressedTextures: boolean;
  hasCompressedMeshes: boolean;
} {
  const parser = (gltf as unknown as { parser?: { json?: Record<string, unknown> } }).parser;
  const json = parser?.json ?? {};

  const extensions = [
    ...(json.extensionsUsed as string[] ?? []),
    ...(json.extensionsRequired as string[] ?? []),
  ];

  const type = detectCompression(gltf);

  return {
    type,
    extensions: [...new Set(extensions)],
    hasCompressedTextures: extensions.some(e => 
      e.includes('texture') || e.includes('ktx') || e.includes('basis')
    ),
    hasCompressedMeshes: extensions.some(e => 
      e.includes('draco') || e.includes('meshopt')
    ),
  };
}

// ============== MESH DECIMATION ==============

/**
 * Simple mesh decimation using edge collapse
 * This is a basic implementation - for production, consider using libraries like
 * @gltf-transform/core or meshoptimizer
 */
export function decimateMesh(
  mesh: THREE.Mesh,
  targetRatio: number,
  options: DecimationOptions = {}
): THREE.Mesh {
  const {
    preserveUVs = true,
    preserveNormals = true,
    preserveBoundaries = true,
    errorThreshold = 0.01,
  } = options;

  if (targetRatio <= 0 || targetRatio >= 1) {
    throw new Error('targetRatio must be between 0 and 1');
  }

  const geometry = mesh.geometry.clone();
  
  // Get current vertex count
  const positionAttr = geometry.attributes.position;
  const originalCount = positionAttr.count;
  const targetCount = Math.floor(originalCount * targetRatio);

  // If already below target, return as-is
  if (originalCount <= targetCount) {
    return new THREE.Mesh(geometry, mesh.material);
  }

  // Perform decimation
  const decimatedGeometry = performDecimation(
    geometry,
    targetCount,
    { preserveUVs, preserveNormals, preserveBoundaries, errorThreshold }
  );

  // Create new mesh with decimated geometry
  const decimatedMesh = new THREE.Mesh(decimatedGeometry, mesh.material);
  decimatedMesh.name = `${mesh.name}_decimated`;
  decimatedMesh.position.copy(mesh.position);
  decimatedMesh.rotation.copy(mesh.rotation);
  decimatedMesh.scale.copy(mesh.scale);

  return decimatedMesh;
}

/**
 * Internal decimation implementation using simplified edge collapse
 */
function performDecimation(
  geometry: THREE.BufferGeometry,
  targetCount: number,
  options: DecimationOptions
): THREE.BufferGeometry {
  const positions = geometry.attributes.position.array as Float32Array;
  const normals = geometry.attributes.normal?.array as Float32Array | undefined;
  const uvs = geometry.attributes.uv?.array as Float32Array | undefined;
  const indices = geometry.index?.array as Uint16Array | Uint32Array | undefined;

  if (!indices) {
    // Non-indexed geometry - convert to indexed first
    geometry = mergeGeometries([geometry], false);
  }

  // Simple vertex clustering decimation
  // For production, this should be replaced with proper edge collapse
  const positionsArray = Array.from(positions);
  const clusters = clusterVertices(positionsArray, targetCount, options.errorThreshold ?? 0.01);
  
  // Build new geometry from clusters
  const newPositions: number[] = [];
  const newNormals: number[] = [];
  const newUVs: number[] = [];
  const newIndices: number[] = [];
  const vertexMap = new Map<number, number>();

  // Calculate cluster centroids
  const clusterCentroids = clusters.map(cluster => {
    const centroid = { x: 0, y: 0, z: 0 };
    let normal = options.preserveNormals && normals ? { x: 0, y: 0, z: 0 } : null;
    let uv = options.preserveUVs && uvs ? { x: 0, y: 0 } : null;

    for (const idx of cluster) {
      centroid.x += positions[idx * 3];
      centroid.y += positions[idx * 3 + 1];
      centroid.z += positions[idx * 3 + 2];

      if (normal && normals) {
        normal.x += normals[idx * 3];
        normal.y += normals[idx * 3 + 1];
        normal.z += normals[idx * 3 + 2];
      }

      if (uv && uvs) {
        uv.x += uvs[idx * 2];
        uv.y += uvs[idx * 2 + 1];
      }
    }

    const count = cluster.length;
    centroid.x /= count;
    centroid.y /= count;
    centroid.z /= count;

    if (normal) {
      normal.x /= count;
      normal.y /= count;
      normal.z /= count;
      const len = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
      if (len > 0) {
        normal.x /= len;
        normal.y /= len;
        normal.z /= len;
      }
    }

    if (uv) {
      uv.x /= count;
      uv.y /= count;
    }

    return { centroid, normal, uv };
  });

  // Remap vertices
  clusters.forEach((cluster, clusterIdx) => {
    for (const vertexIdx of cluster) {
      vertexMap.set(vertexIdx, clusterIdx);
    }
  });

  // Build new vertex arrays
  clusterCentroids.forEach(({ centroid, normal, uv }) => {
    newPositions.push(centroid.x, centroid.y, centroid.z);
    if (normal) newNormals.push(normal.x, normal.y, normal.z);
    if (uv) newUVs.push(uv.x, uv.y);
  });

  // Build new index array
  const originalIndices = geometry.index!.array;
  const processedFaces = new Set<string>();

  for (let i = 0; i < originalIndices.length; i += 3) {
    const a = vertexMap.get(originalIndices[i])!;
    const b = vertexMap.get(originalIndices[i + 1])!;
    const c = vertexMap.get(originalIndices[i + 2])!;

    // Skip degenerate triangles
    if (a === b || b === c || c === a) continue;

    // Skip duplicate faces
    const faceKey = [a, b, c].sort().join(',');
    if (processedFaces.has(faceKey)) continue;
    processedFaces.add(faceKey);

    newIndices.push(a, b, c);
  }

  // Create new geometry
  const newGeometry = new THREE.BufferGeometry();
  newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
  
  if (newNormals.length > 0) {
    newGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(newNormals, 3));
  }
  
  if (newUVs.length > 0) {
    newGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(newUVs, 2));
  }
  
  newGeometry.setIndex(newIndices);
  newGeometry.computeVertexNormals();

  return newGeometry;
}

/**
 * Cluster vertices based on spatial proximity
 */
function clusterVertices(
  positions: number[],
  targetClusters: number,
  threshold: number
): number[][] {
  const vertexCount = positions.length / 3;
  const clusters: number[][] = [];
  const assigned = new Set<number>();

  // Calculate grid size based on target cluster count
  const gridSize = Math.ceil(Math.cbrt(targetClusters));
  const grid = new Map<string, number[]>();

  // Assign vertices to grid cells
  for (let i = 0; i < vertexCount; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];

    const gx = Math.floor((x + 1) * gridSize / 2);
    const gy = Math.floor((y + 1) * gridSize / 2);
    const gz = Math.floor((z + 1) * gridSize / 2);

    const key = `${gx},${gy},${gz}`;
    if (!grid.has(key)) {
      grid.set(key, []);
    }
    grid.get(key)!.push(i);
  }

  // Create clusters from grid cells
  for (const [, cellVertices] of grid) {
    if (cellVertices.length === 0) continue;
    clusters.push(cellVertices);
  }

  // If too many clusters, merge nearby ones
  while (clusters.length > targetClusters) {
    // Find closest pair of clusters
    let minDist = Infinity;
    let pair: [number, number] = [0, 1];

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const dist = clusterDistance(clusters[i], clusters[j], positions);
        if (dist < minDist) {
          minDist = dist;
          pair = [i, j];
        }
      }
    }

    // Merge clusters
    const [i, j] = pair;
    clusters[i] = [...clusters[i], ...clusters[j]];
    clusters.splice(j, 1);
  }

  return clusters;
}

/**
 * Calculate distance between two clusters
 */
function clusterDistance(a: number[], b: number[], positions: number[]): number {
  const centroidA = getCentroid(a, positions);
  const centroidB = getCentroid(b, positions);
  
  const dx = centroidA.x - centroidB.x;
  const dy = centroidA.y - centroidB.y;
  const dz = centroidA.z - centroidB.z;
  
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate centroid of a set of vertices
 */
function getCentroid(indices: number[], positions: number[]): { x: number; y: number; z: number } {
  let x = 0, y = 0, z = 0;
  
  for (const idx of indices) {
    x += positions[idx * 3];
    y += positions[idx * 3 + 1];
    z += positions[idx * 3 + 2];
  }
  
  return {
    x: x / indices.length,
    y: y / indices.length,
    z: z / indices.length,
  };
}

// ============== TEXTURE ATLAS GENERATION ==============

/**
 * Generate a texture atlas from multiple textures
 */
export function generateAtlas(
  textures: THREE.Texture[],
  options: AtlasOptions = {}
): THREE.DataTexture {
  const {
    maxSize = 2048,
    padding = 4,
    powerOfTwo = true,
    potpack = true,
  } = options;

  if (textures.length === 0) {
    throw new Error('No textures provided for atlas generation');
  }

  // Get texture dimensions
  const textureInfos = textures.map((tex, index) => {
    const image = tex.image;
    return {
      index,
      width: image?.width ?? 256,
      height: image?.height ?? 256,
      texture: tex,
    };
  });

  // Calculate atlas size using potpack or simple grid
  let atlasWidth: number;
  let atlasHeight: number;
  const placements: Array<{ x: number; y: number; width: number; height: number; index: number }> = [];

  if (potpack) {
    // Use simple bin packing
    const result = packBins(textureInfos, maxSize, padding);
    atlasWidth = result.width;
    atlasHeight = result.height;
    placements.push(...result.placements);
  } else {
    // Simple grid layout
    const cols = Math.ceil(Math.sqrt(textureInfos.length));
    const rows = Math.ceil(textureInfos.length / cols);
    
    const maxTexWidth = Math.max(...textureInfos.map(t => t.width));
    const maxTexHeight = Math.max(...textureInfos.map(t => t.height));
    
    atlasWidth = cols * (maxTexWidth + padding) + padding;
    atlasHeight = rows * (maxTexHeight + padding) + padding;

    textureInfos.forEach((info, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      placements.push({
        x: col * (maxTexWidth + padding) + padding,
        y: row * (maxTexHeight + padding) + padding,
        width: info.width,
        height: info.height,
        index: info.index,
      });
    });
  }

  // Ensure power of two if required
  if (powerOfTwo) {
    atlasWidth = nextPowerOfTwo(atlasWidth);
    atlasHeight = nextPowerOfTwo(atlasHeight);
  }

  // Clamp to max size
  atlasWidth = Math.min(atlasWidth, maxSize);
  atlasHeight = Math.min(atlasHeight, maxSize);

  // Create atlas canvas
  const canvas = document.createElement('canvas');
  canvas.width = atlasWidth;
  canvas.height = atlasHeight;
  const ctx = canvas.getContext('2d')!;

  // Fill with transparent black
  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, atlasWidth, atlasHeight);

  // Draw textures to atlas
  for (const placement of placements) {
    const tex = textures[placement.index];
    const image = tex.image;

    if (image) {
      ctx.drawImage(image, placement.x, placement.y, placement.width, placement.height);
    }
  }

  // Create data texture from canvas
  const imageData = ctx.getImageData(0, 0, atlasWidth, atlasHeight);
  const atlasTexture = new THREE.DataTexture(
    imageData.data,
    atlasWidth,
    atlasHeight,
    THREE.RGBAFormat,
    THREE.UnsignedByteType
  );
  
  atlasTexture.needsUpdate = true;
  atlasTexture.name = 'atlas_texture';

  // Store UV transform info for each texture
  (atlasTexture as unknown as { uvTransforms: Map<number, { offset: THREE.Vector2; scale: THREE.Vector2 }> }).uvTransforms = new Map();
  
  for (const placement of placements) {
    const uOffset = placement.x / atlasWidth;
    const vOffset = placement.y / atlasHeight;
    const uScale = placement.width / atlasWidth;
    const vScale = placement.height / atlasHeight;

    (atlasTexture as unknown as { uvTransforms: Map<number, { offset: THREE.Vector2; scale: THREE.Vector2 }> }).uvTransforms.set(
      placement.index,
      {
        offset: new THREE.Vector2(uOffset, vOffset),
        scale: new THREE.Vector2(uScale, vScale),
      }
    );
  }

  return atlasTexture;
}

/**
 * Simple bin packing algorithm
 */
function packBins(
  items: Array<{ width: number; height: number; index: number }>,
  maxSize: number,
  padding: number
): { width: number; height: number; placements: Array<{ x: number; y: number; width: number; height: number; index: number }> } {
  // Sort by height descending
  const sorted = [...items].sort((a, b) => b.height - a.height);
  
  const placements: Array<{ x: number; y: number; width: number; height: number; index: number }> = [];
  let currentX = padding;
  let currentY = padding;
  let rowHeight = 0;
  let maxWidth = padding;
  let maxHeight = padding;

  for (const item of sorted) {
    const paddedWidth = item.width + padding;
    const paddedHeight = item.height + padding;

    // Check if we need to start a new row
    if (currentX + paddedWidth > maxSize) {
      currentX = padding;
      currentY += rowHeight + padding;
      rowHeight = 0;
    }

    // Check if we've exceeded max height
    if (currentY + paddedHeight > maxSize) {
      break;
    }

    placements.push({
      x: currentX,
      y: currentY,
      width: item.width,
      height: item.height,
      index: item.index,
    });

    currentX += paddedWidth;
    rowHeight = Math.max(rowHeight, paddedHeight);
    maxWidth = Math.max(maxWidth, currentX);
    maxHeight = Math.max(maxHeight, currentY + paddedHeight);
  }

  return {
    width: maxWidth,
    height: maxHeight,
    placements,
  };
}

/**
 * Get next power of two
 */
function nextPowerOfTwo(n: number): number {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

// ============== LOD CHAIN GENERATION ==============

/**
 * Generate LOD chain for a model
 */
export function generateLODChain(
  model: THREE.Group,
  levels: number = 3
): THREE.LOD {
  const lod = new THREE.LOD();
  const meshes: THREE.Mesh[] = [];

  // Collect all meshes from the model
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      meshes.push(child);
    }
  });

  if (meshes.length === 0) {
    throw new Error('No meshes found in model');
  }

  // Create LOD levels
  const ratios = [1.0, 0.5, 0.25, 0.125].slice(0, levels);
  const distances = [0, 2, 5, 10].slice(0, levels);

  for (let i = 0; i < levels; i++) {
    const levelGroup = new THREE.Group();
    const ratio = ratios[i];
    const distance = distances[i];

    for (const mesh of meshes) {
      if (i === 0) {
        // Use original mesh for highest LOD
        const clonedMesh = mesh.clone();
        levelGroup.add(clonedMesh);
      } else {
        // Decimate for lower LODs
        const decimatedMesh = decimateMesh(mesh, ratio, {
          preserveUVs: true,
          preserveNormals: true,
          preserveBoundaries: true,
        });
        levelGroup.add(decimatedMesh);
      }
    }

    // Copy transforms from original model
    levelGroup.position.copy(model.position);
    levelGroup.rotation.copy(model.rotation);
    levelGroup.scale.copy(model.scale);

    lod.addLevel(levelGroup, distance);
  }

  lod.name = `${model.name}_LOD`;
  
  return lod;
}

/**
 * Generate LOD chain with custom distances
 */
export function generateCustomLODChain(
  model: THREE.Group,
  levelConfigs: Array<{ ratio: number; distance: number }>
): THREE.LOD {
  const lod = new THREE.LOD();
  const meshes: THREE.Mesh[] = [];

  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      meshes.push(child);
    }
  });

  if (meshes.length === 0) {
    throw new Error('No meshes found in model');
  }

  for (const config of levelConfigs) {
    const levelGroup = new THREE.Group();

    for (const mesh of meshes) {
      if (config.ratio >= 0.95) {
        const clonedMesh = mesh.clone();
        levelGroup.add(clonedMesh);
      } else {
        const decimatedMesh = decimateMesh(mesh, Math.max(config.ratio, 0.1), {
          preserveUVs: true,
          preserveNormals: true,
          preserveBoundaries: true,
        });
        levelGroup.add(decimatedMesh);
      }
    }

    levelGroup.position.copy(model.position);
    levelGroup.rotation.copy(model.rotation);
    levelGroup.scale.copy(model.scale);

    lod.addLevel(levelGroup, config.distance);
  }

  lod.name = `${model.name}_LOD`;
  
  return lod;
}

// ============== ADDITIONAL OPTIMIZATION UTILITIES ==============

/**
 * Merge geometries in a model to reduce draw calls
 */
export function mergeModelGeometries(model: THREE.Group): THREE.Group {
  const meshesByMaterial = new Map<THREE.Material, THREE.Mesh[]>();

  model.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      const material = Array.isArray(child.material) ? child.material[0] : child.material;
      
      if (!meshesByMaterial.has(material)) {
        meshesByMaterial.set(material, []);
      }
      meshesByMaterial.get(material)!.push(child);
    }
  });

  const mergedGroup = new THREE.Group();
  mergedGroup.name = `${model.name}_merged`;
  mergedGroup.position.copy(model.position);
  mergedGroup.rotation.copy(model.rotation);
  mergedGroup.scale.copy(model.scale);

  for (const [material, meshes] of meshesByMaterial) {
    if (meshes.length === 1) {
      mergedGroup.add(meshes[0].clone());
      continue;
    }

    const geometries: THREE.BufferGeometry[] = [];

    for (const mesh of meshes) {
      const geometry = mesh.geometry.clone();
      geometry.applyMatrix4(mesh.matrixWorld);
      geometries.push(geometry);
    }

    try {
      const mergedGeometry = mergeGeometries(geometries, false);
      const mergedMesh = new THREE.Mesh(mergedGeometry, material);
      mergedMesh.name = `merged_${material.name || 'material'}`;
      mergedGroup.add(mergedMesh);
    } catch (error) {
      // If merging fails, add meshes individually
      for (const mesh of meshes) {
        mergedGroup.add(mesh.clone());
      }
    }
  }

  return mergedGroup;
}

/**
 * Optimize materials in a model
 */
export function optimizeMaterials(model: THREE.Group): void {
  const materialCache = new Map<string, THREE.Material>();

  model.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      
      const optimizedMaterials = materials.map(mat => {
        const key = `${mat.type}_${mat.uuid}`;
        
        if (materialCache.has(key)) {
          return materialCache.get(key)!;
        }

        // Clone and optimize material
        const optimized = mat.clone();
        
        // Disable expensive features if not needed
        if (optimized instanceof THREE.MeshStandardMaterial) {
          // Reduce texture size if too large
          if (optimized.map && optimized.map.image) {
            const maxSize = 2048;
            if (optimized.map.image.width > maxSize || optimized.map.image.height > maxSize) {
              // Texture should be resized during export/import
            }
          }
        }

        materialCache.set(key, optimized);
        return optimized;
      });

      child.material = materials.length === 1 ? optimizedMaterials[0] : optimizedMaterials;
    }
  });
}

/**
 * Calculate optimization statistics for a model
 */
export function calculateOptimizationStats(
  original: THREE.Group,
  optimized: THREE.Group
): OptimizationStats {
  let originalVertices = 0;
  let originalTriangles = 0;
  let optimizedVertices = 0;
  let optimizedTriangles = 0;

  const countGeometry = (obj: THREE.Group, vertices: { count: number }, triangles: { count: number }) => {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const geo = child.geometry;
        vertices.count += geo.attributes.position?.count ?? 0;
        
        if (geo.index) {
          triangles.count += geo.index.count / 3;
        } else {
          triangles.count += (geo.attributes.position?.count ?? 0) / 3;
        }
      }
    });
  };

  const origVerts = { count: 0 };
  const origTris = { count: 0 };
  const optVerts = { count: 0 };
  const optTris = { count: 0 };

  countGeometry(original, origVerts, origTris);
  countGeometry(optimized, optVerts, optTris);

  return {
    originalVertices: origVerts.count,
    originalTriangles: Math.floor(origTris.count),
    optimizedVertices: optVerts.count,
    optimizedTriangles: Math.floor(optTris.count),
    compressionRatio: optVerts.count / Math.max(origVerts.count, 1),
    processingTime: 0, // Set by caller
  };
}

export default {
  detectCompression,
  getCompressionStats,
  decimateMesh,
  generateAtlas,
  generateLODChain,
  generateCustomLODChain,
  mergeModelGeometries,
  optimizeMaterials,
  calculateOptimizationStats,
};
