/**
 * STIGMATOR GARMENT CATALOG v2.0
 * Comprehensive garment type database with specifications
 */

export type GarmentCategory = 
  | "tops" 
  | "bottoms" 
  | "outerwear" 
  | "headwear" 
  | "accessories" 
  | "footwear"
  | "bags";

export type PrintMethod = "dtg" | "dtf" | "sublimation" | "screen" | "embroidery" | "woven_label";
export type FabricWeight = "light" | "mid" | "heavy";
export type FitType = "slim" | "regular" | "oversized" | "relaxed" | "fitted";

export interface GarmentType {
  id: string;
  name: string;
  category: GarmentCategory;
  description: string;
  
  // Base economics
  baseCost: number;
  suggestedRetail: number;
  minRetail: number;
  
  // Print specs
  printMethods: PrintMethod[];
  maxPrintArea: {
    front?: { width: number; height: number } | null;
    back?: { width: number; height: number } | null;
    leftSleeve?: { width: number; height: number } | null;
    rightSleeve?: { width: number; height: number } | null;
    chest?: { width: number; height: number } | null;
    label?: { width: number; height: number } | null;
  };
  
  // Garment specs
  fabricWeight: FabricWeight;
  fit: FitType;
  material: string;
  
  // Size availability
  availableSizes: string[];
  sizeChart: Record<string, { chest?: number; waist?: number; length?: number; hips?: number }>;
  
  // Colors available
  baseColors: Array<{
    name: string;
    hex: string;
    sku_suffix: string;
    image_url?: string;
  }>;
  
  // Base garment image (neutral color, front view) for compositing
  baseImageUrl?: string;
  
  // Production
  productionTimeDays: number;
  moq: number;
  
  // Placement zones for designs (relative coordinates 0-100)
  placementZones: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    supportsMultiple?: boolean;
    maxDesigns?: number;
  }>;
  
  // Tags for filtering
  tags: string[];
  
  // Popularity/season
  trending: boolean;
  seasonal?: "all" | "summer" | "winter" | "spring" | "fall";
}

/**
 * Get a base garment image URL for compositing.
 * Returns a high-quality garment photo from Unsplash or a fallback.
 */
export function getGarmentBaseImage(garment: GarmentType, colorHex?: string): string {
  // If the garment has a specific base image, use it
  if (garment.baseImageUrl) {
    return garment.baseImageUrl;
  }
  
  // Otherwise, return category-appropriate Unsplash images
  const categoryImages: Record<string, string> = {
    tops: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1024&h=1024&fit=crop&q=80",
    bottoms: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=1024&h=1024&fit=crop&q=80",
    outerwear: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1024&h=1024&fit=crop&q=80",
    headwear: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=1024&h=1024&fit=crop&q=80",
    bags: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1024&h=1024&fit=crop&q=80",
    accessories: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=1024&h=1024&fit=crop&q=80",
    footwear: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1024&h=1024&fit=crop&q=80",
  };
  
  return categoryImages[garment.category] || categoryImages.tops;
}

// Comprehensive garment catalog
export const GARMENT_CATALOG: GarmentType[] = [
  // ==================== TOPS - T-SHIRTS ====================
  {
    id: "tee-classic",
    name: "Classic Cotton Tee",
    category: "tops",
    description: "Premium 100% cotton t-shirt with a structured fit. The go-to canvas for bold tattoo art.",
    baseCost: 12.50,
    suggestedRetail: 55.00,
    minRetail: 35.00,
    printMethods: ["dtg", "screen"],
    maxPrintArea: {
      front: { width: 14, height: 16 },
      back: { width: 14, height: 16 },
      leftSleeve: { width: 3, height: 3 },
      rightSleeve: { width: 3, height: 3 },
      label: { width: 2, height: 1 },
    },
    fabricWeight: "mid",
    fit: "regular",
    material: "100% Ring-Spun Cotton",
    availableSizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    sizeChart: {
      XS: { chest: 34, length: 27 },
      S: { chest: 36, length: 28 },
      M: { chest: 40, length: 29 },
      L: { chest: 44, length: 30 },
      XL: { chest: 48, length: 31 },
      "2XL": { chest: 52, length: 32 },
      "3XL": { chest: 56, length: 33 },
    },
    baseColors: [
      { name: "Midnight Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Pure White", hex: "#fafafa", sku_suffix: "WHT" },
      { name: "Heather Grey", hex: "#6b7280", sku_suffix: "HGY" },
      { name: "Olive Drab", hex: "#4a5d23", sku_suffix: "OLV" },
      { name: "Rust", hex: "#8b4513", sku_suffix: "RST" },
      { name: "Sand", hex: "#c2b280", sku_suffix: "SND" },
      { name: "Navy", hex: "#1e3a5f", sku_suffix: "NVY" },
      { name: "Burgundy", hex: "#722f37", sku_suffix: "BRG" },
    ],
    baseImageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1024&h=1024&fit=crop&q=80",
    productionTimeDays: 3,
    moq: 1,
    placementZones: [
      { id: "front_center", name: "Front Center", x: 50, y: 45, width: 40, height: 35, maxDesigns: 1 },
      { id: "front_left_chest", name: "Left Chest", x: 35, y: 32, width: 15, height: 12, maxDesigns: 1 },
      { id: "back_center", name: "Back Center", x: 50, y: 45, width: 40, height: 40, maxDesigns: 1 },
      { id: "back_upper", name: "Back Upper", x: 50, y: 25, width: 30, height: 15, maxDesigns: 1 },
      { id: "left_sleeve", name: "Left Sleeve", x: 18, y: 25, width: 10, height: 10, maxDesigns: 1 },
      { id: "right_sleeve", name: "Right Sleeve", x: 82, y: 25, width: 10, height: 10, maxDesigns: 1 },
      { id: "neck_label", name: "Neck Label", x: 50, y: 12, width: 12, height: 4, maxDesigns: 1 },
    ],
    tags: ["essential", "bestseller", "tattoo", "streetwear"],
    trending: true,
    seasonal: "all",
  },
  {
    id: "tee-oversized",
    name: "Oversized Drop-Shoulder Tee",
    category: "tops",
    description: "Relaxed, oversized fit with dropped shoulders. Perfect for large-scale back pieces and all-over prints.",
    baseCost: 15.00,
    suggestedRetail: 65.00,
    minRetail: 45.00,
    printMethods: ["dtg", "sublimation"],
    maxPrintArea: {
      front: { width: 16, height: 20 },
      back: { width: 16, height: 20 },
      leftSleeve: { width: 4, height: 4 },
      rightSleeve: { width: 4, height: 4 },
    },
    fabricWeight: "mid",
    fit: "oversized",
    material: "100% Organic Cotton",
    availableSizes: ["S", "M", "L", "XL", "2XL"],
    sizeChart: {
      S: { chest: 44, length: 28 },
      M: { chest: 48, length: 29 },
      L: { chest: 52, length: 30 },
      XL: { chest: 56, length: 31 },
      "2XL": { chest: 60, length: 32 },
    },
    baseColors: [
      { name: "Midnight Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Vintage White", hex: "#f5f5dc", sku_suffix: "VWH" },
      { name: "Washed Grey", hex: "#808080", sku_suffix: "WGY" },
      { name: "Dusty Rose", hex: "#dcae96", sku_suffix: "DRS" },
      { name: "Sage Green", hex: "#9dc183", sku_suffix: "SGE" },
    ],
    baseImageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1024&h=1024&fit=crop&q=80",
    productionTimeDays: 4,
    moq: 1,
    placementZones: [
      { id: "front_large", name: "Front Large", x: 50, y: 45, width: 50, height: 45, maxDesigns: 2 },
      { id: "front_left_chest", name: "Left Chest", x: 32, y: 30, width: 12, height: 10, maxDesigns: 1 },
      { id: "back_full", name: "Back Full", x: 50, y: 45, width: 50, height: 50, maxDesigns: 2 },
      { id: "left_sleeve", name: "Left Sleeve", x: 15, y: 22, width: 12, height: 12, maxDesigns: 1 },
      { id: "right_sleeve", name: "Right Sleeve", x: 85, y: 22, width: 12, height: 12, maxDesigns: 1 },
    ],
    tags: ["oversized", "streetwear", "urban", "trending"],
    trending: true,
    seasonal: "all",
  },
  {
    id: "tee-crop",
    name: "Cropped Baby Tee",
    category: "tops",
    description: "Fitted cropped tee with a vintage feel. Perfect for belly tattoos and summer drops.",
    baseCost: 11.00,
    suggestedRetail: 45.00,
    minRetail: 32.00,
    printMethods: ["dtg", "screen"],
    maxPrintArea: {
      front: { width: 12, height: 12 },
      back: { width: 12, height: 12 },
    },
    fabricWeight: "light",
    fit: "fitted",
    material: "95% Cotton, 5% Spandex",
    availableSizes: ["XS", "S", "M", "L"],
    sizeChart: {
      XS: { chest: 30, length: 16 },
      S: { chest: 32, length: 17 },
      M: { chest: 34, length: 18 },
      L: { chest: 36, length: 19 },
    },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "White", hex: "#fafafa", sku_suffix: "WHT" },
      { name: "Baby Pink", hex: "#f4c2c2", sku_suffix: "PNK" },
      { name: "Lavender", hex: "#e6e6fa", sku_suffix: "LAV" },
    ],
    baseImageUrl: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1024&h=1024&fit=crop&q=80",
    productionTimeDays: 3,
    moq: 1,
    placementZones: [
      { id: "front_center", name: "Front Center", x: 50, y: 42, width: 35, height: 30, maxDesigns: 1 },
      { id: "front_small", name: "Front Mini", x: 50, y: 32, width: 15, height: 12, maxDesigns: 1 },
      { id: "back_center", name: "Back Center", x: 50, y: 42, width: 35, height: 35, maxDesigns: 1 },
    ],
    tags: ["womens", "cropped", "summer", "fitted"],
    trending: true,
    seasonal: "summer",
  },
  {
    id: "tee-longline",
    name: "Longline Scoop Tee",
    category: "tops",
    description: "Extended length with a curved hem. Streetwear staple for layering and bold statement pieces.",
    baseCost: 14.00,
    suggestedRetail: 58.00,
    minRetail: 40.00,
    printMethods: ["dtg", "screen"],
    maxPrintArea: {
      front: { width: 14, height: 18 },
      back: { width: 14, height: 20 },
    },
    fabricWeight: "mid",
    fit: "relaxed",
    material: "100% Cotton",
    availableSizes: ["S", "M", "L", "XL", "2XL"],
    sizeChart: {
      S: { chest: 38, length: 32 },
      M: { chest: 42, length: 33 },
      L: { chest: 46, length: 34 },
      XL: { chest: 50, length: 35 },
      "2XL": { chest: 54, length: 36 },
    },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "White", hex: "#fafafa", sku_suffix: "WHT" },
      { name: "Charcoal", hex: "#36454f", sku_suffix: "CHR" },
    ],
    productionTimeDays: 3,
    moq: 1,
    placementZones: [
      { id: "front_center", name: "Front Center", x: 50, y: 45, width: 40, height: 40, maxDesigns: 1 },
      { id: "back_full", name: "Back Full", x: 50, y: 48, width: 40, height: 50, maxDesigns: 2 },
    ],
    tags: ["longline", "streetwear", "layering"],
    trending: false,
    seasonal: "all",
  },
  {
    id: "tee-vintage",
    name: "Vintage Washed Tee",
    category: "tops",
    description: "Pre-washed and garment-dyed for that worn-in vintage feel. Perfect for retro tattoo art.",
    baseCost: 16.50,
    suggestedRetail: 68.00,
    minRetail: 48.00,
    printMethods: ["dtg", "screen"],
    maxPrintArea: {
      front: { width: 14, height: 16 },
      back: { width: 14, height: 16 },
    },
    fabricWeight: "mid",
    fit: "relaxed",
    material: "100% Ringspun Cotton, Garment Dyed",
    availableSizes: ["S", "M", "L", "XL", "2XL"],
    sizeChart: {
      S: { chest: 38, length: 28 },
      M: { chest: 42, length: 29 },
      L: { chest: 46, length: 30 },
      XL: { chest: 50, length: 31 },
      "2XL": { chest: 54, length: 32 },
    },
    baseColors: [
      { name: "Vintage Black", hex: "#1a1a1a", sku_suffix: "VBLK" },
      { name: "Faded Navy", hex: "#3d5a80", sku_suffix: "FNV" },
      { name: "Dusty Olive", hex: "#556b2f", sku_suffix: "DOL" },
      { name: "Washed Brick", hex: "#a0522d", sku_suffix: "WBR" },
      { name: "Faded Mustard", hex: "#d4a017", sku_suffix: "FMU" },
    ],
    productionTimeDays: 5,
    moq: 1,
    placementZones: [
      { id: "front_center", name: "Front Center", x: 50, y: 45, width: 40, height: 35, maxDesigns: 1 },
      { id: "back_center", name: "Back Center", x: 50, y: 45, width: 40, height: 40, maxDesigns: 1 },
    ],
    tags: ["vintage", "washed", "retro", "tattoo"],
    trending: true,
    seasonal: "all",
  },

  // ==================== TOPS - TANKS ====================
  {
    id: "tank-muscle",
    name: "Classic Muscle Tank",
    category: "tops",
    description: "Sleeveless with dropped armholes. Show off your ink while keeping cool.",
    baseCost: 11.50,
    suggestedRetail: 48.00,
    minRetail: 35.00,
    printMethods: ["dtg", "screen"],
    maxPrintArea: {
      front: { width: 14, height: 18 },
      back: { width: 14, height: 18 },
    },
    fabricWeight: "light",
    fit: "regular",
    material: "100% Cotton",
    availableSizes: ["S", "M", "L", "XL", "2XL"],
    sizeChart: {
      S: { chest: 38, length: 27 },
      M: { chest: 42, length: 28 },
      L: { chest: 46, length: 29 },
      XL: { chest: 50, length: 30 },
      "2XL": { chest: 54, length: 31 },
    },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "White", hex: "#fafafa", sku_suffix: "WHT" },
      { name: "Grey", hex: "#6b7280", sku_suffix: "GRY" },
      { name: "Military Green", hex: "#4b5320", sku_suffix: "MGN" },
    ],
    productionTimeDays: 3,
    moq: 1,
    placementZones: [
      { id: "front_center", name: "Front Center", x: 50, y: 45, width: 40, height: 40, maxDesigns: 1 },
      { id: "back_center", name: "Back Center", x: 50, y: 45, width: 40, height: 45, maxDesigns: 1 },
    ],
    tags: ["tank", "summer", "muscle", "fitness"],
    trending: false,
    seasonal: "summer",
  },
  {
    id: "tank-racerback",
    name: "Racerback Tank",
    category: "tops",
    description: "Athletic racerback cut. Perfect for gym wear and showing back tattoos.",
    baseCost: 12.00,
    suggestedRetail: 45.00,
    minRetail: 32.00,
    printMethods: ["dtg", "sublimation"],
    maxPrintArea: {
      front: { width: 12, height: 14 },
      back: { width: 14, height: 16 },
    },
    fabricWeight: "light",
    fit: "regular",
    material: "92% Polyester, 8% Spandex",
    availableSizes: ["XS", "S", "M", "L", "XL"],
    sizeChart: {
      XS: { chest: 30, length: 24 },
      S: { chest: 32, length: 25 },
      M: { chest: 34, length: 26 },
      L: { chest: 36, length: 27 },
      XL: { chest: 38, length: 28 },
    },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Neon Pink", hex: "#ff6b9d", sku_suffix: "NPK" },
      { name: "Electric Blue", hex: "#00d9ff", sku_suffix: "EBL" },
      { name: "Lime", hex: "#32cd32", sku_suffix: "LIM" },
    ],
    productionTimeDays: 3,
    moq: 1,
    placementZones: [
      { id: "front_center", name: "Front Center", x: 50, y: 45, width: 35, height: 35, maxDesigns: 1 },
      { id: "back_center", name: "Back Center", x: 50, y: 45, width: 40, height: 40, maxDesigns: 1 },
    ],
    tags: ["womens", "tank", "athletic", "fitness", "summer"],
    trending: true,
    seasonal: "summer",
  },
  {
    id: "tank-stringer",
    name: "Y-Back Stringer",
    category: "tops",
    description: "Ultra-low cut stringer tank. Maximum exposure for chest and back pieces.",
    baseCost: 10.50,
    suggestedRetail: 42.00,
    minRetail: 30.00,
    printMethods: ["dtg", "screen"],
    maxPrintArea: {
      front: { width: 10, height: 8 },
      back: { width: 10, height: 12 },
    },
    fabricWeight: "light",
    fit: "relaxed",
    material: "100% Cotton",
    availableSizes: ["S", "M", "L", "XL"],
    sizeChart: {
      S: { chest: 40, length: 26 },
      M: { chest: 44, length: 27 },
      L: { chest: 48, length: 28 },
      XL: { chest: 52, length: 29 },
    },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Grey", hex: "#6b7280", sku_suffix: "GRY" },
      { name: "Red", hex: "#8b0000", sku_suffix: "RED" },
    ],
    productionTimeDays: 3,
    moq: 1,
    placementZones: [
      { id: "front_chest", name: "Front Chest", x: 50, y: 35, width: 25, height: 15, maxDesigns: 1 },
      { id: "back_center", name: "Back Center", x: 50, y: 40, width: 30, height: 35, maxDesigns: 1 },
    ],
    tags: ["stringer", "gym", "fitness", "bodybuilding"],
    trending: false,
    seasonal: "summer",
  },

  // ==================== TOPS - LONG SLEEVE ====================
  {
    id: "ls-classic",
    name: "Classic Long Sleeve",
    category: "tops",
    description: "Standard long sleeve with ribbed cuffs. Perfect for forearm tattoo showcases.",
    baseCost: 16.00,
    suggestedRetail: 62.00,
    minRetail: 45.00,
    printMethods: ["dtg", "screen"],
    maxPrintArea: {
      front: { width: 14, height: 16 },
      back: { width: 14, height: 16 },
      leftSleeve: { width: 3, height: 12 },
      rightSleeve: { width: 3, height: 12 },
    },
    fabricWeight: "mid",
    fit: "regular",
    material: "100% Cotton",
    availableSizes: ["S", "M", "L", "XL", "2XL"],
    sizeChart: {
      S: { chest: 38, length: 28 },
      M: { chest: 42, length: 29 },
      L: { chest: 46, length: 30 },
      XL: { chest: 50, length: 31 },
      "2XL": { chest: 54, length: 32 },
    },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "White", hex: "#fafafa", sku_suffix: "WHT" },
      { name: "Navy", hex: "#1e3a5f", sku_suffix: "NVY" },
      { name: "Burgundy", hex: "#722f37", sku_suffix: "BRG" },
    ],
    productionTimeDays: 4,
    moq: 1,
    placementZones: [
      { id: "front_center", name: "Front Center", x: 50, y: 45, width: 40, height: 35, maxDesigns: 1 },
      { id: "back_center", name: "Back Center", x: 50, y: 45, width: 40, height: 40, maxDesigns: 1 },
      { id: "left_sleeve", name: "Left Sleeve", x: 15, y: 55, width: 8, height: 25, maxDesigns: 1 },
      { id: "right_sleeve", name: "Right Sleeve", x: 85, y: 55, width: 8, height: 25, maxDesigns: 1 },
    ],
    tags: ["longsleeve", "classic", "forearm"],
    trending: false,
    seasonal: "winter",
  },
  {
    id: "ls-thermal",
    name: "Waffle Thermal",
    category: "tops",
    description: "Textured waffle-knit thermal. Warm base layer with vintage workwear vibes.",
    baseCost: 18.50,
    suggestedRetail: 72.00,
    minRetail: 52.00,
    printMethods: ["dtg", "screen"],
    maxPrintArea: {
      front: { width: 12, height: 12 },
      back: { width: 12, height: 14 },
      chest: { width: 6, height: 6 },
    },
    fabricWeight: "heavy",
    fit: "regular",
    material: "60% Cotton, 40% Polyester Waffle Knit",
    availableSizes: ["S", "M", "L", "XL", "2XL"],
    sizeChart: {
      S: { chest: 38, length: 27 },
      M: { chest: 42, length: 28 },
      L: { chest: 46, length: 29 },
      XL: { chest: 50, length: 30 },
      "2XL": { chest: 54, length: 31 },
    },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Heather Grey", hex: "#6b7280", sku_suffix: "HGY" },
      { name: "Oatmeal", hex: "#e6d5c3", sku_suffix: "OAT" },
      { name: "Forest Green", hex: "#228b22", sku_suffix: "FGR" },
    ],
    productionTimeDays: 4,
    moq: 1,
    placementZones: [
      { id: "front_center", name: "Front Center", x: 50, y: 45, width: 35, height: 30, maxDesigns: 1 },
      { id: "chest_left", name: "Left Chest", x: 35, y: 35, width: 10, height: 8, maxDesigns: 1 },
      { id: "back_center", name: "Back Center", x: 50, y: 45, width: 35, height: 35, maxDesigns: 1 },
    ],
    tags: ["thermal", "winter", "waffle", "layering"],
    trending: true,
    seasonal: "winter",
  },

  // ==================== HOODIES ====================
  {
    id: "hoodie-pullover",
    name: "Classic Pullover Hoodie",
    category: "tops",
    description: "The essential hoodie. Kangaroo pocket, drawstring hood. Tattoo culture staple.",
    baseCost: 24.00,
    suggestedRetail: 95.00,
    minRetail: 70.00,
    printMethods: ["dtg", "screen", "embroidery"],
    maxPrintArea: {
      front: { width: 14, height: 14 },
      back: { width: 14, height: 16 },
      leftSleeve: { width: 3, height: 10 },
      rightSleeve: { width: 3, height: 10 },
    },
    fabricWeight: "heavy",
    fit: "regular",
    material: "80% Cotton, 20% Polyester Fleece",
    availableSizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    sizeChart: {
      S: { chest: 42, length: 27 },
      M: { chest: 46, length: 28 },
      L: { chest: 50, length: 29 },
      XL: { chest: 54, length: 30 },
      "2XL": { chest: 58, length: 31 },
      "3XL": { chest: 62, length: 32 },
    },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Ash Grey", hex: "#b2beb5", sku_suffix: "ASH" },
      { name: "Navy", hex: "#1e3a5f", sku_suffix: "NVY" },
      { name: "Maroon", hex: "#800000", sku_suffix: "MAR" },
      { name: "Forest Green", hex: "#228b22", sku_suffix: "FGR" },
      { name: "Sand", hex: "#c2b280", sku_suffix: "SND" },
    ],
    baseImageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1024&h=1024&fit=crop&q=80",
    productionTimeDays: 5,
    moq: 1,
    placementZones: [
      { id: "front_center", name: "Front Center", x: 50, y: 50, width: 40, height: 30, maxDesigns: 1 },
      { id: "front_pocket", name: "Pocket Area", x: 50, y: 75, width: 25, height: 12, maxDesigns: 1 },
      { id: "back_center", name: "Back Center", x: 50, y: 45, width: 40, height: 40, maxDesigns: 1 },
      { id: "left_sleeve", name: "Left Sleeve", x: 15, y: 60, width: 8, height: 20, maxDesigns: 1 },
      { id: "right_sleeve", name: "Right Sleeve", x: 85, y: 60, width: 8, height: 20, maxDesigns: 1 },
      { id: "hood_center", name: "Hood Center", x: 50, y: 12, width: 20, height: 12, maxDesigns: 1 },
    ],
    tags: ["hoodie", "essential", "bestseller", "winter", "streetwear"],
    trending: true,
    seasonal: "all",
  },
  {
    id: "hoodie-zip",
    name: "Full-Zip Hoodie",
    category: "tops",
    description: "Full-zip hoodie for easy layering. Split front design considerations.",
    baseCost: 26.00,
    suggestedRetail: 98.00,
    minRetail: 75.00,
    printMethods: ["dtg", "screen", "embroidery"],
    maxPrintArea: {
      front: { width: 10, height: 12 },
      back: { width: 14, height: 16 },
      leftSleeve: { width: 3, height: 10 },
      rightSleeve: { width: 3, height: 10 },
    },
    fabricWeight: "heavy",
    fit: "regular",
    material: "80% Cotton, 20% Polyester Fleece",
    availableSizes: ["S", "M", "L", "XL", "2XL"],
    sizeChart: {
      S: { chest: 42, length: 27 },
      M: { chest: 46, length: 28 },
      L: { chest: 50, length: 29 },
      XL: { chest: 54, length: 30 },
      "2XL": { chest: 58, length: 31 },
    },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Grey", hex: "#6b7280", sku_suffix: "GRY" },
      { name: "Navy", hex: "#1e3a5f", sku_suffix: "NVY" },
    ],
    productionTimeDays: 5,
    moq: 1,
    placementZones: [
      { id: "front_left", name: "Front Left", x: 35, y: 50, width: 22, height: 28, maxDesigns: 1 },
      { id: "front_right", name: "Front Right", x: 65, y: 50, width: 22, height: 28, maxDesigns: 1 },
      { id: "back_center", name: "Back Center", x: 50, y: 45, width: 40, height: 40, maxDesigns: 1 },
      { id: "left_sleeve", name: "Left Sleeve", x: 15, y: 60, width: 8, height: 20, maxDesigns: 1 },
      { id: "right_sleeve", name: "Right Sleeve", x: 85, y: 60, width: 8, height: 20, maxDesigns: 1 },
    ],
    tags: ["hoodie", "zip", "layering", "winter"],
    trending: false,
    seasonal: "winter",
  },
  {
    id: "hoodie-crop",
    name: "Cropped Hoodie",
    category: "tops",
    description: "Trendy cropped fit hoodie. Perfect for high-waisted looks.",
    baseCost: 22.00,
    suggestedRetail: 88.00,
    minRetail: 65.00,
    printMethods: ["dtg", "screen"],
    maxPrintArea: {
      front: { width: 12, height: 10 },
      back: { width: 12, height: 12 },
    },
    fabricWeight: "mid",
    fit: "fitted",
    material: "80% Cotton, 20% Polyester",
    availableSizes: ["XS", "S", "M", "L"],
    sizeChart: {
      XS: { chest: 36, length: 18 },
      S: { chest: 38, length: 19 },
      M: { chest: 40, length: 20 },
      L: { chest: 42, length: 21 },
    },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "White", hex: "#fafafa", sku_suffix: "WHT" },
      { name: "Lavender", hex: "#e6e6fa", sku_suffix: "LAV" },
      { name: "Sage", hex: "#9dc183", sku_suffix: "SGE" },
    ],
    productionTimeDays: 5,
    moq: 1,
    placementZones: [
      { id: "front_center", name: "Front Center", x: 50, y: 48, width: 35, height: 25, maxDesigns: 1 },
      { id: "back_center", name: "Back Center", x: 50, y: 45, width: 35, height: 30, maxDesigns: 1 },
    ],
    tags: ["hoodie", "cropped", "womens", "trending"],
    trending: true,
    seasonal: "all",
  },
  {
    id: "hoodie-tech",
    name: "Tech Fleece Hoodie",
    category: "tops",
    description: "Performance tech fleece with modern silhouette. Athletic meets street.",
    baseCost: 28.00,
    suggestedRetail: 110.00,
    minRetail: 85.00,
    printMethods: ["dtg", "sublimation", "embroidery"],
    maxPrintArea: {
      front: { width: 14, height: 14 },
      back: { width: 14, height: 16 },
      leftSleeve: { width: 4, height: 10 },
      rightSleeve: { width: 4, height: 10 },
    },
    fabricWeight: "mid",
    fit: "regular",
    material: "100% Polyester Tech Fleece",
    availableSizes: ["S", "M", "L", "XL", "2XL"],
    sizeChart: {
      S: { chest: 40, length: 27 },
      M: { chest: 44, length: 28 },
      L: { chest: 48, length: 29 },
      XL: { chest: 52, length: 30 },
      "2XL": { chest: 56, length: 31 },
    },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Dark Grey", hex: "#333333", sku_suffix: "DGY" },
      { name: "Olive", hex: "#556b2f", sku_suffix: "OLV" },
    ],
    productionTimeDays: 5,
    moq: 1,
    placementZones: [
      { id: "front_center", name: "Front Center", x: 50, y: 50, width: 40, height: 30, maxDesigns: 1 },
      { id: "back_center", name: "Back Center", x: 50, y: 45, width: 40, height: 40, maxDesigns: 1 },
      { id: "left_sleeve", name: "Left Sleeve", x: 15, y: 60, width: 10, height: 18, maxDesigns: 1 },
      { id: "right_sleeve", name: "Right Sleeve", x: 85, y: 60, width: 10, height: 18, maxDesigns: 1 },
    ],
    tags: ["hoodie", "tech", "athletic", "modern"],
    trending: true,
    seasonal: "winter",
  },

  // ==================== SWEATSHIRTS ====================
  {
    id: "crew-premium",
    name: "Premium Crewneck",
    category: "tops",
    description: "Heavyweight crewneck sweatshirt. Clean canvas for center-chest and back designs.",
    baseCost: 20.00,
    suggestedRetail: 78.00,
    minRetail: 58.00,
    printMethods: ["dtg", "screen", "embroidery"],
    maxPrintArea: {
      front: { width: 14, height: 14 },
      back: { width: 14, height: 16 },
    },
    fabricWeight: "heavy",
    fit: "regular",
    material: "80% Cotton, 20% Polyester Fleece",
    availableSizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    sizeChart: {
      S: { chest: 42, length: 27 },
      M: { chest: 46, length: 28 },
      L: { chest: 50, length: 29 },
      XL: { chest: 54, length: 30 },
      "2XL": { chest: 58, length: 31 },
      "3XL": { chest: 62, length: 32 },
    },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Ash", hex: "#b2beb5", sku_suffix: "ASH" },
      { name: "Navy", hex: "#1e3a5f", sku_suffix: "NVY" },
      { name: "Cream", hex: "#fffdd0", sku_suffix: "CRM" },
      { name: "Pine", hex: "#01796f", sku_suffix: "PIN" },
    ],
    productionTimeDays: 4,
    moq: 1,
    placementZones: [
      { id: "front_center", name: "Front Center", x: 50, y: 48, width: 40, height: 32, maxDesigns: 1 },
      { id: "chest_left", name: "Left Chest", x: 35, y: 38, width: 12, height: 10, maxDesigns: 1 },
      { id: "back_center", name: "Back Center", x: 50, y: 45, width: 40, height: 42, maxDesigns: 1 },
    ],
    tags: ["crewneck", "classic", "winter", "bestseller"],
    trending: true,
    seasonal: "winter",
  },
  {
    id: "crew-oversized",
    name: "Oversized Crewneck",
    category: "tops",
    description: "Boxy, oversized crewneck. Streetwear essential with maximum print area.",
    baseCost: 22.00,
    suggestedRetail: 85.00,
    minRetail: 62.00,
    printMethods: ["dtg", "screen"],
    maxPrintArea: {
      front: { width: 16, height: 18 },
      back: { width: 16, height: 20 },
    },
    fabricWeight: "heavy",
    fit: "oversized",
    material: "100% Cotton Fleece",
    availableSizes: ["S", "M", "L", "XL"],
    sizeChart: {
      S: { chest: 48, length: 28 },
      M: { chest: 52, length: 29 },
      L: { chest: 56, length: 30 },
      XL: { chest: 60, length: 31 },
    },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Washed Grey", hex: "#808080", sku_suffix: "WGY" },
      { name: "Tan", hex: "#d2b48c", sku_suffix: "TAN" },
      { name: "Dusty Blue", hex: "#6699cc", sku_suffix: "DBL" },
    ],
    productionTimeDays: 4,
    moq: 1,
    placementZones: [
      { id: "front_large", name: "Front Large", x: 50, y: 48, width: 50, height: 40, maxDesigns: 2 },
      { id: "back_full", name: "Back Full", x: 50, y: 48, width: 50, height: 50, maxDesigns: 2 },
    ],
    tags: ["crewneck", "oversized", "streetwear", "boxy"],
    trending: true,
    seasonal: "winter",
  },

  // ==================== BOTTOMS - PANTS ====================
  {
    id: "joggers-classic",
    name: "Classic Joggers",
    category: "bottoms",
    description: "Tapered fit sweatpants with elastic cuffs. Premium comfort with thigh print capability.",
    baseCost: 22.00,
    suggestedRetail: 75.00,
    minRetail: 55.00,
    printMethods: ["dtg", "screen", "embroidery"],
    maxPrintArea: {
      front: { width: 8, height: 10 },
      back: { width: 10, height: 12 },
    },
    fabricWeight: "mid",
    fit: "regular",
    material: "80% Cotton, 20% Polyester Fleece",
    availableSizes: ["S", "M", "L", "XL", "2XL"],
    sizeChart: {
      S: { waist: 30, hips: 38, length: 40 },
      M: { waist: 32, hips: 40, length: 41 },
      L: { waist: 34, hips: 42, length: 42 },
      XL: { waist: 36, hips: 44, length: 43 },
      "2XL": { waist: 38, hips: 46, length: 44 },
    },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Charcoal", hex: "#36454f", sku_suffix: "CHR" },
      { name: "Heather Grey", hex: "#6b7280", sku_suffix: "HGY" },
      { name: "Navy", hex: "#1e3a5f", sku_suffix: "NVY" },
      { name: "Olive", hex: "#556b2f", sku_suffix: "OLV" },
    ],
    productionTimeDays: 4,
    moq: 1,
    placementZones: [
      { id: "left_thigh", name: "Left Thigh", x: 35, y: 35, width: 20, height: 15, maxDesigns: 1 },
      { id: "right_thigh", name: "Right Thigh", x: 65, y: 35, width: 20, height: 15, maxDesigns: 1 },
      { id: "back_waist", name: "Back Waist", x: 50, y: 15, width: 25, height: 8, maxDesigns: 1 },
      { id: "left_calf", name: "Left Calf", x: 35, y: 72, width: 15, height: 12, maxDesigns: 1 },
      { id: "right_calf", name: "Right Calf", x: 65, y: 72, width: 15, height: 12, maxDesigns: 1 },
    ],
    tags: ["joggers", "bottoms", "comfort", "streetwear"],
    trending: true,
    seasonal: "all",
  },
  {
    id: "shorts-fleece",
    name: "Fleece Shorts",
    category: "bottoms",
    description: "Comfy above-knee fleece shorts. Thigh prints and small details.",
    baseCost: 16.00,
    suggestedRetail: 52.00,
    minRetail: 38.00,
    printMethods: ["dtg", "screen", "embroidery"],
    maxPrintArea: {
      front: { width: 8, height: 8 },
      back: { width: 10, height: 10 },
    },
    fabricWeight: "mid",
    fit: "regular",
    material: "80% Cotton, 20% Polyester",
    availableSizes: ["S", "M", "L", "XL", "2XL"],
    sizeChart: {
      S: { waist: 30, hips: 38, length: 18 },
      M: { waist: 32, hips: 40, length: 19 },
      L: { waist: 34, hips: 42, length: 20 },
      XL: { waist: 36, hips: 44, length: 21 },
      "2XL": { waist: 38, hips: 46, length: 22 },
    },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Grey", hex: "#6b7280", sku_suffix: "GRY" },
      { name: "Navy", hex: "#1e3a5f", sku_suffix: "NVY" },
      { name: "Sand", hex: "#c2b280", sku_suffix: "SND" },
    ],
    productionTimeDays: 3,
    moq: 1,
    placementZones: [
      { id: "left_thigh", name: "Left Thigh", x: 35, y: 45, width: 18, height: 15, maxDesigns: 1 },
      { id: "right_thigh", name: "Right Thigh", x: 65, y: 45, width: 18, height: 15, maxDesigns: 1 },
    ],
    tags: ["shorts", "summer", "fleece", "casual"],
    trending: true,
    seasonal: "summer",
  },
  {
    id: "shorts-athletic",
    name: "Performance Athletic Shorts",
    category: "bottoms",
    description: "Lightweight athletic shorts with mesh liner. Gym and street ready.",
    baseCost: 18.00,
    suggestedRetail: 58.00,
    minRetail: 42.00,
    printMethods: ["sublimation", "screen", "embroidery"],
    maxPrintArea: {
      front: { width: 8, height: 8 },
      back: { width: 10, height: 8 },
    },
    fabricWeight: "light",
    fit: "regular",
    material: "100% Polyester",
    availableSizes: ["S", "M", "L", "XL", "2XL"],
    sizeChart: {
      S: { waist: 30, hips: 38, length: 16 },
      M: { waist: 32, hips: 40, length: 17 },
      L: { waist: 34, hips: 42, length: 18 },
      XL: { waist: 36, hips: 44, length: 19 },
      "2XL": { waist: 38, hips: 46, length: 20 },
    },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Navy", hex: "#1e3a5f", sku_suffix: "NVY" },
      { name: "Grey", hex: "#6b7280", sku_suffix: "GRY" },
      { name: "Camo", hex: "#4b5320", sku_suffix: "CAM" },
    ],
    productionTimeDays: 4,
    moq: 1,
    placementZones: [
      { id: "left_thigh", name: "Left Thigh", x: 35, y: 48, width: 18, height: 15, maxDesigns: 1 },
      { id: "right_thigh", name: "Right Thigh", x: 65, y: 48, width: 18, height: 15, maxDesigns: 1 },
    ],
    tags: ["shorts", "athletic", "gym", "performance"],
    trending: true,
    seasonal: "summer",
  },

  // ==================== OUTERWEAR ====================
  {
    id: "jacket-corduroy",
    name: "Corduroy Shirt Jacket",
    category: "outerwear",
    description: "Heavyweight corduroy overshirt. Vintage vibes with tattoo art flair.",
    baseCost: 38.00,
    suggestedRetail: 145.00,
    minRetail: 110.00,
    printMethods: ["dtg", "embroidery"],
    maxPrintArea: {
      front: { width: 10, height: 12 },
      back: { width: 14, height: 16 },
    },
    fabricWeight: "heavy",
    fit: "oversized",
    material: "100% Cotton Corduroy",
    availableSizes: ["S", "M", "L", "XL", "2XL"],
    sizeChart: {
      S: { chest: 44, length: 28 },
      M: { chest: 48, length: 29 },
      L: { chest: 52, length: 30 },
      XL: { chest: 56, length: 31 },
      "2XL": { chest: 60, length: 32 },
    },
    baseColors: [
      { name: "Brown", hex: "#8b4513", sku_suffix: "BRN" },
      { name: "Olive", hex: "#556b2f", sku_suffix: "OLV" },
      { name: "Tan", hex: "#d2b48c", sku_suffix: "TAN" },
      { name: "Navy", hex: "#1e3a5f", sku_suffix: "NVY" },
    ],
    productionTimeDays: 7,
    moq: 1,
    placementZones: [
      { id: "front_left", name: "Front Left", x: 35, y: 50, width: 20, height: 25, maxDesigns: 1 },
      { id: "front_right", name: "Front Right", x: 65, y: 50, width: 20, height: 25, maxDesigns: 1 },
      { id: "back_center", name: "Back Center", x: 50, y: 45, width: 40, height: 40, maxDesigns: 1 },
    ],
    tags: ["jacket", "corduroy", "vintage", "fall", "layering"],
    trending: true,
    seasonal: "fall",
  },
  {
    id: "bomber-classic",
    name: "Classic Bomber Jacket",
    category: "outerwear",
    description: "MA-1 style bomber jacket. Streetwear icon. Big back print potential.",
    baseCost: 45.00,
    suggestedRetail: 175.00,
    minRetail: 135.00,
    printMethods: ["dtg", "sublimation", "embroidery"],
    maxPrintArea: {
      front: { width: 10, height: 12 },
      back: { width: 14, height: 18 },
      leftSleeve: { width: 4, height: 8 },
      rightSleeve: { width: 4, height: 8 },
    },
    fabricWeight: "mid",
    fit: "regular",
    material: "100% Polyester Nylon",
    availableSizes: ["S", "M", "L", "XL", "2XL"],
    sizeChart: {
      S: { chest: 44, length: 26 },
      M: { chest: 48, length: 27 },
      L: { chest: 52, length: 28 },
      XL: { chest: 56, length: 29 },
      "2XL": { chest: 60, length: 30 },
    },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Olive", hex: "#556b2f", sku_suffix: "OLV" },
      { name: "Burgundy", hex: "#722f37", sku_suffix: "BRG" },
      { name: "Navy", hex: "#1e3a5f", sku_suffix: "NVY" },
    ],
    productionTimeDays: 8,
    moq: 1,
    placementZones: [
      { id: "front_left", name: "Front Left", x: 32, y: 50, width: 18, height: 22, maxDesigns: 1 },
      { id: "front_right", name: "Front Right", x: 68, y: 50, width: 18, height: 22, maxDesigns: 1 },
      { id: "back_center", name: "Back Center", x: 50, y: 48, width: 45, height: 45, maxDesigns: 1 },
      { id: "left_sleeve", name: "Left Sleeve", x: 15, y: 50, width: 10, height: 15, maxDesigns: 1 },
      { id: "right_sleeve", name: "Right Sleeve", x: 85, y: 50, width: 10, height: 15, maxDesigns: 1 },
    ],
    tags: ["bomber", "jacket", "streetwear", "iconic"],
    trending: true,
    seasonal: "all",
  },
  {
    id: "vest-puffer",
    name: "Puffer Vest",
    category: "outerwear",
    description: "Lightweight quilted puffer vest. Layering essential with center chest and back potential.",
    baseCost: 32.00,
    suggestedRetail: 125.00,
    minRetail: 95.00,
    printMethods: ["dtg", "embroidery"],
    maxPrintArea: {
      front: { width: 12, height: 12 },
      back: { width: 12, height: 14 },
    },
    fabricWeight: "mid",
    fit: "regular",
    material: "100% Nylon with Polyester Fill",
    availableSizes: ["S", "M", "L", "XL", "2XL"],
    sizeChart: {
      S: { chest: 42, length: 25 },
      M: { chest: 46, length: 26 },
      L: { chest: 50, length: 27 },
      XL: { chest: 54, length: 28 },
      "2XL": { chest: 58, length: 29 },
    },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Navy", hex: "#1e3a5f", sku_suffix: "NVY" },
      { name: "Olive", hex: "#556b2f", sku_suffix: "OLV" },
    ],
    productionTimeDays: 6,
    moq: 1,
    placementZones: [
      { id: "front_center", name: "Front Center", x: 50, y: 50, width: 35, height: 30, maxDesigns: 1 },
      { id: "back_center", name: "Back Center", x: 50, y: 50, width: 35, height: 35, maxDesigns: 1 },
    ],
    tags: ["vest", "puffer", "layering", "winter"],
    trending: false,
    seasonal: "winter",
  },

  // ==================== HEADWEAR ====================
  {
    id: "cap-dad",
    name: "Dad Hat (Unstructured)",
    category: "headwear",
    description: "Relaxed, unstructured 6-panel cap. Embroidery or small front prints.",
    baseCost: 9.00,
    suggestedRetail: 42.00,
    minRetail: 32.00,
    printMethods: ["embroidery", "dtg"],
    maxPrintArea: {
      front: { width: 4, height: 2.5 },
    },
    fabricWeight: "mid",
    fit: "regular",
    material: "100% Cotton Twill",
    availableSizes: ["One Size"],
    sizeChart: { "One Size": {} },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Navy", hex: "#1e3a5f", sku_suffix: "NVY" },
      { name: "Khaki", hex: "#c3b091", sku_suffix: "KHA" },
      { name: "Olive", hex: "#556b2f", sku_suffix: "OLV" },
      { name: "Maroon", hex: "#800000", sku_suffix: "MAR" },
    ],
    productionTimeDays: 3,
    moq: 1,
    placementZones: [
      { id: "front_center", name: "Front Panel", x: 50, y: 40, width: 40, height: 25, maxDesigns: 1 },
      { id: "side_left", name: "Left Side", x: 25, y: 50, width: 15, height: 20, maxDesigns: 1 },
      { id: "side_right", name: "Right Side", x: 75, y: 50, width: 15, height: 20, maxDesigns: 1 },
      { id: "back", name: "Back Panel", x: 50, y: 75, width: 30, height: 15, maxDesigns: 1 },
    ],
    tags: ["hat", "cap", "dadhat", "headwear", "embroidery"],
    trending: true,
    seasonal: "all",
  },
  {
    id: "cap-snapback",
    name: "Snapback (Structured)",
    category: "headwear",
    description: "High-profile structured snapback. Bold statement piece.",
    baseCost: 10.50,
    suggestedRetail: 48.00,
    minRetail: 35.00,
    printMethods: ["embroidery", "dtg"],
    maxPrintArea: {
      front: { width: 4.5, height: 3 },
    },
    fabricWeight: "mid",
    fit: "regular",
    material: "80% Acrylic, 20% Wool",
    availableSizes: ["One Size"],
    sizeChart: { "One Size": {} },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "White", hex: "#fafafa", sku_suffix: "WHT" },
      { name: "Red", hex: "#8b0000", sku_suffix: "RED" },
      { name: "Royal Blue", hex: "#4169e1", sku_suffix: "RBL" },
      { name: "Camo", hex: "#4b5320", sku_suffix: "CAM" },
    ],
    productionTimeDays: 3,
    moq: 1,
    placementZones: [
      { id: "front_center", name: "Front Panel", x: 50, y: 38, width: 45, height: 28, maxDesigns: 1 },
    ],
    tags: ["hat", "cap", "snapback", "streetwear"],
    trending: true,
    seasonal: "all",
  },
  {
    id: "beanie-cuffed",
    name: "Cuffed Beanie",
    category: "headwear",
    description: "Classic cuffed beanie. Fold-up area perfect for embroidery or small woven labels.",
    baseCost: 8.50,
    suggestedRetail: 38.00,
    minRetail: 28.00,
    printMethods: ["embroidery", "woven_label"],
    maxPrintArea: {
      front: { width: 3, height: 1.5 },
    },
    fabricWeight: "mid",
    fit: "regular",
    material: "100% Acrylic Knit",
    availableSizes: ["One Size"],
    sizeChart: { "One Size": {} },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Grey", hex: "#6b7280", sku_suffix: "GRY" },
      { name: "Navy", hex: "#1e3a5f", sku_suffix: "NVY" },
      { name: "Burgundy", hex: "#722f37", sku_suffix: "BRG" },
      { name: "Olive", hex: "#556b2f", sku_suffix: "OLV" },
    ],
    productionTimeDays: 3,
    moq: 1,
    placementZones: [
      { id: "cuff_front", name: "Cuff Front", x: 50, y: 55, width: 30, height: 20, maxDesigns: 1 },
    ],
    tags: ["beanie", "winter", "headwear", "knit"],
    trending: false,
    seasonal: "winter",
  },
  {
    id: "bucket-hat",
    name: "Bucket Hat",
    category: "headwear",
    description: "Reversible bucket hat. All-over print potential on sublimation version.",
    baseCost: 11.00,
    suggestedRetail: 52.00,
    minRetail: 38.00,
    printMethods: ["sublimation", "embroidery", "dtg"],
    maxPrintArea: {
      front: { width: 6, height: 4 },
    },
    fabricWeight: "light",
    fit: "regular",
    material: "100% Polyester",
    availableSizes: ["S/M", "L/XL"],
    sizeChart: { "S/M": {}, "L/XL": {} },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Khaki", hex: "#c3b091", sku_suffix: "KHA" },
      { name: "Navy", hex: "#1e3a5f", sku_suffix: "NVY" },
    ],
    productionTimeDays: 4,
    moq: 1,
    placementZones: [
      { id: "front_panel", name: "Front Panel", x: 50, y: 45, width: 50, height: 35, maxDesigns: 1 },
      { id: "side_left", name: "Left Side", x: 20, y: 50, width: 20, height: 30, maxDesigns: 1 },
      { id: "side_right", name: "Right Side", x: 80, y: 50, width: 20, height: 30, maxDesigns: 1 },
    ],
    tags: ["hat", "bucket", "summer", "trending"],
    trending: true,
    seasonal: "summer",
  },

  // ==================== ACCESSORIES ====================
  {
    id: "socks-crew",
    name: "Crew Socks",
    category: "accessories",
    description: "Mid-calf crew socks. All-over print capability for bold statement socks.",
    baseCost: 6.50,
    suggestedRetail: 28.00,
    minRetail: 22.00,
    printMethods: ["sublimation"],
    maxPrintArea: {
      front: { width: 4, height: 12 },
    },
    fabricWeight: "mid",
    fit: "regular",
    material: "95% Polyester, 5% Spandex",
    availableSizes: ["S/M", "L/XL"],
    sizeChart: { "S/M": {}, "L/XL": {} },
    baseColors: [
      { name: "White Base", hex: "#fafafa", sku_suffix: "WHT" },
      { name: "Black Base", hex: "#0a0a0a", sku_suffix: "BLK" },
    ],
    productionTimeDays: 3,
    moq: 1,
    placementZones: [
      { id: "sock_outer", name: "Outer Side", x: 30, y: 50, width: 25, height: 60, maxDesigns: 1 },
      { id: "sock_inner", name: "Inner Side", x: 70, y: 50, width: 25, height: 60, maxDesigns: 1 },
    ],
    tags: ["socks", "accessories", "sublimation", "allover"],
    trending: true,
    seasonal: "all",
  },
  {
    id: "bandana",
    name: "Bandana",
    category: "accessories",
    description: "Classic 22\" square bandana. All-over print perfect for repeating patterns or center designs.",
    baseCost: 5.50,
    suggestedRetail: 22.00,
    minRetail: 18.00,
    printMethods: ["sublimation", "screen"],
    maxPrintArea: {
      front: { width: 22, height: 22 },
    },
    fabricWeight: "light",
    fit: "regular",
    material: "100% Polyester",
    availableSizes: ["One Size"],
    sizeChart: { "One Size": {} },
    baseColors: [
      { name: "White", hex: "#fafafa", sku_suffix: "WHT" },
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Red", hex: "#8b0000", sku_suffix: "RED" },
    ],
    productionTimeDays: 2,
    moq: 1,
    placementZones: [
      { id: "full_surface", name: "Full Surface", x: 50, y: 50, width: 90, height: 90, maxDesigns: 4, supportsMultiple: true },
    ],
    tags: ["bandana", "accessories", "pattern", "tattoo"],
    trending: true,
    seasonal: "all",
  },
  {
    id: "flag-wall",
    name: "Wall Flag / Tapestry",
    category: "accessories",
    description: "Large wall-hanging flag. Full bleed art prints. Perfect for tattoo flash collections.",
    baseCost: 18.00,
    suggestedRetail: 85.00,
    minRetail: 65.00,
    printMethods: ["sublimation"],
    maxPrintArea: {
      front: { width: 36, height: 60 },
    },
    fabricWeight: "light",
    fit: "regular",
    material: "100% Polyester",
    availableSizes: ["One Size"],
    sizeChart: { "One Size": {} },
    baseColors: [
      { name: "White Base", hex: "#fafafa", sku_suffix: "WHT" },
      { name: "Black Base", hex: "#0a0a0a", sku_suffix: "BLK" },
    ],
    productionTimeDays: 4,
    moq: 1,
    placementZones: [
      { id: "full_flag", name: "Full Flag", x: 50, y: 50, width: 95, height: 95, maxDesigns: 6, supportsMultiple: true },
    ],
    tags: ["flag", "tapestry", "wallart", "home"],
    trending: false,
    seasonal: "all",
  },
  {
    id: "phone-case",
    name: "Tough Phone Case",
    category: "accessories",
    description: "Dual-layer tough case. Full wrap print.",
    baseCost: 8.00,
    suggestedRetail: 35.00,
    minRetail: 28.00,
    printMethods: ["sublimation"],
    maxPrintArea: {
      front: { width: 3, height: 6 },
    },
    fabricWeight: "mid",
    fit: "regular",
    material: "Polycarbonate + TPU",
    availableSizes: ["iPhone 14/15/Pro/Max", "Samsung S23/S24/Ultra"],
    sizeChart: {},
    baseColors: [
      { name: "Gloss", hex: "#ffffff", sku_suffix: "GLS" },
      { name: "Matte", hex: "#cccccc", sku_suffix: "MAT" },
    ],
    productionTimeDays: 3,
    moq: 1,
    placementZones: [
      { id: "case_back", name: "Case Back", x: 50, y: 50, width: 70, height: 85, maxDesigns: 1 },
    ],
    tags: ["phone", "case", "tech", "accessories"],
    trending: true,
    seasonal: "all",
  },

  // ==================== BAGS ====================
  {
    id: "tote-canvas",
    name: "Canvas Tote Bag",
    category: "bags",
    description: "Heavy canvas tote. Large front print area for statement artwork.",
    baseCost: 12.00,
    suggestedRetail: 48.00,
    minRetail: 35.00,
    printMethods: ["dtg", "screen", "dtf"],
    maxPrintArea: {
      front: { width: 14, height: 14 },
    },
    fabricWeight: "heavy",
    fit: "regular",
    material: "100% Cotton Canvas",
    availableSizes: ["One Size"],
    sizeChart: { "One Size": {} },
    baseColors: [
      { name: "Natural", hex: "#f5f5dc", sku_suffix: "NAT" },
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
    ],
    productionTimeDays: 3,
    moq: 1,
    placementZones: [
      { id: "front_center", name: "Front Center", x: 50, y: 50, width: 60, height: 50, maxDesigns: 1 },
    ],
    tags: ["bag", "tote", "canvas", "eco"],
    trending: true,
    seasonal: "all",
  },
  {
    id: "backpack-mini",
    name: "Mini Backpack",
    category: "bags",
    description: "Compact mini backpack. Front pocket and main body print areas.",
    baseCost: 28.00,
    suggestedRetail: 115.00,
    minRetail: 88.00,
    printMethods: ["sublimation", "dtf"],
    maxPrintArea: {
      front: { width: 10, height: 12 },
    },
    fabricWeight: "mid",
    fit: "regular",
    material: "Polyester Canvas",
    availableSizes: ["One Size"],
    sizeChart: { "One Size": {} },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Navy", hex: "#1e3a5f", sku_suffix: "NVY" },
    ],
    productionTimeDays: 5,
    moq: 1,
    placementZones: [
      { id: "front_pocket", name: "Front Pocket", x: 50, y: 40, width: 50, height: 35, maxDesigns: 1 },
      { id: "main_body", name: "Main Body", x: 50, y: 55, width: 55, height: 50, maxDesigns: 2 },
    ],
    tags: ["bag", "backpack", "streetwear"],
    trending: true,
    seasonal: "all",
  },
  {
    id: "fanny-pack",
    name: "Crossbody Fanny Pack",
    category: "bags",
    description: "Trendy crossbody sling bag. Festival and streetwear essential.",
    baseCost: 15.00,
    suggestedRetail: 58.00,
    minRetail: 42.00,
    printMethods: ["sublimation", "dtf"],
    maxPrintArea: {
      front: { width: 10, height: 6 },
    },
    fabricWeight: "mid",
    fit: "regular",
    material: "Polyester",
    availableSizes: ["One Size"],
    sizeChart: { "One Size": {} },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Neon Green", hex: "#39ff14", sku_suffix: "NGR" },
      { name: "Hot Pink", hex: "#ff69b4", sku_suffix: "HPK" },
    ],
    productionTimeDays: 4,
    moq: 1,
    placementZones: [
      { id: "main_pocket", name: "Main Pocket", x: 50, y: 50, width: 60, height: 40, maxDesigns: 1 },
    ],
    tags: ["bag", "fannypack", "festival", "trending"],
    trending: true,
    seasonal: "all",
  },

  // ==================== SETS (Bundled) ====================
  {
    id: "set-hoodie-joggers",
    name: "Hoodie + Joggers Set",
    category: "tops",
    description: "Matching hoodie and joggers set. Coordinated artwork across both pieces.",
    baseCost: 42.00,
    suggestedRetail: 155.00,
    minRetail: 115.00,
    printMethods: ["dtg", "screen", "embroidery"],
    maxPrintArea: {
      front: { width: 14, height: 14 },
      back: { width: 14, height: 16 },
    },
    fabricWeight: "heavy",
    fit: "regular",
    material: "80% Cotton, 20% Polyester Fleece",
    availableSizes: ["S", "M", "L", "XL", "2XL"],
    sizeChart: {
      S: { chest: 42, waist: 30, length: 27 },
      M: { chest: 46, waist: 32, length: 28 },
      L: { chest: 50, waist: 34, length: 29 },
      XL: { chest: 54, waist: 36, length: 30 },
      "2XL": { chest: 58, waist: 38, length: 31 },
    },
    baseColors: [
      { name: "Black", hex: "#0a0a0a", sku_suffix: "BLK" },
      { name: "Grey", hex: "#6b7280", sku_suffix: "GRY" },
      { name: "Navy", hex: "#1e3a5f", sku_suffix: "NVY" },
    ],
    productionTimeDays: 6,
    moq: 1,
    placementZones: [
      { id: "hoodie_front", name: "Hoodie Front", x: 50, y: 35, width: 40, height: 25, maxDesigns: 1 },
      { id: "hoodie_back", name: "Hoodie Back", x: 50, y: 35, width: 40, height: 30, maxDesigns: 1 },
      { id: "joggers_left", name: "Joggers Left Thigh", x: 35, y: 75, width: 20, height: 15, maxDesigns: 1 },
      { id: "joggers_right", name: "Joggers Right Thigh", x: 65, y: 75, width: 20, height: 15, maxDesigns: 1 },
    ],
    tags: ["set", "hoodie", "joggers", "matching", "bestseller"],
    trending: true,
    seasonal: "winter",
  },
];

// Helper functions
export function getGarmentById(id: string): GarmentType | undefined {
  return GARMENT_CATALOG.find((g) => g.id === id);
}

export function getGarmentsByCategory(category: GarmentCategory): GarmentType[] {
  return GARMENT_CATALOG.filter((g) => g.category === category);
}

export function getTrendingGarments(): GarmentType[] {
  return GARMENT_CATALOG.filter((g) => g.trending);
}

export function getGarmentsByTag(tag: string): GarmentType[] {
  return GARMENT_CATALOG.filter((g) => g.tags.includes(tag));
}

export function getGarmentsBySeason(season: GarmentType["seasonal"]): GarmentType[] {
  return GARMENT_CATALOG.filter((g) => g.seasonal === season || g.seasonal === "all");
}

export function searchGarments(query: string): GarmentType[] {
  const q = query.toLowerCase();
  return GARMENT_CATALOG.filter(
    (g) =>
      g.name.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.tags.some((t) => t.includes(q))
  );
}

export const GARMENT_CATEGORIES: { id: GarmentCategory; label: string; icon: string }[] = [
  { id: "tops", label: "Tops", icon: "👕" },
  { id: "bottoms", label: "Bottoms", icon: "👖" },
  { id: "outerwear", label: "Outerwear", icon: "🧥" },
  { id: "headwear", label: "Headwear", icon: "🧢" },
  { id: "accessories", label: "Accessories", icon: "🧦" },
  { id: "bags", label: "Bags", icon: "🎒" },
];

export const FIT_TYPES: { id: FitType; label: string; description: string }[] = [
  { id: "slim", label: "Slim", description: "Body-hugging fit" },
  { id: "regular", label: "Regular", description: "Standard comfortable fit" },
  { id: "relaxed", label: "Relaxed", description: "Looser, casual fit" },
  { id: "oversized", label: "Oversized", description: "Baggy, streetwear fit" },
  { id: "fitted", label: "Fitted", description: "Contoured to body" },
];

export const PRINT_METHODS: { id: PrintMethod; label: string; description: string }[] = [
  { id: "dtg", label: "DTG", description: "Direct to garment - full color, detailed" },
  { id: "screen", label: "Screen Print", description: "Bold, vibrant, great for bulk" },
  { id: "dtf", label: "DTF", description: "Direct to film - versatile on any fabric" },
  { id: "sublimation", label: "Sublimation", description: "All-over prints, polyester" },
  { id: "embroidery", label: "Embroidery", description: "Premium stitched, textured" },
  { id: "woven_label", label: "Woven Label", description: "Classic tag-style woven" },
];
