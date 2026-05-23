import { NextRequest, NextResponse } from "next/server";
import { getMockOrderById, processMockRefund } from "@/lib/mock/orders";
import { 
  withPermission, 
  canAny,
  forbiddenResponse,
  type ApiContext 
} from "@/lib/api/admin-middleware";

// ============================================
// POST /api/admin/orders/[id]/refund - Process refund
// Requires: orders:refund, orders:manage, or financial:refunds permission
// ============================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Use permission wrapper
  return withPermission("orders:refund", async (req, context) => {
    // Double-check refund permissions
    if (!canAny(context, ["orders:refund", "orders:manage", "financial:refunds"])) {
      return forbiddenResponse("Permission denied");
    }

    const body = await req.json();
    const { amount, reason } = body;

    // Validate required fields
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid refund amount is required" },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Refund reason is required" },
        { status: 400 }
      );
    }

    const order = getMockOrderById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Validate refund amount doesn't exceed order total
    if (amount > order.total) {
      return NextResponse.json(
        { success: false, error: "Refund amount cannot exceed order total" },
        { status: 400 }
      );
    }

    // Check if order can be refunded
    const refundableStatuses = ["confirmed", "processing", "shipped", "delivered"];
    if (!refundableStatuses.includes(order.status)) {
      return NextResponse.json(
        { success: false, error: "Order cannot be refunded in its current status" },
        { status: 400 }
      );
    }

    // Process refund
    const updatedOrder = processMockRefund(id, amount, reason);

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: "Failed to process refund" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        order: updatedOrder,
        refund: {
          amount,
          reason,
          processed_at: updatedOrder.refunded_at,
        },
      },
    });
  })(request);
}
