"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Grid3X3, 
  LayoutList, 
  ImageIcon,
  Check,
  X,
  Sparkles,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface Design {
  id: string;
  name: string;
  image_url: string;
  thumbnail_url?: string;
  style?: string;
  created_at?: string;
  description?: string;
}

interface DesignSelectorProps {
  selectedDesigns: Design[];
  onDesignsChange: (designs: Design[]) => void;
  maxSelections?: number;
  artistId?: string;
}

export function DesignSelector({ 
  selectedDesigns, 
  onDesignsChange, 
  maxSelections = 6,
  artistId 
}: DesignSelectorProps) {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStyle, setFilterStyle] = useState<string | null>(null);
  
  // Fetch designs
  useEffect(() => {
    const fetchDesigns = async () => {
      setIsLoading(true);
      try {
        // Try to fetch from API
        const response = await fetch(`/api/designs${artistId ? `?artist_id=${artistId}` : ""}`);
        if (response.ok) {
          const data = await response.json();
          setDesigns(data.designs || []);
        } else {
          // Fallback to mock data for demo
          setDesigns(getMockDesigns());
        }
      } catch (error) {
        console.error("Error fetching designs:", error);
        setDesigns(getMockDesigns());
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDesigns();
  }, [artistId]);
  
  // Filter designs
  const filteredDesigns = designs.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (d.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesStyle = filterStyle ? d.style === filterStyle : true;
    return matchesSearch && matchesStyle;
  });
  
  // Get unique styles for filter
  const styles = Array.from(new Set(designs.map(d => d.style).filter(Boolean)));
  
  const toggleDesign = (design: Design) => {
    const isSelected = selectedDesigns.find(d => d.id === design.id);
    
    if (isSelected) {
      onDesignsChange(selectedDesigns.filter(d => d.id !== design.id));
    } else if (selectedDesigns.length < maxSelections) {
      onDesignsChange([...selectedDesigns, design]);
    }
  };
  
  const removeDesign = (designId: string) => {
    onDesignsChange(selectedDesigns.filter(d => d.id !== designId));
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 bg-[#0a0f0a] border border-[#1a2e1a]">
        <Loader2 className="h-8 w-8 text-[#4ade80] animate-spin mr-3" />
        <span className="text-[#6b8e6b] font-mono text-sm">LOADING DESIGNS...</span>
      </div>
    );
  }
  
  if (designs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-[#0a0f0a] border border-[#1a2e1a]">
        <ImageIcon className="h-12 w-12 text-[#6b8e6b] mb-4" />
        <h3 className="font-black tracking-tighter text-[#e8f5e8] mb-2">NO DESIGNS FOUND</h3>
        <p className="text-sm text-[#6b8e6b] text-center max-w-md mb-4">
          You don&apos;t have any designs yet. Create a design first to start making garments.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Selected Designs Bar */}
      {selectedDesigns.length > 0 && (
        <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-[#6b8e6b]">
              SELECTED ({selectedDesigns.length}/{maxSelections})
            </span>
            <button 
              onClick={() => onDesignsChange([])}
              className="text-xs text-[#dc2626] hover:underline"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {selectedDesigns.map((design) => (
                <motion.div
                  key={design.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center gap-2 bg-[#1a2e1a] px-3 py-2"
                >
                  <div className="w-8 h-8 bg-[#050805] flex items-center justify-center text-xs">
                    {design.thumbnail_url ? (
                      <img src={design.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      "🎨"
                    )}
                  </div>
                  <span className="text-xs text-[#e8f5e8] truncate max-w-[100px]">
                    {design.name}
                  </span>
                  <button 
                    onClick={() => removeDesign(design.id)}
                    className="text-[#6b8e6b] hover:text-[#dc2626]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
      
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
          <Input
            placeholder="Search designs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#0a0f0a] border-[#1a2e1a] rounded-none h-10 text-[#e8f5e8] placeholder:text-[#6b8e6b]"
          />
        </div>
        
        <div className="flex gap-2">
          {styles.length > 0 && (
            <select
              value={filterStyle || ""}
              onChange={(e) => setFilterStyle(e.target.value || null)}
              className="bg-[#0a0f0a] border border-[#1a2e1a] text-[#e8f5e8] text-sm px-3 h-10"
            >
              <option value="">All Styles</option>
              {styles.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          )}
          
          <div className="flex border border-[#1a2e1a]">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "bg-[#1a2e1a] text-[#4ade80]" : "text-[#6b8e6b]"}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "bg-[#1a2e1a] text-[#4ade80]" : "text-[#6b8e6b]"}`}
            >
              <LayoutList className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Designs Grid/List */}
      <div className={viewMode === "grid" 
        ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3" 
        : "space-y-2"
      }>
        {filteredDesigns.map((design) => {
          const isSelected = selectedDesigns.find(d => d.id === design.id);
          const isMaxReached = selectedDesigns.length >= maxSelections && !isSelected;
          
          return (
            <motion.button
              key={design.id}
              onClick={() => !isMaxReached && toggleDesign(design)}
              disabled={isMaxReached}
              whileHover={!isMaxReached ? { scale: 1.02 } : {}}
              whileTap={!isMaxReached ? { scale: 0.98 } : {}}
              className={`relative border-2 text-left transition-all ${
                isSelected
                  ? "border-[#4ade80] bg-[#4ade80]/10"
                  : isMaxReached
                    ? "border-[#1a2e1a] opacity-50 cursor-not-allowed"
                    : "border-[#1a2e1a] hover:border-[#4ade80]/50 bg-[#0a0f0a]"
              } ${viewMode === "list" ? "flex items-center gap-3 p-3" : "p-3"}`}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-[#4ade80] flex items-center justify-center z-10">
                  <Check className="h-4 w-4 text-black" />
                </div>
              )}
              
              {/* Design Image */}
              <div className={`bg-[#050805] flex items-center justify-center overflow-hidden ${
                viewMode === "grid" ? "aspect-square mb-2" : "w-16 h-16 flex-shrink-0"
              }`}>
                {design.thumbnail_url || design.image_url ? (
                  <img 
                    src={design.thumbnail_url || design.image_url} 
                    alt={design.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Sparkles className="h-8 w-8 text-[#6b8e6b]" />
                )}
              </div>
              
              {/* Design Info */}
              <div className={viewMode === "list" ? "flex-1 min-w-0" : ""}>
                <div className="font-black tracking-tighter text-[#e8f5e8] text-sm truncate">
                  {design.name}
                </div>
                {design.style && (
                  <div className="text-xs text-[#6b8e6b] font-mono">
                    {design.style}
                  </div>
                )}
              </div>
              
              {/* Selection Number */}
              {isSelected && (
                <div className={`text-xs font-black text-[#4ade80] ${
                  viewMode === "list" ? "ml-auto" : "mt-1"
                }`}>
                  #{selectedDesigns.findIndex(d => d.id === design.id) + 1}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
      
      {/* Empty State */}
      {filteredDesigns.length === 0 && (
        <div className="text-center py-8 text-[#6b8e6b]">
          <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No designs match your filters</p>
        </div>
      )}
    </div>
  );
}

// Pre-computed base64 SVG placeholders (works in both SSR and client)
const PLACEHOLDER_SVGS: Record<string, string> = {
  snake: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM4QjAwMDAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IndoaXRlIj7wnYyPPC90ZXh0Pjwvc3ZnPg==",
  wolf: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM0QjAwODIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IndoaXRlIj7wnYy1PC90ZXh0Pjwvc3ZnPg==",
  dragon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMwMDY0MDAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IndoaXRlIj7wnYyQPC90ZXh0Pjwvc3ZnPg==",
  rose: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMxYTFhMWEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IndoaXRlIj7wn4yfPC90ZXh0Pjwvc3ZnPg==",
  cat: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGRjY5QjQiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IndoaXRlIj7wn4ypPC90ZXh0Pjwvc3ZnPg==",
  moon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyRjRGNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI2MCIgZmlsbD0id2hpdGUiPvCfjb08L3RleHQ+PC9zdmc+",
  phoenix: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGRjQ1MDAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IndoaXRlIj7wn4yUPC90ZXh0Pjwvc3ZnPg==",
  skull: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM0QjAwODIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IndoaXRlIj7wn4ysPC90ZXh0Pjwvc3ZnPg==",
  script: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM4QjQ1MTMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IndoaXRlIj7wn4ytPC90ZXh0Pjwvc3ZnPg==",
  mandala: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM0ODNEOEIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IndoaXRlIj7ijHs8L3RleHQ+PC9zdmc+",
};

// Mock designs for demo mode - using pre-computed data URLs that work in SSR
function getMockDesigns(): Design[] {
  return [
    { id: "1", name: "Traditional Snake", image_url: PLACEHOLDER_SVGS.snake, thumbnail_url: PLACEHOLDER_SVGS.snake, style: "Traditional", description: "Classic american traditional snake design" },
    { id: "2", name: "Geometric Wolf", image_url: PLACEHOLDER_SVGS.wolf, thumbnail_url: PLACEHOLDER_SVGS.wolf, style: "Geometric", description: "Sacred geometry wolf head" },
    { id: "3", name: "Japanese Dragon", image_url: PLACEHOLDER_SVGS.dragon, thumbnail_url: PLACEHOLDER_SVGS.dragon, style: "Japanese", description: "Irezumi style dragon" },
    { id: "4", name: "Blackwork Rose", image_url: PLACEHOLDER_SVGS.rose, thumbnail_url: PLACEHOLDER_SVGS.rose, style: "Blackwork", description: "Bold black rose illustration" },
    { id: "5", name: "Neo-Traditional Cat", image_url: PLACEHOLDER_SVGS.cat, thumbnail_url: PLACEHOLDER_SVGS.cat, style: "Neo-Traditional", description: "Vibrant cat portrait" },
    { id: "6", name: "Minimalist Moon", image_url: PLACEHOLDER_SVGS.moon, thumbnail_url: PLACEHOLDER_SVGS.moon, style: "Minimalist", description: "Simple line art moon phases" },
    { id: "7", name: "Tribal Phoenix", image_url: PLACEHOLDER_SVGS.phoenix, thumbnail_url: PLACEHOLDER_SVGS.phoenix, style: "Tribal", description: "Polynesian inspired phoenix" },
    { id: "8", name: "Watercolor Skull", image_url: PLACEHOLDER_SVGS.skull, thumbnail_url: PLACEHOLDER_SVGS.skull, style: "Watercolor", description: "Flowing watercolor skull" },
    { id: "9", name: "Script Banner", image_url: PLACEHOLDER_SVGS.script, thumbnail_url: PLACEHOLDER_SVGS.script, style: "Lettering", description: "Traditional banner script" },
    { id: "10", name: "Dotwork Mandala", image_url: PLACEHOLDER_SVGS.mandala, thumbnail_url: PLACEHOLDER_SVGS.mandala, style: "Dotwork", description: "Intricate stippled mandala" },
  ];
}
