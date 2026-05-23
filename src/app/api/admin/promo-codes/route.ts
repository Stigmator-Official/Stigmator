import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/api/admin-middleware";

// ============================================
// GET /api/admin/promo-codes
// ============================================
export const GET = withAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Production: return empty state (promo codes are enterprise-only for now)
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // Development fallback mock data
    const { mockPromoCodes } = await import("@/app/admin/promo-codes/mock-data");
    const total = mockPromoCodes.length;
    return NextResponse.json({
      success: true,
      data: mockPromoCodes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch promo codes" },
      { status: 500 }
    );
  }
});

// ============================================
// POST /api/admin/promo-codes
// ============================================
export const POST = withAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json();

    // Production: promo codes are not yet implemented
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { success: false, error: "Promo codes are not yet available in production" },
        { status: 501 }
      );
    }

    // Development: validate and return mock success
    if (!body.code || body.code.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Code is required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newPromoCode = {
      id: `promo-${Date.now()}`,
      code: body.code.toUpperCase().trim(),
      type: body.type,
      value: body.type === "free_shipping" ? 0 : body.value,
      usageCount: 0,
      usageLimit: body.usageLimit ?? null,
      minOrderAmount: body.minOrderAmount ?? null,
      expiryDate: body.expiryDate ?? null,
      isActive: body.isActive ?? true,
      onePerCustomer: body.onePerCustomer ?? false,
      applicableProducts: body.applicableProducts ?? "all",
      description: body.description,
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json({
      success: true,
      data: newPromoCode,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create promo code" },
      { status: 500 }
    );
  }
});
