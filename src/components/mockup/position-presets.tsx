'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Bookmark, Heart, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type GarmentType = 'tshirt' | 'hoodie' | 'tank' | 'longsleeve' | 'sweatshirt' | 'polo';

export interface TransformPreset {
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

export interface PositionPreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  transform: TransformPreset;
  isCustom?: boolean;
}

// Icon components for different positions
const ChestCenterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="6" y="4" width="12" height="16" rx="2" className="opacity-40" />
    <rect x="10" y="7" width="4" height="4" rx="0.5" />
  </svg>
);

const LeftChestIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="6" y="4" width="12" height="16" rx="2" className="opacity-40" />
    <rect x="7" y="7" width="4" height="3" rx="0.5" />
  </svg>
);

const FullFrontIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="6" y="4" width="12" height="16" rx="2" className="opacity-40" />
    <rect x="8" y="6" width="8" height="12" rx="0.5" />
  </svg>
);

const UpperBackIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="6" y="4" width="12" height="16" rx="2" className="opacity-40" />
    <rect x="9" y="5" width="6" height="4" rx="0.5" />
  </svg>
);

const FullBackIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="6" y="4" width="12" height="16" rx="2" className="opacity-40" />
    <rect x="8" y="5" width="8" height="14" rx="0.5" />
  </svg>
);

const SleeveLeftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="6" y="4" width="12" height="16" rx="2" className="opacity-40" />
    <rect x="4" y="6" width="3" height="5" rx="0.5" transform="rotate(-15 5.5 8.5)" />
  </svg>
);

const SleeveRightIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="6" y="4" width="12" height="16" rx="2" className="opacity-40" />
    <rect x="17" y="6" width="3" height="5" rx="0.5" transform="rotate(15 18.5 8.5)" />
  </svg>
);

const CenterBackIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="6" y="4" width="12" height="16" rx="2" className="opacity-40" />
    <rect x="10" y="8" width="4" height="6" rx="0.5" />
  </svg>
);

const LowerBackIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="6" y="4" width="12" height="16" rx="2" className="opacity-40" />
    <rect x="9" y="15" width="6" height="4" rx="0.5" />
  </svg>
);

const HoodFrontIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="6" y="6" width="12" height="14" rx="2" className="opacity-40" />
    <path d="M8 6c0-3 2-4 4-4s4 1 4 4" />
    <rect x="10" y="9" width="4" height="4" rx="0.5" />
  </svg>
);

// Preset definitions for each garment type
const DEFAULT_PRESETS: Record<GarmentType, Omit<PositionPreset, 'id'>[]> = {
  tshirt: [
    { name: 'Chest Center', icon: <ChestCenterIcon />, transform: { position: { x: 0, y: -15 }, scale: 100, rotation: 0 } },
    { name: 'Left Chest', icon: <LeftChestIcon />, transform: { position: { x: -20, y: -20 }, scale: 60, rotation: 0 } },
    { name: 'Full Front', icon: <FullFrontIcon />, transform: { position: { x: 0, y: -5 }, scale: 140, rotation: 0 } },
    { name: 'Upper Back', icon: <UpperBackIcon />, transform: { position: { x: 0, y: -25 }, scale: 80, rotation: 0 } },
    { name: 'Full Back', icon: <FullBackIcon />, transform: { position: { x: 0, y: -5 }, scale: 150, rotation: 0 } },
    { name: 'Sleeve Left', icon: <SleeveLeftIcon />, transform: { position: { x: -35, y: -25 }, scale: 40, rotation: -15 } },
    { name: 'Sleeve Right', icon: <SleeveRightIcon />, transform: { position: { x: 35, y: -25 }, scale: 40, rotation: 15 } },
  ],
  hoodie: [
    { name: 'Chest Center', icon: <ChestCenterIcon />, transform: { position: { x: 0, y: -10 }, scale: 90, rotation: 0 } },
    { name: 'Full Front', icon: <FullFrontIcon />, transform: { position: { x: 0, y: 0 }, scale: 130, rotation: 0 } },
    { name: 'Hood Front', icon: <HoodFrontIcon />, transform: { position: { x: 0, y: -35 }, scale: 70, rotation: 0 } },
    { name: 'Center Back', icon: <CenterBackIcon />, transform: { position: { x: 0, y: -10 }, scale: 100, rotation: 0 } },
    { name: 'Full Back', icon: <FullBackIcon />, transform: { position: { x: 0, y: 5 }, scale: 140, rotation: 0 } },
    { name: 'Sleeve Left', icon: <SleeveLeftIcon />, transform: { position: { x: -38, y: -20 }, scale: 45, rotation: -10 } },
    { name: 'Sleeve Right', icon: <SleeveRightIcon />, transform: { position: { x: 38, y: -20 }, scale: 45, rotation: 10 } },
  ],
  tank: [
    { name: 'Chest Center', icon: <ChestCenterIcon />, transform: { position: { x: 0, y: -20 }, scale: 95, rotation: 0 } },
    { name: 'Left Chest', icon: <LeftChestIcon />, transform: { position: { x: -18, y: -22 }, scale: 55, rotation: 0 } },
    { name: 'Full Front', icon: <FullFrontIcon />, transform: { position: { x: 0, y: -5 }, scale: 135, rotation: 0 } },
    { name: 'Upper Back', icon: <UpperBackIcon />, transform: { position: { x: 0, y: -30 }, scale: 85, rotation: 0 } },
    { name: 'Full Back', icon: <FullBackIcon />, transform: { position: { x: 0, y: -5 }, scale: 145, rotation: 0 } },
  ],
  longsleeve: [
    { name: 'Chest Center', icon: <ChestCenterIcon />, transform: { position: { x: 0, y: -18 }, scale: 95, rotation: 0 } },
    { name: 'Left Chest', icon: <LeftChestIcon />, transform: { position: { x: -18, y: -22 }, scale: 55, rotation: 0 } },
    { name: 'Full Front', icon: <FullFrontIcon />, transform: { position: { x: 0, y: 0 }, scale: 130, rotation: 0 } },
    { name: 'Upper Back', icon: <UpperBackIcon />, transform: { position: { x: 0, y: -28 }, scale: 85, rotation: 0 } },
    { name: 'Sleeve Left', icon: <SleeveLeftIcon />, transform: { position: { x: -42, y: -15 }, scale: 50, rotation: -5 } },
    { name: 'Sleeve Right', icon: <SleeveRightIcon />, transform: { position: { x: 42, y: -15 }, scale: 50, rotation: 5 } },
  ],
  sweatshirt: [
    { name: 'Chest Center', icon: <ChestCenterIcon />, transform: { position: { x: 0, y: -12 }, scale: 95, rotation: 0 } },
    { name: 'Full Front', icon: <FullFrontIcon />, transform: { position: { x: 0, y: 5 }, scale: 140, rotation: 0 } },
    { name: 'Upper Back', icon: <UpperBackIcon />, transform: { position: { x: 0, y: -25 }, scale: 80, rotation: 0 } },
    { name: 'Full Back', icon: <FullBackIcon />, transform: { position: { x: 0, y: 0 }, scale: 145, rotation: 0 } },
    { name: 'Sleeve Left', icon: <SleeveLeftIcon />, transform: { position: { x: -40, y: -18 }, scale: 45, rotation: -8 } },
    { name: 'Sleeve Right', icon: <SleeveRightIcon />, transform: { position: { x: 40, y: -18 }, scale: 45, rotation: 8 } },
  ],
  polo: [
    { name: 'Chest Center', icon: <ChestCenterIcon />, transform: { position: { x: 0, y: -18 }, scale: 85, rotation: 0 } },
    { name: 'Left Chest', icon: <LeftChestIcon />, transform: { position: { x: -18, y: -20 }, scale: 50, rotation: 0 } },
    { name: 'Full Front', icon: <FullFrontIcon />, transform: { position: { x: 0, y: -5 }, scale: 125, rotation: 0 } },
    { name: 'Upper Back', icon: <UpperBackIcon />, transform: { position: { x: 0, y: -25 }, scale: 80, rotation: 0 } },
    { name: 'Lower Back', icon: <LowerBackIcon />, transform: { position: { x: 0, y: 20 }, scale: 100, rotation: 0 } },
  ],
};

interface PositionPresetsProps {
  garmentType: GarmentType;
  onSelect: (preset: PositionPreset) => void;
  onHover?: (preset: PositionPreset | null) => void;
  currentTransform?: TransformPreset;
  onSaveCustom?: (preset: Omit<PositionPreset, 'id'>) => void;
  customPresets?: PositionPreset[];
  onDeleteCustom?: (id: string) => void;
  className?: string;
}

export function PositionPresets({
  garmentType,
  onSelect,
  onHover,
  currentTransform,
  onSaveCustom,
  customPresets = [],
  onDeleteCustom,
  className,
}: PositionPresetsProps) {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [hoveredPreset, setHoveredPreset] = useState<string | null>(null);

  // Generate presets with IDs
  const presets: PositionPreset[] = React.useMemo(() => {
    const defaults = DEFAULT_PRESETS[garmentType] || DEFAULT_PRESETS.tshirt;
    return [
      ...defaults.map((p, i) => ({ ...p, id: `${garmentType}-default-${i}` })),
      ...customPresets.map((p) => ({ ...p, isCustom: true })),
    ];
  }, [garmentType, customPresets]);

  const handleMouseEnter = (preset: PositionPreset) => {
    setHoveredPreset(preset.id);
    onHover?.(preset);
  };

  const handleMouseLeave = () => {
    setHoveredPreset(null);
    onHover?.(null);
  };

  const handleSaveCustom = () => {
    if (!customName.trim() || !currentTransform || !onSaveCustom) return;

    onSaveCustom({
      name: customName.trim(),
      icon: <Bookmark className="h-5 w-5" />,
      transform: { ...currentTransform },
    });
    setCustomName('');
    setIsSaveDialogOpen(false);
  };

  // Check if current transform matches a preset
  const isActivePreset = (preset: PositionPreset) => {
    if (!currentTransform) return false;
    const t = preset.transform;
    const c = currentTransform;
    return (
      Math.abs(t.position.x - c.position.x) < 1 &&
      Math.abs(t.position.y - c.position.y) < 1 &&
      Math.abs(t.scale - c.scale) < 1 &&
      Math.abs(t.rotation - c.rotation) < 1
    );
  };

  return (
    <TooltipProvider>
      <div className={cn('space-y-4', className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-300">Position Presets</h3>
          {onSaveCustom && currentTransform && (
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-slate-400 hover:text-slate-200">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Save
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800">
                <DialogHeader>
                  <DialogTitle className="text-slate-200">Save Custom Preset</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-slate-400">Preset Name</Label>
                    <Input
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g., My Custom Position"
                      className="bg-slate-800 border-slate-700 text-slate-200"
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveCustom()}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-800/50 p-3 rounded">
                    <div>Position: {Math.round(currentTransform.position.x)}%, {Math.round(currentTransform.position.y)}%</div>
                    <div>Scale: {Math.round(currentTransform.scale)}%</div>
                    <div>Rotation: {Math.round(currentTransform.rotation)}°</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-slate-700 text-slate-300"
                      onClick={() => setIsSaveDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                      onClick={handleSaveCustom}
                      disabled={!customName.trim()}
                    >
                      Save Preset
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Preset Grid */}
        <div className="grid grid-cols-3 gap-2">
          {presets.map((preset) => (
            <Tooltip key={preset.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelect(preset)}
                  onMouseEnter={() => handleMouseEnter(preset)}
                  onMouseLeave={handleMouseLeave}
                  className={cn(
                    'relative flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200',
                    'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
                    isActivePreset(preset)
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600',
                    hoveredPreset === preset.id && !isActivePreset(preset) && 'bg-slate-800 border-slate-600'
                  )}
                >
                  <div className={cn(
                    'transition-colors',
                    isActivePreset(preset) ? 'text-indigo-400' : 'text-slate-500'
                  )}>
                    {preset.icon}
                  </div>
                  <span className="text-[10px] font-medium truncate w-full text-center">{preset.name}</span>

                  {/* Favorite indicator for custom presets */}
                  {preset.isCustom && (
                    <Heart className="absolute top-1 right-1 h-2.5 w-2.5 text-pink-500 fill-pink-500" />
                  )}

                  {/* Delete button for custom presets */}
                  {preset.isCustom && onDeleteCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCustom(preset.id);
                      }}
                      className="absolute top-1 left-1 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-opacity"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-slate-800 border-slate-700">
                <div className="text-xs space-y-1">
                  <p className="font-medium text-slate-200">{preset.name}</p>
                  <p className="text-slate-400">
                    X: {preset.transform.position.x}% • Y: {preset.transform.position.y}%
                  </p>
                  <p className="text-slate-400">
                    Scale: {preset.transform.scale}% • Rotation: {preset.transform.rotation}°
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Ghost Preview Indicator */}
        {hoveredPreset && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-indigo-500/50 animate-pulse" />
            <span>Previewing: {presets.find((p) => p.id === hoveredPreset)?.name}</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export { DEFAULT_PRESETS };
export default PositionPresets;
