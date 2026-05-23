"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-red-500/10 border-2 border-red-500 flex items-center justify-center">
            <ShieldAlert className="h-12 w-12 text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-black tracking-tighter text-[#e8f5e8] mb-4">
          ACCESS DENIED
        </h1>

        {/* Description */}
        <p className="text-[#6b8e6b] font-mono text-sm mb-2">
          403 FORBIDDEN
        </p>
        <p className="text-[#8b9e8b] mb-8">
          You don&apos;t have permission to access this resource.
          Contact an administrator if you believe this is an error.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button
              variant="outline"
              className="w-full sm:w-auto rounded-none border-[#1a2e1a] text-[#6b8e6b] hover:bg-[#1a2e1a]"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="w-full sm:w-auto rounded-none bg-[#4ade80] hover:bg-[#3ec46e] text-black font-black">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-[#1a2e1a]">
          <p className="text-xs text-[#5b7e5b] font-mono">
            If you need elevated permissions, please contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
