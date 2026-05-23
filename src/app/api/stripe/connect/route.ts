import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { withAuth, forbiddenResponse } from "@/lib/api/admin-middleware";

export const dynamic = "force-dynamic";

// Lazy init Stripe to avoid build errors when key is not configured
let stripe: Stripe | null = null;
function getStripe() {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia" as any,
    });
  }
  return stripe;
}

// GET - Check Stripe Connect status
export async function GET(request: NextRequest) {
  return withAuth(async (req, context) => {
    if (context.role !== "ARTIST" && context.role !== "ADMIN" && context.role !== "SUPER_ADMIN") {
      return forbiddenResponse("Artist access required");
    }

    const supabase = await createRouteHandlerClient();
    const userId = context.user.id;

    try {
      const { data: profile, error } = await supabase
        .from("artist_profiles")
        .select("stripe_account_id, stripe_account_status")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (!profile?.stripe_account_id) {
        return NextResponse.json({
          connected: false,
          onboardingComplete: false,
        });
      }

      // Verify account status with Stripe
      const stripeClient = getStripe();
      if (!stripeClient) {
        return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
      }
      const account = await stripeClient.accounts.retrieve(profile.stripe_account_id);

      return NextResponse.json({
        connected: true,
        onboardingComplete: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        accountId: profile.stripe_account_id,
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to check Connect status" },
        { status: 500 }
      );
    }
  })(request);
}

// POST - Create Stripe Connect account and onboarding link
export async function POST(request: NextRequest) {
  return withAuth(async (req, context) => {
    if (context.role !== "ARTIST" && context.role !== "ADMIN" && context.role !== "SUPER_ADMIN") {
      return forbiddenResponse("Artist access required");
    }

    const supabase = await createRouteHandlerClient();
    const userId = context.user.id;

    try {
      // Check if account already exists
      const { data: profile } = await supabase
        .from("artist_profiles")
        .select("stripe_account_id")
        .eq("user_id", userId)
        .single();

      let accountId = profile?.stripe_account_id;

      if (!accountId) {
        // Create new Stripe Connect Express account
        const stripeClient = getStripe();
        if (!stripeClient) {
          return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
        }
        const account = await stripeClient.accounts.create({
          type: "express",
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          metadata: {
            stigmator_user_id: userId,
          },
        });

        accountId = account.id;

        // Save to database
        await supabase
          .from("artist_profiles")
          .upsert({
            user_id: userId,
            stripe_account_id: accountId,
            stripe_account_status: "pending",
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
      }

      // Create onboarding link
      const stripeClientForLink = getStripe();
      if (!stripeClientForLink) {
        return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
      }
      const onboardingLink = await stripeClientForLink.accountLinks.create({
        account: accountId,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/artist/dashboard?stripe=refresh`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/artist/dashboard?stripe=success`,
        type: "account_onboarding",
      });

      return NextResponse.json({
        url: onboardingLink.url,
        accountId,
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to create Connect account" },
        { status: 500 }
      );
    }
  })(request);
}
