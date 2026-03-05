// Slack OAuth2 scopes
const SCOPES = [
  'search:read',        // Search messages
  'channels:history',   // Read channel history
  'groups:history',     // Read private channel history
  'im:history',         // Read DM history
  'mpim:history',       // Read group DM history
  'users:read',         // Read user info
  'team:read',          // Read team info
];

export interface SlackOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * Generate the authorization URL for Slack OAuth2
 */
export function getSlackAuthUrl(config: SlackOAuthConfig): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    scope: SCOPES.join(','),
    redirect_uri: config.redirectUri,
  });

  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function getSlackTokens(config: SlackOAuthConfig, code: string) {
  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
    }),
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Slack OAuth error: ${data.error}`);
  }

  return {
    access_token: data.authed_user.access_token,
    refresh_token: null, // Slack tokens don't expire (long-lived)
    expires_at: null,
    scope: data.authed_user.scope,
    team_id: data.team.id,
    team_name: data.team.name,
  };
}

/**
 * Get OAuth config from environment variables
 */
export function getSlackOAuthConfig(): SlackOAuthConfig {
  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  const redirectUri = process.env.SLACK_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/slack/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Missing Slack OAuth credentials in environment variables');
  }

  return { clientId, clientSecret, redirectUri };
}
