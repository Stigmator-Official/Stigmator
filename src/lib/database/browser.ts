// STIGMATOR Browser Database Client
// DEPRECATED: Use @/lib/supabase/client directly. This file is kept for backwards compatibility.
// Safe for Client Components

import { createClient } from '@supabase/supabase-js';
import type { Database } from './schema';

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if configured with valid URL
const isConfigured = (
  SUPABASE_URL.length > 0 && 
  SUPABASE_KEY.length > 0 &&
  (SUPABASE_URL.startsWith('http://') || SUPABASE_URL.startsWith('https://'))
);

// Mock client
function mockClient(): ReturnType<typeof createClient<Database>> {
  return new Proxy({} as ReturnType<typeof createClient<Database>>, {
    get(_, prop) {
      if (prop === 'auth') {
        return {
          getUser: async () => ({ data: { user: null }, error: null }),
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithPassword: async () => ({ data: null, error: null }),
          signUp: async () => ({ data: null, error: null }),
          signOut: async () => ({ error: null }),
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
      if (prop === 'channel') {
        return () => ({ 
          on: () => ({ subscribe: () => {} }),
          unsubscribe: () => {}
        });
      }
      if (prop === 'removeChannel') {
        return () => {};
      }
      return undefined;
    },
  });
}

// Create browser client
export function createBrowserClient() {
  if (!isConfigured) {
    return mockClient();
  }
  return createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
  });
}

// Singleton
let instance: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  if (typeof window === 'undefined') {
    throw new Error('Browser only');
  }
  if (!instance) {
    instance = createBrowserClient();
  }
  return instance;
}

// Other exports
export interface QueryOptions {
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

export function buildQuery<T extends { 
  select: (c: string) => T; 
  order: (c: string, o: { ascending: boolean }) => T; 
  limit: (n: number) => T; 
  range: (f: number, t: number) => T 
}>(q: T, opts: QueryOptions): T {
  let b = q;
  if (opts.select) b = b.select(opts.select);
  if (opts.orderBy) b = b.order(opts.orderBy.column, { ascending: opts.orderBy.ascending ?? false });
  if (opts.limit) b = b.limit(opts.limit);
  if (opts.offset) b = b.range(opts.offset, opts.offset + (opts.limit ?? 10) - 1);
  return b;
}

export class DatabaseError extends Error {
  code: string;
  constructor(m: string, c: string) { super(m); this.name = 'DatabaseError'; this.code = c; }
}

export interface RealtimeConfig {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  callback: (p: unknown) => void;
}

export function subscribeToChanges(
  c: ReturnType<typeof createBrowserClient>,
  cfg: RealtimeConfig
) {
  const ch = c.channel(`db-${cfg.table}`).on('postgres_changes' as never, {
    event: cfg.event, schema: 'public', table: cfg.table, filter: cfg.filter,
  }, cfg.callback).subscribe();
  return { unsubscribe: () => ch.unsubscribe() };
}
