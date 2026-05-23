'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, Check, Grid3X3, Maximize, Move } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GarmentType } from './position-presets';

export interface PrintAreaVisualizerProps {
  garmentType: GarmentType;
  activeArea: 'chest' | 'back' | 'sleeve-left' | 'sleeve-right' | 'hood' | 'full-front' | 'full-back';
  designBounds: { width: number; height: number };
  transform: {
    position: { x: number; y: number };
    scale: number;
    rotation: number;
  };
  className?: string;
  showGrid?: boolean;
  onToggleGrid?: (show: boolean) => void;
}

interface PrintAreaDefinition {
  id: string;
  name: string;
  // Bounds as percentage of garment dimensions
  bounds: {
    x: [number, number]; // min, max percentage from center
    y: [number, number]; // min, max percentage from center
  };
  // Safe zone margins (in percentage)
  safeZone: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  // Bleed area (extends beyond bounds by this percentage)
  bleed: number;
  // Recommended min/max design size
  recommendedSize: {
    min: number; // percentage
    max: number; // percentage
  };
}

// Print area definitions for different garment types and areas
const PRINT_AREAS: Record<GarmentType, Record<string, PrintAreaDefinition>> = {
  tshirt: {
    chest: {
      id: 'chest',
      name: 'Chest Print',
      bounds: { x: [-35, 35], y: [-45, -5] },
      safeZone: { top: 5, right: 5, bottom: 5, left: 5 },
      bleed: 3,
      recommendedSize: { min: 15, max: 70 },
    },
    back: {
      id: 'back',
      name: 'Back Print',
      bounds: { x: [-38, 38], y: [-40, 15] },
      safeZone: { top: 5, right: 5, bottom: 5, left: 5 },
      bleed: 3,
      recommendedSize: { min: 20, max: 75 },
    },
    'sleeve-left': {
      id: 'sleeve-left',
      name: 'Left Sleeve',
      bounds: { x: [-48, -35], y: [-40, -15] },
      safeZone: { top: 3, right: 3, bottom: 3, left: 3 },
      bleed: 2,
      recommendedSize: { min: 10, max: 30 },
    },
    'sleeve-right': {
      id: 'sleeve-right',
      name: 'Right Sleeve',
      bounds: { x: [35, 48], y: [-40, -15] },
      safeZone: { top: 3, right: 3, bottom: 3, left: 3 },
      bleed: 2,
      recommendedSize: { min: 10, max: 30 },
    },
    'full-front': {
      id: 'full-front',
      name: 'Full Front',
      bounds: { x: [-40, 40], y: [-45, 25] },
      safeZone: { top: 3, right: 3, bottom: 3, left: 3 },
      bleed: 5,
      recommendedSize: { min: 40, max: 85 },
    },
    'full-back': {
      id: 'full-back',
      name: 'Full Back',
      bounds: { x: [-42, 42], y: [-40, 30] },
      safeZone: { top: 3, right: 3, bottom: 3, left: 3 },
      bleed: 5,
      recommendedSize: { min: 45, max: 90 },
    },
  },
  hoodie: {
    chest: {
      id: 'chest',
      name: 'Chest Print',
      bounds: { x: [-32, 32], y: [-35, -5] },
      safeZone: { top: 5, right: 5, bottom: 5, left: 5 },
      bleed: 3,
      recommendedSize: { min: 15, max: 65 },
    },
    hood: {
      id: 'hood',
      name: 'Hood Print',
      bounds: { x: [-25, 25], y: [-55, -40] },
      safeZone: { top: 3, right: 3, bottom: 3, left: 3 },
      bleed: 2,
      recommendedSize: { min: 15, max: 50 },
    },
    back: {
      id: 'back',
      name: 'Back Print',
      bounds: { x: [-38, 38], y: [-35, 20] },
      safeZone: { top: 5, right: 5, bottom: 5, left: 5 },
      bleed: 3,
      recommendedSize: { min: 20, max: 75 },
    },
    'full-front': {
      id: 'full-front',
      name: 'Full Front',
      bounds: { x: [-38, 38], y: [-40, 30] },
      safeZone: { top: 3, right: 3, bottom: 3, left: 3 },
      bleed: 5,
      recommendedSize: { min: 40, max: 85 },
    },
  },
  tank: {
    chest: {
      id: 'chest',
      name: 'Chest Print',
      bounds: { x: [-35, 35], y: [-50, -10] },
      safeZone: { top: 5, right: 5, bottom: 5, left: 5 },
      bleed: 3,
      recommendedSize: { min: 15, max: 70 },
    },
    back: {
      id: 'back',
      name: 'Back Print',
      bounds: { x: [-38, 38], y: [-45, 10] },
      safeZone: { top: 5, right: 5, bottom: 5, left: 5 },
      bleed: 3,
      recommendedSize: { min: 20, max: 75 },
    },
  },
  longsleeve: {
    chest: {
      id: 'chest',
      name: 'Chest Print',
      bounds: { x: [-33, 33], y: [-45, -5] },
      safeZone: { top: 5, right: 5, bottom: 5, left: 5 },
      bleed: 3,
      recommendedSize: { min: 15, max: 65 },
    },
    back: {
      id: 'back',
      name: 'Back Print',
      bounds: { x: [-36, 36], y: [-40, 15] },
      safeZone: { top: 5, right: 5, bottom: 5, left: 5 },
      bleed: 3,
      recommendedSize: { min: 20, max: 70 },
    },
  },
  sweatshirt: {
    chest: {
      id: 'chest',
      name: 'Chest Print',
      bounds: { x: [-32, 32], y: [-40, -5] },
      safeZone: { top: 5, right: 5, bottom: 5, left: 5 },
      bleed: 3,
      recommendedSize: { min: 15, max: 65 },
    },
    back: {
      id: 'back',
      name: 'Back Print',
      bounds: { x: [-36, 36], y: [-35, 20] },
      safeZone: { top: 5, right: 5, bottom: 5, left: 5 },
      bleed: 3,
      recommendedSize: { min: 20, max: 75 },
    },
  },
  polo: {
    chest: {
      id: 'chest',
      name: 'Chest Print',
      bounds: { x: [-30, 30], y: [-45, -10] },
      safeZone: { top: 5, right: 5, bottom: 5, left: 5 },
      bleed: 3,
      recommendedSize: { min: 12, max: 60 },
    },
    back: {
      id: 'back',
      name: 'Back Print',
      bounds: { x: [-35, 35], y: [-40, 10] },
      safeZone: { top: 5, right: 5, bottom: 5, left: 5 },
      bleed: 3,
      recommendedSize: { min: 18, max: 65 },
    },
  },
};

interface ValidationResult {
  isWithinBounds: boolean;
  isWithinSafeZone: boolean;
  warnings: string[];
}

export function PrintAreaVisualizer({
  garmentType,
  activeArea,
  designBounds,
  transform,
  className,
  showGrid = false,
  onToggleGrid,
}: PrintAreaVisualizerProps) {
  const printArea = useMemo(() => {
    const garmentAreas = PRINT_AREAS[garmentType] || PRINT_AREAS.tshirt;
    return garmentAreas[activeArea] || garmentAreas.chest;
  }, [garmentType, activeArea]);

  // Calculate design corners in percentage space
  const designCorners = useMemo(() => {
    const { position, scale, rotation } = transform;
    const { width, height } = designBounds;
    
    // Base dimensions scaled
    const scaledWidth = (width * scale) / 100;
    const scaledHeight = (height * scale) / 100;
    
    // Convert rotation to radians
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    // Half dimensions
    const hw = scaledWidth / 2;
    const hh = scaledHeight / 2;
    
    // Calculate corners relative to center, then rotate, then translate
    const corners = [
      { x: -hw, y: -hh },
      { x: hw, y: -hh },
      { x: hw, y: hh },
      { x: -hw, y: hh },
    ];
    
    return corners.map((corner) => ({
      x: position.x + (corner.x * cos - corner.y * sin),
      y: position.y + (corner.x * sin + corner.y * cos),
    }));
  }, [designBounds, transform]);

  // Validate placement
  const validation: ValidationResult = useMemo(() => {
    const warnings: string[] = [];
    const { bounds, safeZone, recommendedSize } = printArea;
    
    // Check if design extends beyond bounds
    const xMin = Math.min(...designCorners.map((c) => c.x));
    const xMax = Math.max(...designCorners.map((c) => c.x));
    const yMin = Math.min(...designCorners.map((c) => c.y));
    const yMax = Math.max(...designCorners.map((c) => c.y));
    
    const isWithinBounds =
      xMin >= bounds.x[0] && xMax <= bounds.x[1] && yMin >= bounds.y[0] && yMax <= bounds.y[1];
    
    // Check safe zone
    const safeXMin = bounds.x[0] + safeZone.left;
    const safeXMax = bounds.x[1] - safeZone.right;
    const safeYMin = bounds.y[0] + safeZone.top;
    const safeYMax = bounds.y[1] - safeZone.bottom;
    
    const isWithinSafeZone =
      xMin >= safeXMin && xMax <= safeXMax && yMin >= safeYMin && yMax <= safeYMax;
    
    if (!isWithinBounds) {
      warnings.push('Design extends beyond print area');
    }
    if (!isWithinSafeZone) {
      warnings.push('Design may be cut off during printing');
    }
    if (transform.scale < recommendedSize.min) {
      warnings.push('Design is smaller than recommended size');
    }
    if (transform.scale > recommendedSize.max) {
      warnings.push('Design is larger than recommended size');
    }
    
    return { isWithinBounds, isWithinSafeZone, warnings };
  }, [designCorners, printArea, transform.scale]);

  // Calculate bleed bounds
  const bleedBounds = useMemo(() => {
    const { bounds, bleed } = printArea;
    return {
      x: [bounds.x[0] - bleed, bounds.x[1] + bleed] as [number, number],
      y: [bounds.y[0] - bleed, bounds.y[1] + bleed] as [number, number],
    };
  }, [printArea]);

  return (
    <TooltipProvider>
      <div className={cn('space-y-4', className)}>
        {/* Header with controls */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-300">Print Area Guide</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={showGrid}
                onCheckedChange={(checked) => onToggleGrid?.(checked)}
                className="data-[state=checked]:bg-indigo-600"
              />
              <Label className="text-xs text-slate-400 cursor-pointer">
                <Grid3X3 className="h-3.5 w-3.5" />
              </Label>
            </div>
          </div>
        </div>

        {/* Visual overlay container */}
        <div className="relative aspect-[3/4] bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
          {/* Grid overlay */}
          {showGrid && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              <defs>
                <pattern id="print-grid" width="10%" height="10%" patternUnits="userSpaceOnUse">
                  <path d="M 10% 0 L 0 0 0 10%" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-slate-500" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#print-grid)" />
            </svg>
          )}

          {/* Center guidelines */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-indigo-500/20" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-indigo-500/20" />
          </div>

          {/* Bleed area (dashed line) */}
          <div
            className="absolute border-2 border-dashed border-slate-600/50 rounded"
            style={{
              left: `${50 + bleedBounds.x[0] / 2}%`,
              top: `${50 + bleedBounds.y[0] / 2}%`,
              width: `${(bleedBounds.x[1] - bleedBounds.x[0]) / 2}%`,
              height: `${(bleedBounds.y[1] - bleedBounds.y[0]) / 2}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Valid print area (green zone) */}
          <div
            className={cn(
              'absolute rounded border-2 transition-colors duration-200',
              validation.isWithinBounds
                ? 'bg-green-500/10 border-green-500/40'
                : 'bg-red-500/10 border-red-500/40'
            )}
            style={{
              left: `${50 + printArea.bounds.x[0] / 2}%`,
              top: `${50 + printArea.bounds.y[0] / 2}%`,
              width: `${(printArea.bounds.x[1] - printArea.bounds.x[0]) / 2}%`,
              height: `${(printArea.bounds.y[1] - printArea.bounds.y[0]) / 2}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Safe zone indicator */}
            <div
              className={cn(
                'absolute inset-0 m-[5%] rounded border transition-colors duration-200',
                validation.isWithinSafeZone
                  ? 'border-green-400/30 bg-green-400/5'
                  : 'border-yellow-400/30 bg-yellow-400/5'
              )}
            />
          </div>

          {/* Current design placement (blue outline) */}
          <div
            className={cn(
              'absolute border-2 rounded transition-all duration-100',
              validation.isWithinBounds
                ? 'border-indigo-400 bg-indigo-500/10'
                : 'border-red-400 bg-red-500/10'
            )}
            style={{
              left: '50%',
              top: '50%',
              width: `${(designBounds.width * transform.scale) / 200}%`,
              height: `${(designBounds.height * transform.scale) / 200}%`,
              transform: `translate(-50%, -50%) translate(${transform.position.x / 2}%, ${transform.position.y / 2}%) rotate(${transform.rotation}deg)`,
            }}
          >
            {/* Corner markers */}
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-indigo-400 rounded-full" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-400 rounded-full" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-indigo-400 rounded-full" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-indigo-400 rounded-full" />

            {/* Center cross */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-px bg-indigo-400/50" />
              <div className="h-full w-px bg-indigo-400/50 absolute" />
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 text-green-400 text-[10px] rounded border border-green-500/30">
                  <Maximize className="h-3 w-3" />
                  Print Area
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-800 border-slate-700">
                <p className="text-xs text-slate-300">Valid print zone for {printArea.name}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-[10px] rounded border border-yellow-500/30">
                  <Move className="h-3 w-3" />
                  Safe Zone
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-800 border-slate-700">
                <p className="text-xs text-slate-300">Keep design within safe zone to avoid cutting</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Position indicators */}
          <div className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2 py-1 rounded">
            X:{transform.position.x.toFixed(1)}% Y:{transform.position.y.toFixed(1)}%
          </div>
        </div>

        {/* Status indicators */}
        <div className="space-y-2">
          {/* Validation status */}
          <div
            className={cn(
              'flex items-center gap-2 p-2 rounded-lg text-xs',
              validation.isWithinBounds && validation.isWithinSafeZone
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : validation.isWithinBounds
                  ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
            )}
          >
            {validation.isWithinBounds && validation.isWithinSafeZone ? (
              <>
                <Check className="h-4 w-4" />
                <span>Design is properly positioned</span>
              </>
            ) : validation.isWithinBounds ? (
              <>
                <AlertTriangle className="h-4 w-4" />
                <span>Design is in safe zone</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                <span>Design extends beyond print area</span>
              </>
            )}
          </div>

          {/* Warnings */}
          {validation.warnings.length > 0 && (
            <div className="space-y-1">
              {validation.warnings.map((warning, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] text-amber-400">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}

          {/* Print area info */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 bg-slate-800/50 p-2 rounded">
            <div>
              <span className="text-slate-400">Area:</span> {printArea.name}
            </div>
            <div>
              <span className="text-slate-400">Bleed:</span> ±{printArea.bleed}%
            </div>
            <div>
              <span className="text-slate-400">Rec. Size:</span> {printArea.recommendedSize.min}-{printArea.recommendedSize.max}%
            </div>
            <div>
              <span className="text-slate-400">Safe Margin:</span> {printArea.safeZone.top}%
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export { PRINT_AREAS };
export type { PrintAreaDefinition, ValidationResult };
export default PrintAreaVisualizer;
