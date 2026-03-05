import { google } from 'googleapis';
import { createGoogleOAuth2Client, getGoogleOAuthConfig } from './oauth/google';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export interface GmailThread {
  id: string;
  snippet: string;
  from: string;
  subject: string;
  date: string;
  unread: boolean;
  needsResponse: boolean;
}

/**
 * Get OAuth2 client authenticated with stored tokens
 */
async function getAuthenticatedGmailClient() {
  const userId = 'nate';

  // Fetch stored token
  const { data: token, error } = await supabase
    .from('oauth_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('integration', 'google')
    .single();

  if (error || !token) {
    throw new Error('Google not connected. Please connect in settings.');
  }

  // Check if token is expired
  if (token.expires_at && new Date(token.expires_at) <= new Date()) {
    // TODO: Implement token refresh
    throw new Error('Google token expired. Please reconnect in settings.');
  }

  const config = getGoogleOAuthConfig();
  const oauth2Client = createGoogleOAuth2Client(config);
  oauth2Client.setCredentials({
    access_token: token.access_token,
    refresh_token: token.refresh_token,
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

/**
 * Fetch emails that need responses
 * Looks for:
 * - Unread emails in inbox
 * - Emails sent to user directly (not CC)
 * - Recent emails (last 7 days)
 */
export async function getEmailsNeedingResponse(daysBack: number = 7): Promise<GmailThread[]> {
  try {
    const gmail = await getAuthenticatedGmailClient();

    // Calculate date for query
    const date = new Date();
    date.setDate(date.getDate() - daysBack);
    const afterDate = Math.floor(date.getTime() / 1000);

    // Search for emails
    // Query: in inbox, sent to me, after date, is unread OR marked important
    const query = `in:inbox to:me after:${afterDate} (is:unread OR is:important)`;

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 20,
    });

    const messages = response.data.messages || [];

    // Fetch full details for each message
    const threads: GmailThread[] = [];

    for (const message of messages.slice(0, 10)) {
      // Limit to 10 to avoid rate limits
      try {
        const details = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'full',
        });

        const headers = details.data.payload?.headers || [];
        const from = headers.find((h) => h.name === 'From')?.value || 'Unknown';
        const subject = headers.find((h) => h.name === 'Subject')?.value || 'No subject';
        const date = headers.find((h) => h.name === 'Date')?.value || '';

        // Check if unread
        const labelIds = details.data.labelIds || [];
        const unread = labelIds.includes('UNREAD');
        const important = labelIds.includes('IMPORTANT');

        threads.push({
          id: details.data.id!,
          snippet: details.data.snippet || '',
          from: from.replace(/<.*>/, '').trim(), // Extract name from "Name <email>"
          subject,
          date,
          unread,
          needsResponse: unread || important,
        });
      } catch (err) {
        console.error('Failed to fetch message details:', err);
      }
    }

    return threads;
  } catch (error) {
    console.error('Gmail fetch error:', error);
    return []; // Fail gracefully
  }
}

/**
 * Get summary of emails for context
 */
export async function getGmailSummaryForContext(): Promise<string> {
  try {
    const emails = await getEmailsNeedingResponse(7);

    if (emails.length === 0) {
      return 'No emails needing immediate attention.';
    }

    const summary = emails
      .slice(0, 5) // Top 5
      .map((email) => {
        const status = email.unread ? '[UNREAD]' : '[Important]';
        return `${status} From: ${email.from} - ${email.subject}`;
      })
      .join('\n');

    return `Emails needing attention (${emails.length}):\n${summary}`;
  } catch (error) {
    console.error('Gmail summary error:', error);
    return '';
  }
}
