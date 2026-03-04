import { supabase } from './supabase';
import { NATE_PROFILE } from './constants';

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
  calendar: any[];
  slack: any[];
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
    // Parallel fetching for speed (~300ms total)
    const [memories] = await Promise.all([
      fetchRecentMemories(10),
      // TODO: Add calendar fetching in Phase 3
      // getCalendarEvents('today').catch(() => []),
      // TODO: Add Slack fetching in Phase 4
      // getSlackMentions(24).catch(() => []),
    ]);

    return {
      profile: NATE_PROFILE,
      memories: memories.slice(0, 10),
      calendar: [], // Placeholder for Phase 3
      slack: [],    // Placeholder for Phase 4
    };
  } catch (error) {
    console.error('Context building error:', error);

    // Graceful degradation - return minimal context
    return {
      profile: NATE_PROFILE,
      memories: [],
      calendar: [],
      slack: [],
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

  // Calendar section (placeholder for Phase 3)
  if (context.calendar.length > 0) {
    sections.push(`## Today's Calendar
${context.calendar.map((event: any) => `- ${event.summary} at ${event.start}`).join('\n')}`);
  }

  // Slack section (placeholder for Phase 4)
  if (context.slack.length > 0) {
    sections.push(`## Recent Slack Mentions
${context.slack.map((msg: any) => `- @${msg.user} in #${msg.channel}: "${msg.text}"`).join('\n')}`);
  }

  return sections.join('\n\n');
}
