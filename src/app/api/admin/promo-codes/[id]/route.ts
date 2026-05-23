import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/api/admin-middleware";

export const GET = withAdmin(async (request: NextRequest, context: any) => {
  const params = context.params as { id: string };
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  const { mockPromoCodes } = await import("@/app/admin/promo-codes/mock-data");
  const promoCode = mockPromoCodes.find((p: any) => p.id === params.id);
  if (!promoCode) {
    return NextResponse.json({ success: false, error: "Promo code not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: promoCode });
});

export const PATCH = withAdmin(async (request: NextRequest, context: any) => {
  const params = context.params as { id: string };
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, error: "Not implemented" }, { status: 501 });
  }
  const body = await request.json();
  const { mockPromoCodes } = await import("@/app/admin/promo-codes/mock-data");
  const index = mockPromoCodes.findIndex((p: any) => p.id === params.id);
  if (index === -1) {
    return NextResponse.json({ success: false, error: "Promo code not found" }, { status: 404 });
  }
  const updated = { ...mockPromoCodes[index], ...body, updatedAt: new Date().toISOString() };
  return NextResponse.json({ success: true, data: updated });
});

export const DELETE = withAdmin(async (request: NextRequest, context: any) => {
  const params = context.params as { id: string };
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, error: "Not implemented" }, { status: 501 });
  }
  const { mockPromoCodes } = await import("@/app/admin/promo-codes/mock-data");
  const exists = mockPromoCodes.some((p: any) => p.id === params.id);
  if (!exists) {
    return NextResponse.json({ success: false, error: "Promo code not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
});
