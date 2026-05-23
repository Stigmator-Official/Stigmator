// ============================================
// MIDDLEWARE - Authentication & Authorization
// ============================================

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import {
  isAdmin,
  type UserRole,
} from "@/lib/permissions";

// ============================================
// ROUTE CONFIGURATION
// ============================================

// Public routes (no auth required)
const PUBLIC_ROUTES = [
  "/",
  "/shop",
  "/artists",
  "/artist/apply",
  "/artist/",
  "/competitions",
  "/partner",
  "/invite",
  "/about",
  "/faq",
  "/contact",
  "/terms",
  "/privacy",
  "/product/",
  "/design/",
  "/studio/",
];

// Auth routes (redirect to dashboard if already logged in)
const AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/callback",
];

// Admin routes (admin only)
const ADMIN_ROUTES = [
  "/admin",
  "/admin/",
];

// Protected routes (require authentication)
const PROTECTED_ROUTES = [
  "/dashboard",
  "/dashboard/",
  "/account",
  "/account/",
  "/orders",
  "/orders/",
  "/cart/checkout",
  "/portfolio",
  "/studio/manage",
  "/fulfillment",
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a path matches any of the route patterns
 */
function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some((route) => {
    if (route.endsWith("/")) {
      return path.startsWith(route);
    }
    return path === route || path.startsWith(`${route}/`);
  });
}

/**
 * Check if a path is a static file
 */
function isStaticFile(path: string): boolean {
  return (
    path.startsWith("/_next/") ||
    path.startsWith("/static/") ||
    path.match(/\.(?:ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$/i) !== null
  );
}

/**
 * Check if a path is public
 */
function isPublicRoute(path: string): boolean {
  return matchesRoute(path, PUBLIC_ROUTES);
}

/**
 * Check if a path is an auth route
 */
function isAuthRoute(path: string): boolean {
  return matchesRoute(path, AUTH_ROUTES);
}

/**
 * Check if a path is an admin route
 */
function isAdminRoute(path: string): boolean {
  return matchesRoute(path, ADMIN_ROUTES);
}

/**
 * Check if a path requires authentication
 */
function isProtectedRoute(path: string): boolean {
  return matchesRoute(path, PROTECTED_ROUTES);
}

// ============================================
// MIDDLEWARE
// ============================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files
  if (isStaticFile(pathname)) {
    return NextResponse.next();
  }

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = supabaseUrl && supabaseKey && 
    (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'));

  // Create Supabase client only if configured
  const response = NextResponse.next();
  
  let supabase: ReturnType<typeof createServerClient> | null = null;
  if (isSupabaseConfigured) {
    try {
      supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
              request.cookies.set({ name, value, ...options });
              response.cookies.set({ name, value, ...options });
            },
            remove(name: string, options: CookieOptions) {
              request.cookies.set({ name, value: "", ...options });
              response.cookies.set({ name, value: "", ...options });
            },
          },
        }
      );
    } catch {
      // Failed to create Supabase client
    }
  }

  let isAuthenticated = false;
  let userRole: UserRole | null = null;

  if (supabase) {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user && !error) {
        isAuthenticated = true;
        
        // Always fetch role from database for security (no client-trusted cookie shortcut)
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
        
        userRole = (userData?.role as UserRole) || "CUSTOMER";
      }
    } catch {
      // Error checking auth, treat as unauthenticated
    }
  }

  const userIsAdmin = userRole ? isAdmin(userRole) : false;

  // ==========================================
  // ROUTE PROTECTION LOGIC
  // ==========================================

  // 1. Admin routes - require admin role
  if (isAdminRoute(pathname)) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!userIsAdmin) {
      // User is authenticated but not an admin
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return response;
  }

  // 2. Auth routes - redirect to dashboard if already authenticated
  if (isAuthRoute(pathname)) {
    if (isAuthenticated) {
      // Redirect to appropriate dashboard based on role
      let redirectPath = "/dashboard";
      
      if (userIsAdmin) {
        redirectPath = "/admin";
      } else if (userRole === "ARTIST") {
        redirectPath = "/dashboard";
      }
      
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    return response;
  }

  // 3. Protected routes - require authentication
  if (isProtectedRoute(pathname)) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  // 4. Public routes - allow access
  return response;
}

// ============================================
// CONFIG
// ============================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
