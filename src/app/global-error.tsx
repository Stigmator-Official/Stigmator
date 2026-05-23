"use client"

import { useEffect } from "react"
import { 
  AlertCircle, 
  RefreshCw, 
  Home
} from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Global Error Boundary
 * 
 * This catches errors that occur at the root layout level
 * It's the last line of defense for error handling
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Global application error - logged to monitoring service in production
  }, [error])

  return (
    <html>
      <body className="bg-[#050805] text-[#e8f5e8]">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-lg w-full text-center">
            {/* Error icon */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-[#dc2626]/10 border-2 border-[#dc2626] flex items-center justify-center mx-auto">
                <AlertCircle className="h-12 w-12 text-[#dc2626]" />
              </div>
            </div>

            {/* Error title */}
            <h1 className="text-4xl font-black tracking-tighter text-[#e8f5e8] mb-4">
              CRITICAL ERROR
            </h1>
            
            <p className="text-[#6b8e6b] mb-8">
              A critical error has occurred. Please try refreshing the page or contact support if the problem persists.
            </p>

            {/* Error details in development */}
            {process.env.NODE_ENV === "development" && error && (
              <div className="mb-8 p-4 bg-[#0a0f0a] border border-[#dc2626] text-left overflow-auto max-h-48">
                <p className="text-[#dc2626] font-mono text-sm mb-2">
                  {error.message || "Unknown error"}
                </p>
                {error.stack && (
                  <pre className="text-[#6b8e6b] text-xs overflow-x-auto">
                    {error.stack.split("\n").slice(1, 5).join("\n")}
                  </pre>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={reset}
                className="rounded-none bg-[#4ade80] hover:bg-[#3ec46e] text-[#080a08] h-12 font-black tracking-wider"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                TRY AGAIN
              </Button>
              
              <a href="/">
                <Button 
                  variant="outline"
                  className="w-full sm:w-auto rounded-none border-2 border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] hover:border-[#4ade80] h-12 font-mono bg-transparent"
                >
                  <Home className="h-4 w-4 mr-2" />
                  GO HOME
                </Button>
              </a>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-[#1a2e1a]">
              <p className="text-xs text-[#6b8e6b] font-mono">
                STIGMATOR • ERROR RECOVERY MODE
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
