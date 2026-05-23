"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getBrowserClient } from "@/lib/database/browser";
import type { User } from "@/types/database";
import type { UserRole } from "@/lib/permissions";
import { hasHigherOrEqualRole } from "@/lib/permissions";
import { logger } from "@/lib/logger";

// ============================================
// AUTH CONTEXT TYPES
// ============================================

interface AuthContextType {
  user: User | null;
  session: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, userData: SignUpData) => Promise<{ error: string | null; userId: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  refreshUser: () => Promise<void>;
}

interface SignUpData {
  fullName?: string;
  displayName?: string;
  role?: UserRole;
  referralCode?: string;
}

// ============================================
// PUBLIC ROUTES (No auth required)
// ============================================

const PUBLIC_ROUTES = [
  "/",
  "/shop",
  "/artists",
  "/artist/apply",
  "/competitions",
  "/partner",
  "/invite",
  "/about",
  "/faq",
  "/contact",
  "/terms",
  "/privacy",
];

const AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/callback",
];

// ============================================
// CONTEXT CREATION
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

// ============================================
// AUTH PROVIDER COMPONENT
// ============================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabaseRef = useRef<ReturnType<typeof getBrowserClient> | null>(null);
  
  // Lazy initialize Supabase client
  if (!supabaseRef.current && typeof window !== 'undefined') {
    supabaseRef.current = getBrowserClient();
  }
  
  const supabase = supabaseRef.current!;

  // ==========================================
  // FETCH USER DATA
  // ==========================================

  const fetchUserData = useCallback(async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from("users")
      .select(`
        *,
        artist_profile:artist_profiles(*)
      `)
      .eq("id", userId as never)
      .single() as any;

    if (error || !data) {
      logger.error("Error fetching user:", error);
      return null;
    }

    const userData = data as unknown as { artist_profile: unknown };
    return {
      ...data,
      artistProfile: userData.artist_profile,
    } as User;
  }, [supabase]);

  // ==========================================
  // INITIALIZE AUTH STATE
  // ==========================================

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (currentSession?.user && mounted) {
          const userData = await fetchUserData(currentSession.user.id);
          if (mounted) {
            setUser(userData);
            setSession(true);
            // Role verified server-side in middleware
          }
        }
      } catch (error) {
        logger.error("Auth initialization error:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (event === "SIGNED_IN" && currentSession?.user) {
          const userData = await fetchUserData(currentSession.user.id);
          setUser(userData);
          setSession(true);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setSession(false);
        } else if (event === "TOKEN_REFRESHED" && currentSession?.user) {
          setSession(true);
        } else if (event === "USER_UPDATED" && currentSession?.user) {
          const userData = await fetchUserData(currentSession.user.id);
          setUser(userData);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserData]);

  // ==========================================
  // ROUTE PROTECTION (Client-side)
  // ==========================================

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));
    const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

    if (session && isAuthRoute) {
      router.push("/dashboard");
      return;
    }

    if (!session && !isPublicRoute && !isAuthRoute) {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/auth/login?returnUrl=${returnUrl}`);
    }
  }, [session, isLoading, pathname, router]);

  // ==========================================
  // AUTH ACTIONS
  // ==========================================

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: "An unexpected error occurred" };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: SignUpData
  ): Promise<{ error: string | null; userId: string | null }> => {
    try {
      let referredById: string | null = null;
      if (userData.referralCode) {
        const { data: referrer } = await supabase
          .from("users")
          .select("id")
          .eq("referral_code", userData.referralCode.toUpperCase() as never)
          .single();
        
        if (referrer && 'id' in referrer) {
          referredById = (referrer as { id: string }).id;
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: userData.fullName,
            display_name: userData.displayName,
            role: userData.role || "CUSTOMER",
            referred_by_id: referredById,
          },
        },
      });

      if (error) {
        return { error: error.message, userId: null };
      }

      if (data.user) {
        const { error: insertError } = await supabase.from("users").insert({
          id: data.user.id as unknown as undefined,
          email: email.toLowerCase().trim(),
          full_name: userData.fullName,
          display_name: userData.displayName,
          role: userData.role || "CUSTOMER",
          referred_by_id: referredById,
          verification_status: userData.role === "ARTIST" ? "PENDING" : "APPROVED",
        } as never);

        if (insertError) {
          logger.error("Error creating user record:", insertError);
        }
      }

      return { error: null, userId: data.user?.id || null };
    } catch (error) {
      return { error: "An unexpected error occurred", userId: null };
    }
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(false);
    router.push("/");
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: "An unexpected error occurred" };
    }
  };

  const updatePassword = async (password: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: "An unexpected error occurred" };
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (!user?.id) return;
    const userData = await fetchUserData(user.id);
    setUser(userData);
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user && session,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// ADDITIONAL HOOKS
// ============================================

export function useRequireAuth(redirectTo = "/auth/login") {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return { isAuthenticated, isLoading };
}

export function useRequireRole(allowedRoles: (UserRole | UserRole)[]) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const isAuthorized = useMemo(() => {
    if (!user) return false;
    // Check if user has any of the allowed roles (using hierarchy check)
    return allowedRoles.some(role => hasHigherOrEqualRole(user.role as UserRole, role as UserRole));
  }, [user, allowedRoles]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (!isAuthorized) {
        router.push("/unauthorized");
      }
    }
  }, [user, isAuthenticated, isLoading, isAuthorized, router]);

  return { user, isAuthorized, isLoading };
}
