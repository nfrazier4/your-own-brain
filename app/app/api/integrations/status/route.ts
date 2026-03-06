import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // Return mock for build time
    return {
      from: () => ({
        select: () => ({
          eq: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    } as any;
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * GET /api/integrations/status
 * Check which integrations are connected
 */
export async function GET() {
  try {
    const userId = 'nate'; // Single-user for now
    const supabase = getSupabaseAdmin();

    // Check which integrations have valid tokens
    const { data: tokens, error } = await supabase
      .from('oauth_tokens')
      .select('integration, expires_at')
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to fetch integration status:', error);
      return Response.json({ error: 'Failed to fetch status' }, { status: 500 });
    }

    // Build status object
    const status: Record<string, boolean> = {
      google: false,
      slack: false,
    };

    tokens?.forEach((token: any) => {
      // Check if token is valid (not expired)
      const isValid = !token.expires_at || new Date(token.expires_at) > new Date();
      status[token.integration] = isValid;
    });

    return Response.json(status);
  } catch (error) {
    console.error('Integration status error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
