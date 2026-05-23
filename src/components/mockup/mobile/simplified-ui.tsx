"use client";

/**
 * Simplified UI Components for Stigmator 3D Mockup Generator
 * 
 * Mobile-optimized UI components with simplified interactions
 * for small screens.
 */

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Shirt,
  Palette,
  Move,
  Maximize,
  RotateCw,
  Camera,
  RotateCcw,
  HelpCircle,
  Download,
  Share2,
  Check,
  ChevronRight,
  X,
  Upload,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface MobileGarmentSelectorProps {
  /** Currently selected garment type */
  selectedType?: string;
  /** Callback when garment is selected */
  onSelect?: (type: string) => void;
  /** Available garment types */
  garments?: Array<{
    id: string;
    name: string;
    icon: string;
    description?: string;
  }>;
  /** Optional className */
  className?: string;
}

export interface MobileColorPickerProps {
  /** Currently selected color */
  selectedColor?: string;
  /** Callback when color is selected */
  onSelect?: (color: string) => void;
  /** Available colors */
  colors?: string[];
  /** Optional className */
  className?: string;
}

export interface MobileTransformControlsProps {
  /** Transform values */
  values?: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
  /** Callback when values change */
  onChange?: (values: Partial<MobileTransformControlsProps["values"]>) => void;
  /** Callback to reset values */
  onReset?: () => void;
  /** Optional className */
  className?: string;
}

export interface QuickActionsFABProps {
  /** Callback for screenshot action */
  onScreenshot?: () => void;
  /** Callback for reset action */
  onReset?: () => void;
  /** Callback for help action */
  onHelp?: () => void;
  /** Optional className */
  className?: string;
}

export type ExportStep = "preset" | "confirm" | "processing" | "share";

export interface MobileExportFlowProps {
  /** Whether the export flow is open */
  isOpen: boolean;
  /** Callback when flow is closed */
  onClose: () => void;
  /** Callback when export is complete */
  onExport?: (format: string, quality: string) => Promise<string>;
  /** Optional className */
  className?: string;
}

// ============================================================================
// Component: MobileGarmentSelector
// ============================================================================

/**
 * Simplified garment selector with horizontal scrolling
 */
export function MobileGarmentSelector({
  selectedType = "tshirt",
  onSelect,
  garments = [
    { id: "tshirt", name: "T-Shirt", icon: "👕", description: "Classic fit" },
    { id: "hoodie", name: "Hoodie", icon: "🧥", description: "Cozy warm" },
    { id: "tank", name: "Tank", icon: "🎽", description: "Light & airy" },
    { id: "longsleeve", name: "Long Sleeve", icon: "👔", description: "Full coverage" },
  ],
  className,
}: MobileGarmentSelectorProps): React.ReactNode {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback((id: string) => {
    onSelect?.(id);
  }, [onSelect]);

  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
        Select Garment
      </label>
      
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-3 overflow-x-auto pb-2",
          "scrollbar-hide snap-x snap-mandatory"
        )}
      >
        {garments.map((garment) => (
          <button
            key={garment.id}
            onClick={() => handleSelect(garment.id)}
            className={cn(
              "flex-shrink-0 snap-start",
              "flex flex-col items-center gap-2",
              "p-4 rounded-xl min-w-[100px]",
              "border-2 transition-all duration-200",
              "active:scale-95",
              selectedType === garment.id
                ? "border-green-500 bg-green-500/10"
                : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
            )}
          >
            <span className="text-3xl">{garment.icon}</span>
            <span className="text-sm font-medium text-zinc-200">{garment.name}</span>
            <span className="text-xs text-zinc-500">{garment.description}</span>
          </button>
        ))}
      </div>

      {/* Variant selector */}
      <div className="pt-2">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          Fit
        </label>
        <div className="flex gap-2 mt-2">
          {["Slim", "Regular", "Oversized"].map((fit) => (
            <Button
              key={fit}
              variant="outline"
              size="sm"
              className={cn(
                "flex-1 border-zinc-700 text-zinc-300",
                "hover:bg-zinc-800 hover:text-white",
                "text-xs"
              )}
            >
              {fit}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Component: MobileColorPicker
// ============================================================================

/**
 * Simplified color picker with scrollable swatches
 */
export function MobileColorPicker({
  selectedColor = "#1a1a1a",
  onSelect,
  colors = [
    "#1a1a1a", "#f5f5f5", "#8b4513", "#2f4f4f",
    "#800000", "#191970", "#556b2f", "#4a4a4a",
    "#d2691e", "#708090", "#483d8b", "#2e8b57",
    "#cd853f", "#4682b4", "#9932cc", "#ff6347",
  ],
  className,
}: MobileColorPickerProps): React.ReactNode {
  const [customColor, setCustomColor] = useState(selectedColor);

  return (
    <div className={cn("space-y-4", className)}>
      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
        Garment Color
      </label>

      {/* Color grid */}
      <div className="grid grid-cols-6 gap-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onSelect?.(color)}
            className={cn(
              "w-full aspect-square rounded-full",
              "border-2 transition-all duration-150",
              "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-900",
              "active:scale-90",
              selectedColor === color
                ? "border-green-500 scale-110"
                : "border-zinc-700 hover:border-zinc-500"
            )}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>

      {/* Custom color input */}
      <div className="flex items-center gap-3 pt-2">
        <div className="relative">
          <input
            type="color"
            value={customColor}
            onChange={(e) => {
              setCustomColor(e.target.value);
              onSelect?.(e.target.value);
            }}
            className="w-10 h-10 rounded-lg border-2 border-zinc-700 bg-transparent cursor-pointer"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-zinc-500">Custom Color</label>
          <p className="text-sm font-mono text-zinc-300 uppercase">{customColor}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Component: MobileTransformControls
// ============================================================================

/**
 * Simplified transform controls with stepped buttons and sliders
 */
export function MobileTransformControls({
  values = { x: 0, y: 0, scale: 1, rotation: 0 },
  onChange,
  onReset,
  className,
}: MobileTransformControlsProps): React.ReactNode {
  const step = 5;
  const scaleStep = 0.1;
  const rotateStep = 15;

  const adjustValue = useCallback((
    key: keyof typeof values,
    delta: number
  ) => {
    onChange?.({ [key]: (values[key] || 0) + delta });
  }, [values, onChange]);

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          Adjust Position
        </label>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-7 text-xs text-zinc-500 hover:text-zinc-300"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset
        </Button>
      </div>

      {/* Position controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Horizontal</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-zinc-700 text-zinc-300"
              onClick={() => adjustValue("x", -step)}
            >
              ←
            </Button>
            <span className="text-sm text-zinc-300 w-12 text-center">{values.x}px</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-zinc-700 text-zinc-300"
              onClick={() => adjustValue("x", step)}
            >
              →
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Vertical</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-zinc-700 text-zinc-300"
              onClick={() => adjustValue("y", -step)}
            >
              ↑
            </Button>
            <span className="text-sm text-zinc-300 w-12 text-center">{values.y}px</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-zinc-700 text-zinc-300"
              onClick={() => adjustValue("y", step)}
            >
              ↓
            </Button>
          </div>
        </div>
      </div>

      {/* Scale slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Scale</span>
          <span className="text-sm text-zinc-300">{Math.round(values.scale * 100)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <ZoomOut className="w-4 h-4 text-zinc-500" />
          <Slider
            value={[values.scale * 100]}
            onValueChange={([v]) => onChange?.({ scale: v / 100 })}
            min={25}
            max={200}
            step={5}
            className="flex-1"
          />
          <ZoomIn className="w-4 h-4 text-zinc-500" />
        </div>
      </div>

      {/* Rotation stepped buttons */}
      <div className="space-y-2">
        <span className="text-sm text-zinc-400">Rotation</span>
        <div className="grid grid-cols-4 gap-2">
          {[-45, -15, 0, 15, 45, 90, 180].map((angle) => (
            <Button
              key={angle}
              variant="outline"
              size="sm"
              onClick={() => onChange?.({ rotation: angle })}
              className={cn(
                "border-zinc-700 text-xs",
                values.rotation === angle
                  ? "bg-green-500/20 border-green-500 text-green-400"
                  : "text-zinc-300 hover:bg-zinc-800"
              )}
            >
              {angle}°
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Component: QuickActionsFAB
// ============================================================================

/**
 * Floating Action Button for quick actions
 */
export function QuickActionsFAB({
  onScreenshot,
  onReset,
  onHelp,
  className,
}: QuickActionsFABProps): React.ReactNode {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: "screenshot", icon: Camera, label: "Screenshot", onClick: onScreenshot, color: "bg-blue-600" },
    { id: "reset", icon: RotateCcw, label: "Reset", onClick: onReset, color: "bg-orange-600" },
    { id: "help", icon: HelpCircle, label: "Help", onClick: onHelp, color: "bg-purple-600" },
  ];

  return (
    <div className={cn("fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2", className)}>
      {/* Expanded actions */}
      <div
        className={cn(
          "flex flex-col gap-2 transition-all duration-300",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => {
              action.onClick?.();
              setIsOpen(false);
            }}
            className={cn(
              "flex items-center gap-3 pr-4 pl-1 py-1 rounded-full",
              "bg-zinc-900/95 backdrop-blur-md border border-zinc-700",
              "shadow-lg shadow-black/30",
              "transition-transform active:scale-95"
            )}
          >
            <span className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white", action.color)}>
              <action.icon className="w-4 h-4" />
            </span>
            <span className="text-sm font-medium text-zinc-200">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full",
          "bg-green-600 hover:bg-green-700",
          "flex items-center justify-center",
          "shadow-xl shadow-green-900/30",
          "transition-all duration-300",
          "active:scale-90",
          isOpen && "rotate-45 bg-zinc-700 hover:bg-zinc-600"
        )}
      >
        <span className="text-2xl text-white">+</span>
      </button>
    </div>
  );
}

// ============================================================================
// Component: MobileExportFlow
// ============================================================================

/**
 * Mobile export flow with step-by-step UI
 */
export function MobileExportFlow({
  isOpen,
  onClose,
  onExport,
  className,
}: MobileExportFlowProps): React.ReactNode {
  const [step, setStep] = useState<ExportStep>("preset");
  const [selectedFormat, setSelectedFormat] = useState("png");
  const [selectedQuality, setSelectedQuality] = useState("2x");
  const [progress, setProgress] = useState(0);
  const [exportUrl, setExportUrl] = useState<string | null>(null);

  const formats = [
    { id: "png", name: "PNG", description: "Best quality" },
    { id: "jpg", name: "JPG", description: "Smaller file" },
    { id: "webp", name: "WebP", description: "Web optimized" },
  ];

  const qualities = [
    { id: "1x", name: "1x", description: "Standard" },
    { id: "2x", name: "2x", description: "Retina" },
    { id: "4x", name: "4x", description: "Print quality" },
  ];

  const handleExport = useCallback(async () => {
    setStep("processing");
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 10;
      });
    }, 200);

    try {
      const url = await onExport?.(selectedFormat, selectedQuality);
      setExportUrl(url || null);
      setProgress(100);
      setTimeout(() => setStep("share"), 500);
    } catch (error) {
      setStep("preset");
    }
  }, [selectedFormat, selectedQuality, onExport]);

  const handleClose = useCallback(() => {
    setStep("preset");
    setProgress(0);
    setExportUrl(null);
    onClose();
  }, [onClose]);

  const renderStep = () => {
    switch (step) {
      case "preset":
        return (
          <div className="space-y-6">
            {/* Format selection */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {formats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all",
                      selectedFormat === format.id
                        ? "border-green-500 bg-green-500/10"
                        : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                    )}
                  >
                    <p className="font-medium text-zinc-200">{format.name}</p>
                    <p className="text-xs text-zinc-500">{format.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality selection */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Quality
              </label>
              <div className="grid grid-cols-3 gap-2">
                {qualities.map((quality) => (
                  <button
                    key={quality.id}
                    onClick={() => setSelectedQuality(quality.id)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-center transition-all",
                      selectedQuality === quality.id
                        ? "border-green-500 bg-green-500/10"
                        : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                    )}
                  >
                    <p className="font-medium text-zinc-200">{quality.name}</p>
                    <p className="text-xs text-zinc-500">{quality.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setStep("confirm")}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case "confirm":
        return (
          <div className="space-y-6">
            <div className="bg-zinc-800/50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">Format</span>
                <span className="text-zinc-200 font-medium uppercase">{selectedFormat}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Quality</span>
                <span className="text-zinc-200 font-medium">{selectedQuality}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Estimated size</span>
                <span className="text-zinc-200 font-medium">~2.4 MB</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("preset")}
                className="flex-1 border-zinc-700 text-zinc-300"
              >
                Back
              </Button>
              <Button
                onClick={handleExport}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        );

      case "processing":
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className="w-20 h-20 rounded-full border-4 border-zinc-800 border-t-green-500 animate-spin" />
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-zinc-200">Processing...</p>
              <p className="text-sm text-zinc-500">Generating high-quality mockup</p>
            </div>
            <div className="w-full max-w-xs">
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-zinc-400 mt-2">{progress}%</p>
            </div>
          </div>
        );

      case "share":
        return (
          <div className="space-y-6">
            {exportUrl && (
              <div className="aspect-square bg-zinc-800 rounded-xl overflow-hidden">
                <img
                  src={exportUrl}
                  alt="Export preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => exportUrl && window.open(exportUrl, "_blank")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={() => navigator.share?.({ url: exportUrl || "" })}
                className="border-zinc-700 text-zinc-300"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={handleClose}
              className="w-full text-zinc-500 hover:text-zinc-300"
            >
              Done
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            {step === "preset" && "Export Mockup"}
            {step === "confirm" && "Confirm Export"}
            {step === "processing" && "Processing"}
            {step === "share" && "Export Complete"}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {step === "preset" && "Choose your export settings"}
            {step === "confirm" && "Review and confirm"}
            {step === "processing" && "Please wait while we generate your mockup"}
            {step === "share" && "Your mockup is ready!"}
          </DialogDescription>
        </DialogHeader>

        <div className={cn("mt-4", className)}>
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Additional Mobile Components
// ============================================================================

/**
 * Mobile-friendly design uploader
 */
export function MobileDesignUploader(): React.ReactNode {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file upload
      console.log("Uploading:", file.name);
    }
  }, []);

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        // Handle dropped files
      }}
      className={cn(
        "border-2 border-dashed rounded-xl p-8 text-center",
        "transition-colors duration-200",
        isDragging
          ? "border-green-500 bg-green-500/10"
          : "border-zinc-700 bg-zinc-800/30 hover:border-zinc-600"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Upload className="w-10 h-10 mx-auto text-zinc-500 mb-3" />
      <p className="text-sm text-zinc-300 font-medium">Tap to upload design</p>
      <p className="text-xs text-zinc-500 mt-1">PNG, JPG up to 10MB</p>
    </div>
  );
}

/**
 * Mobile-friendly tab navigation for mockup controls
 */
export function MobileControlTabs(): React.ReactNode {
  const [activeTab, setActiveTab] = useState("garment");
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full bg-zinc-800/50 p-1">
        <TabsTrigger
          value="garment"
          className="flex-1 data-[state=active]:bg-zinc-700 text-zinc-300"
        >
          <Shirt className="w-4 h-4 mr-1" />
          <span className="text-xs">Garment</span>
        </TabsTrigger>
        <TabsTrigger
          value="design"
          className="flex-1 data-[state=active]:bg-zinc-700 text-zinc-300"
        >
          <Palette className="w-4 h-4 mr-1" />
          <span className="text-xs">Design</span>
        </TabsTrigger>
        <TabsTrigger
          value="adjust"
          className="flex-1 data-[state=active]:bg-zinc-700 text-zinc-300"
        >
          <Move className="w-4 h-4 mr-1" />
          <span className="text-xs">Adjust</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="garment" className="mt-4">
        <MobileGarmentSelector />
      </TabsContent>

      <TabsContent value="design" className="mt-4">
        <div className="space-y-4">
          <MobileDesignUploader />
          <MobileColorPicker />
        </div>
      </TabsContent>

      <TabsContent value="adjust" className="mt-4">
        <MobileTransformControls />
      </TabsContent>
    </Tabs>
  );
}

export default MobileGarmentSelector;
