"use client";

import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { UserRole, Permission, hasPermission, canAccessAdmin } from "@/lib/permissions";

interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

interface UseAdminReturn {
  user: AdminUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  checkPermission: (permission: Permission) => boolean;
}

export function useAdmin(): UseAdminReturn {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const supabase = supabaseBrowser();
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, email, role, full_name")
          .eq("id", authUser.id)
          .single();

        if (userError || !userData || !canAccessAdmin(userData.role as UserRole)) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        setUser({
          id: userData.id,
          email: userData.email,
          role: userData.role as UserRole,
          name: userData.full_name || userData.email,
        });
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmin();
  }, []);

  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  return {
    user,
    isLoading,
    isAdmin: !!user,
    checkPermission,
  };
}

export function usePermission(permission: Permission): boolean {
  const { checkPermission } = useAdmin();
  return checkPermission(permission);
}

export function useRole(): UserRole | null {
  const { user } = useAdmin();
  return user?.role || null;
}
