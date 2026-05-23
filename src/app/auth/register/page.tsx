"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import { 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff,
  Droplets,
  Gift
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp } = useAuth();
  
  const referralCode = searchParams.get("ref") || "";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    displayName: "",
    agreeTerms: false,
    agreeMarketing: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = "Password must contain uppercase, lowercase, and number";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.fullName) {
      errors.fullName = "Full name is required";
    }

    if (!formData.displayName) {
      errors.displayName = "Display name is required";
    } else if (formData.displayName.length < 3) {
      errors.displayName = "Display name must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.displayName)) {
      errors.displayName = "Display name can only contain letters, numbers, and underscores";
    }

    if (!formData.agreeTerms) {
      errors.agreeTerms = "You must agree to the terms";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const { error: signUpError, userId } = await signUp(
      formData.email,
      formData.password,
      {
        fullName: formData.fullName,
        displayName: formData.displayName,
        role: "CUSTOMER",
        referralCode: referralCode || undefined,
      }
    );

    if (signUpError) {
      setError(signUpError);
      setIsLoading(false);
      return;
    }

    // Success - redirect to login
    router.push("/auth/login?registered=true");
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#050805] texture-grain">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Droplets className="h-8 w-8 text-[#dc2626]" />
            <span className="text-3xl font-black tracking-tighter text-[#e8f5e8]">
              STIGMATOR
            </span>
          </Link>
        </div>

        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-black tracking-tighter text-[#e8f5e8]">
              GET MARKED
            </CardTitle>
            <CardDescription className="text-[#6b8e6b]">
              Create your account to start collecting
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Referral Banner */}
            {referralCode && (
              <div className="bg-[#4ade80]/10 border border-[#4ade80] p-3 rounded-none flex items-center gap-2">
                <Gift className="h-4 w-4 text-[#4ade80]" />
                <span className="text-sm text-[#4ade80]">
                  Referred by: <span className="font-mono font-bold">{referralCode}</span>
                </span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <Alert className="bg-[#dc2626]/10 border-[#dc2626] rounded-none">
                <AlertCircle className="h-4 w-4 text-[#dc2626]" />
                <AlertDescription className="text-[#dc2626]">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-[#e8f5e8] font-mono text-xs tracking-wider">
                  FULL NAME
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    disabled={isLoading}
                    className={`pl-10 bg-[#050805] border rounded-none text-[#e8f5e8] focus:border-[#4ade80] h-12 ${
                      fieldErrors.fullName ? "border-[#dc2626]" : "border-[#1a2e1a]"
                    }`}
                  />
                </div>
                {fieldErrors.fullName && (
                  <p className="text-xs text-[#dc2626]">{fieldErrors.fullName}</p>
                )}
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-[#e8f5e8] font-mono text-xs tracking-wider">
                  DISPLAY NAME
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
                  <Input
                    id="displayName"
                    placeholder="johndoe_ink"
                    value={formData.displayName}
                    onChange={(e) => updateField("displayName", e.target.value)}
                    disabled={isLoading}
                    className={`pl-10 bg-[#050805] border rounded-none text-[#e8f5e8] focus:border-[#4ade80] h-12 ${
                      fieldErrors.displayName ? "border-[#dc2626]" : "border-[#1a2e1a]"
                    }`}
                  />
                </div>
                {fieldErrors.displayName && (
                  <p className="text-xs text-[#dc2626]">{fieldErrors.displayName}</p>
                )}
                <p className="text-xs text-[#6b8e6b]">
                  This will be your public username
                </p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#e8f5e8] font-mono text-xs tracking-wider">
                  EMAIL
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    disabled={isLoading}
                    className={`pl-10 bg-[#050805] border rounded-none text-[#e8f5e8] focus:border-[#4ade80] h-12 ${
                      fieldErrors.email ? "border-[#dc2626]" : "border-[#1a2e1a]"
                    }`}
                    autoComplete="email"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-[#dc2626]">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#e8f5e8] font-mono text-xs tracking-wider">
                  PASSWORD
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    disabled={isLoading}
                    className={`pl-10 pr-10 bg-[#050805] border rounded-none text-[#e8f5e8] focus:border-[#4ade80] h-12 ${
                      fieldErrors.password ? "border-[#dc2626]" : "border-[#1a2e1a]"
                    }`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8e6b] hover:text-[#e8f5e8] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-[#dc2626]">{fieldErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[#e8f5e8] font-mono text-xs tracking-wider">
                  CONFIRM PASSWORD
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    disabled={isLoading}
                    className={`pl-10 bg-[#050805] border rounded-none text-[#e8f5e8] focus:border-[#4ade80] h-12 ${
                      fieldErrors.confirmPassword ? "border-[#dc2626]" : "border-[#1a2e1a]"
                    }`}
                    autoComplete="new-password"
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-[#dc2626]">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => updateField("agreeTerms", checked as boolean)}
                    disabled={isLoading}
                    className="border-[#1a2e1a] data-[state=checked]:bg-[#4ade80] data-[state=checked]:border-[#4ade80]"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-[#6b8e6b] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <Link href="/terms" className="text-[#4ade80] hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-[#4ade80] hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {fieldErrors.agreeTerms && (
                  <p className="text-xs text-[#dc2626]">{fieldErrors.agreeTerms}</p>
                )}

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="marketing"
                    checked={formData.agreeMarketing}
                    onCheckedChange={(checked) => updateField("agreeMarketing", checked as boolean)}
                    disabled={isLoading}
                    className="border-[#1a2e1a] data-[state=checked]:bg-[#4ade80] data-[state=checked]:border-[#4ade80]"
                  />
                  <label
                    htmlFor="marketing"
                    className="text-sm text-[#6b8e6b] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Send me updates about new drops and artist features
                  </label>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-none h-12 font-black tracking-wider"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    CREATING ACCOUNT...
                  </>
                ) : (
                  <>
                    CREATE ACCOUNT
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <Separator className="bg-[#1a2e1a]" />

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-[#6b8e6b] text-sm">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-[#4ade80] hover:text-[#3ec46e] font-black transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>

            {/* Demo access removed for production security */}
          </CardContent>
        </Card>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-[#6b8e6b] hover:text-[#e8f5e8] transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
