import { NextRequest, NextResponse } from "next/server";
import { getMockOrderById, updateMockOrderStatus, addNoteToOrder } from "@/lib/mock/orders";
import type { OrderStatus } from "@/lib/api/orders";
import { 
  withOrderManagement, 
  can, 
  canAny,
  forbiddenResponse,
} from "@/lib/api/admin-middleware";

// ============================================
// GET /api/admin/orders/[id] - Get single order details
// Requires: orders:read permission
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  return withOrderManagement(async () => {
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
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

    return NextResponse.json({
      success: true,
      data: { order },
    });
  })(request);
}

// ============================================
// PATCH /api/admin/orders/[id] - Update order (status, notes, etc.)
// Requires: orders:update or orders:manage permission
// ============================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  return withOrderManagement(async (req, context) => {
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, note, tracking_number, refund } = body;

    const order = getMockOrderById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Update status if provided
    if (status) {
      // Check permission for status updates
      if (!canAny(context, ["orders:update", "orders:manage", "orders:fulfill"])) {
        return forbiddenResponse("Permission denied for status update");
      }

      const validStatuses: OrderStatus[] = [
        "pending_payment",
        "payment_failed",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ];
      
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: "Invalid status" },
          { status: 400 }
        );
      }

      updateMockOrderStatus(id, status);
    }

    // Add note if provided
    if (note && typeof note === "string") {
      if (!canAny(context, ["orders:update", "orders:manage"])) {
        return forbiddenResponse("Permission denied for adding notes");
      }

      addNoteToOrder(id, note);
    }

    // Process refund if requested
    if (refund === true) {
      if (!canAny(context, ["orders:refund", "orders:manage", "financial:refunds"])) {
        return forbiddenResponse("Permission denied for refunds");
      }

      updateMockOrderStatus(id, "refunded");
    }

    // Get updated order
    const updatedOrder = getMockOrderById(id);

    return NextResponse.json({
      success: true,
      data: { order: updatedOrder },
    });
  })(request);
}

// ============================================
// DELETE /api/admin/orders/[id] - Delete single order
// Requires: orders:manage permission
// ============================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  return withOrderManagement(async (req, context) => {
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Check delete permission
    if (!can(context, "orders:manage")) {
      return forbiddenResponse("Permission denied");
    }

    const order = getMockOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // In a real implementation, delete from database
    // For mock, we just return success

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  })(request);
}
