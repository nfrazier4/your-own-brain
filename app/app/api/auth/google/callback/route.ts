import { getGoogleTokens, getGoogleOAuthConfig } from '@/lib/oauth/google';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // Return mock for build time
    return {
      from: () => ({
        upsert: () => Promise.resolve({ data: null, error: null }),
      }),
    } as any;
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * GET /api/auth/google/callback
 * Handle OAuth callback from Google
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/settings?error=${encodeURIComponent('Google authorization failed')}`, req.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/settings?error=missing_code', req.url)
      );
    }

    // Exchange code for tokens
    const config = getGoogleOAuthConfig();
    const tokens = await getGoogleTokens(config, code);

    // Store tokens in Supabase
    const userId = 'nate'; // Single-user for now
    const supabase = getSupabaseAdmin();

    const { error: dbError } = await supabase
      .from('oauth_tokens')
      .upsert({
        user_id: userId,
        integration: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_at?.toISOString(),
        scope: tokens.scope,
      }, {
        onConflict: 'user_id,integration',
      });

    if (dbError) {
      console.error('Failed to store Google tokens:', dbError);
      return NextResponse.redirect(
        new URL(`/settings?error=${encodeURIComponent('Failed to save Google connection')}`, req.url)
      );
    }

    // Success - redirect back to settings
    return NextResponse.redirect(
      new URL('/settings?success=google_connected', req.url)
    );
  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent('Google authorization failed')}`, req.url)
    );
  }
}
