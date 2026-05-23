"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useRequireRole } from "@/lib/auth/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GARMENT_CATALOG } from "@/lib/garments/catalog";
import { generateProductMockup } from "@/lib/garments/compositor-client";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  ImageIcon, 
  X, 
  AlertCircle, 
  CheckCircle, 
  ArrowLeft,
  ArrowRight,
  Loader2,
  Droplets,
  Tags,
  FileText,
  Eye,
  EyeOff,
  Info,
  Sparkles
} from "lucide-react";

// Tattoo styles for selection
const TATTOO_STYLES = [
  "Traditional", "Neo-Traditional", "Japanese", "Blackwork",
  "Geometric", "Dotwork", "Watercolor", "Realism", "Portrait",
  "Black & Grey", "New School", "Illustrative", "Fine Line",
  "Minimalist", "Tribal", "Biomechanical", "Surrealism"
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

interface UploadState {
  file: File | null;
  preview: string | null;
  title: string;
  description: string;
  category: string;
  tags: string[];
  customTag: string;
  isNSFW: boolean;
  attributionRequired: boolean;
  agreeToTerms: boolean;
}

export default function DesignUploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  useRequireRole(["ARTIST", "ADMIN"]);

  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    preview: null,
    title: "",
    description: "",
    category: "",
    tags: [],
    customTag: "",
    isNSFW: false,
    attributionRequired: false,
    agreeToTerms: false,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadedDesign, setUploadedDesign] = useState<{ id: string; imageUrl: string; title: string } | null>(null);
  const [quickMockups, setQuickMockups] = useState<Array<{ garmentName: string; imageUrl: string; garmentId: string }>>([]);
  const [isGeneratingMockups, setIsGeneratingMockups] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload JPG, PNG, WebP, or SVG.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File too large. Maximum size is 10MB.";
    }
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadState(prev => ({
        ...prev,
        file,
        preview: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const clearFile = () => {
    setUploadState(prev => ({
      ...prev,
      file: null,
      preview: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleStyle = (style: string) => {
    setUploadState(prev => {
      const current = prev.tags;
      const updated = current.includes(style)
        ? current.filter(s => s !== style)
        : [...current, style];
      return { ...prev, tags: updated };
    });
  };

  const addCustomTag = () => {
    const tag = uploadState.customTag.trim().toLowerCase();
    if (tag && !uploadState.tags.includes(tag)) {
      setUploadState(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        customTag: "",
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setUploadState(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!uploadState.file) {
      setError("Please select a design file");
      return;
    }
    if (!uploadState.title.trim()) {
      setError("Please enter a title");
      return;
    }
    if (!uploadState.category) {
      setError("Please select a category");
      return;
    }
    if (uploadState.tags.length === 0) {
      setError("Please select at least one style/tag");
      return;
    }
    if (!uploadState.agreeToTerms) {
      setError("You must confirm you own the rights to this design");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", uploadState.file);
      formData.append("title", uploadState.title);
      formData.append("description", uploadState.description);
      formData.append("category", uploadState.category);
      formData.append("tags", JSON.stringify(uploadState.tags));
      formData.append("isNSFW", String(uploadState.isNSFW));
      formData.append("attributionRequired", String(uploadState.attributionRequired));

      const response = await new Promise<{ design: { id: string; images: string[]; title: string } }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Invalid response"));
            }
          } else {
            let message = "Upload failed";
            try {
              const data = JSON.parse(xhr.responseText);
              message = data.error || message;
            } catch {}
            reject(new Error(message));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
        xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

        xhr.open("POST", "/api/designs/upload");
        xhr.send(formData);
      });

      const design = response.design;
      setUploadedDesign({
        id: design.id,
        imageUrl: design.images[0],
        title: design.title,
      });
      setSuccess(true);
      setIsUploading(false);

      // Generate quick mockups on popular garments
      setIsGeneratingMockups(true);
      const popularGarments = [
        GARMENT_CATALOG.find(g => g.id === "tee-classic"),
        GARMENT_CATALOG.find(g => g.id === "tee-oversized"),
        GARMENT_CATALOG.find(g => g.id === "hoodie-pullover"),
      ].filter(Boolean);

      const mockups: Array<{ garmentName: string; imageUrl: string; garmentId: string }> = [];
      for (const garment of popularGarments) {
        if (!garment) continue;
        try {
          const mockup = await generateProductMockup(
            garment.baseImageUrl || `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1024&h=1024&fit=crop&q=80`,
            [{
              imageUrl: design.images[0],
              placement: { x: 50, y: 45, scale: 1, rotation: 0, opacity: 1, flipX: false, flipY: false },
            }],
            garment.baseColors[0]?.hex,
            512,
            512
          );
          mockups.push({
            garmentName: garment.name,
            imageUrl: mockup,
            garmentId: garment.id,
          });
        } catch {
          // Skip failed mockup
        }
      }
      setQuickMockups(mockups);
      setIsGeneratingMockups(false);
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
      setIsUploading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 bg-[#050805] texture-grain">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <Card className="bg-[#0a0f0a] border-[#4ade80]/50 rounded-none mb-8">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-[#4ade80]/20 border border-[#4ade80] flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-[#4ade80]" />
              </div>
              
              <h1 className="text-2xl font-black tracking-tighter text-[#e8f5e8] mb-2">
                DESIGN UPLOADED
              </h1>
              
              <p className="text-[#6b8e6b] mb-4">
                &ldquo;{uploadedDesign?.title}&rdquo; is ready to be placed on garments
              </p>

              <div className="flex gap-4 justify-center">
                <Link href="/artist/designs">
                  <Button variant="outline" className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] rounded-none">
                    VIEW ALL DESIGNS
                  </Button>
                </Link>
                <Link href="/artist/garments/create">
                  <Button className="bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black">
                    CREATE GARMENT
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Mockups */}
          <div className="mb-6">
            <h2 className="text-xl font-black tracking-tighter text-[#e8f5e8] mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#4ade80]" />
              QUICK PREVIEW
            </h2>
            <p className="text-sm text-[#6b8e6b] mb-6">
              See how your design looks on popular garments. Click any to customize placement.
            </p>

            {isGeneratingMockups ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#0a0f0a] border border-[#1a2e1a] aspect-square flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-[#4ade80] animate-spin" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickMockups.map((mockup) => (
                  <Link
                    key={mockup.garmentId}
                    href={`/artist/garments/create?design_id=${uploadedDesign?.id}&garment_id=${mockup.garmentId}`}
                    className="group bg-[#0a0f0a] border border-[#1a2e1a] hover:border-[#4ade80]/50 transition-all overflow-hidden"
                  >
                    <div className="aspect-square relative">
                      <img
                        src={mockup.imageUrl}
                        alt={mockup.garmentName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050805] via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-sm font-black text-[#e8f5e8]">{mockup.garmentName.toUpperCase()}</p>
                        <p className="text-xs text-[#4ade80] font-mono mt-1">CLICK TO CUSTOMIZE &rarr;</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-[#050805] texture-grain">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/artist/dashboard" 
            className="inline-flex items-center text-[#6b8e6b] hover:text-[#e8f5e8] mb-4 font-mono text-xs"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK TO DASHBOARD
          </Link>
          
          <div className="flex items-center gap-3">
            <Upload className="h-8 w-8 text-[#4ade80]" />
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-[#e8f5e8]">
              UPLOAD DESIGN
            </h1>
          </div>
          
          <p className="text-[#6b8e6b] mt-2">
            Upload your tattoo designs to create products and share with the world
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {error && (
            <Alert className="bg-[#dc2626]/10 border-[#dc2626] rounded-none">
              <AlertCircle className="h-4 w-4 text-[#dc2626]" />
              <AlertDescription className="text-[#dc2626]">{error}</AlertDescription>
            </Alert>
          )}

          {/* File Upload Area */}
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardHeader>
              <CardTitle className="text-lg font-black tracking-tighter text-[#e8f5e8]">
                DESIGN FILE
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!uploadState.preview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-none p-12 text-center cursor-pointer transition-colors ${
                    isDragging 
                      ? "border-[#4ade80] bg-[#4ade80]/5" 
                      : "border-[#1a2e1a] hover:border-[#4ade80]/50"
                  }`}
                >
                  <Upload className="h-12 w-12 text-[#6b8e6b] mx-auto mb-4" />
                  <p className="text-[#e8f5e8] font-black mb-2">
                    DROP YOUR DESIGN HERE
                  </p>
                  <p className="text-sm text-[#6b8e6b] mb-4">
                    or click to browse
                  </p>
                  <p className="text-xs text-[#6b8e6b]">
                    JPG, PNG, WebP, or SVG • Max 10MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.svg"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="relative aspect-square max-w-md mx-auto bg-[#050805] border border-[#1a2e1a]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploadState.preview}
                      alt="Design preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="absolute top-2 right-2 w-8 h-8 bg-[#dc2626] text-white flex items-center justify-center hover:bg-[#b91c1c] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <p className="text-center text-sm text-[#6b8e6b] mt-2">
                    {uploadState.file?.name} • {(uploadState.file!.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Design Details */}
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardHeader>
              <CardTitle className="text-lg font-black tracking-tighter text-[#e8f5e8]">
                DESIGN DETAILS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[#e8f5e8] font-mono text-xs tracking-wider">
                  TITLE *
                </Label>
                <Input
                  id="title"
                  value={uploadState.title}
                  onChange={(e) => setUploadState(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] h-12 focus:border-[#4ade80]"
                  placeholder="e.g., Traditional Japanese Dragon"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#e8f5e8] font-mono text-xs tracking-wider">
                  DESCRIPTION
                </Label>
                <Textarea
                  id="description"
                  value={uploadState.description}
                  onChange={(e) => setUploadState(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] min-h-[100px] resize-none focus:border-[#4ade80]"
                  placeholder="Describe your design, its inspiration, meaning, etc."
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-[#e8f5e8] font-mono text-xs tracking-wider">
                  PRIMARY STYLE *
                </Label>
                <select
                  id="category"
                  value={uploadState.category}
                  onChange={(e) => setUploadState(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full h-12 bg-[#050805] border border-[#1a2e1a] rounded-none text-[#e8f5e8] px-3 focus:border-[#4ade80] outline-none"
                >
                  <option value="">Select a style...</option>
                  {TATTOO_STYLES.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <Label className="text-[#e8f5e8] font-mono text-xs tracking-wider">
                  ADDITIONAL TAGS/STYLES *
                </Label>
                <div className="flex flex-wrap gap-2">
                  {TATTOO_STYLES.map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleStyle(style)}
                      className={`px-3 py-2 text-xs font-mono transition-all ${
                        uploadState.tags.includes(style)
                          ? "bg-[#4ade80] text-black"
                          : "bg-[#050805] border border-[#1a2e1a] text-[#6b8e6b] hover:border-[#4ade80]"
                      }`}
                    >
                      {style.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Custom Tags */}
                <div className="flex gap-2">
                  <Input
                    value={uploadState.customTag}
                    onChange={(e) => setUploadState(prev => ({ ...prev, customTag: e.target.value }))}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                    className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] h-10"
                    placeholder="Add custom tag..."
                  />
                  <Button
                    type="button"
                    onClick={addCustomTag}
                    variant="outline"
                    className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] rounded-none"
                  >
                    ADD
                  </Button>
                </div>

                {/* Selected Tags Display */}
                {uploadState.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {uploadState.tags.map(tag => (
                      <Badge 
                        key={tag} 
                        className="bg-[#4ade80]/20 text-[#4ade80] border-[#4ade80]/30 rounded-none font-mono text-xs flex items-center gap-1"
                      >
                        {tag.toUpperCase()}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardHeader>
              <CardTitle className="text-lg font-black tracking-tighter text-[#e8f5e8]">
                OPTIONS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="nsfw"
                  checked={uploadState.isNSFW}
                  onCheckedChange={(checked) => setUploadState(prev => ({ ...prev, isNSFW: checked as boolean }))}
                  className="border-[#1a2e1a] data-[state=checked]:bg-[#dc2626] data-[state=checked]:border-[#dc2626] mt-1"
                />
                <div>
                  <label htmlFor="nsfw" className="text-sm text-[#e8f5e8] font-medium">
                    This design contains mature content
                  </label>
                  <p className="text-xs text-[#6b8e6b]">
                    NSFW designs will be filtered from default views
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="attribution"
                  checked={uploadState.attributionRequired}
                  onCheckedChange={(checked) => setUploadState(prev => ({ ...prev, attributionRequired: checked as boolean }))}
                  className="border-[#1a2e1a] data-[state=checked]:bg-[#fbbf24] data-[state=checked]:border-[#fbbf24] mt-1"
                />
                <div>
                  <label htmlFor="attribution" className="text-sm text-[#e8f5e8] font-medium">
                    Require partnership code for this design
                  </label>
                  <p className="text-xs text-[#6b8e6b]">
                    Only clients with a valid partnership code can purchase products with this design
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms */}
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={uploadState.agreeToTerms}
                  onCheckedChange={(checked) => setUploadState(prev => ({ ...prev, agreeToTerms: checked as boolean }))}
                  className="border-[#1a2e1a] data-[state=checked]:bg-[#4ade80] data-[state=checked]:border-[#4ade80] mt-1"
                />
                <label htmlFor="terms" className="text-sm text-[#6b8e6b]">
                  I confirm that I am the original creator of this design and have the rights to distribute it. 
                  I agree to the{" "}
                  <Link href="/artist-agreement" className="text-[#4ade80] hover:underline">
                    Artist Agreement
                  </Link>{" "}
                  and understand that uploading copyrighted material without permission will result in account termination.
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Link href="/artist/dashboard" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] rounded-none h-12"
              >
                CANCEL
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isUploading || !uploadState.file}
              className="flex-1 bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none h-12 font-black tracking-wider disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  UPLOADING... {uploadProgress}%
                </>
              ) : (
                <>
                  UPLOAD DESIGN
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
