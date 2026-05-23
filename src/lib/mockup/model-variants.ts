/**
 * Stigmator Garment Model Variants
 * 
 * Defines all supported garment types, their variants, and properties
 * for the 3D mockup generation pipeline.
 */

export type GarmentType = 'tshirt' | 'hoodie' | 'tank' | 'longsleeve' | 'sweatpants' | 'shorts';

export interface UVRegion {
  u: [number, number];
  v: [number, number];
}

export interface FabricProperties {
  roughness: number;
  metalness: number;
  sheen: number;
  sheenRoughness?: number;
  sheenColor?: string;
  clearcoat?: number;
  clearcoatRoughness?: number;
  normalScale?: number;
}

export interface PrintArea {
  maxWidth: number;  // in cm
  maxHeight: number; // in cm
  recommendedPosition: { x: number; y: number; z?: number };
  safeZone: { x: number; y: number; width: number; height: number }; // normalized 0-1
}

export interface UVRegions {
  chest?: UVRegion;
  back?: UVRegion;
  leftSleeve?: UVRegion;
  rightSleeve?: UVRegion;
  front?: UVRegion;
  label?: UVRegion;
  leftLeg?: UVRegion;
  rightLeg?: UVRegion;
}

export interface GarmentVariant {
  id: string;
  type: GarmentType;
  name: string;
  displayName: string;
  description?: string;
  defaultColor: string;
  availableColors: string[];
  fabricProperties: FabricProperties;
  uvRegions: UVRegions;
  printArea: PrintArea;
  // Technical specifications
  dimensions: {
    chestWidth: number;  // cm
    length: number;      // cm
    sleeveLength?: number; // cm
    shoulderWidth?: number; // cm
  };
  // Fit type affects how the garment drapes
  fitType: 'slim' | 'regular' | 'oversized' | 'relaxed';
  // Layer order for rendering (higher = on top)
  layerPriority: number;
  // Whether this variant supports certain features
  features: {
    supportsPockets: boolean;
    supportsHood: boolean;
    supportsZipper: boolean;
    supportsDrawstrings: boolean;
  };
  // Default camera position for this garment type
  cameraDefaults: {
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
    fov: number;
  };
  // LOD distances for this variant
  lodDistances: {
    high: number;   // Distance for high-res model (meters)
    medium: number; // Distance for medium-res model
    low: number;    // Distance for low-res model
  };
}

// ============== T-SHIRT VARIANTS ==============

const TSHIRT_VARIANTS: GarmentVariant[] = [
  {
    id: 'tshirt-unisex-001',
    type: 'tshirt',
    name: 'classic-unisex',
    displayName: 'Classic Unisex T-Shirt',
    description: 'Standard fit crew neck t-shirt, 100% cotton',
    defaultColor: '#FFFFFF',
    availableColors: ['#FFFFFF', '#000000', '#1E3A5F', '#8B0000', '#228B22', '#4B0082', '#FF6347', '#FFD700'],
    fabricProperties: {
      roughness: 0.85,
      metalness: 0.0,
      sheen: 0.1,
      sheenRoughness: 0.5,
      sheenColor: '#FFFFFF',
      clearcoat: 0.0,
      clearcoatRoughness: 0.5,
      normalScale: 0.3,
    },
    uvRegions: {
      chest: { u: [0.25, 0.75], v: [0.3, 0.7] },
      back: { u: [0.25, 0.75], v: [0.3, 0.7] },
      leftSleeve: { u: [0.75, 0.95], v: [0.4, 0.8] },
      rightSleeve: { u: [0.05, 0.25], v: [0.4, 0.8] },
      label: { u: [0.45, 0.55], v: [0.85, 0.95] },
    },
    printArea: {
      maxWidth: 35,  // 35cm wide
      maxHeight: 45, // 45cm tall
      recommendedPosition: { x: 0, y: 0.05, z: 0.12 },
      safeZone: { x: 0.2, y: 0.35, width: 0.6, height: 0.4 },
    },
    dimensions: {
      chestWidth: 52,
      length: 72,
      sleeveLength: 20,
      shoulderWidth: 45,
    },
    fitType: 'regular',
    layerPriority: 1,
    features: {
      supportsPockets: false,
      supportsHood: false,
      supportsZipper: false,
      supportsDrawstrings: false,
    },
    cameraDefaults: {
      position: { x: 0, y: 0.2, z: 1.2 },
      target: { x: 0, y: 0, z: 0 },
      fov: 35,
    },
    lodDistances: {
      high: 0,
      medium: 2.0,
      low: 5.0,
    },
  },
  {
    id: 'tshirt-premium-001',
    type: 'tshirt',
    name: 'premium-fitted',
    displayName: 'Premium Fitted T-Shirt',
    description: 'Premium combed cotton with a modern fitted cut',
    defaultColor: '#F5F5F5',
    availableColors: ['#F5F5F5', '#111111', '#2C3E50', '#7B241C', '#145A32', '#4A235A', '#E74C3C', '#F39C12'],
    fabricProperties: {
      roughness: 0.75,
      metalness: 0.02,
      sheen: 0.15,
      sheenRoughness: 0.4,
      sheenColor: '#F0F0F0',
      clearcoat: 0.05,
      clearcoatRoughness: 0.3,
      normalScale: 0.25,
    },
    uvRegions: {
      chest: { u: [0.28, 0.72], v: [0.32, 0.68] },
      back: { u: [0.28, 0.72], v: [0.32, 0.68] },
      leftSleeve: { u: [0.72, 0.92], v: [0.42, 0.78] },
      rightSleeve: { u: [0.08, 0.28], v: [0.42, 0.78] },
      label: { u: [0.45, 0.55], v: [0.85, 0.95] },
    },
    printArea: {
      maxWidth: 30,
      maxHeight: 40,
      recommendedPosition: { x: 0, y: 0.08, z: 0.11 },
      safeZone: { x: 0.25, y: 0.38, width: 0.5, height: 0.35 },
    },
    dimensions: {
      chestWidth: 48,
      length: 70,
      sleeveLength: 18,
      shoulderWidth: 42,
    },
    fitType: 'slim',
    layerPriority: 1,
    features: {
      supportsPockets: false,
      supportsHood: false,
      supportsZipper: false,
      supportsDrawstrings: false,
    },
    cameraDefaults: {
      position: { x: 0, y: 0.15, z: 1.1 },
      target: { x: 0, y: 0, z: 0 },
      fov: 35,
    },
    lodDistances: {
      high: 0,
      medium: 1.8,
      low: 4.5,
    },
  },
  {
    id: 'tshirt-oversized-001',
    type: 'tshirt',
    name: 'oversized-boxy',
    displayName: 'Oversized Boxy T-Shirt',
    description: 'Relaxed oversized fit with dropped shoulders',
    defaultColor: '#E8E8E8',
    availableColors: ['#E8E8E8', '#1A1A1A', '#2E4053', '#641E16', '#1E8449', '#5B2C6F', '#C0392B', '#D68910'],
    fabricProperties: {
      roughness: 0.9,
      metalness: 0.0,
      sheen: 0.05,
      sheenRoughness: 0.6,
      sheenColor: '#FFFFFF',
      clearcoat: 0.0,
      clearcoatRoughness: 0.5,
      normalScale: 0.35,
    },
    uvRegions: {
      chest: { u: [0.22, 0.78], v: [0.28, 0.72] },
      back: { u: [0.22, 0.78], v: [0.28, 0.72] },
      leftSleeve: { u: [0.78, 0.95], v: [0.38, 0.82] },
      rightSleeve: { u: [0.05, 0.22], v: [0.38, 0.82] },
      label: { u: [0.45, 0.55], v: [0.85, 0.95] },
    },
    printArea: {
      maxWidth: 40,
      maxHeight: 50,
      recommendedPosition: { x: 0, y: 0.02, z: 0.13 },
      safeZone: { x: 0.15, y: 0.3, width: 0.7, height: 0.45 },
    },
    dimensions: {
      chestWidth: 58,
      length: 76,
      sleeveLength: 22,
      shoulderWidth: 52,
    },
    fitType: 'oversized',
    layerPriority: 1,
    features: {
      supportsPockets: false,
      supportsHood: false,
      supportsZipper: false,
      supportsDrawstrings: false,
    },
    cameraDefaults: {
      position: { x: 0, y: 0.25, z: 1.4 },
      target: { x: 0, y: 0, z: 0 },
      fov: 38,
    },
    lodDistances: {
      high: 0,
      medium: 2.2,
      low: 5.5,
    },
  },
];

// ============== HOODIE VARIANTS ==============

const HOODIE_VARIANTS: GarmentVariant[] = [
  {
    id: 'hoodie-pullover-001',
    type: 'hoodie',
    name: 'classic-pullover',
    displayName: 'Classic Pullover Hoodie',
    description: 'Mid-weight cotton blend pullover hoodie',
    defaultColor: '#2C3E50',
    availableColors: ['#2C3E50', '#ECF0F1', '#1A1A1A', '#7F8C8D', '#8E44AD', '#27AE60', '#C0392B', '#D35400'],
    fabricProperties: {
      roughness: 0.95,
      metalness: 0.0,
      sheen: 0.08,
      sheenRoughness: 0.7,
      sheenColor: '#DDDDDD',
      clearcoat: 0.0,
      clearcoatRoughness: 0.5,
      normalScale: 0.5,
    },
    uvRegions: {
      chest: { u: [0.25, 0.75], v: [0.35, 0.75] },
      back: { u: [0.25, 0.75], v: [0.35, 0.75] },
      leftSleeve: { u: [0.75, 0.92], v: [0.3, 0.7] },
      rightSleeve: { u: [0.08, 0.25], v: [0.3, 0.7] },
      label: { u: [0.45, 0.55], v: [0.88, 0.95] },
      front: { u: [0.2, 0.8], v: [0.2, 0.9] },
    },
    printArea: {
      maxWidth: 38,
      maxHeight: 48,
      recommendedPosition: { x: 0, y: 0.08, z: 0.15 },
      safeZone: { x: 0.2, y: 0.35, width: 0.6, height: 0.4 },
    },
    dimensions: {
      chestWidth: 56,
      length: 68,
      sleeveLength: 62,
      shoulderWidth: 48,
    },
    fitType: 'regular',
    layerPriority: 2,
    features: {
      supportsPockets: true,
      supportsHood: true,
      supportsZipper: false,
      supportsDrawstrings: true,
    },
    cameraDefaults: {
      position: { x: 0, y: 0.3, z: 1.4 },
      target: { x: 0, y: 0.1, z: 0 },
      fov: 40,
    },
    lodDistances: {
      high: 0,
      medium: 2.5,
      low: 6.0,
    },
  },
  {
    id: 'hoodie-zipup-001',
    type: 'hoodie',
    name: 'zip-up-premium',
    displayName: 'Premium Zip-Up Hoodie',
    description: 'Premium zip-up hoodie with split print areas',
    defaultColor: '#34495E',
    availableColors: ['#34495E', '#BDC3C7', '#2C3E50', '#95A5A6', '#9B59B6', '#16A085', '#E74C3C', '#E67E22'],
    fabricProperties: {
      roughness: 0.9,
      metalness: 0.02,
      sheen: 0.12,
      sheenRoughness: 0.6,
      sheenColor: '#CCCCCC',
      clearcoat: 0.03,
      clearcoatRoughness: 0.4,
      normalScale: 0.4,
    },
    uvRegions: {
      chest: { u: [0.25, 0.5], v: [0.4, 0.75] },  // Left side (zipper splits)
      back: { u: [0.25, 0.75], v: [0.4, 0.75] },
      leftSleeve: { u: [0.75, 0.92], v: [0.35, 0.7] },
      rightSleeve: { u: [0.08, 0.25], v: [0.35, 0.7] },
      label: { u: [0.45, 0.55], v: [0.88, 0.95] },
      front: { u: [0.52, 0.75], v: [0.4, 0.75] }, // Right side
    },
    printArea: {
      maxWidth: 16,  // Per side due to zipper
      maxHeight: 35,
      recommendedPosition: { x: -0.12, y: 0.1, z: 0.14 },
      safeZone: { x: 0.25, y: 0.4, width: 0.25, height: 0.35 },
    },
    dimensions: {
      chestWidth: 54,
      length: 66,
      sleeveLength: 60,
      shoulderWidth: 46,
    },
    fitType: 'regular',
    layerPriority: 2,
    features: {
      supportsPockets: true,
      supportsHood: true,
      supportsZipper: true,
      supportsDrawstrings: true,
    },
    cameraDefaults: {
      position: { x: 0.3, y: 0.25, z: 1.3 },
      target: { x: 0, y: 0.1, z: 0 },
      fov: 40,
    },
    lodDistances: {
      high: 0,
      medium: 2.3,
      low: 5.8,
    },
  },
  {
    id: 'hoodie-oversized-001',
    type: 'hoodie',
    name: 'oversized-heavyweight',
    displayName: 'Oversized Heavyweight Hoodie',
    description: 'Heavyweight oversized hoodie with extra room',
    defaultColor: '#1A1A1A',
    availableColors: ['#1A1A1A', '#D5D8DC', '#212F3D', '#85929E', '#76448A', '#1E8449', '#922B21', '#CA6F1E'],
    fabricProperties: {
      roughness: 0.98,
      metalness: 0.0,
      sheen: 0.05,
      sheenRoughness: 0.8,
      sheenColor: '#BBBBBB',
      clearcoat: 0.0,
      clearcoatRoughness: 0.5,
      normalScale: 0.6,
    },
    uvRegions: {
      chest: { u: [0.22, 0.78], v: [0.32, 0.78] },
      back: { u: [0.22, 0.78], v: [0.32, 0.78] },
      leftSleeve: { u: [0.78, 0.95], v: [0.28, 0.72] },
      rightSleeve: { u: [0.05, 0.22], v: [0.28, 0.72] },
      label: { u: [0.45, 0.55], v: [0.88, 0.95] },
      front: { u: [0.18, 0.82], v: [0.18, 0.92] },
    },
    printArea: {
      maxWidth: 45,
      maxHeight: 55,
      recommendedPosition: { x: 0, y: 0.05, z: 0.17 },
      safeZone: { x: 0.15, y: 0.3, width: 0.7, height: 0.45 },
    },
    dimensions: {
      chestWidth: 64,
      length: 74,
      sleeveLength: 68,
      shoulderWidth: 56,
    },
    fitType: 'oversized',
    layerPriority: 2,
    features: {
      supportsPockets: true,
      supportsHood: true,
      supportsZipper: false,
      supportsDrawstrings: true,
    },
    cameraDefaults: {
      position: { x: 0, y: 0.35, z: 1.6 },
      target: { x: 0, y: 0.1, z: 0 },
      fov: 42,
    },
    lodDistances: {
      high: 0,
      medium: 2.8,
      low: 6.5,
    },
  },
];

// ============== TANK TOP VARIANTS ==============

const TANK_VARIANTS: GarmentVariant[] = [
  {
    id: 'tank-unisex-001',
    type: 'tank',
    name: 'classic-tank',
    displayName: 'Classic Tank Top',
    description: 'Standard fit tank top with generous armholes',
    defaultColor: '#FFFFFF',
    availableColors: ['#FFFFFF', '#000000', '#1E3A5F', '#8B0000', '#228B22', '#4B0082', '#FF6347', '#FFD700'],
    fabricProperties: {
      roughness: 0.8,
      metalness: 0.0,
      sheen: 0.12,
      sheenRoughness: 0.5,
      sheenColor: '#FFFFFF',
      clearcoat: 0.0,
      clearcoatRoughness: 0.5,
      normalScale: 0.25,
    },
    uvRegions: {
      chest: { u: [0.25, 0.75], v: [0.35, 0.75] },
      back: { u: [0.25, 0.75], v: [0.35, 0.75] },
      label: { u: [0.45, 0.55], v: [0.88, 0.95] },
    },
    printArea: {
      maxWidth: 32,
      maxHeight: 40,
      recommendedPosition: { x: 0, y: 0.08, z: 0.11 },
      safeZone: { x: 0.25, y: 0.35, width: 0.5, height: 0.4 },
    },
    dimensions: {
      chestWidth: 50,
      length: 70,
      shoulderWidth: 38,
    },
    fitType: 'regular',
    layerPriority: 1,
    features: {
      supportsPockets: false,
      supportsHood: false,
      supportsZipper: false,
      supportsDrawstrings: false,
    },
    cameraDefaults: {
      position: { x: 0, y: 0.15, z: 1.1 },
      target: { x: 0, y: 0, z: 0 },
      fov: 35,
    },
    lodDistances: {
      high: 0,
      medium: 1.8,
      low: 4.5,
    },
  },
  {
    id: 'tank-muscle-001',
    type: 'tank',
    name: 'muscle-fit',
    displayName: 'Muscle Fit Tank',
    description: 'Athletic fit with wider straps and lower cut',
    defaultColor: '#111111',
    availableColors: ['#111111', '#F5F5F5', '#2C3E50', '#7B241C', '#145A32', '#4A235A', '#E74C3C', '#F39C12'],
    fabricProperties: {
      roughness: 0.75,
      metalness: 0.01,
      sheen: 0.15,
      sheenRoughness: 0.4,
      sheenColor: '#F0F0F0',
      clearcoat: 0.02,
      clearcoatRoughness: 0.3,
      normalScale: 0.2,
    },
    uvRegions: {
      chest: { u: [0.28, 0.72], v: [0.38, 0.78] },
      back: { u: [0.28, 0.72], v: [0.38, 0.78] },
      label: { u: [0.45, 0.55], v: [0.88, 0.95] },
    },
    printArea: {
      maxWidth: 28,
      maxHeight: 38,
      recommendedPosition: { x: 0, y: 0.1, z: 0.1 },
      safeZone: { x: 0.28, y: 0.38, width: 0.44, height: 0.38 },
    },
    dimensions: {
      chestWidth: 46,
      length: 68,
      shoulderWidth: 42,
    },
    fitType: 'slim',
    layerPriority: 1,
    features: {
      supportsPockets: false,
      supportsHood: false,
      supportsZipper: false,
      supportsDrawstrings: false,
    },
    cameraDefaults: {
      position: { x: 0, y: 0.12, z: 1.0 },
      target: { x: 0, y: 0, z: 0 },
      fov: 35,
    },
    lodDistances: {
      high: 0,
      medium: 1.6,
      low: 4.0,
    },
  },
];

// ============== LONG SLEEVE VARIANTS ==============

const LONGSLEEVE_VARIANTS: GarmentVariant[] = [
  {
    id: 'longsleeve-unisex-001',
    type: 'longsleeve',
    name: 'classic-longsleeve',
    displayName: 'Classic Long Sleeve T-Shirt',
    description: 'Standard fit long sleeve t-shirt',
    defaultColor: '#FFFFFF',
    availableColors: ['#FFFFFF', '#000000', '#1E3A5F', '#8B0000', '#228B22', '#4B0082', '#FF6347', '#FFD700'],
    fabricProperties: {
      roughness: 0.85,
      metalness: 0.0,
      sheen: 0.1,
      sheenRoughness: 0.5,
      sheenColor: '#FFFFFF',
      clearcoat: 0.0,
      clearcoatRoughness: 0.5,
      normalScale: 0.3,
    },
    uvRegions: {
      chest: { u: [0.25, 0.75], v: [0.35, 0.75] },
      back: { u: [0.25, 0.75], v: [0.35, 0.75] },
      leftSleeve: { u: [0.75, 0.95], v: [0.15, 0.65] },
      rightSleeve: { u: [0.05, 0.25], v: [0.15, 0.65] },
      label: { u: [0.45, 0.55], v: [0.88, 0.95] },
    },
    printArea: {
      maxWidth: 35,
      maxHeight: 45,
      recommendedPosition: { x: 0, y: 0.08, z: 0.12 },
      safeZone: { x: 0.2, y: 0.35, width: 0.6, height: 0.4 },
    },
    dimensions: {
      chestWidth: 52,
      length: 72,
      sleeveLength: 60,
      shoulderWidth: 45,
    },
    fitType: 'regular',
    layerPriority: 1,
    features: {
      supportsPockets: false,
      supportsHood: false,
      supportsZipper: false,
      supportsDrawstrings: false,
    },
    cameraDefaults: {
      position: { x: 0, y: 0.2, z: 1.3 },
      target: { x: 0, y: 0, z: 0 },
      fov: 38,
    },
    lodDistances: {
      high: 0,
      medium: 2.2,
      low: 5.5,
    },
  },
  {
    id: 'longsleeve-raglan-001',
    type: 'longsleeve',
    name: 'raglan-baseball',
    displayName: 'Raglan Baseball Tee',
    description: 'Classic raglan style with contrasting sleeves',
    defaultColor: '#FFFFFF',
    availableColors: ['#FFFFFF', '#F5F5F5', '#1A1A1A', '#2C3E50', '#7B241C', '#145A32', '#4A235A', '#E74C3C'],
    fabricProperties: {
      roughness: 0.82,
      metalness: 0.0,
      sheen: 0.12,
      sheenRoughness: 0.48,
      sheenColor: '#FFFFFF',
      clearcoat: 0.0,
      clearcoatRoughness: 0.5,
      normalScale: 0.28,
    },
    uvRegions: {
      chest: { u: [0.25, 0.75], v: [0.35, 0.75] },
      back: { u: [0.25, 0.75], v: [0.35, 0.75] },
      leftSleeve: { u: [0.75, 0.95], v: [0.12, 0.62] },
      rightSleeve: { u: [0.05, 0.25], v: [0.12, 0.62] },
      label: { u: [0.45, 0.55], v: [0.88, 0.95] },
    },
    printArea: {
      maxWidth: 32,
      maxHeight: 42,
      recommendedPosition: { x: 0, y: 0.08, z: 0.11 },
      safeZone: { x: 0.22, y: 0.35, width: 0.56, height: 0.38 },
    },
    dimensions: {
      chestWidth: 50,
      length: 70,
      sleeveLength: 58,
      shoulderWidth: 44,
    },
    fitType: 'regular',
    layerPriority: 1,
    features: {
      supportsPockets: false,
      supportsHood: false,
      supportsZipper: false,
      supportsDrawstrings: false,
    },
    cameraDefaults: {
      position: { x: 0, y: 0.18, z: 1.25 },
      target: { x: 0, y: 0, z: 0 },
      fov: 38,
    },
    lodDistances: {
      high: 0,
      medium: 2.0,
      low: 5.0,
    },
  },
];

// ============== SWEATPANTS VARIANTS ==============

const SWEATPANTS_VARIANTS: GarmentVariant[] = [
  {
    id: 'sweatpants-unisex-001',
    type: 'sweatpants',
    name: 'classic-joggers',
    displayName: 'Classic Joggers',
    description: 'Mid-weight cotton blend joggers with elastic cuffs',
    defaultColor: '#2C3E50',
    availableColors: ['#2C3E50', '#ECF0F1', '#1A1A1A', '#7F8C8D', '#8E44AD', '#27AE60', '#C0392B', '#D35400'],
    fabricProperties: {
      roughness: 0.92,
      metalness: 0.0,
      sheen: 0.08,
      sheenRoughness: 0.65,
      sheenColor: '#DDDDDD',
      clearcoat: 0.0,
      clearcoatRoughness: 0.5,
      normalScale: 0.45,
    },
    uvRegions: {
      leftLeg: { u: [0.1, 0.45], v: [0.1, 0.9] },
      rightLeg: { u: [0.55, 0.9], v: [0.1, 0.9] },
      label: { u: [0.45, 0.55], v: [0.92, 0.98] },
    },
    printArea: {
      maxWidth: 18,  // Per leg
      maxHeight: 30,
      recommendedPosition: { x: 0.15, y: -0.15, z: 0.1 },
      safeZone: { x: 0.12, y: 0.3, width: 0.35, height: 0.4 },
    },
    dimensions: {
      chestWidth: 40,  // Hip width for pants
      length: 100,     // Inseam + rise
    },
    fitType: 'regular',
    layerPriority: 0,
    features: {
      supportsPockets: true,
      supportsHood: false,
      supportsZipper: false,
      supportsDrawstrings: true,
    },
    cameraDefaults: {
      position: { x: 0.5, y: -0.2, z: 1.2 },
      target: { x: 0, y: -0.3, z: 0 },
      fov: 45,
    },
    lodDistances: {
      high: 0,
      medium: 2.5,
      low: 6.0,
    },
  },
  {
    id: 'sweatpants-wideleg-001',
    type: 'sweatpants',
    name: 'wide-leg-comfort',
    displayName: 'Wide Leg Comfort Pants',
    description: 'Relaxed wide leg sweatpants with open cuffs',
    defaultColor: '#34495E',
    availableColors: ['#34495E', '#BDC3C7', '#2C3E50', '#95A5A6', '#9B59B6', '#16A085', '#E74C3C', '#E67E22'],
    fabricProperties: {
      roughness: 0.95,
      metalness: 0.0,
      sheen: 0.06,
      sheenRoughness: 0.7,
      sheenColor: '#CCCCCC',
      clearcoat: 0.0,
      clearcoatRoughness: 0.5,
      normalScale: 0.5,
    },
    uvRegions: {
      leftLeg: { u: [0.08, 0.47], v: [0.1, 0.9] },
      rightLeg: { u: [0.53, 0.92], v: [0.1, 0.9] },
      label: { u: [0.45, 0.55], v: [0.92, 0.98] },
    },
    printArea: {
      maxWidth: 22,
      maxHeight: 35,
      recommendedPosition: { x: 0.18, y: -0.12, z: 0.12 },
      safeZone: { x: 0.1, y: 0.25, width: 0.38, height: 0.45 },
    },
    dimensions: {
      chestWidth: 44,
      length: 102,
    },
    fitType: 'relaxed',
    layerPriority: 0,
    features: {
      supportsPockets: true,
      supportsHood: false,
      supportsZipper: false,
      supportsDrawstrings: true,
    },
    cameraDefaults: {
      position: { x: 0.6, y: -0.15, z: 1.4 },
      target: { x: 0, y: -0.3, z: 0 },
      fov: 48,
    },
    lodDistances: {
      high: 0,
      medium: 2.8,
      low: 6.5,
    },
  },
];

// ============== SHORTS VARIANTS ==============

const SHORTS_VARIANTS: GarmentVariant[] = [
  {
    id: 'shorts-unisex-001',
    type: 'shorts',
    name: 'classic-shorts',
    displayName: 'Classic Athletic Shorts',
    description: 'Mid-thigh length athletic shorts',
    defaultColor: '#2C3E50',
    availableColors: ['#2C3E50', '#ECF0F1', '#1A1A1A', '#7F8C8D', '#8E44AD', '#27AE60', '#C0392B', '#D35400'],
    fabricProperties: {
      roughness: 0.85,
      metalness: 0.0,
      sheen: 0.1,
      sheenRoughness: 0.55,
      sheenColor: '#DDDDDD',
      clearcoat: 0.0,
      clearcoatRoughness: 0.5,
      normalScale: 0.35,
    },
    uvRegions: {
      leftLeg: { u: [0.1, 0.45], v: [0.2, 0.85] },
      rightLeg: { u: [0.55, 0.9], v: [0.2, 0.85] },
      label: { u: [0.45, 0.55], v: [0.88, 0.95] },
    },
    printArea: {
      maxWidth: 16,
      maxHeight: 20,
      recommendedPosition: { x: 0.12, y: -0.05, z: 0.08 },
      safeZone: { x: 0.12, y: 0.35, width: 0.35, height: 0.35 },
    },
    dimensions: {
      chestWidth: 42,
      length: 45,
    },
    fitType: 'regular',
    layerPriority: 0,
    features: {
      supportsPockets: true,
      supportsHood: false,
      supportsZipper: false,
      supportsDrawstrings: true,
    },
    cameraDefaults: {
      position: { x: 0.4, y: -0.1, z: 1.0 },
      target: { x: 0, y: -0.15, z: 0 },
      fov: 42,
    },
    lodDistances: {
      high: 0,
      medium: 1.8,
      low: 4.5,
    },
  },
  {
    id: 'shorts-cargo-001',
    type: 'shorts',
    name: 'cargo-shorts',
    displayName: 'Utility Cargo Shorts',
    description: 'Knee length cargo shorts with multiple pockets',
    defaultColor: '#34495E',
    availableColors: ['#34495E', '#BDC3C7', '#2C3E50', '#95A5A6', '#9B59B6', '#16A085', '#E74C3C', '#E67E22'],
    fabricProperties: {
      roughness: 0.9,
      metalness: 0.01,
      sheen: 0.08,
      sheenRoughness: 0.6,
      sheenColor: '#CCCCCC',
      clearcoat: 0.0,
      clearcoatRoughness: 0.5,
      normalScale: 0.4,
    },
    uvRegions: {
      leftLeg: { u: [0.08, 0.47], v: [0.15, 0.88] },
      rightLeg: { u: [0.53, 0.92], v: [0.15, 0.88] },
      label: { u: [0.45, 0.55], v: [0.88, 0.95] },
    },
    printArea: {
      maxWidth: 18,
      maxHeight: 25,
      recommendedPosition: { x: 0.15, y: -0.08, z: 0.1 },
      safeZone: { x: 0.1, y: 0.3, width: 0.38, height: 0.4 },
    },
    dimensions: {
      chestWidth: 44,
      length: 50,
    },
    fitType: 'relaxed',
    layerPriority: 0,
    features: {
      supportsPockets: true,
      supportsHood: false,
      supportsZipper: true,
      supportsDrawstrings: false,
    },
    cameraDefaults: {
      position: { x: 0.5, y: -0.12, z: 1.2 },
      target: { x: 0, y: -0.2, z: 0 },
      fov: 45,
    },
    lodDistances: {
      high: 0,
      medium: 2.0,
      low: 5.0,
    },
  },
];

// ============== EXPORT ALL VARIANTS ==============

export const GARMENT_VARIANTS: Record<GarmentType, GarmentVariant[]> = {
  tshirt: TSHIRT_VARIANTS,
  hoodie: HOODIE_VARIANTS,
  tank: TANK_VARIANTS,
  longsleeve: LONGSLEEVE_VARIANTS,
  sweatpants: SWEATPANTS_VARIANTS,
  shorts: SHORTS_VARIANTS,
};

// ============== UTILITY FUNCTIONS ==============

/**
 * Get all variants for a specific garment type
 */
export function getVariantsByType(type: GarmentType): GarmentVariant[] {
  return GARMENT_VARIANTS[type] ?? [];
}

/**
 * Get a specific variant by ID
 */
export function getVariantById(id: string): GarmentVariant | undefined {
  for (const variants of Object.values(GARMENT_VARIANTS)) {
    const variant = variants.find((v) => v.id === id);
    if (variant) return variant;
  }
  return undefined;
}

/**
 * Get a specific variant by type and name
 */
export function getVariantByName(type: GarmentType, name: string): GarmentVariant | undefined {
  return GARMENT_VARIANTS[type]?.find((v) => v.name === name);
}

/**
 * Get default variant for a garment type
 */
export function getDefaultVariant(type: GarmentType): GarmentVariant | undefined {
  return GARMENT_VARIANTS[type]?.[0];
}

/**
 * Check if a garment type supports a specific print area
 */
export function supportsPrintArea(type: GarmentType, area: keyof UVRegions): boolean {
  const variant = getDefaultVariant(type);
  if (!variant) return false;
  return area in variant.uvRegions;
}

/**
 * Get all available garment types
 */
export function getAllGarmentTypes(): GarmentType[] {
  return Object.keys(GARMENT_VARIANTS) as GarmentType[];
}

/**
 * Get total count of all variants
 */
export function getTotalVariantCount(): number {
  return Object.values(GARMENT_VARIANTS).reduce((acc, variants) => acc + variants.length, 0);
}

export default GARMENT_VARIANTS;
