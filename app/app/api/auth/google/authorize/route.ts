import { getGoogleAuthUrl, getGoogleOAuthConfig } from '@/lib/oauth/google';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * GET /api/auth/google/authorize
 * Redirect to Google OAuth2 consent screen
 */
export async function GET() {
  try {
    const config = getGoogleOAuthConfig();
    const authUrl = getGoogleAuthUrl(config);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google authorization error:', error);
    return NextResponse.redirect(
      `/settings?error=${encodeURIComponent('Failed to start Google authorization')}`
    );
  }
}
