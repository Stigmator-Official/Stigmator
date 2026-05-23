import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

// Check if Supabase is properly configured with valid URL
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(
    url && 
    key && 
    !url.includes('your-') && // Reject placeholders like 'your-project-url'
    !key.includes('your-') &&
    (url.startsWith('http://') || url.startsWith('https://'))
  )
}

// Mock response for demo mode
const mockEmptyResponse = { data: [], error: null }
const mockNullResponse = { data: null, error: null }

// Create a mock query builder that supports chaining
function createMockQueryBuilder() {
  const builder: any = {
    select: () => builder,
    eq: () => builder,
    neq: () => builder,
    gt: () => builder,
    gte: () => builder,
    lt: () => builder,
    lte: () => builder,
    like: () => builder,
    ilike: () => builder,
    in: () => builder,
    contains: () => builder,
    containedBy: () => builder,
    range: () => builder,
    overlaps: () => builder,
    textSearch: () => builder,
    match: () => builder,
    not: () => builder,
    or: () => builder,
    and: () => builder,
    filter: () => builder,
    order: () => builder,
    limit: () => builder,
    single: async () => mockNullResponse,
    maybeSingle: async () => mockNullResponse,
    then: (resolve: any) => Promise.resolve(mockEmptyResponse).then(resolve),
  }
  
  // Make it thenable
  builder.then = (resolve: any) => Promise.resolve(mockEmptyResponse).then(resolve)
  
  return builder
}

// Mock channel
const mockChannel = {
  on: () => mockChannel,
  subscribe: () => {},
  unsubscribe: () => {}
}

// Create mock client for demo mode
function createMockClient() {
  const mockBuilder = createMockQueryBuilder()
  
  const mock = {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: new Error('Demo mode') }),
      signUp: async () => ({ data: null, error: new Error('Demo mode') }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => mockBuilder,
    rpc: async () => mockNullResponse,
    storage: {
      from: () => ({
        upload: async () => mockNullResponse,
        download: async () => mockNullResponse,
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        remove: async () => mockNullResponse,
        list: async () => mockEmptyResponse,
      }),
    },
    channel: () => mockChannel,
    removeChannel: () => { console.debug('removeChannel called (mock)'); },
  }
  
  return mock as any
}

// Client-side Supabase client - use this in Client Components ("use client")
export const createClientBrowser = () => {
  // If not configured, return a mock client for demo mode
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Running in demo mode.')
    return createMockClient()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Export a singleton instance for convenience (lazy loaded)
let supabaseInstance: ReturnType<typeof createClientBrowser> | null = null

export const supabaseBrowser = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClientBrowser()
  }
  return supabaseInstance
}
