// ============================================
// API ADMIN MIDDLEWARE
// Server-side middleware for API route protection
// ============================================

import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { adminRateLimit } from "@/lib/rate-limit";
import type { User } from "@/types/database";
import {
  type UserRole,
  type Permission,
  isAdminRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasHigherOrEqualRole,
  ROLE_PERMISSIONS,
} from "@/lib/permissions";

// ============================================
// TYPES
// ============================================

export interface ApiContext {
  user: User;
  role: UserRole;
  isAdmin: boolean;
  permissions: Permission[];
  params?: Record<string, string | string[]>;
}

export type ApiHandler = (
  request: NextRequest,
  context: ApiContext
) => Promise<NextResponse> | NextResponse;

export type WrappedApiHandler = (
  request: NextRequest
) => Promise<NextResponse> | NextResponse;

export type DynamicApiHandler = (
  request: NextRequest,
  context: ApiContext & { params: { id: string } }
) => Promise<NextResponse> | NextResponse;

// ============================================
// ERROR RESPONSES
// ============================================

export function unauthorizedResponse(
  message = "Unauthorized",
  code = "UNAUTHORIZED"
): NextResponse {
  return NextResponse.json(
    { error: message, code },
    { status: 401 }
  );
}

export function forbiddenResponse(
  message = "Forbidden",
  code = "FORBIDDEN"
): NextResponse {
  return NextResponse.json(
    { error: message, code },
    { status: 403 }
  );
}

export function badRequestResponse(
  message = "Bad Request",
  code = "BAD_REQUEST"
): NextResponse {
  return NextResponse.json(
    { error: message, code },
    { status: 400 }
  );
}

// ============================================
// USER RESOLUTION
// ============================================

/**
 * Get current user from request
 */
export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  try {
    // Get user from Supabase
    const supabase = await createRouteHandlerClient();
    
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return null;
    }

    // Fetch full user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(`
        *,
        artist_profile:artist_profiles(*)
      `)
      .eq("id", authUser.id)
      .single();

    if (userError || !userData) {
      return null;
    }

    return {
      ...userData,
      artistProfile: (userData as unknown as { artist_profile: unknown }).artist_profile,
    } as User;
  } catch {
    return null;
  }
}

// ============================================
// MIDDLEWARE WRAPPERS
// ============================================

/**
 * Wrap an API handler with authentication check
 */
export function withAuth(handler: ApiHandler): WrappedApiHandler {
  return async (request: NextRequest) => {
    const user = await getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse("Authentication required");
    }

    const role = user.role as UserRole;
    const context: ApiContext = {
      user,
      role,
      isAdmin: isAdminRole(role),
      permissions: ROLE_PERMISSIONS[role] || [],
    };

    return handler(request, context);
  };
}

/**
 * Wrap an API handler with admin check
 */
export function withAdmin(handler: ApiHandler): WrappedApiHandler {
  return async (request: NextRequest) => {
    const user = await getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse("Authentication required");
    }

    // Rate limit admin users
    const { success: limitSuccess } = await adminRateLimit(user.id)
    if (!limitSuccess) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const role = user.role as UserRole;

    if (!isAdminRole(role)) {
      return forbiddenResponse("Admin access required");
    }

    const context: ApiContext = {
      user,
      role,
      isAdmin: true,
      permissions: ROLE_PERMISSIONS[role] || [],
    };

    return handler(request, context);
  };
}

/**
 * Wrap an API handler with role check
 */
export function withRole(
  requiredRole: UserRole | UserRole,
  handler: ApiHandler
): WrappedApiHandler {
  return async (request: NextRequest) => {
    const user = await getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse("Authentication required");
    }

    const role = user.role as UserRole;

    if (!hasHigherOrEqualRole(role, requiredRole)) {
      return forbiddenResponse(`${requiredRole} access required`);
    }

    const context: ApiContext = {
      user,
      role,
      isAdmin: isAdminRole(role),
      permissions: ROLE_PERMISSIONS[role] || [],
    };

    return handler(request, context);
  };
}

/**
 * Wrap an API handler with permission check
 */
export function withPermission(
  permission: Permission,
  handler: ApiHandler
): WrappedApiHandler {
  return async (request: NextRequest) => {
    const user = await getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse("Authentication required");
    }

    // Rate limit
    const { success: limitSuccess } = await adminRateLimit(user.id)
    if (!limitSuccess) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const role = user.role as UserRole;

    if (!hasPermission(role, permission)) {
      return forbiddenResponse(`Permission '${permission}' required`);
    }

    const context: ApiContext = {
      user,
      role,
      isAdmin: isAdminRole(role),
      permissions: ROLE_PERMISSIONS[role] || [],
    };

    return handler(request, context);
  };
}

/**
 * Wrap an API handler with any permission check
 */
export function withAnyPermission(
  permissions: Permission[],
  handler: ApiHandler
): WrappedApiHandler {
  return async (request: NextRequest) => {
    const user = await getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse("Authentication required");
    }

    // Rate limit
    const { success: limitSuccess } = await adminRateLimit(user.id)
    if (!limitSuccess) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const role = user.role as UserRole;

    if (!hasAnyPermission(role, permissions)) {
      return forbiddenResponse(
        `One of [${permissions.join(", ")}] permissions required`
      );
    }

    const context: ApiContext = {
      user,
      role,
      isAdmin: isAdminRole(role),
      permissions: ROLE_PERMISSIONS[role] || [],
    };

    return handler(request, context);
  };
}

/**
 * Wrap an API handler with all permissions check
 */
export function withAllPermissions(
  permissions: Permission[],
  handler: ApiHandler
): WrappedApiHandler {
  return async (request: NextRequest) => {
    const user = await getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse("Authentication required");
    }

    // Rate limit
    const { success: limitSuccess } = await adminRateLimit(user.id)
    if (!limitSuccess) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const role = user.role as UserRole;

    if (!hasAllPermissions(role, permissions)) {
      return forbiddenResponse(
        `All of [${permissions.join(", ")}] permissions required`
      );
    }

    const context: ApiContext = {
      user,
      role,
      isAdmin: isAdminRole(role),
      permissions: ROLE_PERMISSIONS[role] || [],
    };

    return handler(request, context);
  };
}

// ============================================
// CONVENIENCE MIDDLEWARE
// ============================================

/**
 * Middleware for order management endpoints
 */
export function withOrderManagement(handler: ApiHandler): WrappedApiHandler {
  return withAnyPermission(
    ["orders:manage", "orders:update", "orders:refund", "orders:fulfill"],
    handler
  );
}

/**
 * Middleware for product management endpoints
 */
export function withProductManagement(handler: ApiHandler): WrappedApiHandler {
  return withAnyPermission(
    ["products:moderate", "products:edit", "products:delete"],
    handler
  );
}

/**
 * Middleware for user management endpoints
 */
export function withUserManagement(handler: ApiHandler): WrappedApiHandler {
  return withAnyPermission(
    ["users:ban", "users:update", "users:delete", "users:impersonate"],
    handler
  );
}

/**
 * Middleware for financial endpoints
 */
export function withFinancialAccess(handler: ApiHandler): WrappedApiHandler {
  return withAnyPermission(
    ["financial:manage", "financial:payouts", "financial:refunds", "financial:view"],
    handler
  );
}

/**
 * Middleware for system settings endpoints
 */
export function withSystemAccess(handler: ApiHandler): WrappedApiHandler {
  return withAnyPermission(
    ["system:configure", "system:maintenance", "system:logs"],
    handler
  );
}

// ============================================
// REQUEST CONTEXT HELPERS
// ============================================

/**
 * Check if user can perform action in API handler
 */
export function can(
  context: ApiContext,
  permission: Permission
): boolean {
  return hasPermission(context.role, permission);
}

/**
 * Check if user can perform any of the actions
 */
export function canAny(
  context: ApiContext,
  permissions: Permission[]
): boolean {
  return hasAnyPermission(context.role, permissions);
}

/**
 * Check if user can perform all of the actions
 */
export function canAll(
  context: ApiContext,
  permissions: Permission[]
): boolean {
  return hasAllPermissions(context.role, permissions);
}

/**
 * Check if user has required role
 */
export function hasRole(
  context: ApiContext,
  requiredRole: UserRole
): boolean {
  return hasHigherOrEqualRole(context.role, requiredRole);
}

// ============================================
// EXPORTS
// ============================================

export {
  isAdminRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasHigherOrEqualRole,
  ROLE_PERMISSIONS,
} from "@/lib/permissions";

export type { UserRole, Permission } from "@/lib/permissions";
