import { getSlackAuthUrl, getSlackOAuthConfig } from '@/lib/oauth/slack';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * GET /api/auth/slack/authorize
 * Redirect to Slack OAuth2 consent screen
 */
export async function GET() {
  try {
    const config = getSlackOAuthConfig();
    const authUrl = getSlackAuthUrl(config);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Slack authorization error:', error);
    return NextResponse.redirect(
      `/settings?error=${encodeURIComponent('Failed to start Slack authorization')}`
    );
  }
}
