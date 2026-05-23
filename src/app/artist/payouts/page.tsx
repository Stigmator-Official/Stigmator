"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, useRequireRole } from "@/lib/auth/provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/toast/toast-context";
import {
  ArrowLeft,
  DollarSign,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Wallet,
  Calendar,
} from "lucide-react";

interface Payout {
  id: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  processed_at: string | null;
  stripe_transfer_id: string | null;
}

export default function ArtistPayoutsPage() {
  const { user } = useAuth();
  useRequireRole(["ARTIST", "ADMIN"]);
  const { success, error: showError } = useToast();

  const [availableBalance, setAvailableBalance] = useState(0);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestAmount, setRequestAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/artist/payouts");
      if (res.ok) {
        const data = await res.json();
        setAvailableBalance(data.availableBalance);
        setPayouts(data.payouts);
      }
    } catch {
      showError("Failed to load payouts", "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    const amount = Math.round(parseFloat(requestAmount) * 100);
    if (!amount || amount < 1000) {
      showError("Invalid amount", "Minimum payout is $10.00");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/artist/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();
      if (res.ok) {
        success("Payout requested", `Your $${(amount / 100).toFixed(2)} payout is pending approval`);
        setRequestAmount("");
        loadPayouts();
      } else {
        showError("Request failed", data.error || "Please try again");
      }
    } catch {
      showError("Request failed", "Please try again");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-[#4ade80]" />;
      case "pending":
        return <Clock className="h-4 w-4 text-[#fbbf24]" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-[#4ade80] animate-spin" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-[#dc2626]" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-[#4ade80]";
      case "pending":
        return "text-[#fbbf24]";
      case "processing":
        return "text-[#4ade80]";
      case "failed":
        return "text-[#dc2626]";
      default:
        return "text-[#6b8e6b]";
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#050805]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/artist/dashboard">
            <Button variant="outline" className="border-[#1a2e1a] text-[#6b8e6b] hover:text-[#e8f5e8] rounded-none">
              <ArrowLeft className="h-4 w-4 mr-2" />
              BACK
            </Button>
          </Link>
          <h1 className="text-4xl font-black tracking-tighter text-[#e8f5e8]">
            PAYOUTS
          </h1>
        </div>

        {/* Balance & Request */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-mono text-[#6b8e6b]">AVAILABLE BALANCE</p>
                  <p className="text-4xl font-black text-[#4ade80]">
                    {loading ? "—" : `$${(availableBalance / 100).toFixed(2)}`}
                  </p>
                </div>
                <Wallet className="h-10 w-10 text-[#4ade80]" />
              </div>
              <p className="text-sm text-[#6b8e6b]">
                Funds become available after orders are confirmed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
            <CardHeader>
              <CardTitle className="text-lg font-black tracking-tighter text-[#e8f5e8]">
                REQUEST PAYOUT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b8e6b]" />
                  <Input
                    type="number"
                    min="10"
                    step="0.01"
                    placeholder="0.00"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    className="pl-10 bg-[#050805] border-[#1a2e1a] rounded-none h-12 text-[#e8f5e8]"
                  />
                </div>
                <Button
                  onClick={handleRequestPayout}
                  disabled={submitting || !requestAmount || availableBalance < 1000}
                  className="bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black h-12"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "REQUEST"
                  )}
                </Button>
              </div>
              <p className="text-xs text-[#6b8e6b]">
                Minimum payout: $10.00. Payouts are processed within 2-3 business days.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payout History */}
        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardHeader>
            <CardTitle className="text-lg font-black tracking-tighter text-[#e8f5e8]">
              PAYOUT HISTORY
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 text-[#4ade80] animate-spin" />
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#1a2e1a]">
                <DollarSign className="h-12 w-12 text-[#1a2e1a] mx-auto mb-4" />
                <p className="text-[#6b8e6b] font-mono text-sm">NO PAYOUTS YET</p>
                <p className="text-xs text-[#6b8e6b]/70 mt-1">
                  Request your first payout when you have available balance
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-4 bg-[#050805] border border-[#1a2e1a]"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(payout.status)}
                      <div>
                        <p className="font-black text-[#e8f5e8]">
                          ${(payout.amount / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-[#6b8e6b] flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(payout.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-mono uppercase ${getStatusColor(payout.status)}`}>
                      {payout.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
