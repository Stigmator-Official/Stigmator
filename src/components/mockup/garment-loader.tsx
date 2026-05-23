"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface GarmentLoaderProps {
  isLoading: boolean;
  progress?: number;
  className?: string;
}

export function GarmentLoader({ isLoading, progress, className }: GarmentLoaderProps) {
  const [dots, setDots] = useState("");
  
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className={cn(
      "absolute inset-0 z-50 flex flex-col items-center justify-center",
      "bg-[#0a0f0a]/90 backdrop-blur-sm",
      className
    )}>
      {/* Animated garment outline */}
      <div className="relative mb-8">
        <svg 
          width="80" 
          height="100" 
          viewBox="0 0 80 100" 
          fill="none" 
          className="animate-pulse"
        >
          {/* T-shirt outline */}
          <path
            d="M25 10 L15 25 L22 32 L30 24 L30 90 L50 90 L50 24 L58 32 L65 25 L55 10 Q40 15 25 10Z"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-[dash_2s_ease-in-out_infinite]"
            style={{
              strokeDasharray: 300,
              strokeDashoffset: 0,
            }}
          />
          <style>{`
            @keyframes dash {
              0%, 100% { stroke-dashoffset: 300; }
              50% { stroke-dashoffset: 0; }
            }
          `}</style>
        </svg>
      </div>

      {/* Progress text */}
      <div className="text-[#22c55e] font-mono text-sm tracking-wider">
        {typeof progress === "number" ? (
          <span>Loading {progress}%</span>
        ) : (
          <span>Loading{dots}</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-4 w-48 h-1 bg-[#22c55e]/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#22c55e] rounded-full transition-all duration-300"
          style={{ 
            width: typeof progress === "number" ? `${progress}%` : "60%",
            animation: typeof progress !== "number" ? "progress 1.5s ease-in-out infinite" : undefined
          }}
        />
        <style>{`
          @keyframes progress {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(0); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    </div>
  );
}
