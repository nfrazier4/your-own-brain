import { WebClient } from '@slack/web-api';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export interface SlackMention {
  text: string;
  user: string;
  userName?: string;
  channel: string;
  channelName?: string;
  timestamp: string;
  permalink?: string;
}

/**
 * Get authenticated Slack client with stored token
 */
async function getAuthenticatedSlackClient(): Promise<WebClient> {
  const userId = 'nate';

  // Fetch stored token
  const { data: token, error } = await supabase
    .from('oauth_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('integration', 'slack')
    .single();

  if (error || !token) {
    throw new Error('Slack not connected. Please connect in settings.');
  }

  return new WebClient(token.access_token);
}

/**
 * Get Slack mentions from the last N hours
 */
export async function getSlackMentions(hoursBack: number = 24): Promise<SlackMention[]> {
  try {
    const client = await getAuthenticatedSlackClient();

    // Get authenticated user's ID
    const authResponse = await client.auth.test();
    const userId = authResponse.user_id;

    // Calculate timestamp for query (Slack uses seconds)
    const now = Math.floor(Date.now() / 1000);
    const afterTimestamp = now - hoursBack * 60 * 60;

    // Search for mentions
    const searchResponse = await client.search.messages({
      query: `<@${userId}>`,
      sort: 'timestamp',
      sort_dir: 'desc',
      count: 20,
    });

    if (!searchResponse.ok || !searchResponse.messages?.matches) {
      return [];
    }

    const mentions: SlackMention[] = [];

    for (const match of searchResponse.messages.matches.slice(0, 10)) {
      // Filter by time
      const messageTs = parseFloat(match.ts || '0');
      if (messageTs < afterTimestamp) continue;

      mentions.push({
        text: match.text || '',
        user: match.user || '',
        userName: match.username,
        channel: match.channel?.id || '',
        channelName: match.channel?.name,
        timestamp: match.ts || '',
        permalink: match.permalink,
      });
    }

    return mentions;
  } catch (error) {
    console.error('Slack mentions fetch error:', error);
    return []; // Fail gracefully
  }
}

/**
 * Get summary of Slack mentions for context
 */
export async function getSlackSummaryForContext(hoursBack: number = 24): Promise<string> {
  try {
    const mentions = await getSlackMentions(hoursBack);

    if (mentions.length === 0) {
      return 'No recent Slack mentions.';
    }

    const summary = mentions
      .slice(0, 5) // Top 5
      .map((mention) => {
        const channel = mention.channelName ? `#${mention.channelName}` : 'DM';
        const user = mention.userName || 'Someone';
        const preview = mention.text.substring(0, 80);
        return `${user} in ${channel}: "${preview}..."`;
      })
      .join('\n');

    return `Recent Slack mentions (${mentions.length}):\n${summary}`;
  } catch (error) {
    console.error('Slack summary error:', error);
    return '';
  }
}
