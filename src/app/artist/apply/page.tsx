"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Loader2, 
  Mail, 
  User, 
  Building2, 
  Palette, 
  FileText, 
  Instagram, 
  Globe, 
  MapPin,
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Droplets,
  Gift,
  Upload,
  Camera
} from "lucide-react";

// Tattoo styles for selection
const TATTOO_STYLES = [
  "Traditional", "Neo-Traditional", "Japanese (Irezumi)", "Blackwork",
  "Geometric", "Dotwork", "Watercolor", "Realism", "Portrait",
  "Black & Grey", "New School", "Illustrative", "Fine Line",
  "Minimalist", "Tribal", "Biomechanical", "Surrealism", "Other"
];

// Form step types
type FormStep = "personal" | "professional" | "portfolio" | "review";

interface FormData {
  // Personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  
  // Professional
  studioName: string;
  studioWebsite: string;
  yearsExperience: string;
  styles: string[];
  instagram: string;
  otherSocial: string;
  
  // Portfolio
  portfolioUrl: string;
  bio: string;
  whyJoin: string;
  
  // Agreements
  agreeTerms: boolean;
  agreeAuthentic: boolean;
  hasPortfolio: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function ArtistApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref") || "";
  
  const [currentStep, setCurrentStep] = useState<FormStep>("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    studioName: "",
    studioWebsite: "",
    yearsExperience: "",
    styles: [],
    instagram: "",
    otherSocial: "",
    portfolioUrl: "",
    bio: "",
    whyJoin: "",
    agreeTerms: false,
    agreeAuthentic: false,
    hasPortfolio: false,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = useCallback((field: keyof FormData, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [errors]);

  const toggleStyle = useCallback((style: string) => {
    setFormData(prev => {
      const current = prev.styles;
      const updated = current.includes(style)
        ? current.filter(s => s !== style)
        : [...current, style];
      return { ...prev, styles: updated };
    });
    if (errors.styles) {
      setErrors(prev => ({ ...prev, styles: "" }));
    }
  }, [errors.styles]);

  const validateStep = (step: FormStep): boolean => {
    const newErrors: FormErrors = {};
    
    switch (step) {
      case "personal":
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!formData.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Please enter a valid email";
        }
        if (!formData.location.trim()) newErrors.location = "Location is required";
        break;
        
      case "professional":
        if (!formData.yearsExperience.trim()) {
          newErrors.yearsExperience = "Years of experience is required";
        } else {
          const years = parseInt(formData.yearsExperience);
          if (isNaN(years) || years < 0 || years > 60) {
            newErrors.yearsExperience = "Please enter a valid number";
          }
        }
        if (formData.styles.length === 0) newErrors.styles = "Select at least one style";
        if (!formData.instagram.trim()) newErrors.instagram = "Instagram handle is required";
        break;
        
      case "portfolio":
        if (!formData.bio.trim() || formData.bio.length < 50) {
          newErrors.bio = "Please provide a bio of at least 50 characters";
        }
        if (!formData.whyJoin.trim() || formData.whyJoin.length < 100) {
          newErrors.whyJoin = "Please tell us why you want to join (min 100 characters)";
        }
        break;
        
      case "review":
        if (!formData.agreeTerms) newErrors.agreeTerms = "You must agree to the terms";
        if (!formData.agreeAuthentic) newErrors.agreeAuthentic = "You must confirm your work is authentic";
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    
    const steps: FormStep[] = ["personal", "professional", "portfolio", "review"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    const steps: FormStep[] = ["personal", "professional", "portfolio", "review"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep("review")) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Submit application via Supabase
      const response = await fetch('/api/artist/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          referralCode,
        }),
      });
      
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Application failed');
      }
      
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgress = () => {
    const steps: FormStep[] = ["personal", "professional", "portfolio", "review"];
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100;
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 bg-[#050805] texture-grain">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-[#0a0f0a] border-[#4ade80]/50 rounded-none">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-[#4ade80]/20 border border-[#4ade80] flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-[#4ade80]" />
              </div>
              
              <h1 className="text-3xl font-black tracking-tighter text-[#e8f5e8] mb-4">
                APPLICATION RECEIVED
              </h1>
              
              <p className="text-[#6b8e6b] mb-6 max-w-md mx-auto">
                Thank you for applying to join STIGMATOR. Our team will review your application and portfolio within 3-5 business days.
              </p>
              
              <div className="bg-[#050805] border border-[#1a2e1a] p-4 mb-6 max-w-sm mx-auto">
                <p className="text-xs font-mono text-[#6b8e6b] mb-1">APPLICATION ID</p>
                <p className="font-mono text-[#4ade80]">APP-{Date.now().toString(36).toUpperCase()}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/">
                  <Button className="bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black">
                    RETURN HOME
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button variant="outline" className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] rounded-none">
                    BROWSE THE FLASH
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-[#050805] texture-grain">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-[#6b8e6b] hover:text-[#e8f5e8] mb-4 font-mono text-xs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK TO HOME
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <Droplets className="h-8 w-8 text-[#dc2626]" />
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-[#e8f5e8]">
              JOIN THE ARTISTS
            </h1>
          </div>
          
          <p className="text-[#6b8e6b] max-w-xl">
            Apply to become a verified STIGMATOR artist. Earn from your designs on premium apparel.
          </p>
          
          {referralCode && (
            <div className="mt-4 inline-flex items-center gap-2 bg-[#4ade80]/10 border border-[#4ade80] px-4 py-2">
              <Gift className="h-4 w-4 text-[#4ade80]" />
              <span className="text-sm text-[#4ade80]">
                Referred by: <span className="font-mono font-bold">{referralCode}</span>
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-mono text-[#6b8e6b] mb-2">
            <span>STEP {["personal", "professional", "portfolio", "review"].indexOf(currentStep) + 1} OF 4</span>
            <span>{Math.round(getProgress())}% COMPLETE</span>
          </div>
          <div className="h-1 bg-[#1a2e1a] overflow-hidden">
            <div 
              className="h-full bg-[#4ade80] transition-all duration-300"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardHeader>
            <CardTitle className="text-xl font-black tracking-tighter text-[#e8f5e8]">
              {currentStep === "personal" && "PERSONAL INFORMATION"}
              {currentStep === "professional" && "PROFESSIONAL DETAILS"}
              {currentStep === "portfolio" && "PORTFOLIO & BIO"}
              {currentStep === "review" && "REVIEW & SUBMIT"}
            </CardTitle>
            <CardDescription className="text-[#6b8e6b]">
              {currentStep === "personal" && "Tell us about yourself"}
              {currentStep === "professional" && "Share your experience and style"}
              {currentStep === "portfolio" && "Show us your work"}
              {currentStep === "review" && "Review your application before submitting"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="bg-[#dc2626]/10 border-[#dc2626] rounded-none mb-6">
                <AlertCircle className="h-4 w-4 text-[#dc2626]" />
                <AlertDescription className="text-[#dc2626]">{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Personal */}
            {currentStep === "personal" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#e8f5e8] font-mono text-xs tracking-wider">FIRST NAME *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
                      <Input
                        value={formData.firstName}
                        onChange={(e) => updateField("firstName", e.target.value)}
                        className={`pl-10 bg-[#050805] border rounded-none text-[#e8f5e8] h-12 ${errors.firstName ? "border-[#dc2626]" : "border-[#1a2e1a]"}`}
                        placeholder="JOHN"
                      />
                    </div>
                    {errors.firstName && <p className="text-xs text-[#dc2626]">{errors.firstName}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[#e8f5e8] font-mono text-xs tracking-wider">LAST NAME *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
                      <Input
                        value={formData.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        className={`pl-10 bg-[#050805] border rounded-none text-[#e8f5e8] h-12 ${errors.lastName ? "border-[#dc2626]" : "border-[#1a2e1a]"}`}
                        placeholder="DOE"
                      />
                    </div>
                    {errors.lastName && <p className="text-xs text-[#dc2626]">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#e8f5e8] font-mono text-xs tracking-wider">EMAIL *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className={`pl-10 bg-[#050805] border rounded-none text-[#e8f5e8] h-12 ${errors.email ? "border-[#dc2626]" : "border-[#1a2e1a]"}`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-[#dc2626]">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-[#e8f5e8] font-mono text-xs tracking-wider">LOCATION (CITY, STATE/COUNTRY) *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
                    <Input
                      value={formData.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      className={`pl-10 bg-[#050805] border rounded-none text-[#e8f5e8] h-12 ${errors.location ? "border-[#dc2626]" : "border-[#1a2e1a]"}`}
                      placeholder="LOS ANGELES, CA"
                    />
                  </div>
                  {errors.location && <p className="text-xs text-[#dc2626]">{errors.location}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-[#e8f5e8] font-mono text-xs tracking-wider">PHONE NUMBER</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] h-12"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Professional */}
            {currentStep === "professional" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[#e8f5e8] font-mono text-xs tracking-wider">STUDIO NAME</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
                    <Input
                      value={formData.studioName}
                      onChange={(e) => updateField("studioName", e.target.value)}
                      className="pl-10 bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] h-12"
                      placeholder="BLACK NEEDLE TATTOO"
                    />
                  </div>
                  <p className="text-xs text-[#6b8e6b]">Leave blank if independent</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#e8f5e8] font-mono text-xs tracking-wider">YEARS OF EXPERIENCE *</Label>
                  <Input
                    type="number"
                    min="0"
                    max="60"
                    value={formData.yearsExperience}
                    onChange={(e) => updateField("yearsExperience", e.target.value)}
                    className={`bg-[#050805] border rounded-none text-[#e8f5e8] h-12 ${errors.yearsExperience ? "border-[#dc2626]" : "border-[#1a2e1a]"}`}
                    placeholder="5"
                  />
                  {errors.yearsExperience && <p className="text-xs text-[#dc2626]">{errors.yearsExperience}</p>}
                </div>

                <div className="space-y-3">
                  <Label className="text-[#e8f5e8] font-mono text-xs tracking-wider">TATTOO STYLES * (SELECT ALL THAT APPLY)</Label>
                  <div className="flex flex-wrap gap-2">
                    {TATTOO_STYLES.map(style => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => toggleStyle(style)}
                        className={`px-3 py-2 text-xs font-mono transition-all ${
                          formData.styles.includes(style)
                            ? "bg-[#4ade80] text-black"
                            : "bg-[#050805] border border-[#1a2e1a] text-[#6b8e6b] hover:border-[#4ade80]"
                        }`}
                      >
                        {style.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  {errors.styles && <p className="text-xs text-[#dc2626]">{errors.styles}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-[#e8f5e8] font-mono text-xs tracking-wider">INSTAGRAM HANDLE *</Label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
                    <Input
                      value={formData.instagram}
                      onChange={(e) => updateField("instagram", e.target.value)}
                      className={`pl-10 bg-[#050805] border rounded-none text-[#e8f5e8] h-12 ${errors.instagram ? "border-[#dc2626]" : "border-[#1a2e1a]"}`}
                      placeholder="@yourhandle"
                    />
                  </div>
                  {errors.instagram && <p className="text-xs text-[#dc2626]">{errors.instagram}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Portfolio */}
            {currentStep === "portfolio" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[#e8f5e8] font-mono text-xs tracking-wider">PORTFOLIO URL</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
                    <Input
                      value={formData.portfolioUrl}
                      onChange={(e) => updateField("portfolioUrl", e.target.value)}
                      className="pl-10 bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] h-12"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                  <p className="text-xs text-[#6b8e6b]">Optional but recommended</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#e8f5e8] font-mono text-xs tracking-wider">ARTIST BIO *</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    className={`bg-[#050805] border rounded-none text-[#e8f5e8] min-h-[120px] resize-none ${errors.bio ? "border-[#dc2626]" : "border-[#1a2e1a]"}`}
                    placeholder="Tell us about your artistic journey, influences, and what makes your work unique..."
                  />
                  <div className="flex justify-between text-xs">
                    {errors.bio ? (
                      <span className="text-[#dc2626]">{errors.bio}</span>
                    ) : (
                      <span />
                    )}
                    <span className={formData.bio.length >= 50 ? "text-[#4ade80]" : "text-[#6b8e6b]"}>
                      {formData.bio.length}/50 min
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#e8f5e8] font-mono text-xs tracking-wider">WHY DO YOU WANT TO JOIN STIGMATOR? *</Label>
                  <Textarea
                    value={formData.whyJoin}
                    onChange={(e) => updateField("whyJoin", e.target.value)}
                    className={`bg-[#050805] border rounded-none text-[#e8f5e8] min-h-[150px] resize-none ${errors.whyJoin ? "border-[#dc2626]" : "border-[#1a2e1a]"}`}
                    placeholder="Tell us why you want to join our platform, what you hope to achieve, and how you see yourself contributing to the community..."
                  />
                  <div className="flex justify-between text-xs">
                    {errors.whyJoin ? (
                      <span className="text-[#dc2626]">{errors.whyJoin}</span>
                    ) : (
                      <span />
                    )}
                    <span className={formData.whyJoin.length >= 100 ? "text-[#4ade80]" : "text-[#6b8e6b]"}>
                      {formData.whyJoin.length}/100 min
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === "review" && (
              <div className="space-y-6">
                <div className="bg-[#050805] border border-[#1a2e1a] p-6 space-y-4">
                  <h3 className="font-black tracking-tighter text-[#e8f5e8] mb-4">APPLICATION SUMMARY</h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[#6b8e6b] font-mono text-xs">NAME</p>
                      <p className="text-[#e8f5e8]">{formData.firstName} {formData.lastName}</p>
                    </div>
                    <div>
                      <p className="text-[#6b8e6b] font-mono text-xs">EMAIL</p>
                      <p className="text-[#e8f5e8]">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-[#6b8e6b] font-mono text-xs">LOCATION</p>
                      <p className="text-[#e8f5e8]">{formData.location}</p>
                    </div>
                    <div>
                      <p className="text-[#6b8e6b] font-mono text-xs">EXPERIENCE</p>
                      <p className="text-[#e8f5e8]">{formData.yearsExperience} years</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[#6b8e6b] font-mono text-xs">STYLES</p>
                      <p className="text-[#e8f5e8]">{formData.styles.join(", ")}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[#6b8e6b] font-mono text-xs">INSTAGRAM</p>
                      <p className="text-[#e8f5e8]">{formData.instagram}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => updateField("agreeTerms", checked as boolean)}
                      className="border-[#1a2e1a] data-[state=checked]:bg-[#4ade80] data-[state=checked]:border-[#4ade80] mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-[#6b8e6b]">
                      I agree to the{" "}
                      <Link href="/terms" className="text-[#4ade80] hover:underline">Terms of Service</Link>
                      ,{" "}
                      <Link href="/privacy" className="text-[#4ade80] hover:underline">Privacy Policy</Link>
                      , and{" "}
                      <Link href="/artist-agreement" className="text-[#4ade80] hover:underline">Artist Agreement</Link>
                    </label>
                  </div>
                  {errors.agreeTerms && <p className="text-xs text-[#dc2626]">{errors.agreeTerms}</p>}

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="authentic"
                      checked={formData.agreeAuthentic}
                      onCheckedChange={(checked) => updateField("agreeAuthentic", checked as boolean)}
                      className="border-[#1a2e1a] data-[state=checked]:bg-[#4ade80] data-[state=checked]:border-[#4ade80] mt-1"
                    />
                    <label htmlFor="authentic" className="text-sm text-[#6b8e6b]">
                      I confirm that all work submitted is my own original creation and I have the rights to distribute it
                    </label>
                  </div>
                  {errors.agreeAuthentic && <p className="text-xs text-[#dc2626]">{errors.agreeAuthentic}</p>}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-[#1a2e1a] mt-6">
              {currentStep !== "personal" ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] rounded-none"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  BACK
                </Button>
              ) : (
                <div />
              )}

              {currentStep !== "review" ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-none font-black tracking-wider"
                >
                  CONTINUE
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black tracking-wider"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      SUBMITTING...
                    </>
                  ) : (
                    <>
                      SUBMIT APPLICATION
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#6b8e6b]">
            Questions? Email us at{" "}
            <a href="mailto:artists@stigmator.com" className="text-[#4ade80] hover:underline">
              artists@stigmator.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
