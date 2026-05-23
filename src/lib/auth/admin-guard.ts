// Admin Guard - Authentication and Authorization for Admin Routes

import { createClientServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UserRole, Permission, canAccessAdmin, hasPermission } from "@/lib/permissions";

export interface AdminSession {
  id: string;
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

// Get current admin session from Supabase auth
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const supabase = await createClientServer();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    // Fetch user role from database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email, role, full_name")
      .eq("id", user.id)
      .single();
      
    if (userError || !userData) {
      return null;
    }
    
    const role = userData.role as UserRole;
    if (!canAccessAdmin(role)) {
      return null;
    }
    
    return {
      id: userData.id,
      userId: userData.id,
      email: userData.email,
      role,
      name: userData.full_name || userData.email,
    };
  } catch {
    return null;
  }
}

// Require admin access - use in page components
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  
  if (!session) {
    redirect('/auth/login?redirect=/admin');
  }
  
  if (!canAccessAdmin(session.role)) {
    redirect('/unauthorized');
  }
  
  return session;
}

// Require specific permission
export async function requirePermission(permission: Permission): Promise<AdminSession> {
  const session = await requireAdmin();
  
  if (!hasPermission(session.role, permission)) {
    redirect('/unauthorized');
  }
  
  return session;
}

// Require any of multiple permissions
export async function requireAnyPermission(permissions: Permission[]): Promise<AdminSession> {
  const session = await requireAdmin();
  
  const hasAny = permissions.some(p => hasPermission(session.role, p));
  if (!hasAny) {
    redirect('/unauthorized');
  }
  
  return session;
}

// Check if API request is from authorized admin
export async function checkAdminApiAuth(requiredPermission?: Permission): Promise<AdminSession> {
  const session = await getAdminSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  if (!canAccessAdmin(session.role)) {
    throw new Error('Forbidden');
  }
  
  if (requiredPermission && !hasPermission(session.role, requiredPermission)) {
    throw new Error('Forbidden');
  }
  
  return session;
}
