"use client";

/**
 * Layer Panel Component for Stigmator 3D Mockup Generator
 * 
 * Right-side collapsible panel for layer management with
 * drag-and-drop reordering, visibility/lock toggles, and
 * opacity/blend mode controls.
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Layers,
  ChevronRight,
  ChevronLeft,
  GripVertical,
  Image,
  Shirt,
  Sparkles,
  Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type LayerType = 'garment' | 'design' | 'effect' | 'background';

export interface Layer {
  id: string;
  type: LayerType;
  name: string;
  visible: boolean;
  locked: boolean;
  thumbnail?: string;
  opacity?: number;
  blendMode?: string;
}

export interface LayerPanelProps {
  layers: Layer[];
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onSelect: (id: string) => void;
  selectedId?: string;
  onChangeOpacity?: (id: string, opacity: number) => void;
  onChangeBlendMode?: (id: string, mode: string) => void;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const BLEND_MODES = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'hard-light', label: 'Hard Light' },
];

const LAYER_ICONS: Record<LayerType, React.ReactNode> = {
  garment: <Shirt className="w-4 h-4" />,
  design: <Image className="w-4 h-4" />,
  effect: <Sparkles className="w-4 h-4" />,
  background: <Palette className="w-4 h-4" />,
};

// ============================================================================
// Component
// ============================================================================

export function LayerPanel({
  layers,
  onToggleVisibility,
  onToggleLock,
  onReorder,
  onSelect,
  selectedId,
  onChangeOpacity,
  onChangeBlendMode,
  className,
}: LayerPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedIndex !== null && draggedIndex !== dropIndex) {
        onReorder(draggedIndex, dropIndex);
      }
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex, onReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Reversed layers for display (top layer at top)
  const displayLayers = [...layers].reverse();

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
              <p className="text-xs">Expand layers</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-4 bg-zinc-800" />

          <div className="flex flex-col gap-1">
            {displayLayers.slice(0, 4).map((layer) => (
              <div
                key={layer.id}
                className={cn(
                  'w-8 h-8 rounded flex items-center justify-center',
                  layer.visible
                    ? layer.id === selectedId
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-zinc-800 text-zinc-400'
                    : 'bg-zinc-800/50 text-zinc-600'
                )}
              >
                {LAYER_ICONS[layer.type]}
              </div>
            ))}
            {displayLayers.length > 4 && (
              <div className="w-8 h-8 rounded bg-zinc-800/50 flex items-center justify-center text-[10px] text-zinc-500">
                +{displayLayers.length - 4}
              </div>
            )}
          </div>
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
            <Layers className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-200">Layers</span>
            <span className="text-xs text-zinc-500">({layers.length})</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Layer List */}
        <div className="flex-1 overflow-y-auto max-h-96 p-1.5 space-y-1">
          {displayLayers.map((layer, displayIndex) => {
            const originalIndex = layers.length - 1 - displayIndex;
            const isSelected = layer.id === selectedId;
            const isDragging = draggedIndex === originalIndex;
            const isDragOver = dragOverIndex === originalIndex;

            return (
              <div
                key={layer.id}
                draggable
                onDragStart={() => handleDragStart(originalIndex)}
                onDragOver={(e) => handleDragOver(e, originalIndex)}
                onDrop={(e) => handleDrop(e, originalIndex)}
                onDragEnd={handleDragEnd}
                onClick={() => onSelect(layer.id)}
                className={cn(
                  'group rounded-md transition-all cursor-pointer',
                  isSelected
                    ? 'bg-green-600/10 border border-green-600/30'
                    : 'bg-zinc-800/50 border border-transparent hover:border-zinc-700',
                  isDragging && 'opacity-50',
                  isDragOver && 'border-green-500/50 bg-green-500/5'
                )}
              >
                {/* Main Layer Row */}
                <div className="flex items-center gap-2 px-2 py-2">
                  {/* Drag Handle */}
                  <div className="text-zinc-600 group-hover:text-zinc-400 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-3 h-3" />
                  </div>

                  {/* Visibility Toggle */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleVisibility(layer.id);
                        }}
                        className={cn(
                          'text-zinc-500 hover:text-zinc-300 transition-colors',
                          !layer.visible && 'text-zinc-700'
                        )}
                      >
                        {layer.visible ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="bg-zinc-900 border-zinc-800">
                      <p className="text-xs">{layer.visible ? 'Hide' : 'Show'} layer</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Lock Toggle */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLock(layer.id);
                        }}
                        className={cn(
                          'text-zinc-500 hover:text-zinc-300 transition-colors',
                          layer.locked && 'text-amber-500'
                        )}
                      >
                        {layer.locked ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="bg-zinc-900 border-zinc-800">
                      <p className="text-xs">{layer.locked ? 'Unlock' : 'Lock'} layer</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Thumbnail */}
                  <div
                    className={cn(
                      'w-8 h-8 rounded flex items-center justify-center shrink-0',
                      layer.type === 'garment' && 'bg-zinc-700',
                      layer.type === 'design' && 'bg-zinc-700',
                      layer.type === 'effect' && 'bg-zinc-700',
                      layer.type === 'background' && 'bg-zinc-700',
                      !layer.visible && 'opacity-40'
                    )}
                  >
                    {layer.thumbnail ? (
                      <img
                        src={layer.thumbnail}
                        alt={layer.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <span
                        className={cn(
                          'text-zinc-400',
                          !layer.visible && 'text-zinc-600'
                        )}
                      >
                        {LAYER_ICONS[layer.type]}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <span
                    className={cn(
                      'text-sm flex-1 truncate',
                      isSelected ? 'text-green-400' : 'text-zinc-300',
                      !layer.visible && 'text-zinc-600'
                    )}
                  >
                    {layer.name}
                  </span>
                </div>

                {/* Opacity & Blend Mode Controls (shown when selected or on hover for design layers) */}
                {(isSelected || layer.type === 'design') && (
                  <div className="px-2 pb-2 space-y-2">
                    {/* Opacity Slider */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 w-10">Opacity</span>
                      <Slider
                        value={[layer.opacity ?? 100]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={([value]) => onChangeOpacity?.(layer.id, value)}
                        className="flex-1"
                      />
                      <span className="text-[10px] text-zinc-400 w-7 text-right tabular-nums">
                        {layer.opacity ?? 100}%
                      </span>
                    </div>

                    {/* Blend Mode (design layers only) */}
                    {layer.type === 'design' && onChangeBlendMode && (
                      <div className="flex items-center gap-2">
                        <Palette className="w-3 h-3 text-zinc-500" />
                        <select
                          value={layer.blendMode || 'normal'}
                          onChange={(e) => onChangeBlendMode(layer.id, e.target.value)}
                          className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-green-600"
                        >
                          {BLEND_MODES.map((mode) => (
                            <option key={mode.value} value={mode.value}>
                              {mode.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default LayerPanel;
