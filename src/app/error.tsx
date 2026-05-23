"use client"

import { useEffect } from "react"
import Link from "next/link"
import { 
  AlertCircle, 
  RefreshCw, 
  Home, 
  Bug,
  Terminal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"

/**
 * Error Boundary Page
 * 
 * Catches errors in the app and displays a user-friendly error page
 * Brutalist design with error details (in development)
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console
    // Application error - logged to monitoring service
  }, [error])

  return (
    <div className="min-h-screen pt-24 pb-12 texture-grain flex items-center">
      <Container size="small" className="w-full">
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute -top-20 -right-20 text-[180px] font-black text-[#dc2626]/[0.03] leading-none select-none pointer-events-none">
            ERR
          </div>

          <div className="relative z-10 max-w-2xl mx-auto text-center">
            {/* Error icon */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-[#dc2626]/10 border-2 border-[#dc2626] flex items-center justify-center mx-auto relative">
                <AlertCircle className="h-12 w-12 text-[#dc2626]" />
                {/* Animated pulse effect */}
                <div className="absolute inset-0 border-2 border-[#dc2626] animate-ping opacity-20" />
              </div>
            </div>

            {/* Error title */}
            <div className="space-y-2 mb-6">
              <span className="font-mono text-xs tracking-widest text-[#dc2626]">
                [SYSTEM ERROR]
              </span>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-[#e8f5e8]">
                SOMETHING WENT WRONG
              </h1>
            </div>

            {/* Error description */}
            <p className="text-[#6b8e6b] text-lg mb-8 max-w-lg mx-auto leading-relaxed">
              We&apos;ve encountered an unexpected error. Don&apos;t worry, 
              it&apos;s not your fault. Our team has been notified.
            </p>

            {/* Error details in development */}
            {process.env.NODE_ENV === "development" && error && (
              <div className="mb-8 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal className="h-4 w-4 text-[#dc2626]" />
                  <span className="font-mono text-xs text-[#dc2626]">
                    ERROR DETAILS (DEV ONLY)
                  </span>
                </div>
                <div className="p-4 bg-[#050805] border border-[#dc2626] overflow-auto max-h-48">
                  <p className="text-[#dc2626] font-mono text-sm mb-2">
                    {error.message || "Unknown error"}
                  </p>
                  {error.stack && (
                    <pre className="text-[#6b8e6b] text-xs overflow-x-auto whitespace-pre-wrap">
                      {error.stack.split("\n").slice(1, 5).join("\n")}
                    </pre>
                  )}
                  {error.digest && (
                    <p className="text-[#6b8e6b] font-mono text-xs mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
              <Button
                onClick={reset}
                className="rounded-none bg-[#4ade80] hover:bg-[#3ec46e] text-[#080a08] h-12 font-black tracking-wider"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                TRY AGAIN
              </Button>
              
              <Link href="/">
                <Button 
                  variant="outline"
                  className="w-full sm:w-auto rounded-none border-2 border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:border-[#4ade80] h-12 font-mono"
                >
                  <Home className="h-4 w-4 mr-2" />
                  GO HOME
                </Button>
              </Link>
            </div>

            {/* Help section */}
            <div className="border-t border-[#1a2e1a] pt-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Bug className="h-4 w-4 text-[#6b8e6b]" />
                <span className="font-mono text-xs text-[#6b8e6b]">
                  STILL HAVING ISSUES?
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <Link 
                  href="/about"
                  className="text-[#6b8e6b] hover:text-[#4ade80] transition-colors font-mono"
                >
                  [CONTACT SUPPORT]
                </Link>
                <span className="hidden sm:inline text-[#1a2e1a]">|</span>
                <Link 
                  href="/shop"
                  className="text-[#6b8e6b] hover:text-[#4ade80] transition-colors font-mono"
                >
                  [BROWSE DESIGNS]
                </Link>
                <span className="hidden sm:inline text-[#1a2e1a]">|</span>
                <button
                  onClick={() => window.location.reload()}
                  className="text-[#6b8e6b] hover:text-[#4ade80] transition-colors font-mono"
                >
                  [HARD REFRESH]
                </button>
              </div>
            </div>
          </div>

          {/* Bottom decorative text */}
          <div className="mt-16 text-center overflow-hidden">
            <span className="text-[10vw] font-black text-[#4ade80]/[0.02] tracking-tighter whitespace-nowrap select-none">
              SYSTEM FAILURE
            </span>
          </div>
        </div>
      </Container>
    </div>
  )
}
