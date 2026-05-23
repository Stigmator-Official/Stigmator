"use client";

import { ViewPreset } from "@/lib/mockup/use-mockup-state";
import { cn } from "@/lib/utils";
import { 
  Box,
  Square,
  ArrowLeftRight,
  FlipHorizontal,
  ArrowUp,
  ArrowDown,
  Keyboard
} from "lucide-react";

interface ViewPresetsProps {
  activePreset: ViewPreset;
  onChange: (preset: ViewPreset) => void;
  className?: string;
}

const PRESETS: { id: ViewPreset; label: string; icon: React.ReactNode; shortcut: string }[] = [
  { id: "front", label: "Front", icon: <Square className="w-4 h-4" />, shortcut: "1" },
  { id: "three-quarter", label: "3/4 View", icon: <Box className="w-4 h-4" />, shortcut: "2" },
  { id: "side", label: "Side", icon: <ArrowLeftRight className="w-4 h-4" />, shortcut: "3" },
  { id: "back", label: "Back", icon: <FlipHorizontal className="w-4 h-4" />, shortcut: "4" },
  { id: "top", label: "Top", icon: <ArrowUp className="w-4 h-4" />, shortcut: "5" },
  { id: "bottom", label: "Bottom", icon: <ArrowDown className="w-4 h-4" />, shortcut: "6" },
];

export function ViewPresets({ activePreset, onChange, className }: ViewPresetsProps) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {PRESETS.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onChange(preset.id)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium",
            "transition-all duration-200",
            activePreset === preset.id
              ? "bg-[#22c55e] text-[#0a0f0a]"
              : "bg-[#1a1a1a] text-[#e0e0e0]/70 hover:bg-[#22c55e]/20 hover:text-[#22c55e]"
          )}
          title={`${preset.label} (${preset.shortcut})`}
        >
          {preset.icon}
          <span className="hidden sm:inline">{preset.label}</span>
          <span className="text-[10px] opacity-60 font-mono ml-0.5">[{preset.shortcut}]</span>
        </button>
      ))}
    </div>
  );
}

interface ViewControlsProps {
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  onScreenshot: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  className?: string;
}

import { Play, Pause, Camera, Maximize, Minimize } from "lucide-react";

export function ViewControls({
  autoRotate,
  onToggleAutoRotate,
  onScreenshot,
  onFullscreen,
  isFullscreen,
  className,
}: ViewControlsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={onToggleAutoRotate}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium",
          "transition-all duration-200",
          autoRotate
            ? "bg-[#22c55e] text-[#0a0f0a]"
            : "bg-[#1a1a1a] text-[#e0e0e0]/70 hover:bg-[#22c55e]/20 hover:text-[#22c55e]"
        )}
        title="Toggle Auto-Rotate (Space)"
      >
        {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{autoRotate ? "Pause" : "Rotate"}</span>
      </button>

      <div className="w-px h-6 bg-[#22c55e]/20" />

      <button
        onClick={onScreenshot}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium",
          "bg-[#1a1a1a] text-[#e0e0e0]/70",
          "hover:bg-[#22c55e]/20 hover:text-[#22c55e]",
          "transition-all duration-200"
        )}
        title="Take Screenshot"
      >
        <Camera className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Capture</span>
      </button>

      <button
        onClick={onFullscreen}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium",
          "bg-[#1a1a1a] text-[#e0e0e0]/70",
          "hover:bg-[#22c55e]/20 hover:text-[#22c55e]",
          "transition-all duration-200"
        )}
        title="Toggle Fullscreen"
      >
        {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

// Keyboard shortcuts reference
export function KeyboardShortcuts() {
  const shortcuts = [
    { key: "Ctrl+S", action: "Save mockup" },
    { key: "Space", action: "Play/Pause rotation" },
    { key: "1-6", action: "View presets" },
    { key: "R", action: "Reset camera" },
    { key: "G", action: "Toggle grid" },
    { key: "P", action: "Toggle print area" },
    { key: "+/-", action: "Zoom in/out" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[#22c55e]">
        <Keyboard className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">Shortcuts</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-xs">
        {shortcuts.map(({ key, action }) => (
          <div key={key} className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-[#1a1a1a] rounded text-[#22c55e] font-mono text-[10px]">
              {key}
            </kbd>
            <span className="text-[#e0e0e0]/60">{action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
