import { getSlackTokens, getSlackOAuthConfig } from '@/lib/oauth/slack';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

/**
 * GET /api/auth/slack/callback
 * Handle OAuth callback from Slack
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Slack OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/settings?error=${encodeURIComponent('Slack authorization failed')}`, req.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/settings?error=missing_code', req.url)
      );
    }

    // Exchange code for tokens
    const config = getSlackOAuthConfig();
    const tokens = await getSlackTokens(config, code);

    // Store tokens in Supabase
    const userId = 'nate'; // Single-user for now

    const { error: dbError } = await supabase
      .from('oauth_tokens')
      .upsert({
        user_id: userId,
        integration: 'slack',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: null, // Slack tokens are long-lived and don't expire
        scope: tokens.scope,
      }, {
        onConflict: 'user_id,integration',
      });

    if (dbError) {
      console.error('Failed to store Slack tokens:', dbError);
      return NextResponse.redirect(
        new URL(`/settings?error=${encodeURIComponent('Failed to save Slack connection')}`, req.url)
      );
    }

    // Success - redirect back to settings
    return NextResponse.redirect(
      new URL('/settings?success=slack_connected', req.url)
    );
  } catch (error) {
    console.error('Slack callback error:', error);
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent('Slack authorization failed')}`, req.url)
    );
  }
}
