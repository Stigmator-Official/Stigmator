# Mockup Generator Components

## GarmentLoader

The `GarmentLoader` component handles loading, optimizing, and preparing 3D garment models for the mockup generator.

### Features

- **GLTF/GLB Support**: Load industry-standard 3D model formats
- **Automatic Optimization**: Scaling, centering, and shadow configuration
- **Material Management**: Extract and clone fabric materials for texture application
- **Caching**: Avoid redundant model loading
- **Error Handling**: Retry mechanism with user feedback
- **Placeholder Mode**: Development-friendly mock geometry

### Props

```typescript
interface GarmentLoaderProps {
  modelUrl: string;                          // URL to GLTF/GLB file or "placeholder"
  onLoad: (model: THREE.Group, fabricMaterial?: THREE.Material) => void;
  onProgress?: (progress: number) => void;   // Loading progress 0-100
  onError?: (error: Error) => void;          // Error callback
  className?: string;                        // Additional CSS classes
}
```

### Usage

#### Basic Usage with Three.js Scene

```tsx
import { useState, useRef } from "react";
import * as THREE from "three";
import { GarmentLoader } from "@/components/mockup/garment-loader";

function MockupCanvas() {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [fabricMaterial, setFabricMaterial] = useState<THREE.Material | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Three.js scene here (renderer, camera, lights)
  // ...

  const handleLoad = (loadedModel: THREE.Group, material?: THREE.Material) => {
    setModel(loadedModel);
    setFabricMaterial(material || null);
    
    // Add to your scene
    scene.add(loadedModel);
  };

  return (
    <div ref={containerRef} className="w-full h-[600px]">
      <GarmentLoader
        modelUrl="/models/tshirt.glb"
        onLoad={handleLoad}
        onProgress={(p) => console.log(`Loading: ${p.toFixed(0)}%`)}
        onError={(e) => console.error("Failed to load:", e)}
      />
      {/* Render your Three.js canvas here */}
    </div>
  );
}
```

#### Using Placeholder for Development

```tsx
// Use "placeholder" or empty string for development
<GarmentLoader
  modelUrl="placeholder"
  onLoad={handleLoad}
/>
```

#### With Texture Application

```tsx
import { useFabricMaterial } from "@/components/mockup/garment-loader";

function MockupDesigner() {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const { applyTexture, setColor } = useFabricMaterial(model);

  const handleDesignUpload = (textureUrl: string) => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(textureUrl, (texture) => {
      applyTexture(texture);
    });
  };

  const handleColorChange = (color: string) => {
    setColor(color);
  };

  return (
    <div>
      <GarmentLoader
        modelUrl="/models/hoodie.glb"
        onLoad={(m) => setModel(m)}
      />
      {/* Design controls */}
    </div>
  );
}
```

### Utilities

#### Preload Models

```tsx
import { preloadModel } from "@/components/mockup/garment-loader";

// Preload for faster subsequent navigation
await preloadModel("/models/tshirt.glb");
```

#### Clear Cache

```tsx
import { clearModelCache } from "@/components/mockup/garment-loader";

// Clear all cached models (e.g., on logout)
clearModelCache();
```

### Model Optimization Details

1. **Centering**: Model is centered at origin (0,0,0) with bottom at y=0
2. **Scaling**: Normalized to maximum dimension of 2 units
3. **Shadows**: All meshes have `castShadow` and `receiveShadow` enabled
4. **Material Cloning**: Fabric material is cloned to allow independent modifications

### Fabric Mesh Detection

The loader attempts to find the main fabric mesh in this priority:

1. Mesh named "Fabric", "Material", or "Main" (case-insensitive)
2. Largest mesh by surface area (fallback)

### Error Handling

The component displays:
- Loading spinner with progress bar during load
- Error message with retry button on failure
- Automatically retries from cache if available
