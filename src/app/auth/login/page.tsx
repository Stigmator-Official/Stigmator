"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff,
  Droplets
} from "lucide-react";

// Client-only component that uses window.location
function useQueryParams() {
  const [params, setParams] = useState<{ returnUrl?: string; registered?: boolean; reset?: boolean }>({});
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      setParams({
        returnUrl: url.searchParams.get("returnUrl") || undefined,
        registered: url.searchParams.get("registered") === "true",
        reset: url.searchParams.get("reset") === "true",
      });
    }
  }, []);
  
  return params;
}

function LoginForm() {
  const router = useRouter();
  const { signIn, isAuthenticated, isLoading: authLoading } = useAuth();
  const { returnUrl, registered, reset } = useQueryParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  demoLoading;

  useEffect(() => {
    if (isAuthenticated && !authLoading && returnUrl) {
      // Security: only allow relative return URLs on same origin
      // Strict allowlist: relative paths only, no protocol, no host, no escape chars
      const isSafeReturnUrl = returnUrl.startsWith('/') && 
        !returnUrl.startsWith('//') && 
        !returnUrl.includes(':') &&
        !returnUrl.includes('\\');
      if (isSafeReturnUrl) {
        router.push(returnUrl);
      }
    }
  }, [isAuthenticated, authLoading, returnUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError);
      setIsLoading(false);
      return;
    }
  };

  // Demo login removed for production security

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
              WELCOME BACK
            </CardTitle>
            <CardDescription className="text-[#6b8e6b]">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Success Messages */}
            {registered && (
              <div className="bg-[#4ade80]/10 border border-[#4ade80] rounded-none p-4">
                <p className="text-[#4ade80] text-sm">
                  Account created successfully! Please sign in.
                </p>
              </div>
            )}

            {reset && (
              <div className="bg-[#4ade80]/10 border border-[#4ade80] rounded-none p-4">
                <p className="text-[#4ade80] text-sm">
                  Password reset successful! Please sign in with your new password.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-[#dc2626]/10 border border-[#dc2626] rounded-none p-4 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-[#dc2626] flex-shrink-0 mt-0.5" />
                <p className="text-[#dc2626] text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] focus:border-[#4ade80] h-12"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#e8f5e8] font-mono text-xs tracking-wider">
                    PASSWORD
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-[#6b8e6b] hover:text-[#4ade80] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 pr-10 bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] focus:border-[#4ade80] h-12"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8e6b] hover:text-[#e8f5e8] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
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
                    SIGNING IN...
                  </>
                ) : (
                  <>
                    SIGN IN
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <Separator className="bg-[#1a2e1a]" />

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-[#6b8e6b] text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/register" className="text-[#4ade80] hover:text-[#3ec46e] font-black">
                  Get Marked
                </Link>
              </p>
            </div>

            {/* Artist Application */}
            <div className="text-center pt-2 border-t border-[#1a2e1a]">
              <p className="text-[#6b8e6b] text-xs mb-2">Are you a tattoo artist?</p>
              <Link href="/artist/apply">
                <Button variant="outline" className="w-full border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] rounded-none">
                  Apply as Artist
                </Button>
              </Link>
            </div>

            {/* Demo access removed for production security */}
          </CardContent>
        </Card>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-[#6b8e6b] hover:text-[#e8f5e8]">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}

// Simple loading placeholder for SSR
function LoginSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#050805]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="h-8 w-8 bg-[#dc2626] rounded" />
            <span className="text-3xl font-black tracking-tighter text-[#e8f5e8]">STIGMATOR</span>
          </div>
        </div>
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardContent className="p-6">
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#4ade80]" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoginSkeleton />;
  }

  return <LoginForm />;
}
