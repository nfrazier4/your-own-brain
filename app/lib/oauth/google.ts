import { google } from 'googleapis';

// Google OAuth2 scopes for Calendar and Gmail
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export function createGoogleOAuth2Client(config: GoogleOAuthConfig) {
  return new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUri
  );
}

/**
 * Generate the authorization URL for Google OAuth2
 */
export function getGoogleAuthUrl(config: GoogleOAuthConfig): string {
  const oauth2Client = createGoogleOAuth2Client(config);

  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Get refresh token
    prompt: 'consent', // Force consent screen to get refresh token
    scope: SCOPES,
  });
}

/**
 * Exchange authorization code for access token
 */
export async function getGoogleTokens(config: GoogleOAuthConfig, code: string) {
  const oauth2Client = createGoogleOAuth2Client(config);

  const { tokens } = await oauth2Client.getToken(code);

  return {
    access_token: tokens.access_token!,
    refresh_token: tokens.refresh_token || null,
    expires_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    scope: tokens.scope || SCOPES.join(' '),
  };
}

/**
 * Refresh an expired access token
 */
export async function refreshGoogleToken(config: GoogleOAuthConfig, refreshToken: string) {
  const oauth2Client = createGoogleOAuth2Client(config);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const { credentials } = await oauth2Client.refreshAccessToken();

  return {
    access_token: credentials.access_token!,
    expires_at: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
  };
}

/**
 * Get OAuth config from environment variables
 */
export function getGoogleOAuthConfig(): GoogleOAuthConfig {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Missing Google OAuth credentials in environment variables');
  }

  return { clientId, clientSecret, redirectUri };
}
