"use client";

/**
 * View Toolbar Component for Stigmator 3D Mockup Generator
 * 
 * Floating bar at bottom of viewport with view presets and
 * auto-rotation controls with speed slider.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Box,
  BoxSelect,
  ChevronLeft,
  ChevronRight,
  Rotate3D,
  Play,
  Pause,
  Gauge,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type ViewPreset =
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'three-quarter-left'
  | 'three-quarter-right';

export interface ViewToolbarProps {
  activePreset: ViewPreset;
  onSelectPreset: (preset: ViewPreset) => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  rotateSpeed: number;
  onChangeSpeed: (speed: number) => void;
  className?: string;
}

interface PresetConfig {
  id: ViewPreset;
  label: string;
  icon: React.ReactNode;
  shortcut: string;
}

// ============================================================================
// Preset Configurations
// ============================================================================

const VIEW_PRESETS: PresetConfig[] = [
  {
    id: 'front',
    label: 'Front',
    icon: <Box className="w-4 h-4" />,
    shortcut: '1',
  },
  {
    id: 'three-quarter-left',
    label: '3/4 L',
    icon: <Rotate3D className="w-4 h-4" />,
    shortcut: '5',
  },
  {
    id: 'left',
    label: 'Side',
    icon: <ChevronLeft className="w-4 h-4" />,
    shortcut: '3',
  },
  {
    id: 'right',
    label: 'Side',
    icon: <ChevronRight className="w-4 h-4" />,
    shortcut: '4',
  },
  {
    id: 'three-quarter-right',
    label: '3/4 R',
    icon: <Rotate3D className="w-4 h-4 scale-x-[-1]" />,
    shortcut: '6',
  },
  {
    id: 'back',
    label: 'Back',
    icon: <BoxSelect className="w-4 h-4" />,
    shortcut: '2',
  },
];

// ============================================================================
// Component
// ============================================================================

export function ViewToolbar({
  activePreset,
  onSelectPreset,
  autoRotate,
  onToggleAutoRotate,
  rotateSpeed,
  onChangeSpeed,
  className,
}: ViewToolbarProps) {
  const [showSpeedSlider, setShowSpeedSlider] = useState(false);

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2',
          'bg-zinc-900/95 backdrop-blur-md',
          'border border-zinc-800',
          'rounded-full shadow-2xl shadow-black/50',
          className
        )}
      >
        {/* View Presets */}
        <div className="flex items-center gap-1">
          {VIEW_PRESETS.map((preset) => {
            const isActive = activePreset === preset.id;
            return (
              <Tooltip key={preset.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectPreset(preset.id)}
                    className={cn(
                      'h-8 px-3 text-xs font-medium transition-all',
                      isActive
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    )}
                  >
                    <span className={cn('mr-1.5', isActive ? 'text-white' : 'text-zinc-500')}>
                      {preset.icon}
                    </span>
                    {preset.label}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-zinc-900 border-zinc-800">
                  <p className="text-xs">{preset.label} view</p>
                  <p className="text-[10px] text-zinc-500">Press {preset.shortcut}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-zinc-800" />

        {/* Auto Rotate Controls */}
        <div
          className="flex items-center gap-2"
          onMouseEnter={() => setShowSpeedSlider(true)}
          onMouseLeave={() => setShowSpeedSlider(false)}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleAutoRotate}
                className={cn(
                  'h-8 w-8 transition-colors',
                  autoRotate
                    ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20 hover:text-green-300'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                )}
              >
                {autoRotate ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-900 border-zinc-800">
              <p className="text-xs">{autoRotate ? 'Pause' : 'Play'} rotation (Space)</p>
            </TooltipContent>
          </Tooltip>

          {/* Speed Slider - appears on hover when auto-rotate is on */}
          <div
            className={cn(
              'flex items-center gap-2 overflow-hidden transition-all duration-200',
              showSpeedSlider && autoRotate ? 'w-28 opacity-100' : 'w-0 opacity-0'
            )}
          >
            <Gauge className="w-3 h-3 text-zinc-500 shrink-0" />
            <Slider
              value={[rotateSpeed]}
              min={0.5}
              max={5}
              step={0.5}
              onValueChange={([value]) => onChangeSpeed(value)}
              className="w-20"
            />
            <span className="text-[10px] text-zinc-400 w-4 tabular-nums">
              {rotateSpeed.toFixed(1)}x
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default ViewToolbar;
