"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle, 
  Package, 
  Mail, 
  ShoppingBag,
  Instagram,
  Twitter,
  ArrowRight
} from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "ORD-2024-XXX";

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#050805]">
      <div className="max-w-[800px] mx-auto px-4 sm:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-[#4ade80] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-black" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-[#e8f5e8] mb-4">
            ORDER CONFIRMED
          </h1>
          <p className="text-[#a3c9a3] text-lg">
            Thank you for supporting independent artists
          </p>
        </div>

        {/* Order Details */}
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none mb-8">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <p className="text-[#6b8e6b] font-mono text-xs mb-1">ORDER NUMBER</p>
                <p className="text-xl font-black text-[#e8f5e8]">{orderNumber}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[#6b8e6b] font-mono text-xs mb-1">ESTIMATED DELIVERY</p>
                <p className="text-xl font-black text-[#4ade80]">7-10 Business Days</p>
              </div>
            </div>

            <div className="bg-[#050805] border border-[#1a2e1a] p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#dc2626]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-[#dc2626]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#e8f5e8] mb-1">Confirmation Email Sent</h3>
                  <p className="text-sm text-[#6b8e6b]">
                    We&apos;ve sent order details to your email. Check your spam folder if you don&apos;t see it within a few minutes.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-6">
              <Package className="h-8 w-8 text-[#4ade80] mb-4" />
              <h3 className="font-bold text-[#e8f5e8] mb-2">Track Your Order</h3>
              <p className="text-sm text-[#6b8e6b] mb-4">
                Once shipped, you&apos;ll receive tracking information via email.
              </p>
              <Link href="/dashboard/orders">
                <Button variant="outline" className="w-full border-[#1a2e1a] text-[#4ade80] rounded-none hover:bg-[#1a2e1a]">
                  VIEW ORDERS
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-6">
              <ShoppingBag className="h-8 w-8 text-[#4ade80] mb-4" />
              <h3 className="font-bold text-[#e8f5e8] mb-2">Keep Shopping</h3>
              <p className="text-sm text-[#6b8e6b] mb-4">
                Discover more fresh designs from our tattoo artist collective.
              </p>
              <Link href="/shop">
                <Button className="w-full bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black">
                  SHOP FLASH <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Social Share */}
        <div className="text-center">
          <p className="text-[#6b8e6b] mb-4">Share the fresh ink</p>
          <div className="flex justify-center gap-4">
            <button className="w-12 h-12 bg-[#0a0f0a] border border-[#1a2e1a] flex items-center justify-center text-[#6b8e6b] hover:text-[#4ade80] hover:border-[#4ade80] transition-colors">
              <Instagram className="h-5 w-5" />
            </button>
            <button className="w-12 h-12 bg-[#0a0f0a] border border-[#1a2e1a] flex items-center justify-center text-[#6b8e6b] hover:text-[#4ade80] hover:border-[#4ade80] transition-colors">
              <Twitter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Artist Attribution */}
        <div className="mt-12 text-center border-t border-[#1a2e1a] pt-8">
          <p className="text-[#6b8e6b] text-sm mb-2">Your purchase supports independent tattoo artists</p>
          <p className="text-[#4ade80] font-mono text-xs">EQUITY INK PROTOCOL ACTIVE</p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 pb-12 bg-[#050805] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#4ade80] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6b8e6b]">Loading order details...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
