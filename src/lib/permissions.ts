// Enterprise Permission System for STIGMATOR
// Role-based access control with granular permissions

export type UserRole = 
  | 'CUSTOMER' 
  | 'ARTIST' 
  | 'DEVELOPER' 
  | 'ADMIN' 
  | 'SUPER_ADMIN';

export type Permission =
  // Dashboard
  | 'dashboard:view'
  | 'dashboard:analytics'
  
  // Orders
  | 'orders:view'
  | 'orders:manage'
  | 'orders:update'
  | 'orders:fulfill'
  | 'orders:refund'
  | 'orders:delete'
  
  // Products
  | 'products:view'
  | 'products:create'
  | 'products:edit'
  | 'products:delete'
  | 'products:moderate'
  
  // Customers
  | 'customers:view'
  | 'customers:manage'
  
  // Users (general user management)
  | 'users:view'
  | 'users:manage'
  | 'users:ban'
  | 'users:update'
  | 'users:delete'
  | 'users:impersonate'
  
  // Artists
  | 'artists:view'
  | 'artists:manage'
  | 'artists:approve'
  
  // Studios
  | 'studios:view'
  | 'studios:manage'
  
  // Analytics
  | 'analytics:view'
  | 'analytics:export'
  
  // Promo Codes
  | 'promo:view'
  | 'promo:create'
  | 'promo:edit'
  | 'promo:delete'
  
  // Settings
  | 'settings:view'
  | 'settings:edit'
  
  // Developer
  | 'developer:view'
  | 'developer:api'
  | 'developer:webhooks'
  | 'developer:logs'
  
  // Financial
  | 'financial:view'
  | 'financial:manage'
  | 'financial:refunds'
  | 'financial:payouts'
  
  // Admin Actions
  | 'admin:manage_users'
  | 'admin:manage_roles'
  | 'admin:system_config'
  
  // System
  | 'system:configure'
  | 'system:maintenance'
  | 'system:logs';

// Role hierarchy (higher index = more permissions)
export const ROLE_HIERARCHY: UserRole[] = [
  'CUSTOMER',
  'ARTIST',
  'DEVELOPER',
  'ADMIN',
  'SUPER_ADMIN',
];

// Permission mapping for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  CUSTOMER: [
    // Customers have no admin permissions
  ],
  
  ARTIST: [
    'dashboard:view',
    'products:view',
    'products:create',
    'products:edit',
    'orders:view',
    'orders:update',
    'orders:fulfill',
    'analytics:view',
  ],
  
  DEVELOPER: [
    'dashboard:view',
    'dashboard:analytics',
    'orders:view',
    'products:view',
    'customers:view',
    'analytics:view',
    'analytics:export',
    'promo:view',
    'developer:view',
    'developer:api',
    'developer:webhooks',
    'developer:logs',
  ],
  
  ADMIN: [
    'dashboard:view',
    'dashboard:analytics',
    'orders:view',
    'orders:manage',
    'orders:refund',
    'products:view',
    'products:create',
    'products:edit',
    'products:moderate',
    'customers:view',
    'customers:manage',
    'users:view',
    'users:manage',
    'users:ban',
    'users:update',
    'users:delete',
    'users:impersonate',
    'artists:view',
    'artists:manage',
    'artists:approve',
    'studios:view',
    'studios:manage',
    'analytics:view',
    'analytics:export',
    'promo:view',
    'promo:create',
    'promo:edit',
    'settings:view',
    'settings:edit',
    'developer:view',
    'developer:logs',
    'financial:view',
    'financial:manage',
    'financial:refunds',
    'financial:payouts',
    'system:logs',
  ],
  
  SUPER_ADMIN: [
    // All permissions
    'dashboard:view',
    'dashboard:analytics',
    'orders:view',
    'orders:manage',
    'orders:refund',
    'orders:delete',
    'products:view',
    'products:create',
    'products:edit',
    'products:delete',
    'products:moderate',
    'customers:view',
    'customers:manage',
    'users:view',
    'users:manage',
    'users:ban',
    'users:update',
    'users:delete',
    'artists:view',
    'artists:manage',
    'artists:approve',
    'studios:view',
    'studios:manage',
    'analytics:view',
    'analytics:export',
    'promo:view',
    'promo:create',
    'promo:edit',
    'promo:delete',
    'settings:view',
    'settings:edit',
    'developer:view',
    'developer:api',
    'developer:webhooks',
    'developer:logs',
    'financial:view',
    'financial:manage',
    'financial:refunds',
    'financial:payouts',
    'admin:manage_users',
    'admin:manage_roles',
    'admin:system_config',
    'system:configure',
    'system:maintenance',
    'system:logs',
  ],
};

// Helper functions
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(userRole, p));
}

export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(userRole, p));
}

export function isAdmin(userRole: UserRole): boolean {
  return ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(userRole);
}

export function canAccessAdmin(userRole: UserRole): boolean {
  return isAdmin(userRole);
}

export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    CUSTOMER: 'Customer',
    ARTIST: 'Artist',
    DEVELOPER: 'Developer',
    ADMIN: 'Administrator',
    SUPER_ADMIN: 'Super Admin',
  };
  return names[role] || role;
}

export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    CUSTOMER: 'bg-[#6b8e6b]',
    ARTIST: 'bg-[#60a5fa]',
    DEVELOPER: 'bg-[#a78bfa]',
    ADMIN: 'bg-[#4ade80]',
    SUPER_ADMIN: 'bg-[#dc2626]',
  };
  return colors[role] || 'bg-[#6b8e6b]';
}

// Check if user has higher or equal role
export function hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  return userIndex >= requiredIndex;
}

// Convenience permission checks
export function canManageOrders(role: UserRole): boolean {
  return hasAnyPermission(role, ['orders:view', 'orders:manage']);
}

export function canManageProducts(role: UserRole): boolean {
  return hasAnyPermission(role, ['products:view', 'products:create', 'products:edit']);
}

export function canManageUsers(role: UserRole): boolean {
  return hasAnyPermission(role, ['admin:manage_users', 'admin:manage_roles']);
}

export function canManageFinancials(role: UserRole): boolean {
  return hasAnyPermission(role, ['analytics:view', 'analytics:export']);
}

export function canAccessSystem(role: UserRole): boolean {
  return hasAnyPermission(role, ['developer:view', 'developer:api', 'developer:logs']);
}

// Alias for backwards compatibility
export const isAdminRole = isAdmin;
export const hasHigherOrEqualRole = hasRoleLevel;
