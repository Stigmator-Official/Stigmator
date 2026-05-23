"use client";

import { useAuth, useRequireRole } from "@/lib/auth/provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Package,
  LogOut,
  Droplets
} from "lucide-react";
import Link from "next/link";

export default function CustomerDashboardPage() {
  const { user, signOut } = useAuth();
  useRequireRole(["CUSTOMER", "ARTIST", "ADMIN"]);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#050805]">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tighter text-[#e8f5e8]">
            YOUR DASHBOARD
          </h1>
          <p className="text-[#6b8e6b] mt-2">
            Welcome back, {user?.displayName || user?.fullName || "Collector"}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#4ade80]/10 border border-[#4ade80]/30 flex items-center justify-center">
                  <Package className="h-6 w-6 text-[#4ade80]" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#e8f5e8]">0</p>
                  <p className="text-xs font-mono text-[#6b8e6b]">ORDERS</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#dc2626]/10 border border-[#dc2626]/30 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-[#dc2626]" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#e8f5e8]">0</p>
                  <p className="text-xs font-mono text-[#6b8e6b]">FAVORITES</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#fbbf24]/10 border border-[#fbbf24]/30 flex items-center justify-center">
                  <Droplets className="h-6 w-6 text-[#fbbf24]" />
                </div>
                <div>
                  <p className="text-2xl font-black text-[#e8f5e8]">0</p>
                  <p className="text-xs font-mono text-[#6b8e6b]">INK PORTFOLIO</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#6b8e6b]/10 border border-[#6b8e6b]/30 flex items-center justify-center">
                  <User className="h-6 w-6 text-[#6b8e6b]" />
                </div>
                <div>
                  <p className="text-sm font-black text-[#e8f5e8] truncate max-w-[120px]">
                    {user?.displayName || "Set Username"}
                  </p>
                  <p className="text-xs font-mono text-[#6b8e6b]">PROFILE</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-black tracking-tighter text-[#e8f5e8]">
                RECENT ORDERS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 border border-dashed border-[#1a2e1a]">
                <ShoppingBag className="h-12 w-12 text-[#1a2e1a] mx-auto mb-4" />
                <p className="text-[#6b8e6b] font-mono text-sm">NO ORDERS YET</p>
                <p className="text-xs text-[#6b8e6b]/70 mt-1">Start collecting art from our artists</p>
                <Link href="/shop" className="mt-4 inline-block">
                  <Button className="bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black">
                    BROWSE THE FLASH
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
              <CardHeader>
                <CardTitle className="text-lg font-black tracking-tighter text-[#e8f5e8]">
                  QUICK LINKS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/shop">
                  <Button variant="ghost" className="w-full justify-start text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Shop
                  </Button>
                </Link>
                <Link href="/partner">
                  <Button variant="ghost" className="w-full justify-start text-[#6b8e6b] hover:text-[#e8f5e8] hover:bg-[#1a2e1a] rounded-none">
                    <Droplets className="mr-2 h-4 w-4" />
                    Activate Your Ink
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-[#dc2626] hover:text-[#ff4444] hover:bg-[#dc2626]/10 rounded-none"
                  onClick={signOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            {/* Referral Card */}
            <Card className="bg-[#4ade80]/5 border-[#4ade80]/20 rounded-none">
              <CardContent className="p-6">
                <p className="text-sm font-black text-[#4ade80] mb-2">REFER & EARN</p>
                <p className="text-xs text-[#6b8e6b] mb-3">
                  Share your referral code and earn 5% of your friends&apos; sales for 6 months.
                </p>
                <div className="bg-[#050805] border border-[#1a2e1a] p-2 text-center font-mono text-sm text-[#4ade80]">
                  {user?.referralCode || "Loading..."}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
