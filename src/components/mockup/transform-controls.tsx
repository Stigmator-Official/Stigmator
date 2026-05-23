"use client";

import { TransformState } from "@/lib/mockup/use-mockup-state";
import { cn } from "@/lib/utils";
import { 
  Move, 
  Maximize2, 
  RotateCw, 
  MoveHorizontal,
  MoveVertical,
  RotateCcw
} from "lucide-react";

interface TransformControlsProps {
  transform: TransformState;
  onChange: (transform: Partial<TransformState>) => void;
  onReset: () => void;
  disabled?: boolean;
  className?: string;
}

interface SliderProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
}

function ControlSlider({ 
  label, 
  icon, 
  value, 
  min, 
  max, 
  step, 
  unit = "",
  onChange,
  disabled
}: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#e0e0e0]/70">
          {icon}
          <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-xs text-[#22c55e] font-mono">
          {value.toFixed(step < 1 ? 1 : 0)}{unit}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={disabled}
          className="w-6 h-6 flex items-center justify-center rounded bg-[#1a1a1a] text-[#e0e0e0]/50 hover:bg-[#22c55e]/20 hover:text-[#22c55e] transition-colors disabled:opacity-50"
        >
          -
        </button>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className={cn(
            "flex-1 h-1.5 rounded-full appearance-none cursor-pointer",
            "bg-[#1a1a1a] accent-[#22c55e]",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#22c55e]",
            "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform",
            "[&::-webkit-slider-thumb]:hover:scale-125",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={disabled}
          className="w-6 h-6 flex items-center justify-center rounded bg-[#1a1a1a] text-[#e0e0e0]/50 hover:bg-[#22c55e]/20 hover:text-[#22c55e] transition-colors disabled:opacity-50"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function TransformControls({
  transform,
  onChange,
  onReset,
  disabled = false,
  className,
}: TransformControlsProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Position Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#22c55e]">
            <Move className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Position</span>
          </div>
        </div>
        
        <ControlSlider
          label="Horizontal (X)"
          icon={<MoveHorizontal className="w-3 h-3" />}
          value={transform.x}
          min={-100}
          max={100}
          step={1}
          unit="%"
          onChange={(x) => onChange({ x })}
          disabled={disabled}
        />
        
        <ControlSlider
          label="Vertical (Y)"
          icon={<MoveVertical className="w-3 h-3" />}
          value={transform.y}
          min={-100}
          max={100}
          step={1}
          unit="%"
          onChange={(y) => onChange({ y })}
          disabled={disabled}
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-[#22c55e]/20" />

      {/* Scale Control */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#22c55e]">
            <Maximize2 className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Scale</span>
          </div>
          <button
            onClick={onReset}
            disabled={disabled}
            className="text-xs text-[#e0e0e0]/50 hover:text-[#22c55e] transition-colors disabled:opacity-50"
          >
            Reset
          </button>
        </div>
        
        <ControlSlider
          label="Size"
          icon={<Maximize2 className="w-3 h-3" />}
          value={transform.scale}
          min={0.1}
          max={3}
          step={0.1}
          unit="x"
          onChange={(scale) => onChange({ scale })}
          disabled={disabled}
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-[#22c55e]/20" />

      {/* Rotation Control */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#22c55e]">
            <RotateCw className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Rotation</span>
          </div>
        </div>
        
        <ControlSlider
          label="Angle"
          icon={<RotateCcw className="w-3 h-3" />}
          value={transform.rotation}
          min={-180}
          max={180}
          step={5}
          unit="°"
          onChange={(rotation) => onChange({ rotation })}
          disabled={disabled}
        />
        
        {/* Quick rotation buttons */}
        <div className="flex gap-2">
          {[-90, -45, 0, 45, 90].map((angle) => (
            <button
              key={angle}
              onClick={() => onChange({ rotation: angle })}
              disabled={disabled}
              className={cn(
                "flex-1 py-1.5 px-2 text-xs font-mono rounded",
                "bg-[#1a1a1a] text-[#e0e0e0]/70",
                "hover:bg-[#22c55e]/20 hover:text-[#22c55e]",
                "transition-colors disabled:opacity-50",
                transform.rotation === angle && "bg-[#22c55e]/20 text-[#22c55e]"
              )}
            >
              {angle}°
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
