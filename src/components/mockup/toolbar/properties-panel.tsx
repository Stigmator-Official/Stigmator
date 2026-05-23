"use client";

/**
 * Properties Panel Component for Stigmator 3D Mockup Generator
 * 
 * Right-side panel showing details of selected element.
 * Content adapts based on selection type: garment, design, or lighting.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Shirt,
  Image,
  Sun,
  X,
  ChevronRight,
  ChevronLeft,
  Ruler,
  Palette,
  Layers,
  FileImage,
  Move,
  RotateCw,
  Maximize,
  Info,
  Lightbulb,
  Cloud,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type SelectionType = 'garment' | 'design' | 'lighting';

export interface GarmentData {
  type: string;
  variant: string;
  color: string;
  fabric: string;
  dimensions: {
    chestWidth: number;
    length: number;
    sleeveLength?: number;
    shoulderWidth?: number;
  };
}

export interface DesignData {
  fileName: string;
  fileSize: string;
  dimensions: {
    width: number;
    height: number;
  };
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  scale: {
    x: number;
    y: number;
  };
}

export interface LightingData {
  preset: string;
  ambientIntensity: number;
  directionalIntensity: number;
  shadowEnabled: boolean;
  shadowQuality: 'low' | 'medium' | 'high';
}

export interface Selection {
  type: SelectionType;
  data: GarmentData | DesignData | LightingData;
}

export interface PropertiesPanelProps {
  selection: Selection | null;
  onClose?: () => void;
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatDimension(value: number): string {
  return `${value.toFixed(1)}"`;
}

function formatPosition(value: number): string {
  return value.toFixed(2);
}

function formatDegrees(radians: number): string {
  return `${Math.round((radians * 180) / Math.PI)}°`;
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

// ============================================================================
// Sub-components
// ============================================================================

function GarmentProperties({ data }: { data: GarmentData }) {
  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-300">
          <Shirt className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">Garment</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500">Type</span>
            <p className="text-zinc-300 capitalize">{data.type}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-zinc-500">Variant</span>
            <p className="text-zinc-300">{data.variant}</p>
          </div>
        </div>
      </div>

      {/* Color & Fabric */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-300">
          <Palette className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">Material</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded border border-zinc-700"
              style={{ backgroundColor: data.color }}
            />
            <span className="text-sm text-zinc-400 uppercase">{data.color}</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-500" />
            <span className="text-sm text-zinc-300">{data.fabric}</span>
          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-300">
          <Ruler className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">Dimensions</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-zinc-800/50 rounded p-2">
            <span className="text-xs text-zinc-500 block">Chest Width</span>
            <span className="text-zinc-300 tabular-nums">
              {formatDimension(data.dimensions.chestWidth)}
            </span>
          </div>
          <div className="bg-zinc-800/50 rounded p-2">
            <span className="text-xs text-zinc-500 block">Length</span>
            <span className="text-zinc-300 tabular-nums">
              {formatDimension(data.dimensions.length)}
            </span>
          </div>
          {data.dimensions.sleeveLength !== undefined && (
            <div className="bg-zinc-800/50 rounded p-2">
              <span className="text-xs text-zinc-500 block">Sleeve</span>
              <span className="text-zinc-300 tabular-nums">
                {formatDimension(data.dimensions.sleeveLength)}
              </span>
            </div>
          )}
          {data.dimensions.shoulderWidth !== undefined && (
            <div className="bg-zinc-800/50 rounded p-2">
              <span className="text-xs text-zinc-500 block">Shoulder</span>
              <span className="text-zinc-300 tabular-nums">
                {formatDimension(data.dimensions.shoulderWidth)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DesignProperties({ data }: { data: DesignData }) {
  return (
    <div className="space-y-4">
      {/* File Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-300">
          <Image className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">Design</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <FileImage className="w-4 h-4 text-zinc-500 mt-0.5" />
            <div>
              <p className="text-sm text-zinc-300 break-all">{data.fileName}</p>
              <p className="text-xs text-zinc-500">{data.fileSize}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-300">
          <Maximize className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">Dimensions</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-zinc-800/50 rounded p-2">
            <span className="text-xs text-zinc-500 block">Width</span>
            <span className="text-zinc-300 tabular-nums">
              {data.dimensions.width}px
            </span>
          </div>
          <div className="bg-zinc-800/50 rounded p-2">
            <span className="text-xs text-zinc-500 block">Height</span>
            <span className="text-zinc-300 tabular-nums">
              {data.dimensions.height}px
            </span>
          </div>
        </div>
      </div>

      {/* Position */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-300">
          <Move className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">Position</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="bg-zinc-800/50 rounded p-2">
            <span className="text-xs text-zinc-500 block">X</span>
            <span className="text-zinc-300 tabular-nums">
              {formatPosition(data.position.x)}
            </span>
          </div>
          <div className="bg-zinc-800/50 rounded p-2">
            <span className="text-xs text-zinc-500 block">Y</span>
            <span className="text-zinc-300 tabular-nums">
              {formatPosition(data.position.y)}
            </span>
          </div>
          <div className="bg-zinc-800/50 rounded p-2">
            <span className="text-xs text-zinc-500 block">Z</span>
            <span className="text-zinc-300 tabular-nums">
              {formatPosition(data.position.z)}
            </span>
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-300">
          <RotateCw className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">Rotation</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="bg-zinc-800/50 rounded p-2">
            <span className="text-xs text-zinc-500 block">X</span>
            <span className="text-zinc-300 tabular-nums">
              {formatDegrees(data.rotation.x)}
            </span>
          </div>
          <div className="bg-zinc-800/50 rounded p-2">
            <span className="text-xs text-zinc-500 block">Y</span>
            <span className="text-zinc-300 tabular-nums">
              {formatDegrees(data.rotation.y)}
            </span>
          </div>
          <div className="bg-zinc-800/50 rounded p-2">
            <span className="text-xs text-zinc-500 block">Z</span>
            <span className="text-zinc-300 tabular-nums">
              {formatDegrees(data.rotation.z)}
            </span>
          </div>
        </div>
      </div>

      {/* Scale */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-300">
          <Maximize className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">Scale</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-zinc-800/50 rounded p-2">
            <span className="text-xs text-zinc-500 block">Width</span>
            <span className="text-zinc-300 tabular-nums">
              {formatPercent(data.scale.x)}
            </span>
          </div>
          <div className="bg-zinc-800/50 rounded p-2">
            <span className="text-xs text-zinc-500 block">Height</span>
            <span className="text-zinc-300 tabular-nums">
              {formatPercent(data.scale.y)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LightingProperties({ data }: { data: LightingData }) {
  return (
    <div className="space-y-4">
      {/* Preset Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-300">
          <Sun className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">Lighting</span>
        </div>

        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-zinc-500" />
          <div>
            <p className="text-sm text-zinc-300">{data.preset}</p>
            <p className="text-xs text-zinc-500">Lighting Preset</p>
          </div>
        </div>
      </div>

      {/* Intensity Values */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-300">
          <Info className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">Intensity</span>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-500">Ambient</span>
              <span className="text-zinc-300 tabular-nums">
                {Math.round(data.ambientIntensity * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${data.ambientIntensity * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-500">Directional</span>
              <span className="text-zinc-300 tabular-nums">
                {Math.round(data.directionalIntensity * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${data.directionalIntensity * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shadow Settings */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-300">
          <Cloud className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">Shadows</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-zinc-800">
            <span className="text-sm text-zinc-400">Enabled</span>
            <span
              className={cn(
                'text-sm font-medium',
                data.shadowEnabled ? 'text-green-400' : 'text-zinc-600'
              )}
            >
              {data.shadowEnabled ? 'On' : 'Off'}
            </span>
          </div>

          {data.shadowEnabled && (
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-zinc-400">Quality</span>
              <span className="text-sm text-zinc-300 capitalize">{data.shadowQuality}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Info className="w-8 h-8 text-zinc-600 mb-3" />
      <p className="text-sm text-zinc-500">No element selected</p>
      <p className="text-xs text-zinc-600 mt-1">
        Click on a garment, design, or lighting to view properties
      </p>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function PropertiesPanel({
  selection,
  onClose,
  className,
}: PropertiesPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={200}>
        <div
          className={cn(
            'flex flex-col items-center gap-2 p-2',
            'bg-zinc-900/95 backdrop-blur-md',
            'border border-zinc-800',
            'rounded-lg shadow-2xl shadow-black/50',
            className
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(false)}
                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-zinc-900 border-zinc-800">
              <p className="text-xs">Show properties</p>
            </TooltipContent>
          </Tooltip>

          {selection && (
            <div
              className={cn(
                'w-8 h-8 rounded flex items-center justify-center',
                selection.type === 'garment' && 'bg-green-600/20 text-green-400',
                selection.type === 'design' && 'bg-blue-600/20 text-blue-400',
                selection.type === 'lighting' && 'bg-amber-600/20 text-amber-400'
              )}
            >
              {selection.type === 'garment' && <Shirt className="w-4 h-4" />}
              {selection.type === 'design' && <Image className="w-4 h-4" />}
              {selection.type === 'lighting' && <Sun className="w-4 h-4" />}
            </div>
          )}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          'flex flex-col w-64',
          'bg-zinc-900/95 backdrop-blur-md',
          'border border-zinc-800',
          'rounded-lg shadow-2xl shadow-black/50',
          'overflow-hidden',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            {selection ? (
              <>
                {selection.type === 'garment' && (
                  <Shirt className="w-4 h-4 text-green-500" />
                )}
                {selection.type === 'design' && (
                  <Image className="w-4 h-4 text-green-500" />
                )}
                {selection.type === 'lighting' && (
                  <Sun className="w-4 h-4 text-green-500" />
                )}
                <span className="text-sm font-medium text-zinc-200 capitalize">
                  {selection.type} Properties
                </span>
              </>
            ) : (
              <>
                <Info className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-200">Properties</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(true)}
              className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-96 p-4">
          {selection === null ? (
            <EmptyState />
          ) : (
            <>
              {selection.type === 'garment' && (
                <GarmentProperties data={selection.data as GarmentData} />
              )}
              {selection.type === 'design' && (
                <DesignProperties data={selection.data as DesignData} />
              )}
              {selection.type === 'lighting' && (
                <LightingProperties data={selection.data as LightingData} />
              )}
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default PropertiesPanel;
