# Stigmator Export Workflow System

This directory contains the export workflow components for Stigmator's 3D mockup generator.

## Components

### 1. `export-panel.tsx`
Main export configuration panel with preset selection and custom settings.

```tsx
import { ExportPanel, EXPORT_PRESETS } from '@/components/mockup/export-panel'

<ExportPanel
  scene={threeScene}
  camera={threeCamera}
  renderer={threeRenderer}
  currentConfig={{
    garmentType: 'tshirt',
    designName: 'My Design',
    variant: 'classic'
  }}
  onExportStart={() => console.log('Export started')}
  onExportComplete={(results) => console.log('Exported:', results)}
  onExportError={(error) => console.error('Export failed:', error)}
/>
```

**Features:**
- 5 built-in presets (Shop Listing, Social Square, Social Story, Print Ready, Custom)
- Custom size input with aspect ratio lock
- Format selector (PNG, JPG, WebP)
- Quality slider (1-100)
- Multiple camera angles (front, back, 3/4 left, 3/4 right, side left, side right)
- Watermark toggle
- File size estimation
- Progress bar during export

### 2. `download-button.tsx`
Primary download action button with states.

```tsx
import { DownloadButton, QuickDownloadButton, BatchDownloadButton } from '@/components/mockup/download-button'

// Basic usage with async generation
<DownloadButton
  onGenerate={async () => {
    // Generate and return data URL
    return canvas.toDataURL('image/png')
  }}
  fileName="my-mockup.png"
/>

// Quick download when URL is already available
<QuickDownloadButton
  url={blobUrl}
  fileName="mockup.png"
  revokeUrl={true}  // Clean up blob URL after download
/>

// Batch download multiple files
<BatchDownloadButton
  items={[
    { url: url1, filename: 'mockup-1.png' },
    { url: url2, filename: 'mockup-2.png' }
  ]}
  downloadDelay={100}  // ms between downloads
/>
```

**Features:**
- Loading state with spinner
- Success animation
- Error state with retry
- Auto-filename generation: `{garment-type}_{design-name}_{timestamp}.{ext}`

### 3. `batch-export.tsx`
Batch export multiple mockups with queue management.

```tsx
import { BatchExport } from '@/components/mockup/batch-export'

<BatchExport
  mockups={[
    {
      id: '1',
      name: 'T-Shirt Design A',
      config: { garmentType: 'tshirt', designName: 'Design A' },
      thumbnail: '/thumbs/design-a.jpg'
    }
  ]}
  preset={EXPORT_PRESETS[0]}
  scene={threeScene}
  camera={threeCamera}
  renderer={threeRenderer}
  angles={['front', 'back']}
  onComplete={(results) => console.log('Batch complete:', results)}
  onProgress={(completed, total) => console.log(`${completed}/${total}`)}
/>
```

**Features:**
- Select multiple mockups from preset browser
- Queue display with progress per item
- Pause/resume functionality
- Download all as ZIP
- Skip on error, continue with rest
- Estimated time remaining

### 4. `export-formats.ts` (lib)
Format-specific export logic and utilities.

```tsx
import {
  FORMATS,
  PLATFORM_EXPORTS,
  CAMERA_ANGLES,
  exportForPlatform,
  exportFromMultipleAngles,
  estimateFileSize,
  validateExportOptions,
  generateFilename
} from '@/lib/mockup/export-formats'

// Export for specific platform
const blob = await exportForPlatform(scene, camera, renderer, 'instagram')

// Export from multiple angles
const results = await exportFromMultipleAngles(
  scene,
  camera,
  renderer,
  { width: 1200, height: 1200, format: 'webp', quality: 85, angles: ['front', 'back'] }
)

// Estimate file size
const estimatedBytes = estimateFileSize(1200, 1200, 'webp', 85)
```

**Features:**
- Format configuration (PNG, JPG, WebP)
- Platform-specific presets (Stigmator, Instagram, Facebook, etc.)
- Camera angle configurations
- File size estimation
- Export validation
- Watermark support

## Export Presets

| Preset | Dimensions | Format | Quality | Use Case |
|--------|------------|--------|---------|----------|
| Shop Listing | 1200×1200 | WebP | 85% | Stigmator product pages |
| Social Square | 1080×1080 | JPG | 90% | Instagram, Twitter, Facebook |
| Social Story | 1080×1920 | JPG | 90% | Stories, TikTok, Reels |
| Print Ready | 3000×3000 | PNG | 100% | Print catalogs, press kits |
| Custom | Configurable | Any | Any | Full control |

## Platform Exports

```tsx
const platforms = {
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
```

## Camera Angles

| ID | Name | Description |
|----|------|-------------|
| front | Front | Direct front view |
| back | Back | Direct back view |
| three-quarter-left | 3/4 Left | Angled from front-left |
| three-quarter-right | 3/4 Right | Angled from front-right |
| side-left | Side Left | Direct left side view |
| side-right | Side Right | Direct right side view |

## Dependencies

```bash
npm install jszip @radix-ui/react-accordion @radix-ui/react-checkbox @radix-ui/react-label @radix-ui/react-separator @radix-ui/react-tabs three
```

## Usage Example

```tsx
'use client'

import { useRef } from 'react'
import * as THREE from 'three'
import { ExportPanel, BatchExport } from '@/components/mockup'
import { EXPORT_PRESETS } from '@/components/mockup/export-panel'

export default function MockupExporter() {
  const sceneRef = useRef<THREE.Scene>()
  const cameraRef = useRef<THREE.Camera>()
  const rendererRef = useRef<THREE.WebGLRenderer>()

  return (
    <div className="grid grid-cols-2 gap-6">
      <ExportPanel
        scene={sceneRef.current!}
        camera={cameraRef.current!}
        renderer={rendererRef.current!}
        currentConfig={{
          garmentType: 'tshirt',
          designName: 'Summer Collection'
        }}
      />
      
      <BatchExport
        mockups={mockups}
        preset={EXPORT_PRESETS[0]}
        scene={sceneRef.current!}
        camera={cameraRef.current!}
        renderer={rendererRef.current!}
      />
    </div>
  )
}
```

## Styling

All components use the Stigmator dark theme with:
- Primary accent: `#4ade80` (green)
- Background: `#0a0f0a` (dark)
- Card background: `#0f1a0f` (slightly lighter)
- Border: `#1a2e1a` (subtle green)
- Text: `#e8f5e8` (light green-tinted white)
- Muted text: `#7a9a7a`, `#a8c5a8`
