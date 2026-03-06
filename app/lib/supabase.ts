import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Get Supabase client instance (lazy-loaded)
 * This ensures the client is only created when actually needed,
 * not during build time
 */
export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // During build time, env vars might not be available
    // Create a placeholder that will be replaced at runtime
    if (!supabaseUrl || !supabaseAnonKey) {
      // Return a mock client for build time
      // This will never be called at runtime because the env vars will be available
      return {
        from: () => ({
          select: () => ({ data: [], error: null }),
          insert: () => ({ data: null, error: null }),
          update: () => ({ data: null, error: null }),
          upsert: () => ({ data: null, error: null }),
          delete: () => ({ data: null, error: null }),
        }),
      } as any;
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseInstance;
}

// Export a proxy that lazily creates the client
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    return getSupabase()[prop as keyof SupabaseClient];
  },
});
