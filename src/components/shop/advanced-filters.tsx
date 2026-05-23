"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Users, 
  DollarSign, 
  Palette,
  X,
  ChevronDown,
  Globe
} from "lucide-react"

export interface FilterState {
  countries: string[]
  regions: string[]
  genders: ("male" | "female" | "unisex")[]
  styles: string[]
  priceRange: {
    min: number | null
    max: number | null
  }
  garmentTypes: string[]
  isLimited: boolean | null
  artistVerified: boolean | null
}

interface AdvancedFiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  onClear: () => void
  resultCount: number
}

// Filter options
const COUNTRIES = [
  "United States", "United Kingdom", "Australia", "Canada", 
  "Germany", "France", "Japan", "Brazil", "Mexico", "Indonesia",
  "Netherlands", "Spain", "Italy", "South Korea", "Thailand"
]

const REGIONS = {
  "North America": ["United States", "Canada", "Mexico"],
  "Europe": ["United Kingdom", "Germany", "France", "Netherlands", "Spain", "Italy"],
  "Asia-Pacific": ["Australia", "Japan", "South Korea", "Thailand", "Indonesia"],
  "South America": ["Brazil"]
}

const GENDERS = [
  { id: "male", label: "MEN'S", icon: "♂" },
  { id: "female", label: "WOMEN'S", icon: "♀" },
  { id: "unisex", label: "UNISEX", icon: "⚥" }
] as const

const STYLES = [
  "Traditional", "Neo-Traditional", "Japanese", "Blackwork",
  "Geometric", "Watercolor", "Minimalist", "Realism",
  "Tribal", "New School", "Illustrative", "Abstract"
]

const GARMENT_TYPES = [
  "T-Shirt", "Long Sleeve", "Hoodie", "Crewneck", 
  "Tank Top", "Crop Top", "Zip-Up"
]

const PRICE_RANGES = [
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "$100 - $150", min: 100, max: 150 },
  { label: "$150+", min: 150, max: null }
]

export function AdvancedFilters({ filters, onChange, onClear, resultCount }: AdvancedFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["location", "gender", "price"])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const activeFilterCount = 
    filters.countries.length +
    filters.regions.length +
    filters.genders.length +
    filters.styles.length +
    filters.garmentTypes.length +
    (filters.priceRange.min !== null || filters.priceRange.max !== null ? 1 : 0) +
    (filters.isLimited !== null ? 1 : 0) +
    (filters.artistVerified ? 1 : 0)

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...filters, [key]: value })
  }

  const toggleArrayFilter = <K extends keyof FilterState>(
    key: K, 
    value: string, 
    currentArray: string[]
  ) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    updateFilter(key, newArray as FilterState[K])
  }

  return (
    <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1a2e1a]">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-[#4ade80]" />
          <span className="font-black text-[#e8f5e8]">FILTERS</span>
          {activeFilterCount > 0 && (
            <Badge className="bg-[#4ade80] text-black rounded-none text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button 
            onClick={onClear}
            className="text-xs text-[#6b8e6b] hover:text-[#dc2626] flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            CLEAR
          </button>
        )}
      </div>

      {/* Location Filter */}
      <div className="border border-[#1a2e1a]">
        <button 
          onClick={() => toggleSection("location")}
          className="w-full p-3 flex items-center justify-between bg-[#050805] hover:bg-[#1a2e1a] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#60a5fa]" />
            <span className="font-black text-sm text-[#e8f5e8]">LOCATION</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-[#6b8e6b] transition-transform ${expandedSections.includes("location") ? "rotate-180" : ""}`} />
        </button>
        
        {expandedSections.includes("location") && (
          <div className="p-3 space-y-4">
            {/* Regions */}
            <div>
              <p className="text-xs font-mono text-[#6b8e6b] mb-2">REGIONS</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(REGIONS).map(region => (
                  <button
                    key={region}
                    onClick={() => toggleArrayFilter("regions", region, filters.regions)}
                    className={`px-3 py-1.5 text-xs font-black border transition-colors ${
                      filters.regions.includes(region)
                        ? "border-[#60a5fa] bg-[#60a5fa]/10 text-[#60a5fa]"
                        : "border-[#1a2e1a] text-[#6b8e6b] hover:border-[#60a5fa]/50"
                    }`}
                  >
                    {region.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Countries */}
            <div>
              <p className="text-xs font-mono text-[#6b8e6b] mb-2">COUNTRIES</p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {COUNTRIES.map(country => (
                  <label 
                    key={country}
                    className="flex items-center gap-2 p-2 hover:bg-[#1a2e1a] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.countries.includes(country)}
                      onChange={() => toggleArrayFilter("countries", country, filters.countries)}
                      className="w-4 h-4 accent-[#4ade80]"
                    />
                    <span className="text-sm text-[#e8f5e8]">{country}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gender Filter */}
      <div className="border border-[#1a2e1a]">
        <button 
          onClick={() => toggleSection("gender")}
          className="w-full p-3 flex items-center justify-between bg-[#050805] hover:bg-[#1a2e1a] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#f472b6]" />
            <span className="font-black text-sm text-[#e8f5e8]">GENDER</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-[#6b8e6b] transition-transform ${expandedSections.includes("gender") ? "rotate-180" : ""}`} />
        </button>
        
        {expandedSections.includes("gender") && (
          <div className="p-3">
            <div className="grid grid-cols-3 gap-2">
              {GENDERS.map(gender => (
                <button
                  key={gender.id}
                  onClick={() => {
                    const newGenders = filters.genders.includes(gender.id)
                      ? filters.genders.filter(g => g !== gender.id)
                      : [...filters.genders, gender.id]
                    updateFilter("genders", newGenders)
                  }}
                  className={`p-3 border text-center transition-colors ${
                    filters.genders.includes(gender.id)
                      ? "border-[#f472b6] bg-[#f472b6]/10"
                      : "border-[#1a2e1a] hover:border-[#f472b6]/50"
                  }`}
                >
                  <span className="text-2xl">{gender.icon}</span>
                  <p className="text-xs font-black text-[#e8f5e8] mt-1">{gender.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="border border-[#1a2e1a]">
        <button 
          onClick={() => toggleSection("price")}
          className="w-full p-3 flex items-center justify-between bg-[#050805] hover:bg-[#1a2e1a] transition-colors"
        >
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-[#fbbf24]" />
            <span className="font-black text-sm text-[#e8f5e8]">PRICE RANGE</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-[#6b8e6b] transition-transform ${expandedSections.includes("price") ? "rotate-180" : ""}`} />
        </button>
        
        {expandedSections.includes("price") && (
          <div className="p-3 space-y-3">
            {/* Quick ranges */}
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map(range => (
                <button
                  key={range.label}
                  onClick={() => updateFilter("priceRange", { min: range.min, max: range.max })}
                  className={`px-3 py-1.5 text-xs font-black border transition-colors ${
                    filters.priceRange.min === range.min && filters.priceRange.max === range.max
                      ? "border-[#fbbf24] bg-[#fbbf24]/10 text-[#fbbf24]"
                      : "border-[#1a2e1a] text-[#6b8e6b] hover:border-[#fbbf24]/50"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Custom range */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Min $"
                  value={filters.priceRange.min || ""}
                  onChange={(e) => updateFilter("priceRange", { 
                    ...filters.priceRange, 
                    min: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  className="w-full bg-[#050805] border border-[#1a2e1a] p-2 text-[#e8f5e8] text-sm focus:border-[#fbbf24] focus:outline-none"
                />
              </div>
              <span className="text-[#6b8e6b]">-</span>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Max $"
                  value={filters.priceRange.max || ""}
                  onChange={(e) => updateFilter("priceRange", { 
                    ...filters.priceRange, 
                    max: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  className="w-full bg-[#050805] border border-[#1a2e1a] p-2 text-[#e8f5e8] text-sm focus:border-[#fbbf24] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Style Filter */}
      <div className="border border-[#1a2e1a]">
        <button 
          onClick={() => toggleSection("style")}
          className="w-full p-3 flex items-center justify-between bg-[#050805] hover:bg-[#1a2e1a] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-[#a78bfa]" />
            <span className="font-black text-sm text-[#e8f5e8]">TATTOO STYLE</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-[#6b8e6b] transition-transform ${expandedSections.includes("style") ? "rotate-180" : ""}`} />
        </button>
        
        {expandedSections.includes("style") && (
          <div className="p-3">
            <div className="flex flex-wrap gap-2">
              {STYLES.map(style => (
                <button
                  key={style}
                  onClick={() => toggleArrayFilter("styles", style, filters.styles)}
                  className={`px-3 py-1.5 text-xs font-black border transition-colors ${
                    filters.styles.includes(style)
                      ? "border-[#a78bfa] bg-[#a78bfa]/10 text-[#a78bfa]"
                      : "border-[#1a2e1a] text-[#6b8e6b] hover:border-[#a78bfa]/50"
                  }`}
                >
                  {style.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Garment Type Filter */}
      <div className="border border-[#1a2e1a]">
        <button 
          onClick={() => toggleSection("garment")}
          className="w-full p-3 flex items-center justify-between bg-[#050805] hover:bg-[#1a2e1a] transition-colors"
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#4ade80]" />
            <span className="font-black text-sm text-[#e8f5e8]">GARMENT TYPE</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-[#6b8e6b] transition-transform ${expandedSections.includes("garment") ? "rotate-180" : ""}`} />
        </button>
        
        {expandedSections.includes("garment") && (
          <div className="p-3">
            <div className="flex flex-wrap gap-2">
              {GARMENT_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => toggleArrayFilter("garmentTypes", type, filters.garmentTypes)}
                  className={`px-3 py-1.5 text-xs font-black border transition-colors ${
                    filters.garmentTypes.includes(type)
                      ? "border-[#4ade80] bg-[#4ade80]/10 text-[#4ade80]"
                      : "border-[#1a2e1a] text-[#6b8e6b] hover:border-[#4ade80]/50"
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Other Filters */}
      <div className="border border-[#1a2e1a] p-3 space-y-3">
        <p className="text-xs font-mono text-[#6b8e6b]">OTHER</p>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.isLimited === true}
            onChange={() => updateFilter("isLimited", filters.isLimited === true ? null : true)}
            className="w-4 h-4 accent-[#fbbf24]"
          />
          <span className="text-sm text-[#e8f5e8]">Limited Edition Only</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.artistVerified || false}
            onChange={() => updateFilter("artistVerified", !filters.artistVerified)}
            className="w-4 h-4 accent-[#4ade80]"
          />
          <span className="text-sm text-[#e8f5e8]">Verified Artists Only</span>
        </label>
      </div>

      {/* Results Count */}
      <div className="pt-4 border-t border-[#1a2e1a]">
        <Button 
          className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-black rounded-none font-black"
        >
          SHOW {resultCount} RESULTS
        </Button>
      </div>
    </div>
  )
}

// Helper to create initial filter state
export function createInitialFilters(): FilterState {
  return {
    countries: [],
    regions: [],
    genders: [],
    styles: [],
    priceRange: { min: null, max: null },
    garmentTypes: [],
    isLimited: null,
    artistVerified: false
  }
}
