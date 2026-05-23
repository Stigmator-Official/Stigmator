"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shirt, 
  ArrowLeft, 
  Upload, 
  Layers, 
  Palette,
  Download,
  Sparkles,
  AlertCircle,
  Check,
  Loader2,
  Image as ImageIcon,
  X
} from "lucide-react";
import { useToast } from "@/components/toast/toast-context";

const GARMENT_TYPES = [
  { id: "t-shirt", name: "T-Shirt", icon: "👕" },
  { id: "hoodie", name: "Hoodie", icon: "🧥" },
  { id: "longsleeve", name: "Long Sleeve", icon: "👔" },
  { id: "tank", name: "Tank Top", icon: "🎽" },
]

const MOCKUP_STYLES = [
  { id: "flat", name: "Flat Lay", description: "Clean, flat presentation" },
  { id: "model", name: "On Model", description: "Worn by a model" },
  { id: "hanging", name: "Hanging", description: "On a hanger" },
]

export default function MockupsPage() {
  const { success, error: showError } = useToast();
  const [selectedGarment, setSelectedGarment] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("flat");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMockups, setGeneratedMockups] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showError("Invalid file", "Please upload an image file");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        success("Image uploaded", "Your design is ready for mockup generation");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showError("Invalid file", "Please upload an image file");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        success("Image uploaded", "Your design is ready for mockup generation");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedGarment || !uploadedImage) {
      showError("Missing information", "Please select a garment and upload a design");
      return;
    }

    setIsGenerating(true);
    
    // Simulate API call for mockup generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo, just use the uploaded image as "generated" mockup
    setGeneratedMockups([uploadedImage, uploadedImage, uploadedImage]);
    setIsGenerating(false);
    success("Mockups generated!", "Your mockups are ready for download");
  };

  const handleDownload = (index: number) => {
    success("Download started", "Your mockup is being downloaded");
  };

  const clearImage = () => {
    setUploadedImage(null);
    setGeneratedMockups([]);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 texture-grain">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/artist/garments" className="inline-flex items-center text-[#6b8e6b] hover:text-[#e8f5e8] mb-4 font-mono text-xs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            BACK TO GARMENTS
          </Link>
          <h1 className="text-4xl font-black tracking-tighter text-[#e8f5e8] mb-2">
            MOCKUP GENERATOR
          </h1>
          <p className="text-[#6b8e6b]">
            Create professional mockups of your designs on various garments
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Configuration */}
          <div className="space-y-6">
            {/* Design Upload */}
            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardHeader>
                <CardTitle className="font-black tracking-tighter flex items-center gap-2">
                  <Upload className="h-5 w-5 text-[#4ade80]" />
                  UPLOAD DESIGN
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!uploadedImage ? (
                  <div 
                    className={`border-2 border-dashed p-8 text-center transition-all ${
                      isDragging 
                        ? "border-[#4ade80] bg-[#4ade80]/5" 
                        : "border-[#1a2e1a] hover:border-[#4ade80]/50"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="design-upload"
                    />
                    <label htmlFor="design-upload" className="cursor-pointer block">
                      <ImageIcon className="h-10 w-10 text-[#4ade80] mx-auto mb-3" />
                      <p className="text-[#e8f5e8] font-black mb-1">
                        DROP DESIGN HERE
                      </p>
                      <p className="text-sm text-[#6b8e6b]">
                        or click to browse
                      </p>
                      <p className="text-xs text-[#6b8e6b] mt-2">
                        PNG with transparent background recommended
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="aspect-square bg-[#1a2e1a] flex items-center justify-center">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded design" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <button
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-2 bg-[#dc2626] text-white hover:bg-[#b91c1c]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="mt-2 flex items-center gap-2 text-[#4ade80]">
                      <Check className="h-4 w-4" />
                      <span className="text-sm">Design uploaded</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Garment Selection */}
            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardHeader>
                <CardTitle className="font-black tracking-tighter flex items-center gap-2">
                  <Shirt className="h-5 w-5 text-[#4ade80]" />
                  SELECT GARMENT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {GARMENT_TYPES.map((garment) => (
                    <button
                      key={garment.id}
                      onClick={() => setSelectedGarment(garment.id)}
                      className={`p-4 border-2 text-center transition-all ${
                        selectedGarment === garment.id
                          ? "border-[#4ade80] bg-[#4ade80]/10"
                          : "border-[#1a2e1a] hover:border-[#4ade80]/50 bg-[#050805]"
                      }`}
                    >
                      <span className="text-3xl mb-2 block">{garment.icon}</span>
                      <span className="font-black text-sm text-[#e8f5e8]">
                        {garment.name.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Style Selection */}
            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardHeader>
                <CardTitle className="font-black tracking-tighter flex items-center gap-2">
                  <Palette className="h-5 w-5 text-[#4ade80]" />
                  MOCKUP STYLE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {MOCKUP_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`w-full p-4 border-2 text-left transition-all ${
                        selectedStyle === style.id
                          ? "border-[#4ade80] bg-[#4ade80]/10"
                          : "border-[#1a2e1a] hover:border-[#4ade80]/50 bg-[#050805]"
                      }`}
                    >
                      <span className="font-black text-[#e8f5e8]">{style.name}</span>
                      <p className="text-sm text-[#6b8e6b]">{style.description}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!selectedGarment || !uploadedImage || isGenerating}
              className="w-full h-14 bg-[#4ade80] hover:bg-[#3ec46e] text-[#080a08] font-black rounded-none disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  GENERATING MOCKUPS...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  GENERATE MOCKUPS
                </>
              )}
            </Button>

            {!selectedGarment && (
              <p className="text-xs text-[#6b8e6b] text-center">
                Select a garment type to continue
              </p>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div>
            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none h-full">
              <CardHeader>
                <CardTitle className="font-black tracking-tighter flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#4ade80]" />
                  PREVIEW
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedMockups.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      {generatedMockups.map((mockup, index) => (
                        <div 
                          key={index} 
                          className="relative bg-[#050805] border border-[#1a2e1a] p-4 group"
                        >
                          <div className="aspect-[4/3] bg-[#1a2e1a] flex items-center justify-center">
                            <img 
                              src={mockup} 
                              alt={`Mockup ${index + 1}`}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-sm text-[#6b8e6b]">
                              {selectedStyle} view {index + 1}
                            </span>
                            <Button
                              onClick={() => handleDownload(index)}
                              size="sm"
                              className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-none"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              DOWNLOAD
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-96 flex flex-col items-center justify-center text-center border border-dashed border-[#1a2e1a]">
                    <Layers className="h-16 w-16 text-[#1a2e1a] mb-4" />
                    <p className="text-[#6b8e6b] font-mono mb-2">NO MOCKUPS YET</p>
                    <p className="text-sm text-[#6b8e6b] max-w-xs">
                      Upload a design, select a garment type, and click &quot;Generate Mockups&quot; to see previews
                    </p>
                  </div>
                )}

                {/* Info Box */}
                <div className="mt-6 p-4 bg-[#fbbf24]/5 border border-[#fbbf24]/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-[#fbbf24] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-sm text-[#fbbf24] mb-1">
                        PRO TIP
                      </p>
                      <p className="text-sm text-[#6b8e6b]">
                        For best results, upload designs with transparent backgrounds (PNG). 
                        High-resolution images (300 DPI) will produce the highest quality mockups.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alternative Option */}
        <div className="mt-12 text-center">
          <p className="text-[#6b8e6b] mb-4">
            Need more advanced mockup options?
          </p>
          <Link href="/artist/garments/create">
            <Button 
              variant="outline" 
              className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] rounded-none"
            >
              <Shirt className="h-4 w-4 mr-2" />
              CREATE FULL GARMENT
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
