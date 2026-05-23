// STIGMATOR Garment Builder Components
// Powerful, elite garment creation engine with 3D visualization

export { DesignSelector, type Design } from "./DesignSelector";
export { PlacementCanvas, type DesignPlacement } from "./PlacementCanvas";
export { GarmentSelector } from "./GarmentSelector";
export { GarmentCard } from "./GarmentCard";
export { ColorSizeSelector, type VariantConfig, PRESET_VARIANTS } from "./ColorSizeSelector";
export { Garment3DViewer } from "./Garment3DViewer";
export { AIGarmentEngine } from "./AIGarmentEngine";

// Re-export catalog types for convenience
export {
  GARMENT_CATALOG,
  GARMENT_CATEGORIES,
  getGarmentById,
  getGarmentsByCategory,
  getTrendingGarments,
  searchGarments,
  type GarmentType,
  type GarmentCategory,
  type FitType,
  type PrintMethod,
} from "@/lib/garments/catalog";
