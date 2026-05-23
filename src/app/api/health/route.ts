import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, "healthy" | "unhealthy" | "unknown"> = {
    database: "unknown",
    stripe: "unknown",
  };

  try {
    // Database check
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase.from("users").select("id", { count: "exact", head: true });
    checks.database = error ? "unhealthy" : "healthy";
  } catch {
    checks.database = "unhealthy";
  }

  // Stripe check
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    checks.stripe = stripeKey && stripeKey.startsWith("sk_") ? "healthy" : "unhealthy";
  } catch {
    checks.stripe = "unhealthy";
  }

  const allHealthy = Object.values(checks).every((status) => status === "healthy");

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allHealthy ? 200 : 503 }
  );
}
