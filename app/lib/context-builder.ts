import { supabase } from './supabase';
import { NATE_PROFILE } from './constants';
import { getCalendarEvents, type CalendarEvent } from './google-calendar';
import { getSlackMentions, type SlackMention } from './slack';
import { getEmailsNeedingResponse, type GmailThread } from './gmail';

interface Memory {
  id: number;
  raw_text: string;
  context_tag: string;
  memory_type: string;
  people: string[];
  action_items: string[];
  tags: string[];
  created_at: string;
}

export interface ContextData {
  profile: typeof NATE_PROFILE;
  memories: Memory[];
  calendar: CalendarEvent[];
  slack: SlackMention[];
  gmail: GmailThread[];
}

/**
 * Fetch recent memories from Supabase brain
 */
async function fetchRecentMemories(limit: number = 10): Promise<Memory[]> {
  try {
    const { data } = await supabase
      .from('memories')
      .select('id, raw_text, context_tag, memory_type, people, action_items, tags, created_at')
      .eq('archived', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  } catch (error) {
    console.error('Error fetching memories:', error);
    return [];
  }
}

/**
 * Build complete context for Claude's system prompt
 * Fetches data in parallel for speed
 */
export async function buildContextForClaude(): Promise<ContextData> {
  try {
    // Parallel fetching for speed (~500ms total)
    // Fail gracefully for external integrations if not connected
    const [memories, calendar, slack, gmail] = await Promise.all([
      fetchRecentMemories(10),
      getCalendarEvents('today').catch((err) => {
        console.log('Calendar not available:', err.message);
        return [];
      }),
      getSlackMentions(24).catch((err) => {
        console.log('Slack not available:', err.message);
        return [];
      }),
      getEmailsNeedingResponse(7).catch((err) => {
        console.log('Gmail not available:', err.message);
        return [];
      }),
    ]);

    return {
      profile: NATE_PROFILE,
      memories: memories.slice(0, 10),
      calendar,
      slack,
      gmail,
    };
  } catch (error) {
    console.error('Context building error:', error);

    // Graceful degradation - return minimal context
    return {
      profile: NATE_PROFILE,
      memories: [],
      calendar: [],
      slack: [],
      gmail: [],
    };
  }
}

/**
 * Format context data into a readable string for Claude's system prompt
 */
export function formatContextForPrompt(context: ContextData): string {
  const sections: string[] = [];

  // Profile section
  sections.push(`## About Nate
Name: ${context.profile.name}
Role: ${context.profile.role}
Context: ${context.profile.context}

### Areas Nate Manages:
- **OAIA**: ${context.profile.areas.oaia}
- **Swell**: ${context.profile.areas.swell}
- **Partio**: ${context.profile.areas.partio}
- **Personal**: ${context.profile.areas.personal}

### Communication Preferences:
${context.profile.preferences}`);

  // Recent memories section
  if (context.memories.length > 0) {
    sections.push(`## Recent Memories (Last 10 Captures)
${context.memories.map((m, i) => {
  const area = m.context_tag.toUpperCase();
  const date = new Date(m.created_at).toLocaleDateString();
  let memoryText = `${i + 1}. [${area}] ${m.raw_text} (${date})`;

  if (m.people && m.people.length > 0) {
    memoryText += `\n   People: ${m.people.join(', ')}`;
  }
  if (m.action_items && m.action_items.length > 0) {
    memoryText += `\n   Actions: ${m.action_items.join('; ')}`;
  }

  return memoryText;
}).join('\n\n')}`);
  }

  // Calendar section
  if (context.calendar.length > 0) {
    sections.push(`## Today's Calendar (${context.calendar.length} events)
${context.calendar.map((event, i) => {
  const startTime = new Date(event.start).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  let eventText = `${i + 1}. ${startTime} - ${event.summary}`;
  if (event.location) {
    eventText += ` (${event.location})`;
  }
  if (event.attendees && event.attendees.length > 0) {
    eventText += `\n   Attendees: ${event.attendees.slice(0, 3).join(', ')}${event.attendees.length > 3 ? '...' : ''}`;
  }
  return eventText;
}).join('\n\n')}`);
  }

  // Gmail section
  if (context.gmail.length > 0) {
    sections.push(`## Emails Needing Response (${context.gmail.length} total)
${context.gmail.slice(0, 5).map((email, i) => {
  const status = email.unread ? '[UNREAD]' : '[Important]';
  const preview = email.snippet.substring(0, 100);
  return `${i + 1}. ${status} From: ${email.from}
   Subject: ${email.subject}
   Preview: ${preview}...`;
}).join('\n\n')}`);
  }

  // Slack section
  if (context.slack.length > 0) {
    sections.push(`## Recent Slack Mentions (${context.slack.length} total)
${context.slack.slice(0, 5).map((mention, i) => {
  const channel = mention.channelName ? `#${mention.channelName}` : 'DM';
  const user = mention.userName || 'Someone';
  const preview = mention.text.substring(0, 100);
  return `${i + 1}. ${user} in ${channel}:
   "${preview}..."`;
}).join('\n\n')}`);
  }

  return sections.join('\n\n');
}
