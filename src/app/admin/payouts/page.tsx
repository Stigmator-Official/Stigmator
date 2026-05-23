"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/toast/toast-context";
import { useRequireRole } from "@/lib/auth/provider";
import {
  DollarSign,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
} from "lucide-react";

interface Payout {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  recipient: {
    display_name: string | null;
    full_name: string | null;
    email: string;
  };
}

export default function AdminPayoutsPage() {
  useRequireRole(["ADMIN", "SUPER_ADMIN"]);
  const { success, error: showError } = useToast();

  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    loadPayouts();
  }, [filter]);

  const loadPayouts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payouts?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setPayouts(data.payouts);
      }
    } catch {
      showError("Failed to load payouts", "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (payoutId: string, action: "approve" | "reject") => {
    setProcessing(payoutId);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId, action }),
      });

      if (res.ok) {
        success(
          action === "approve" ? "Payout approved" : "Payout rejected",
          action === "approve" ? "Earnings marked as paid" : "Payout has been rejected"
        );
        loadPayouts();
      } else {
        const data = await res.json();
        showError("Action failed", data.error || "Please try again");
      }
    } catch {
      showError("Action failed", "Please try again");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#050805]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        <h1 className="text-4xl font-black tracking-tighter text-[#e8f5e8] mb-8">
          PAYOUT MANAGEMENT
        </h1>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {["pending", "processing", "completed", "failed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-xs font-mono uppercase border transition-colors ${
                filter === status
                  ? "bg-[#4ade80] text-black border-[#4ade80]"
                  : "bg-[#050805] text-[#6b8e6b] border-[#1a2e1a] hover:border-[#4ade80]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <Card className="bg-[#0a0f0a] border-[#1a2e1a] rounded-none">
          <CardHeader>
            <CardTitle className="text-lg font-black tracking-tighter text-[#e8f5e8]">
              {filter.toUpperCase()} PAYOUTS
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
                <p className="text-[#6b8e6b] font-mono text-sm">
                  NO {filter.toUpperCase()} PAYOUTS
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#050805] border border-[#1a2e1a] gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#1a2e1a] flex items-center justify-center">
                        <User className="h-5 w-5 text-[#6b8e6b]" />
                      </div>
                      <div>
                        <p className="font-black text-[#e8f5e8]">
                          ${(payout.amount / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-[#6b8e6b]">
                          {payout.recipient.display_name || payout.recipient.full_name || "Unknown"}
                        </p>
                        <p className="text-xs text-[#6b8e6b] flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(payout.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {filter === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAction(payout.id, "approve")}
                          disabled={processing === payout.id}
                          className="bg-[#4ade80] hover:bg-[#3ec46e] text-black rounded-none font-black"
                        >
                          {processing === payout.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          )}
                          APPROVE
                        </Button>
                        <Button
                          onClick={() => handleAction(payout.id, "reject")}
                          disabled={processing === payout.id}
                          variant="outline"
                          className="border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626]/10 rounded-none"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          REJECT
                        </Button>
                      </div>
                    )}

                    {filter !== "pending" && (
                      <span className={`text-xs font-mono uppercase ${
                        payout.status === "completed" ? "text-[#4ade80]" :
                        payout.status === "failed" ? "text-[#dc2626]" :
                        "text-[#fbbf24]"
                      }`}>
                        {payout.status}
                      </span>
                    )}
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
