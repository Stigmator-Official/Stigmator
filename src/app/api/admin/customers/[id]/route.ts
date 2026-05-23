import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { customers, type CustomerRole, type CustomerStatus } from "@/lib/data/customers";
import { canAccessAdmin } from "@/lib/permissions";
import { adminRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

async function requireAdmin(request: NextRequest) {
  const supabase = await createClientServer();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }) };
  }

  // Rate limit admin endpoints
  const { success: limitOk } = await adminRateLimit(user.id);
  if (!limitOk) {
    return { error: NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 }) };
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userData || !canAccessAdmin(userData.role)) {
    return { error: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }) };
  }

  return { user: { id: user.id, role: userData.role } };
}

// GET /api/admin/customers/[id] - Get single customer details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const customer = customers.find(c => c.id === id);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/customers/[id] - Update customer
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { role, status, email, fullName, displayName, phone, location, bio } = body;

    const customerIndex = customers.findIndex(c => c.id === id);

    if (customerIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Validate role if provided
    if (role && !["CUSTOMER", "ARTIST", "ADMIN", "SUPER_ADMIN", "DEVELOPER"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role" },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !["active", "inactive", "suspended", "pending"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // In a real app, update the database here
    // For mock data, we'll update the in-memory array
    const updatedCustomer = {
      ...customers[customerIndex],
      ...(role && { role: role as CustomerRole }),
      ...(status && { status: status as CustomerStatus }),
      ...(email && { email }),
      ...(fullName && { fullName }),
      ...(displayName && { displayName }),
      ...(phone && { phone }),
      ...(location && { location }),
      ...(bio && { bio }),
    };

    customers[customerIndex] = updatedCustomer;

    // Add activity log entry
    if (role && role !== customers[customerIndex].role) {
      updatedCustomer.activityLog?.unshift({
        id: `act_${Date.now()}`,
        type: "role_change",
        description: `Role changed to ${role}`,
        timestamp: new Date().toISOString(),
      });
    }

    if (status && status !== customers[customerIndex].status) {
      updatedCustomer.activityLog?.unshift({
        id: `act_${Date.now()}_status`,
        type: "status_change",
        description: `Status changed to ${status}`,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedCustomer,
      message: "Customer updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/customers/[id] - Delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const customerIndex = customers.findIndex(c => c.id === id);

    if (customerIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Prevent deletion of super admin
    if (customers[customerIndex].role === "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Cannot delete super admin account" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
