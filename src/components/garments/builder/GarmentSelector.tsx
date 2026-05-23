"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Flame, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GarmentType, GARMENT_CATALOG, GARMENT_CATEGORIES, getTrendingGarments } from "@/lib/garments/catalog";
import { GarmentCard } from "./GarmentCard";

interface GarmentSelectorProps {
  selectedGarment: GarmentType | null;
  onGarmentSelect: (garment: GarmentType) => void;
}

type FilterTab = "all" | "trending" | "tops" | "bottoms" | "outerwear" | "headwear" | "accessories" | "bags";

export function GarmentSelector({ selectedGarment, onGarmentSelect }: GarmentSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Filter garments
  const filteredGarments = useMemo(() => {
    let garments = GARMENT_CATALOG;
    
    if (activeTab === "trending") {
      garments = getTrendingGarments();
    } else if (activeTab !== "all") {
      garments = GARMENT_CATALOG.filter(g => g.category === activeTab);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      garments = garments.filter(g => 
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.tags.some(t => t.includes(q))
      );
    }
    
    return garments;
  }, [activeTab, searchQuery]);
  
  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    GARMENT_CATEGORIES.forEach(cat => {
      counts[cat.id] = GARMENT_CATALOG.filter(g => g.category === cat.id).length;
    });
    counts["trending"] = getTrendingGarments().length;
    counts["all"] = GARMENT_CATALOG.length;
    return counts;
  }, []);
  
  const tabs: { id: FilterTab; label: string; icon: string }[] = [
    { id: "all", label: "All", icon: "🔍" },
    { id: "trending", label: "Trending", icon: "🔥" },
    ...GARMENT_CATEGORIES.map(cat => ({
      id: cat.id as FilterTab,
      label: cat.label,
      icon: cat.icon
    })),
  ];
  
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
        <Input
          placeholder="Search 48+ garment types..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-[#0a0f0a] border-[#1a2e1a] rounded-none h-12 text-[#e8f5e8] placeholder:text-[#6b8e6b] text-sm"
        />
      </div>
      
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-xs font-black tracking-wider border-2 transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "border-[#4ade80] bg-[#4ade80] text-black"
                : "border-[#1a2e1a] text-[#6b8e6b] hover:border-[#4ade80]/50 hover:text-[#e8f5e8]"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label.toUpperCase()}</span>
            <span className={`text-[10px] ${activeTab === tab.id ? "text-black/60" : "text-[#6b8e6b]"}`}>
              ({categoryCounts[tab.id]})
            </span>
          </button>
        ))}
      </div>
      
      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-[#6b8e6b] font-mono">
        <span>{filteredGarments.length} RESULTS</span>
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-[#4ade80] hover:underline">
            CLEAR SEARCH
          </button>
        )}
      </div>
      
      {/* Garment Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
        {mounted ? (
          <AnimatePresence mode="popLayout">
            {filteredGarments.map((garment) => (
              <GarmentCard
                key={garment.id}
                garment={garment}
                isSelected={selectedGarment?.id === garment.id}
                onClick={() => onGarmentSelect(garment)}
              />
            ))}
          </AnimatePresence>
        ) : (
          // Static fallback for SSR
          filteredGarments.map((garment) => (
            <GarmentCard
              key={garment.id}
              garment={garment}
              isSelected={selectedGarment?.id === garment.id}
              onClick={() => onGarmentSelect(garment)}
            />
          ))
        )}
      </div>
      
      {/* Empty State */}
      {filteredGarments.length === 0 && (
        <div className="text-center py-12 bg-[#0a0f0a] border border-[#1a2e1a]">
          <Filter className="h-12 w-12 text-[#6b8e6b] mx-auto mb-4 opacity-50" />
          <h4 className="font-black tracking-tighter text-[#e8f5e8] mb-2">
            NO GARMENTS FOUND
          </h4>
          <p className="text-sm text-[#6b8e6b]">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
