"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, 
  Mail, 
  ArrowRight, 
  AlertCircle,
  CheckCircle,
  Droplets,
  ArrowLeft
} from "lucide-react";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email) {
      setError("Please enter your email address");
      setIsLoading(false);
      return;
    }

    const { error: resetError } = await resetPassword(email);

    if (resetError) {
      setError(resetError);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
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
              RESET PASSWORD
            </CardTitle>
            <CardDescription className="text-[#6b8e6b]">
              Enter your email to receive a reset link
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Success State */}
            {success ? (
              <div className="space-y-4">
                <Alert className="bg-[#4ade80]/10 border-[#4ade80] rounded-none">
                  <CheckCircle className="h-4 w-4 text-[#4ade80]" />
                  <AlertDescription className="text-[#4ade80]">
                    Check your email for a password reset link. The link will expire in 1 hour.
                  </AlertDescription>
                </Alert>
                <p className="text-sm text-[#6b8e6b] text-center">
                  Didn&apos;t receive it? Check your spam folder or{" "}
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setEmail("");
                    }}
                    className="text-[#4ade80] hover:underline"
                  >
                    try again
                  </button>
                </p>
              </div>
            ) : (
              <>
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

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-none h-12 font-black tracking-wider"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        SENDING...
                      </>
                    ) : (
                      <>
                        SEND RESET LINK
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-sm text-[#6b8e6b] hover:text-[#e8f5e8] transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
