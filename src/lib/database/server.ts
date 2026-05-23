// STIGMATOR Database Client - Server Only
// DEPRECATED: Use @/lib/supabase/server directly. This file is kept for backwards compatibility.
// This file should only be imported in Server Components or API routes

import { createClient } from '@supabase/supabase-js';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './schema';

// Environment getters - safe for missing env vars
const getSupabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const getSupabaseKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const getServiceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if Supabase is configured with valid URL
const isConfigured = () => {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  return !!(
    url && 
    key && 
    (url.startsWith('http://') || url.startsWith('https://'))
  );
};

// ============================================
// SERVER CLIENT
// ============================================

/**
 * Server-side Supabase client with cookie-based auth
 * Use this in Server Components and API routes
 */
export async function createServerClient() {
  if (!isConfigured()) {
    console.warn('Supabase not configured - returning mock client');
    return createMockClient();
  }

  const cookieStore = await cookies();

  return createSupabaseServerClient(getSupabaseUrl(), getSupabaseKey(), {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // Handle middleware case where cookies can't be set
        }
      },
      remove(name: string, options: Record<string, unknown>) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch (error) {
          // Handle middleware case where cookies can't be removed
        }
      },
    },
  });
}

// Mock client for when Supabase is not configured
function createMockClient(): any {
  return new Proxy({} as any, {
    get(target, prop) {
      if (prop === 'auth') {
        return {
          getUser: async () => ({ data: { user: null }, error: null }),
          getSession: async () => ({ data: { session: null }, error: null }),
        };
      }
      if (prop === 'from') {
        return () => ({
          select: () => ({ data: [], error: null }),
          insert: () => ({ data: null, error: null }),
          update: () => ({ data: null, error: null }),
          delete: () => ({ data: null, error: null }),
        });
      }
      return target[prop as keyof typeof target];
    },
  });
}

// ============================================
// ADMIN CLIENT
// ============================================

/**
 * Admin/Service role client
 * Use this for admin operations, bypasses RLS
 * ⚠️ Never expose this to the client
 */
export function createAdminClient() {
  const serviceKey = getServiceKey();
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin client');
  }

  return createClient(getSupabaseUrl(), serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ============================================
// SERVER-SIDE QUERY HELPERS
// ============================================

export interface QueryOptions {
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

/**
 * Execute a database query on the server
 */
export async function executeServerQuery<T>(
  table: string,
  options: QueryOptions = {}
): Promise<{ data: T[] | null; error: Error | null }> {
  const client = await createServerClient();
  
  let query = client.from(table).select(options.select || '*');

  if (options.orderBy) {
    query = query.order(options.orderBy.column, {
      ascending: options.orderBy.ascending ?? false,
    });
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1);
  }

  const { data, error } = await query;
  return { data: data as T[] | null, error };
}
