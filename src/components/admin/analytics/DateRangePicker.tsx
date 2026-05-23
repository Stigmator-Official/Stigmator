"use client";

import React, { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type DateRange = "today" | "7d" | "30d" | "90d" | "custom";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange, startDate?: string, endDate?: string) => void;
  className?: string;
}

const presets: { value: DateRange; label: string; shortcut?: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 Days", shortcut: "W" },
  { value: "30d", label: "30 Days", shortcut: "M" },
  { value: "90d", label: "90 Days", shortcut: "Q" },
];

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getPresetDates(range: DateRange): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  
  switch (range) {
    case "today":
      return { start: formatDate(start), end: formatDate(end) };
    case "7d":
      start.setDate(start.getDate() - 7);
      return { start: formatDate(start), end: formatDate(end) };
    case "30d":
      start.setDate(start.getDate() - 30);
      return { start: formatDate(start), end: formatDate(end) };
    case "90d":
      start.setDate(start.getDate() - 90);
      return { start: formatDate(start), end: formatDate(end) };
    default:
      return { start: formatDate(start), end: formatDate(end) };
  }
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case "t":
            onChange("today");
            break;
          case "w":
            onChange("7d");
            break;
          case "m":
            onChange("30d");
            break;
          case "q":
            onChange("90d");
            break;
        }
      }
    }
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onChange]);
  
  const handlePresetClick = (preset: DateRange) => {
    onChange(preset);
    setIsOpen(false);
  };
  
  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onChange("custom", customStart, customEnd);
      setIsOpen(false);
    }
  };
  
  const getDisplayLabel = () => {
    const preset = presets.find((p) => p.value === value);
    if (preset) return preset.label;
    if (value === "custom" && customStart && customEnd) {
      return `${customStart} - ${customEnd}`;
    }
    return "Custom Range";
  };
  
  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5",
          "bg-[#0a0f0a] border border-[#1a2e1a]",
          "text-[#e8f5e8] text-sm font-mono",
          "hover:border-[#4ade80]/50 hover:bg-[#0f1a0f]",
          "transition-all duration-200",
          "focus:outline-none focus:border-[#4ade80]",
          isOpen && "border-[#4ade80] bg-[#0f1a0f]"
        )}
      >
        <CalendarIcon className="w-4 h-4 text-[#4ade80]" />
        <span>{getDisplayLabel()}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-[#6b8e6b] ml-2 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div
          className={cn(
            "absolute right-0 top-full mt-2 z-50",
            "w-80 bg-[#0a0f0a] border border-[#1a2e1a]",
            "shadow-2xl shadow-black/50"
          )}
        >
          {/* Presets */}
          <div className="p-3 border-b border-[#1a2e1a]">
            <p className="text-xs font-mono text-[#6b8e6b] uppercase mb-2">Quick Select</p>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetClick(preset.value)}
                  className={cn(
                    "px-3 py-2 text-sm font-mono text-left",
                    "border transition-all duration-150",
                    value === preset.value
                      ? "bg-[#4ade80] text-black border-[#4ade80]"
                      : "bg-[#050805] text-[#e8f5e8] border-[#1a2e1a] hover:border-[#4ade80]/50"
                  )}
                >
                  <span className="font-bold">{preset.label}</span>
                  {preset.shortcut && (
                    <span className="ml-2 text-xs opacity-60">Alt+{preset.shortcut}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Custom Range */}
          <div className="p-3">
            <p className="text-xs font-mono text-[#6b8e6b] uppercase mb-2">Custom Range</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#6b8e6b] mb-1 block">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2",
                    "bg-[#050805] border border-[#1a2e1a]",
                    "text-[#e8f5e8] text-sm font-mono",
                    "focus:outline-none focus:border-[#4ade80]",
                    "[color-scheme:dark]"
                  )}
                />
              </div>
              <div>
                <label className="text-xs text-[#6b8e6b] mb-1 block">End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2",
                    "bg-[#050805] border border-[#1a2e1a]",
                    "text-[#e8f5e8] text-sm font-mono",
                    "focus:outline-none focus:border-[#4ade80]",
                    "[color-scheme:dark]"
                  )}
                />
              </div>
              <button
                onClick={handleCustomApply}
                disabled={!customStart || !customEnd}
                className={cn(
                  "w-full px-4 py-2",
                  "bg-[#4ade80] text-black font-bold font-mono text-sm",
                  "hover:bg-[#3ec46e] transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#4ade80]"
                )}
              >
                Apply Custom Range
              </button>
            </div>
          </div>
          
          {/* Footer hint */}
          <div className="px-3 py-2 bg-[#050805] border-t border-[#1a2e1a]">
            <p className="text-xs text-[#6b8e6b]">
              Use <kbd className="px-1 bg-[#1a2e1a] text-[#e8f5e8]">Alt</kbd> + shortcut keys for quick selection
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;
