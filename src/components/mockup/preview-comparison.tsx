"use client";

/**
 * Preview Comparison Component for Stigmator 3D Mockup Generator
 * 
 * Provides side-by-side, slider, and flip comparison modes
 * for before/after design comparisons.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Columns,
  FlipHorizontal,
  MoveHorizontal,
  Download,
  Maximize2,
  Minimize2,
  RefreshCw,
  Camera,
  Type
} from 'lucide-react';
// Note: MockupConfig should be defined in use-mockup-state or types.d.ts
// For now, we define it locally to avoid import issues
interface MockupConfig {
  garmentModelId?: string;
  designUrl?: string;
  transform?: {
    position: { x: number; y: number };
    scale: number;
    rotation: number;
  };
  camera?: {
    theta: number;
    phi: number;
    radius: number;
  };
  lighting?: string;
}

// ============================================================================
// Types & Interfaces
// ============================================================================

export type ComparisonMode = 'slider' | 'side-by-side' | 'flip';

export interface ComparisonConfig {
  config: MockupConfig;
  label: string;
  thumbnail?: string;
}

export interface PreviewComparisonProps {
  before: ComparisonConfig;
  after: ComparisonConfig;
  mode?: ComparisonMode;
  onModeChange?: (mode: ComparisonMode) => void;
  className?: string;
  syncedCamera?: boolean;  // sync camera between views
  showLabels?: boolean;
}

export interface SyncedCameraState {
  position: THREE.Vector3;
  target: THREE.Vector3;
  zoom: number;
}

// ============================================================================
// Slider Comparison Component
// ============================================================================

interface SliderComparisonProps {
  before: ComparisonConfig;
  after: ComparisonConfig;
  showLabels?: boolean;
  className?: string;
}

function SliderComparison({ 
  before, 
  after, 
  showLabels = true,
  className = '' 
}: SliderComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleMouseDown = useCallback(() => setIsDragging(true), []);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  
  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    setSliderPosition(percentage);
  }, [isDragging]);
  
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg ${className}`}
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
    >
      {/* After image (full width, background) */}
      <div className="absolute inset-0 bg-zinc-950">
        <div className="w-full h-full flex items-center justify-center text-zinc-700">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <span className="text-sm">After: {after.label}</span>
          </div>
        </div>
        {showLabels && (
          <div className="absolute top-4 right-4 bg-green-600/90 text-white text-xs px-2 py-1 rounded">
            {after.label}
          </div>
        )}
      </div>
      
      {/* Before image (clipped by slider position) */}
      <div 
        className="absolute inset-0 bg-zinc-900 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <div className="w-full h-full flex items-center justify-center text-zinc-600">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <span className="text-sm">Before: {before.label}</span>
          </div>
        </div>
        {showLabels && (
          <div className="absolute top-4 left-4 bg-zinc-600/90 text-white text-xs px-2 py-1 rounded">
            {before.label}
          </div>
        )}
      </div>
      
      {/* Slider divider */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* Slider handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <MoveHorizontal className="w-4 h-4 text-zinc-800" />
        </div>
      </div>
      
      {/* Slider control */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 bg-zinc-900/90 rounded-full px-3 py-2">
        <Slider
          value={[sliderPosition]}
          onValueChange={(v) => setSliderPosition(v[0])}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );
}

// ============================================================================
// Side-by-Side Comparison Component
// ============================================================================

interface SideBySideComparisonProps {
  before: ComparisonConfig;
  after: ComparisonConfig;
  syncedCamera?: boolean;
  showLabels?: boolean;
  className?: string;
}

function SideBySideComparison({ 
  before, 
  after, 
  syncedCamera = true,
  showLabels = true,
  className = '' 
}: SideBySideComparisonProps) {
  const [dividerPosition, setDividerPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleMouseDown = useCallback(() => setIsResizing(true), []);
  const handleMouseUp = useCallback(() => setIsResizing(false), []);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(20, Math.min(80, (x / rect.width) * 100));
    
    setDividerPosition(percentage);
  }, [isResizing]);
  
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsResizing(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className={`flex relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Before panel */}
      <div 
        className="relative bg-zinc-950 border-r border-zinc-800"
        style={{ width: `${dividerPosition}%` }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
          <div className="text-center p-4">
            <RefreshCw className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <span className="text-sm">Before: {before.label}</span>
          </div>
        </div>
        {showLabels && (
          <div className="absolute top-4 left-4 bg-zinc-600/90 text-white text-xs px-2 py-1 rounded">
            {before.label}
          </div>
        )}
        {syncedCamera && (
          <div className="absolute bottom-4 left-4 flex items-center gap-1 text-zinc-500 text-xs">
            <Camera className="w-3 h-3" />
            <span>Synced</span>
          </div>
        )}
      </div>
      
      {/* Resize divider */}
      <div 
        className="absolute top-0 bottom-0 w-4 cursor-col-resize z-10 flex items-center justify-center -ml-2"
        style={{ left: `${dividerPosition}%` }}
        onMouseDown={handleMouseDown}
      >
        <div className="w-1 h-12 bg-zinc-600 rounded-full" />
      </div>
      
      {/* After panel */}
      <div 
        className="relative bg-zinc-950 flex-1"
        style={{ width: `${100 - dividerPosition}%` }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
          <div className="text-center p-4">
            <RefreshCw className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <span className="text-sm">After: {after.label}</span>
          </div>
        </div>
        {showLabels && (
          <div className="absolute top-4 right-4 bg-green-600/90 text-white text-xs px-2 py-1 rounded">
            {after.label}
          </div>
        )}
        {syncedCamera && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1 text-zinc-500 text-xs">
            <Camera className="w-3 h-3" />
            <span>Synced</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Flip Comparison Component
// ============================================================================

interface FlipComparisonProps {
  before: ComparisonConfig;
  after: ComparisonConfig;
  showLabels?: boolean;
  className?: string;
}

function FlipComparison({ 
  before, 
  after, 
  showLabels = true,
  className = '' 
}: FlipComparisonProps) {
  const [showingAfter, setShowingAfter] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  
  const handleFlip = useCallback(() => {
    setIsFlipping(true);
    setTimeout(() => {
      setShowingAfter(!showingAfter);
      setTimeout(() => setIsFlipping(false), 150);
    }, 150);
  }, [showingAfter]);
  
  const currentConfig = showingAfter ? after : before;
  
  return (
    <div className={`relative ${className}`}>
      {/* Main view */}
      <div 
        className={`relative w-full h-full bg-zinc-950 rounded-lg overflow-hidden transition-transform duration-150 ${
          isFlipping ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
          <div className="text-center p-4">
            <RefreshCw className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <span className="text-sm">{currentConfig.label}</span>
          </div>
        </div>
        
        {showLabels && (
          <div className={`absolute top-4 px-2 py-1 rounded text-xs ${
            showingAfter 
              ? 'right-4 bg-green-600/90 text-white' 
              : 'left-4 bg-zinc-600/90 text-white'
          }`}>
            {currentConfig.label}
          </div>
        )}
      </div>
      
      {/* Flip controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-zinc-900/90 rounded-full px-2 py-1">
        <Button
          variant={!showingAfter ? 'default' : 'ghost'}
          size="sm"
          onClick={() => !showingAfter || handleFlip()}
          className={`h-7 text-xs ${!showingAfter ? 'bg-zinc-600 hover:bg-zinc-700' : 'hover:bg-zinc-800'}`}
        >
          {before.label}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleFlip}
          className="h-7 w-7 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
        >
          <FlipHorizontal className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant={showingAfter ? 'default' : 'ghost'}
          size="sm"
          onClick={() => showingAfter || handleFlip()}
          className={`h-7 text-xs ${showingAfter ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-zinc-800'}`}
        >
          {after.label}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Export Comparison Utility
// ============================================================================

export interface ExportComparisonOptions {
  format?: 'png' | 'jpg';
  quality?: number;
  includeLabels?: boolean;
}

export async function exportComparisonImage(
  beforeCanvas: HTMLCanvasElement,
  afterCanvas: HTMLCanvasElement,
  mode: ComparisonMode,
  options: ExportComparisonOptions = {}
): Promise<Blob> {
  const { 
    format = 'png', 
    quality = 0.95,
    includeLabels = true 
  } = options;
  
  // Create a combined canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  const width = Math.max(beforeCanvas.width, afterCanvas.width);
  const height = Math.max(beforeCanvas.height, afterCanvas.height);
  
  if (mode === 'side-by-side') {
    canvas.width = width * 2;
    canvas.height = height;
    
    ctx.drawImage(beforeCanvas, 0, 0, width, height);
    ctx.drawImage(afterCanvas, width, 0, width, height);
    
    // Draw divider
    ctx.fillStyle = '#27272a';
    ctx.fillRect(width - 1, 0, 2, height);
  } else {
    canvas.width = width;
    canvas.height = height;
    
    // For slider/flip mode, just export the "after" view
    ctx.drawImage(afterCanvas, 0, 0);
  }
  
  // Add labels if requested
  if (includeLabels) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.font = '14px sans-serif';
    
    if (mode === 'side-by-side') {
      ctx.fillText('Before', 10, 24);
      ctx.fillText('After', width + 10, 24);
    }
  }
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      },
      `image/${format}`,
      quality
    );
  });
}

// ============================================================================
// Main Component
// ============================================================================

export function PreviewComparison({
  before,
  after,
  mode: initialMode = 'slider',
  onModeChange,
  className = '',
  syncedCamera = true,
  showLabels = true,
}: PreviewComparisonProps) {
  const [mode, setMode] = useState<ComparisonMode>(initialMode);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const handleModeChange = useCallback((newMode: ComparisonMode) => {
    setMode(newMode);
    onModeChange?.(newMode);
  }, [onModeChange]);
  
  const handleExport = useCallback(async () => {
    // Placeholder - actual implementation would capture canvases
    console.log('Export comparison:', { before, after, mode });
  }, [before, after, mode]);
  
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);
  
  return (
    <TooltipProvider>
      <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''} ${className}`}>
        {/* Header with controls */}
        <div className="flex items-center justify-between p-3 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-medium text-zinc-200">Compare</h3>
            
            <Tabs value={mode} onValueChange={(v) => handleModeChange(v as ComparisonMode)}>
              <TabsList className="bg-zinc-800">
                <TabsTrigger value="slider" className="text-xs data-[state=active]:bg-zinc-700">
                  <MoveHorizontal className="w-3.5 h-3.5 mr-1" />
                  Slider
                </TabsTrigger>
                <TabsTrigger value="side-by-side" className="text-xs data-[state=active]:bg-zinc-700">
                  <Columns className="w-3.5 h-3.5 mr-1" />
                  Split
                </TabsTrigger>
                <TabsTrigger value="flip" className="text-xs data-[state=active]:bg-zinc-700">
                  <FlipHorizontal className="w-3.5 h-3.5 mr-1" />
                  Flip
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleExport}
                  className="h-8 w-8 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export comparison</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="h-8 w-8 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        {/* Comparison content */}
        <div className="flex-1 relative">
          {mode === 'slider' && (
            <SliderComparison 
              before={before} 
              after={after} 
              showLabels={showLabels}
              className="w-full h-full"
            />
          )}
          
          {mode === 'side-by-side' && (
            <SideBySideComparison 
              before={before} 
              after={after}
              syncedCamera={syncedCamera}
              showLabels={showLabels}
              className="w-full h-full"
            />
          )}
          
          {mode === 'flip' && (
            <FlipComparison 
              before={before} 
              after={after}
              showLabels={showLabels}
              className="w-full h-full"
            />
          )}
        </div>
        
        {/* Footer with info */}
        <div className="flex items-center justify-between p-2 bg-zinc-900 border-t border-zinc-800 text-xs text-zinc-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Type className="w-3 h-3" />
              Before: {before.label}
            </span>
            <span className="flex items-center gap-1">
              <Type className="w-3 h-3 text-green-500" />
              After: {after.label}
            </span>
          </div>
          <div>
            {syncedCamera && mode === 'side-by-side' && 'Camera synced between views'}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

// Export sub-components
export { SliderComparison, SideBySideComparison, FlipComparison };

export default PreviewComparison;
