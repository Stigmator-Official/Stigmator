import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { authRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Rate limit applications
    const { success: limitSuccess } = await authRateLimit(user.id);
    if (!limitSuccess) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      location,
      studioName,
      studioWebsite,
      yearsExperience,
      styles,
      instagram,
      otherSocial,
      portfolioUrl,
      bio,
      whyJoin,
      referralCode,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !bio) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    // Upsert user record with artist role and pending status
    const { error: userError } = await supabase
      .from("users")
      .update({
        full_name: `${firstName} ${lastName}`,
        role: "ARTIST",
        verification_status: "PENDING",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (userError) {
      return NextResponse.json(
        { error: "Failed to update user record" },
        { status: 500 }
      );
    }

    // Create or update artist profile with application data
    const applicationData = {
      firstName,
      lastName,
      email,
      phone,
      location,
      studioName,
      studioWebsite,
      yearsExperience,
      styles,
      instagram,
      otherSocial,
      portfolioUrl,
      bio,
      whyJoin,
      referralCode,
      submittedAt: new Date().toISOString(),
    };

    const { error: profileError } = await supabase
      .from("artist_profiles")
      .upsert({
        user_id: user.id,
        application_data: applicationData,
        reviewed_at: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (profileError) {
      return NextResponse.json(
        { error: "Failed to create artist profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
