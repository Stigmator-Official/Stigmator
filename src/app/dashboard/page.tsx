"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/provider";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Redirect based on role
      switch (user.role) {
        case "ARTIST":
          router.push("/artist/dashboard");
          break;
        case "ADMIN":
          router.push("/admin/dashboard");
          break;
        case "FULFILLMENT":
          router.push("/fulfillment/dashboard");
          break;
        case "STUDIO_MANAGER":
          router.push("/studio/dashboard");
          break;
        case "CUSTOMER":
        default:
          router.push("/customer/dashboard");
          break;
      }
    }
  }, [user, isLoading, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050805]">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-[#4ade80] animate-spin mx-auto mb-4" />
        <p className="text-[#6b8e6b] font-mono text-sm">Loading your dashboard...</p>
      </div>
    </div>
  );
}
