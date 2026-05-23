"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  className,
}: SliderProps) {
  const isRange = value.length === 2;
  
  const handleChange = (index: number, newValue: number) => {
    const newValues = [...value];
    newValues[index] = newValue;
    
    // Ensure range values don't cross
    if (isRange) {
      if (index === 0 && newValue > value[1]) {
        newValues[0] = value[1];
      } else if (index === 1 && newValue < value[0]) {
        newValues[1] = value[0];
      }
    }
    
    onValueChange(newValues);
  };

  if (isRange) {
    // Dual handle range slider
    const minPercent = ((value[0] - min) / (max - min)) * 100;
    const maxPercent = ((value[1] - min) / (max - min)) * 100;

    return (
      <div className={cn("relative w-full h-6", className)}>
        {/* Track background */}
        <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 bg-[#1a2e1a] rounded-full" />
        
        {/* Active track */}
        <div 
          className="absolute top-1/2 h-2 -translate-y-1/2 bg-[#4ade80] rounded-full"
          style={{ 
            left: `${minPercent}%`, 
            width: `${maxPercent - minPercent}%` 
          }}
        />
        
        {/* Min handle */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => handleChange(0, parseFloat(e.target.value))}
          disabled={disabled}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-full h-6 appearance-none bg-transparent cursor-pointer z-10",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#4ade80]",
            "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform",
            "[&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:shadow-lg",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          style={{ pointerEvents: "auto" }}
        />
        
        {/* Max handle */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={(e) => handleChange(1, parseFloat(e.target.value))}
          disabled={disabled}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-full h-6 appearance-none bg-transparent cursor-pointer z-20",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#4ade80]",
            "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform",
            "[&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:shadow-lg",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          style={{ pointerEvents: "auto" }}
        />
      </div>
    );
  }

  // Single value slider
  const percentage = ((value[0] - min) / (max - min)) * 100;

  return (
    <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onValueChange([parseFloat(e.target.value)])}
        disabled={disabled}
        className={cn(
          "absolute w-full h-2 rounded-full appearance-none cursor-pointer bg-transparent z-10",
          "[&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
          "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#4ade80]",
          "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform",
          "[&::-webkit-slider-thumb]:hover:scale-125",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
      <div
        className="absolute h-2 rounded-full bg-[#4ade80] pointer-events-none"
        style={{ width: `${percentage}%` }}
      />
      <div className="w-full h-2 rounded-full bg-[#1a2e1a]" />
    </div>
  );
}
