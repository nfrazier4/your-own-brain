import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Create a mock client for build time
const mockClient: any = {
  from: () => ({
    select: () => ({
      eq: () => ({
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
        limit: () => Promise.resolve({ data: [], error: null }),
      }),
      order: () => ({
        limit: () => Promise.resolve({ data: [], error: null }),
      }),
      limit: () => Promise.resolve({ data: [], error: null }),
    }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    upsert: () => Promise.resolve({ data: null, error: null }),
    delete: () => ({
      eq: () => Promise.resolve({ data: null, error: null }),
    }),
  }),
};

let supabaseInstance: SupabaseClient | null = null;

/**
 * Get Supabase client instance (lazy-loaded)
 * This ensures the client is only created when actually needed,
 * not during build time
 */
function getSupabaseInternal(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // If env vars are missing or empty (build time), return mock
    if (!supabaseUrl || !supabaseAnonKey) {
      return mockClient;
    }

    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      // If client creation fails during build, return mock
      console.warn('Supabase client creation failed, using mock');
      return mockClient;
    }
  }

  return supabaseInstance;
}

// Export a Proxy that delays calling getSupabaseInternal() until actually used
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseInternal();
    const value = client[prop as keyof SupabaseClient];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
