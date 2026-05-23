"use client";

import { ReactNode } from "react";
import { UserRole, Permission, hasPermission, hasAnyPermission } from "@/lib/permissions";

export interface PermissionGateProps {
  userRole: UserRole;
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({
  userRole,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGateProps) {
  let hasAccess = false;

  if (requiredPermission) {
    hasAccess = hasPermission(userRole, requiredPermission);
  } else if (requiredPermissions) {
    hasAccess = requireAll
      ? requiredPermissions.every(p => hasPermission(userRole, p))
      : requiredPermissions.some(p => hasPermission(userRole, p));
  } else {
    hasAccess = true;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Simpler version that just checks role level
export interface RoleGateProps {
  userRole: UserRole;
  minRole: UserRole;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({
  userRole,
  minRole,
  children,
  fallback = null,
}: RoleGateProps) {
  const ROLE_LEVELS: UserRole[] = ['CUSTOMER', 'ARTIST', 'DEVELOPER', 'ADMIN', 'SUPER_ADMIN'];
  const userLevel = ROLE_LEVELS.indexOf(userRole);
  const minLevel = ROLE_LEVELS.indexOf(minRole);

  if (userLevel < minLevel) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
