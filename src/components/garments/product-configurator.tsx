"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Palette, Users } from "lucide-react"

// Constants
const GENDER_OPTIONS = [
  { id: "male", label: "MEN'S", icon: "♂", description: "Masculine fit and sizing" },
  { id: "female", label: "WOMEN'S", icon: "♀", description: "Feminine fit and sizing" },
  { id: "unisex", label: "UNISEX", icon: "⚥", description: "Universal fit for all" }
] as const

const TATTOO_STYLES = [
  "Traditional", "Neo-Traditional", "Japanese", "Blackwork",
  "Geometric", "Watercolor", "Minimalist", "Realism",
  "Tribal", "New School", "Illustrative", "Abstract",
  "Fine Line", "Dotwork", "Biomechanical", "Portrait"
]

const GARMENT_TYPES = [
  "T-Shirt", "Long Sleeve", "Hoodie", "Crewneck", 
  "Tank Top", "Crop Top", "Zip-Up Hoodie", "Baseball Tee"
]

interface ArtistProfile {
  country: string
  city: string
  region: string
}

interface ProductConfig {
  name: string
  description: string
  gender: "male" | "female" | "unisex" | null
  tattooStyle: string | null
  garmentType: string | null
  tags: string[]
  artistLocation: ArtistProfile
}

interface ProductConfiguratorProps {
  artistProfile?: ArtistProfile
  onChange: (config: ProductConfig) => void
}

// Default artist profile (would come from Supabase in real app)
const DEFAULT_PROFILE: ArtistProfile = {
  country: "United States",
  city: "Los Angeles",
  region: "North America"
}

export function ProductConfigurator({ 
  artistProfile = DEFAULT_PROFILE, 
  onChange 
}: ProductConfiguratorProps) {
  const [config, setConfig] = useState<ProductConfig>({
    name: "",
    description: "",
    gender: null,
    tattooStyle: null,
    garmentType: null,
    tags: [],
    artistLocation: artistProfile
  })

  useEffect(() => {
    onChange(config)
  }, [config, onChange])

  const updateConfig = <K extends keyof ProductConfig>(key: K, value: ProductConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const addTag = (tag: string) => {
    if (tag && !config.tags.includes(tag)) {
      updateConfig("tags", [...config.tags, tag])
    }
  }

  const removeTag = (tag: string) => {
    updateConfig("tags", config.tags.filter(t => t !== tag))
  }

  return (
    <div className="space-y-8">
      {/* Product Identity */}
      <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
        <h3 className="font-black tracking-tighter text-lg text-[#e8f5e8] mb-4">
          PRODUCT IDENTITY
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="font-mono text-xs text-[#6b8e6b] block mb-2">
              DESIGN NAME
            </label>
            <Input
              value={config.name}
              onChange={(e) => updateConfig("name", e.target.value)}
              placeholder="e.g., SERPENT COIL"
              className="bg-[#050805] border-[#1a2e1a] rounded-none h-12 font-black text-[#e8f5e8] text-lg focus:border-[#4ade80]"
            />
          </div>

          <div>
            <label className="font-mono text-xs text-[#6b8e6b] block mb-2">
              DESCRIPTION
            </label>
            <textarea
              value={config.description}
              onChange={(e) => updateConfig("description", e.target.value)}
              placeholder="Describe your design, the inspiration, the story behind it..."
              rows={3}
              className="w-full bg-[#050805] border border-[#1a2e1a] rounded-none p-3 text-[#e8f5e8] focus:border-[#4ade80] focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Artist Location (Read-only from profile) */}
      <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-[#60a5fa]" />
          <h3 className="font-black tracking-tighter text-lg text-[#e8f5e8]">
            YOUR LOCATION
          </h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4 p-4 bg-[#050805] border border-[#1a2e1a]">
          <div>
            <div className="text-xs font-mono text-[#6b8e6b]">COUNTRY</div>
            <div className="font-black text-[#e8f5e8]">{config.artistLocation.country}</div>
          </div>
          <div>
            <div className="text-xs font-mono text-[#6b8e6b]">CITY</div>
            <div className="font-black text-[#e8f5e8]">{config.artistLocation.city}</div>
          </div>
          <div>
            <div className="text-xs font-mono text-[#6b8e6b]">REGION</div>
            <div className="font-black text-[#e8f5e8]">{config.artistLocation.region}</div>
          </div>
        </div>
        
        <p className="text-xs text-[#6b8e6b] mt-3">
          This is pulled from your profile. Customers can filter by location to find local artists.
          <a href="/artist/settings" className="text-[#4ade80] ml-2 hover:underline">
            Update in settings →
          </a>
        </p>
      </div>

      {/* Gender Selection */}
      <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-[#f472b6]" />
          <h3 className="font-black tracking-tighter text-lg text-[#e8f5e8]">
            GENDER FIT
          </h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {GENDER_OPTIONS.map((gender) => (
            <button
              key={gender.id}
              onClick={() => updateConfig("gender", gender.id)}
              className={`p-4 border text-center transition-all ${
                config.gender === gender.id
                  ? "border-[#f472b6] bg-[#f472b6]/10"
                  : "border-[#1a2e1a] hover:border-[#f472b6]/50"
              }`}
            >
              <span className="text-3xl">{gender.icon}</span>
              <p className="font-black text-sm text-[#e8f5e8] mt-2">{gender.label}</p>
              <p className="text-xs text-[#6b8e6b] mt-1">{gender.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Garment Type */}
      <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
        <h3 className="font-black tracking-tighter text-lg text-[#e8f5e8] mb-4">
          GARMENT TYPE
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {GARMENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => updateConfig("garmentType", type)}
              className={`px-4 py-2 text-xs font-black border transition-colors ${
                config.garmentType === type
                  ? "border-[#4ade80] bg-[#4ade80]/10 text-[#4ade80]"
                  : "border-[#1a2e1a] text-[#6b8e6b] hover:border-[#4ade80]/50"
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tattoo Style */}
      <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-5 w-5 text-[#a78bfa]" />
          <h3 className="font-black tracking-tighter text-lg text-[#e8f5e8]">
            TATTOO STYLE
          </h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {TATTOO_STYLES.map((style) => (
            <button
              key={style}
              onClick={() => updateConfig("tattooStyle", style)}
              className={`px-3 py-2 text-xs font-black border transition-colors ${
                config.tattooStyle === style
                  ? "border-[#a78bfa] bg-[#a78bfa]/10 text-[#a78bfa]"
                  : "border-[#1a2e1a] text-[#6b8e6b] hover:border-[#a78bfa]/50"
              }`}
            >
              {style.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
        <h3 className="font-black tracking-tighter text-lg text-[#e8f5e8] mb-4">
          SEARCH TAGS
        </h3>
        
        <Input
          placeholder="Type tag and press Enter (e.g., snake, blackwork, traditional...)"
          className="bg-[#050805] border-[#1a2e1a] rounded-none h-10 font-black text-[#e8f5e8] mb-3"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addTag((e.target as HTMLInputElement).value.trim())
              ;(e.target as HTMLInputElement).value = ""
            }
          }}
        />
        
        {config.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {config.tags.map((tag) => (
              <Badge 
                key={tag}
                className="bg-[#1a2e1a] text-[#e8f5e8] rounded-none font-mono text-xs flex items-center gap-1"
              >
                {tag}
                <button 
                  onClick={() => removeTag(tag)}
                  className="text-[#6b8e6b] hover:text-[#dc2626]"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
        
        <p className="text-xs text-[#6b8e6b] mt-3">
          These tags help customers find your design when searching
        </p>
      </div>

      {/* Summary */}
      <div className="bg-[#4ade80]/5 border border-[#4ade80]/20 p-6">
        <h4 className="font-black tracking-tighter text-[#4ade80] mb-4">
          CONFIGURATION SUMMARY
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-[#6b8e6b]">Name:</span>
            <span className="text-[#e8f5e8] font-black">{config.name || "Not set"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6b8e6b]">Gender:</span>
            <span className="text-[#e8f5e8] font-black">
              {config.gender ? config.gender.toUpperCase() : "Not selected"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6b8e6b]">Style:</span>
            <span className="text-[#e8f5e8] font-black">
              {config.tattooStyle || "Not selected"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6b8e6b]">Location:</span>
            <span className="text-[#e8f5e8] font-black">
              {config.artistLocation.city}, {config.artistLocation.country}
            </span>
          </div>
          <div className="flex justify-between col-span-2">
            <span className="text-[#6b8e6b]">Tags:</span>
            <span className="text-[#e8f5e8]">
              {config.tags.length > 0 ? config.tags.join(", ") : "None added"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
