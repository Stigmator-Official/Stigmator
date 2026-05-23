import * as THREE from 'three';

// Track objects for memory management
const trackedObjects = new Map<string, THREE.Object3D>();

// Three.js object disposal
export function disposeGeometry(geometry: THREE.BufferGeometry): void {
  if (!geometry) return;

  // Dispose of the geometry itself
  geometry.dispose();

  // Dispose of any associated attributes
  Object.keys(geometry.attributes).forEach(key => {
    const attribute = geometry.attributes[key] as { dispose?: () => void } | undefined;
    if (attribute && typeof attribute.dispose === 'function') {
      attribute.dispose();
    }
  });

  // Dispose of index if present
  if (geometry.index) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (geometry.index as any).dispose();
  }
}

export function disposeMaterial(material: THREE.Material): void {
  if (!material) return;

  // Dispose textures
  const textureProperties = [
    'map',
    'lightMap',
    'aoMap',
    'emissiveMap',
    'bumpMap',
    'normalMap',
    'displacementMap',
    'roughnessMap',
    'metalnessMap',
    'alphaMap',
    'envMap',
    'specularMap',
    'gradientMap',
    'clearcoatMap',
    'clearcoatRoughnessMap',
    'clearcoatNormalMap',
    'sheenColorMap',
    'sheenRoughnessMap',
    'transmissionMap',
    'thicknessMap',
  ] as const;

  textureProperties.forEach(prop => {
    const texture = (material as any)[prop];
    if (texture) {
      disposeTexture(texture);
    }
  });

  // Dispose of the material itself
  material.dispose();
}

export function disposeTexture(texture: THREE.Texture): void {
  if (!texture) return;

  // Dispose of the texture
  texture.dispose();

  // Dispose of the image data if it's a custom source
  if (texture.image && texture.image instanceof HTMLCanvasElement) {
    // Canvas elements don't need disposal, but we can clear them
    const ctx = texture.image.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, texture.image.width, texture.image.height);
    }
  }
}

export function disposeObject(object: THREE.Object3D): void {
  if (!object) return;

  // Dispose geometry
  if ((object as THREE.Mesh).geometry) {
    disposeGeometry((object as THREE.Mesh).geometry as THREE.BufferGeometry);
  }

  // Dispose material(s)
  const material = (object as THREE.Mesh).material;
  if (material) {
    if (Array.isArray(material)) {
      material.forEach(m => disposeMaterial(m));
    } else {
      disposeMaterial(material);
    }
  }

  // Recursively dispose children
  while (object.children.length > 0) {
    const child = object.children[0];
    disposeObject(child);
    object.remove(child);
  }

  // Remove from tracking
  trackedObjects.forEach((trackedObj, label) => {
    if (trackedObj === object) {
      trackedObjects.delete(label);
    }
  });
}

// Scene cleanup
export function cleanupScene(scene: THREE.Scene): void {
  if (!scene) return;

  // Dispose all objects in the scene
  const objectsToRemove: THREE.Object3D[] = [];
  
  scene.traverse(object => {
    objectsToRemove.push(object);
  });

  objectsToRemove.forEach(object => {
    disposeObject(object);
  });

  // Clear the scene
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }

  // Dispose scene background and environment
  if (scene.background) {
    if (scene.background instanceof THREE.Texture) {
      disposeTexture(scene.background);
    }
  }
  
  if (scene.environment) {
    disposeTexture(scene.environment);
  }
}

// Memory tracking
export function trackObject(object: THREE.Object3D, label: string): void {
  if (trackedObjects.has(label)) {
    console.warn(`Object with label "${label}" is already being tracked. Overwriting.`);
  }
  trackedObjects.set(label, object);
}

export function untrackObject(label: string): void {
  trackedObjects.delete(label);
}

export function getTrackedObjects(): Map<string, THREE.Object3D> {
  return new Map(trackedObjects);
}

// Force garbage collection hint (if available)
export function requestGC(): void {
  if (typeof globalThis !== 'undefined' && (globalThis as any).gc) {
    try {
      (globalThis as any).gc();
      console.log('Garbage collection requested');
    } catch (e) {
      console.warn('Failed to request garbage collection:', e);
    }
  } else {
    // Create memory pressure to encourage GC
    const pressure: number[] = [];
    try {
      for (let i = 0; i < 1000000; i++) {
        pressure.push(i);
      }
    } catch (e) {
      // Ignore
    }
    // Release the pressure immediately
    pressure.length = 0;
  }
}

// Texture memory estimation
export function estimateTextureMemory(texture: THREE.Texture): number {
  if (!texture || !texture.image) return 0;

  const image = texture.image;
  let width = 0;
  let height = 0;

  if (image instanceof HTMLImageElement) {
    width = image.naturalWidth || image.width;
    height = image.naturalHeight || image.height;
  } else if (image instanceof HTMLCanvasElement) {
    width = image.width;
    height = image.height;
  } else if (image instanceof HTMLVideoElement) {
    width = image.videoWidth || image.width;
    height = image.videoHeight || image.height;
  } else if (image instanceof ImageBitmap) {
    width = image.width;
    height = image.height;
  } else if (typeof image === 'object' && 'width' in image && 'height' in image) {
    width = (image as { width: number }).width;
    height = (image as { height: number }).height;
  }

  if (width === 0 || height === 0) return 0;

  // Calculate mipmaps
  let mipmaps = 1;
  let w = width;
  let h = height;
  while (w > 1 || h > 1) {
    w = Math.max(1, Math.floor(w / 2));
    h = Math.max(1, Math.floor(h / 2));
    mipmaps++;
  }

  // Determine bytes per pixel based on format
  let bytesPerPixel = 4; // Default RGBA
  
  switch (texture.format) {
    case THREE.AlphaFormat:
      bytesPerPixel = 1;
      break;
    case THREE.LuminanceFormat:
    case THREE.DepthFormat:
      bytesPerPixel = 1;
      break;
    case THREE.LuminanceAlphaFormat:
      bytesPerPixel = 2;
      break;
    // RGB formats (3 bytes per pixel) - note: RGBFormat was removed in r152
    case THREE.RGBAFormat:
    case THREE.RGBAIntegerFormat:
      bytesPerPixel = 4;
      break;
    case THREE.DepthStencilFormat:
      bytesPerPixel = 4;
      break;
  }

  // Account for compressed textures
  if (texture instanceof THREE.CompressedTexture) {
    // Simplified estimation for compressed textures (typically 4bpp or 8bpp)
    bytesPerPixel = 0.5;
  }

  // Calculate total memory
  let totalPixels = 0;
  w = width;
  h = height;
  for (let i = 0; i < mipmaps; i++) {
    totalPixels += w * h;
    w = Math.max(1, Math.floor(w / 2));
    h = Math.max(1, Math.floor(h / 2));
  }

  // Convert to MB
  const bytes = totalPixels * bytesPerPixel;
  const megabytes = bytes / (1024 * 1024);

  return Math.round(megabytes * 100) / 100;
}

// Get total Three.js memory usage
export function getRendererMemory(renderer: THREE.WebGLRenderer): {
  geometries: number;
  textures: number;
  totalMB: number;
} {
  if (!renderer) {
    return { geometries: 0, textures: 0, totalMB: 0 };
  }

  const info = renderer.info;
  const geometries = info.memory.geometries;
  const textures = info.memory.textures;

  // Estimate memory usage
  // This is a rough estimation - actual memory usage depends on the GPU and browser
  const avgGeometrySize = 0.5; // ~0.5 MB per geometry on average
  const avgTextureSize = 2.0;  // ~2 MB per texture on average
  
  const totalMB = Math.round((geometries * avgGeometrySize + textures * avgTextureSize) * 100) / 100;

  return {
    geometries,
    textures,
    totalMB,
  };
}

// Memory limit checker
export function checkMemoryLimit(renderer: THREE.WebGLRenderer, limitMB: number = 512): boolean {
  const memory = getRendererMemory(renderer);
  return memory.totalMB < limitMB;
}

// Dispose all materials from a scene
export function disposeAllMaterials(scene: THREE.Scene): void {
  const materials = new Set<THREE.Material>();

  scene.traverse(object => {
    const mesh = object as THREE.Mesh;
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => materials.add(m));
      } else {
        materials.add(mesh.material);
      }
    }
  });

  materials.forEach(material => {
    disposeMaterial(material);
  });
}

// Dispose all geometries from a scene
export function disposeAllGeometries(scene: THREE.Scene): void {
  const geometries = new Set<THREE.BufferGeometry>();

  scene.traverse(object => {
    const mesh = object as THREE.Mesh;
    if (mesh.geometry) {
      geometries.add(mesh.geometry as THREE.BufferGeometry);
    }
  });

  geometries.forEach(geometry => {
    disposeGeometry(geometry);
  });
}

// Clear all textures from a renderer
export function clearRendererTextures(renderer: THREE.WebGLRenderer): void {
  // Note: Three.js doesn't expose a direct way to clear all textures
  // This is a best-effort approach
  
  // Force texture upload to clear pending textures
  renderer.initTexture(new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1));
  
  // Dispose any render targets
  renderer.getRenderTarget();
}
