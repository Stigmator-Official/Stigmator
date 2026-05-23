"use client";

/**
 * Primary Toolbar Component for Stigmator 3D Mockup Generator
 * 
 * Main floating toolbar at top of viewport with zoom controls,
 * display toggles, screenshot, and fullscreen functionality.
 */

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Grid3X3,
  Scan,
  Sun,
  Camera,
  Fullscreen,
  Minimize,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface PrimaryToolbarProps {
  // View controls
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onFitToScreen: () => void;

  // Display toggles
  showGrid: boolean;
  onToggleGrid: () => void;
  showPrintArea: boolean;
  onTogglePrintArea: () => void;
  showShadows: boolean;
  onToggleShadows: () => void;

  // Screenshot
  onScreenshot: () => void;

  // Fullscreen
  isFullscreen: boolean;
  onToggleFullscreen: () => void;

  // Optional
  className?: string;
  zoomLevel?: number;
}

// ============================================================================
// Component
// ============================================================================

export function PrimaryToolbar({
  onZoomIn,
  onZoomOut,
  onResetView,
  onFitToScreen,
  showGrid,
  onToggleGrid,
  showPrintArea,
  onTogglePrintArea,
  showShadows,
  onToggleShadows,
  onScreenshot,
  isFullscreen,
  onToggleFullscreen,
  className,
  zoomLevel = 100,
}: PrimaryToolbarProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1.5',
          'bg-zinc-900/95 backdrop-blur-md',
          'border border-zinc-800',
          'rounded-full shadow-2xl shadow-black/50',
          className
        )}
      >
        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onZoomOut}
                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-zinc-900 border-zinc-800">
              <p className="text-xs">Zoom out (-)</p>
            </TooltipContent>
          </Tooltip>

          <span className="text-xs font-medium text-zinc-300 w-12 text-center tabular-nums">
            {zoomLevel}%
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onZoomIn}
                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-zinc-900 border-zinc-800">
              <p className="text-xs">Zoom in (+)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-zinc-800 mx-1" />

        {/* Reset & Fit */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onResetView}
                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-zinc-900 border-zinc-800">
              <p className="text-xs">Reset view (R)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onFitToScreen}
                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-zinc-900 border-zinc-800">
              <p className="text-xs">Fit to screen (F)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-zinc-800 mx-1" />

        {/* Display Toggles */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleGrid}
                className={cn(
                  'h-8 w-8 transition-colors',
                  showGrid
                    ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20 hover:text-green-300'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-zinc-900 border-zinc-800">
              <p className="text-xs">Toggle grid (G)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onTogglePrintArea}
                className={cn(
                  'h-8 w-8 transition-colors',
                  showPrintArea
                    ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20 hover:text-green-300'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                )}
              >
                <Scan className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-zinc-900 border-zinc-800">
              <p className="text-xs">Toggle print area (P)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleShadows}
                className={cn(
                  'h-8 w-8 transition-colors',
                  showShadows
                    ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20 hover:text-green-300'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                )}
              >
                <Sun className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-zinc-900 border-zinc-800">
              <p className="text-xs">Toggle shadows</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-zinc-800 mx-1" />

        {/* Screenshot */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onScreenshot}
              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <Camera className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-zinc-900 border-zinc-800">
            <p className="text-xs">Take screenshot</p>
          </TooltipContent>
        </Tooltip>

        {/* Fullscreen */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className={cn(
                'h-8 w-8 transition-colors',
                isFullscreen
                  ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20 hover:text-green-300'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              )}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Fullscreen className="w-4 h-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-zinc-900 border-zinc-800">
            <p className="text-xs">Toggle fullscreen</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export default PrimaryToolbar;
