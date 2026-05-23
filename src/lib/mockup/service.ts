// STIGMATOR Mockup Service
// Handles mockup generation and print file creation

// ============================================
// TYPES
// ============================================

export interface MockupConfig {
  garmentType: string;
  garmentColor: string;
  designUrl: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

export interface PrintFileConfig {
  designUrl: string;
  printArea: { width: number; height: number };
  dpi: number;
}

export interface MockupResult {
  mockupUrl: string;
  thumbnailUrl: string;
  printFileUrl: string;
}

// ============================================
// MOCKUP GENERATION
// ============================================

/**
 * Generate a product mockup by compositing design onto garment
 * This is a client-side preview - actual production files are server-generated
 */
export async function generateMockup(config: MockupConfig): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    // Set canvas size (high-res for quality)
    canvas.width = 1200;
    canvas.height = 1500;

    // Load garment template
    const garment = new Image();
    garment.crossOrigin = "anonymous";
    
    // Use a simple colored rectangle as garment base for now
    // In production, this would load actual garment templates
    garment.onload = () => {
      // Draw garment
      ctx.drawImage(garment, 0, 0, canvas.width, canvas.height);

      // Load and draw design
      const design = new Image();
      design.crossOrigin = "anonymous";
      design.src = config.designUrl;
      
      design.onload = () => {
        // Calculate design position and size
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const baseSize = 400 * config.scale;
        
        const x = centerX + (config.position.x - 50) * 6 - baseSize / 2;
        const y = centerY + (config.position.y - 35) * 10 - baseSize / 2;

        ctx.save();
        ctx.translate(x + baseSize / 2, y + baseSize / 2);
        ctx.rotate((config.rotation * Math.PI) / 180);
        ctx.drawImage(design, -baseSize / 2, -baseSize / 2, baseSize, baseSize);
        ctx.restore();

        // Export as data URL
        resolve(canvas.toDataURL("image/png"));
      };
      
      design.onerror = () => reject(new Error("Failed to load design"));
    };
    
    // Use a placeholder garment image
    garment.src = getGarmentTemplateUrl(config.garmentType, config.garmentColor);
    garment.onerror = () => {
      // Fallback: draw simple garment shape
      ctx.fillStyle = config.garmentColor.toLowerCase();
      ctx.fillRect(200, 100, 800, 1300);
      
      // Add design
      const design = new Image();
      design.crossOrigin = "anonymous";
      design.src = config.designUrl;
      design.onload = () => {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const baseSize = 400 * config.scale;
        const x = centerX + (config.position.x - 50) * 6 - baseSize / 2;
        const y = centerY + (config.position.y - 35) * 10 - baseSize / 2;
        
        ctx.save();
        ctx.translate(x + baseSize / 2, y + baseSize / 2);
        ctx.rotate((config.rotation * Math.PI) / 180);
        ctx.drawImage(design, -baseSize / 2, -baseSize / 2, baseSize, baseSize);
        ctx.restore();
        
        resolve(canvas.toDataURL("image/png"));
      };
    };
  });
}

/**
 * Get garment template URL
 * In production, this would return actual garment photography templates
 */
function getGarmentTemplateUrl(type: string, color: string): string {
  // Return a placeholder - in production, use actual garment templates
  const colorMap: Record<string, string> = {
    black: "000000",
    white: "FFFFFF",
    navy: "000080",
    grey: "808080",
    red: "DC2626",
    olive: "556B2F",
    cream: "FFFDD0",
  };
  
  const hex = colorMap[color.toLowerCase()] || "808080";
  return `https://placehold.co/600x750/${hex}/FFFFFF?text=${type}+${color}`;
}

// ============================================
// PRINT FILE GENERATION
// ============================================

/**
 * Generate a print-ready file for manufacturing
 * This creates a high-resolution image with proper dimensions for printing
 */
export async function generatePrintFile(
  designUrl: string,
  config: PrintFileConfig
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    // Calculate canvas size based on print area and DPI
    // Convert mm to pixels at specified DPI
    const mmToInches = 0.0393701;
    const widthPixels = Math.round(config.printArea.width * mmToInches * config.dpi);
    const heightPixels = Math.round(config.printArea.height * mmToInches * config.dpi);
    
    canvas.width = widthPixels;
    canvas.height = heightPixels;

    // Fill with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Load and draw design
    const design = new Image();
    design.crossOrigin = "anonymous";
    design.src = designUrl;
    
    design.onload = () => {
      // Draw design centered and scaled to fit
      const scale = Math.min(
        canvas.width / design.width,
        canvas.height / design.height
      );
      
      const x = (canvas.width - design.width * scale) / 2;
      const y = (canvas.height - design.height * scale) / 2;
      
      ctx.drawImage(design, x, y, design.width * scale, design.height * scale);
      
      // Export as PNG for transparency support
      resolve(canvas.toDataURL("image/png"));
    };
    
    design.onerror = () => reject(new Error("Failed to load design"));
  });
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Generate mockups for multiple garments
 */
export async function generateMockupBatch(
  designs: MockupConfig[]
): Promise<string[]> {
  const promises = designs.map(config => generateMockup(config));
  return Promise.all(promises);
}

// ============================================
// VALIDATION
// ============================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate mockup configuration
 */
export function validateMockupConfig(config: MockupConfig): ValidationResult {
  const errors: string[] = [];

  if (!config.garmentType) {
    errors.push("Garment type is required");
  }

  if (!config.designUrl) {
    errors.push("Design URL is required");
  }

  if (config.position.x < 0 || config.position.x > 100) {
    errors.push("Position X must be between 0 and 100");
  }

  if (config.position.y < 0 || config.position.y > 100) {
    errors.push("Position Y must be between 0 and 100");
  }

  if (config.scale <= 0 || config.scale > 3) {
    errors.push("Scale must be between 0.1 and 3.0");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================
// PRESETS
// ============================================

export const MOCKUP_PRESETS = {
  tshirt: {
    printArea: { width: 300, height: 400 }, // mm
    recommendedDpi: 300,
    positions: {
      center: { x: 50, y: 35 },
      leftChest: { x: 35, y: 30 },
      fullFront: { x: 50, y: 45 },
    },
  },
  hoodie: {
    printArea: { width: 350, height: 450 },
    recommendedDpi: 300,
    positions: {
      center: { x: 50, y: 35 },
      fullFront: { x: 50, y: 45 },
    },
  },
  longsleeve: {
    printArea: { width: 300, height: 400 },
    recommendedDpi: 300,
    positions: {
      center: { x: 50, y: 35 },
    },
  },
} as const;

// ============================================
// EXPORT HELPERS
// ============================================

/**
 * Download a generated mockup or print file
 */
export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Convert data URL to Blob for upload
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const byteString = atob(dataUrl.split(",")[1]);
  const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeString });
}
