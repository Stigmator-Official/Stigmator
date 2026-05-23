"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Droplets
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasRecoveryToken, setHasRecoveryToken] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      setHasRecoveryToken(true);
    } else {
      setError("Invalid or expired reset link. Please request a new one.");
    }
  }, []);

  const validatePassword = (): boolean => {
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError("Password must contain uppercase, lowercase, and number");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);

    const { error: updateError } = await updatePassword(password);

    if (updateError) {
      setError(updateError);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);

    setTimeout(() => {
      router.push("/auth/login?reset=true");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#050805] texture-grain">
      <div className="w-full max-w-md">
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
              NEW PASSWORD
            </CardTitle>
            <CardDescription className="text-[#6b8e6b]">
              Enter your new password below
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {success ? (
              <Alert className="bg-[#4ade80]/10 border-[#4ade80] rounded-none">
                <CheckCircle className="h-4 w-4 text-[#4ade80]" />
                <AlertDescription className="text-[#4ade80]">
                  Password updated! Redirecting to login...
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {error && (
                  <Alert className="bg-[#dc2626]/10 border-[#dc2626] rounded-none">
                    <AlertCircle className="h-4 w-4 text-[#dc2626]" />
                    <AlertDescription className="text-[#dc2626]">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {hasRecoveryToken && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-[#e8f5e8] font-mono text-xs tracking-wider">
                        NEW PASSWORD
                      </Label>
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
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b8e6b]"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

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
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={isLoading}
                          className="pl-10 bg-[#050805] border-[#1a2e1a] rounded-none text-[#e8f5e8] focus:border-[#4ade80] h-12"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-none h-12 font-black tracking-wider"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          UPDATING...
                        </>
                      ) : (
                        <>
                          UPDATE PASSWORD
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                )}

                {!hasRecoveryToken && !error && (
                  <div className="text-center">
                    <p className="text-[#6b8e6b] text-sm mb-4">
                      This reset link appears to be invalid or expired.
                    </p>
                    <Link href="/auth/forgot-password">
                      <Button className="bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black">
                        REQUEST NEW LINK
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/auth/login" className="text-sm text-[#6b8e6b] hover:text-[#e8f5e8]">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
