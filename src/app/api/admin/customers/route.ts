import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { withUserManagement } from "@/lib/api/admin-middleware";

export const dynamic = "force-dynamic";

function sanitizeSearch(input: string): string {
  // Remove characters that could interfere with PostgREST filter syntax
  return input.replace(/[,&()"\\]/g, "");
}

export const GET = withUserManagement(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const supabase = await createRouteHandlerClient();

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const roles = searchParams.getAll("roles");
    const status = searchParams.getAll("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const minSpent = searchParams.get("minSpent");
    const maxSpent = searchParams.get("maxSpent");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build query
    let query = supabase
      .from("users")
      .select("*, artist_profile:artist_profiles(*)", { count: "exact" });

    if (roles.length > 0) {
      query = query.in("role", roles);
    }

    if (status.length > 0) {
      query = query.in("verification_status", status);
    }

    if (dateFrom) {
      query = query.gte("created_at", new Date(dateFrom).toISOString());
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      query = query.lte("created_at", toDate.toISOString());
    }

    const safeSearch = sanitizeSearch(search);
    if (safeSearch) {
      query = query.or(`full_name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%,display_name.ilike.%${safeSearch}%`);
    }

    const validSortFields = ["created_at", "full_name", "email", "role"];
    const orderField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    query = query.order(orderField, { ascending: sortOrder === "asc" });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: users, count: total, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch customers" },
        { status: 500 }
      );
    }

    // Map to admin customer format
    const customers = (users || []).map((user: any) => ({
      id: user.id,
      fullName: user.full_name || "",
      displayName: user.display_name || "",
      email: user.email,
      role: user.role?.toLowerCase() || "customer",
      status: user.verification_status?.toLowerCase() || "approved",
      avatarUrl: user.avatar_url,
      joinedAt: user.created_at,
      totalSpent: 0, // Would require aggregating orders
      totalOrders: 0,
      lastActiveAt: user.updated_at,
      location: user.location,
      phone: null,
      notes: null,
      tags: [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        customers,
        pagination: {
          page,
          limit,
          total: total || 0,
          totalPages: Math.ceil((total || 0) / limit),
          hasNext: page < Math.ceil((total || 0) / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
});
