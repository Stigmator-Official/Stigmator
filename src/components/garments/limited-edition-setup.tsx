"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { 
  Sparkles, 
  Flame, 
  Crown, 
  Gem,
  TrendingUp,
  Clock,
  AlertCircle,
  Users,
  Package,
  CheckCircle2
} from "lucide-react"

interface LimitedEditionConfig {
  enabled: boolean
  totalUnits: number
  presaleUnits: number
  allowRestock: boolean
  numberedCertificates: boolean
  exclusivePackaging: boolean
}

interface LimitedEditionSetupProps {
  onChange: (config: LimitedEditionConfig) => void
  garmentType?: string
}

const PRESET_RUNS = [
  { 
    id: "ultra-rare", 
    name: "ULTRA RARE", 
    units: 10, 
    icon: Crown, 
    color: "#fbbf24",
    description: "Extremely limited - creates maximum hype",
    priceMultiplier: 2.5
  },
  { 
    id: "limited", 
    name: "LIMITED", 
    units: 50, 
    icon: Gem, 
    color: "#60a5fa",
    description: "Classic limited run - collector appeal",
    priceMultiplier: 1.5
  },
  { 
    id: "exclusive", 
    name: "EXCLUSIVE", 
    units: 100, 
    icon: Sparkles, 
    color: "#a78bfa",
    description: "Exclusive drop - balances scarcity & reach",
    priceMultiplier: 1.3
  },
  { 
    id: "small-batch", 
    name: "SMALL BATCH", 
    units: 250, 
    icon: Flame, 
    color: "#f97316",
    description: "Small production run - artist direct",
    priceMultiplier: 1.1
  },
]

const PRESALE_OPTIONS = [
  { value: 0, label: "No Presale", description: "All units available at launch" },
  { value: 0.1, label: "10% Presale", description: "Early access for VIPs" },
  { value: 0.25, label: "25% Presale", description: "Quarter reserved for early birds" },
  { value: 0.5, label: "50% Presale", description: "Half for presale, half for general" },
]

export function LimitedEditionSetup({ onChange, garmentType = "Garment" }: LimitedEditionSetupProps) {
  const [config, setConfig] = useState<LimitedEditionConfig>({
    enabled: false,
    totalUnits: 50,
    presaleUnits: 0,
    allowRestock: false,
    numberedCertificates: true,
    exclusivePackaging: false,
  })
  const [selectedPreset, setSelectedPreset] = useState<string | null>("limited")
  const [customUnits, setCustomUnits] = useState(50)

  const updateConfig = (updates: Partial<LimitedEditionConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onChange(newConfig)
  }

  const handlePresetSelect = (preset: typeof PRESET_RUNS[0]) => {
    setSelectedPreset(preset.id)
    setCustomUnits(preset.units)
    updateConfig({ totalUnits: preset.units })
  }

  const handleCustomUnits = (value: number) => {
    setSelectedPreset(null)
    setCustomUnits(value)
    updateConfig({ totalUnits: value })
  }

  const selectedPresetData = PRESET_RUNS.find(p => p.id === selectedPreset)

  return (
    <div className="space-y-6">
      {/* Enable Toggle */}
      <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-black tracking-tighter text-lg text-[#e8f5e8] flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#fbbf24]" />
              LIMITED EDITION RUN
            </h3>
            <p className="text-sm text-[#6b8e6b] mt-1">
              Create scarcity and exclusivity with a fixed number of units
            </p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(checked) => updateConfig({ enabled: checked })}
          />
        </div>
      </div>

      {config.enabled && (
        <>
          {/* Preset Selection */}
          <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6 space-y-4">
            <h4 className="font-black tracking-tighter text-sm text-[#e8f5e8]">
              CHOOSE SCARCITY LEVEL
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PRESET_RUNS.map((preset) => {
                const Icon = preset.icon
                const isSelected = selectedPreset === preset.id
                
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={`p-4 border-2 text-left transition-all ${
                      isSelected
                        ? "border-[#4ade80] bg-[#4ade80]/10"
                        : "border-[#1a2e1a] hover:border-[#4ade80]/50 bg-[#050805]"
                    }`}
                  >
                    <Icon 
                      className="h-6 w-6 mb-2" 
                      style={{ color: preset.color }} 
                    />
                    <div className="font-black text-sm text-[#e8f5e8]">{preset.name}</div>
                    <div className="text-2xl font-black" style={{ color: preset.color }}>
                      {preset.units}
                    </div>
                    <div className="text-xs text-[#6b8e6b]">units</div>
                  </button>
                )
              })}
            </div>

            {/* Custom Units Input */}
            <div className="pt-4 border-t border-[#1a2e1a]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-[#6b8e6b]">OR CUSTOM AMOUNT</span>
                {selectedPreset === null && (
                  <span className="text-xs text-[#4ade80]">Custom selected</span>
                )}
              </div>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={customUnits}
                  onChange={(e) => handleCustomUnits(parseInt(e.target.value) || 1)}
                  min={1}
                  max={10000}
                  className="flex-1 bg-[#050805] border border-[#1a2e1a] px-4 py-3 text-[#e8f5e8] font-black text-xl focus:border-[#4ade80] focus:outline-none"
                />
                <div className="px-4 py-3 bg-[#1a2e1a] text-[#6b8e6b] font-mono text-sm flex items-center">
                  UNITS
                </div>
              </div>
            </div>
          </div>

          {/* Presale Configuration */}
          <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6 space-y-4">
            <h4 className="font-black tracking-tighter text-sm text-[#e8f5e8] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#4ade80]" />
              PRESALE ALLOCATION
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {PRESALE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateConfig({ presaleUnits: Math.floor(config.totalUnits * option.value) })}
                  className={`p-3 border text-left transition-all ${
                    config.presaleUnits === Math.floor(config.totalUnits * option.value)
                      ? "border-[#4ade80] bg-[#4ade80]/10"
                      : "border-[#1a2e1a] hover:border-[#4ade80]/50"
                  }`}
                >
                  <div className="font-black text-sm text-[#e8f5e8]">{option.label}</div>
                  <div className="text-xs text-[#6b8e6b]">{option.description}</div>
                  {option.value > 0 && (
                    <div className="text-xs text-[#fbbf24] mt-1">
                      {Math.floor(config.totalUnits * option.value)} units
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Premium Options */}
          <div className="bg-[#0a0f0a] border border-[#1a2e1a] p-6 space-y-4">
            <h4 className="font-black tracking-tighter text-sm text-[#e8f5e8]">
              PREMIUM FEATURES
            </h4>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-[#050805] border border-[#1a2e1a] cursor-pointer hover:border-[#4ade80]/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-[#4ade80]" />
                  <div>
                    <div className="font-black text-sm text-[#e8f5e8]">Numbered Certificates</div>
                    <div className="text-xs text-[#6b8e6b]">Each item comes with a certificate of authenticity</div>
                  </div>
                </div>
                <Switch
                  checked={config.numberedCertificates}
                  onCheckedChange={(checked) => updateConfig({ numberedCertificates: checked })}
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#050805] border border-[#1a2e1a] cursor-pointer hover:border-[#4ade80]/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Gem className="h-5 w-5 text-[#fbbf24]" />
                  <div>
                    <div className="font-black text-sm text-[#e8f5e8]">Exclusive Packaging</div>
                    <div className="text-xs text-[#6b8e6b]">Custom box and tissue paper (+$3/unit)</div>
                  </div>
                </div>
                <Switch
                  checked={config.exclusivePackaging}
                  onCheckedChange={(checked) => updateConfig({ exclusivePackaging: checked })}
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#050805] border border-[#1a2e1a] cursor-pointer hover:border-[#4ade80]/50 transition-colors">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-[#60a5fa]" />
                  <div>
                    <div className="font-black text-sm text-[#e8f5e8]">Allow Future Restock</div>
                    <div className="text-xs text-[#6b8e6b]">Option to create a different variant later</div>
                  </div>
                </div>
                <Switch
                  checked={config.allowRestock}
                  onCheckedChange={(checked) => updateConfig({ allowRestock: checked })}
                />
              </label>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-[#4ade80]/5 border border-[#4ade80]/20 p-6">
            <h4 className="font-black tracking-tighter text-[#4ade80] mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              LIMITED EDITION SUMMARY
            </h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[#6b8e6b] text-xs font-mono">TOTAL UNITS</div>
                <div className="text-2xl font-black text-[#e8f5e8]">{config.totalUnits}</div>
              </div>
              <div>
                <div className="text-[#6b8e6b] text-xs font-mono">PRESALE ALLOCATION</div>
                <div className="text-2xl font-black text-[#e8f5e8]">{config.presaleUnits || 0}</div>
              </div>
              <div>
                <div className="text-[#6b8e6b] text-xs font-mono">GENERAL SALE</div>
                <div className="text-xl font-black text-[#e8f5e8]">
                  {config.totalUnits - (config.presaleUnits || 0)}
                </div>
              </div>
              <div>
                <div className="text-[#6b8e6b] text-xs font-mono">SCARCITY TIER</div>
                <div className="text-xl font-black" style={{ color: selectedPresetData?.color || "#6b8e6b" }}>
                  {selectedPresetData?.name || "CUSTOM"}
                </div>
              </div>
            </div>

            {selectedPresetData && (
              <div className="mt-4 pt-4 border-t border-[#1a2e1a]">
                <div className="flex items-start gap-2 text-sm text-[#6b8e6b]">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>{selectedPresetData.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Urgency Note */}
          <div className="flex items-center gap-3 p-4 bg-[#1a2e1a]/50 border border-[#1a2e1a]">
            <Users className="h-5 w-5 text-[#fbbf24]" />
            <p className="text-sm text-[#6b8e6b]">
              <strong className="text-[#e8f5e8]">Pro tip:</strong> Limited editions typically sell 
              <strong className="text-[#4ade80]"> 3-5x faster</strong> than continuous runs due to scarcity psychology.
            </p>
          </div>
        </>
      )}

      {!config.enabled && (
        <div className="bg-[#1a2e1a]/50 border border-[#1a2e1a] p-6 text-center">
          <Package className="h-12 w-12 mx-auto mb-3 text-[#1a2e1a]" />
          <p className="text-[#6b8e6b]">
            This {garmentType.toLowerCase()} will be available as a <strong className="text-[#e8f5e8]">continuous run</strong>.
            <br />
            Units will be manufactured on-demand as orders come in.
          </p>
        </div>
      )}
    </div>
  )
}
