import Anthropic from '@anthropic-ai/sdk';

// Claude SDK client singleton (server-side only)
// Lazy initialization to avoid errors during build
let anthropicInstance: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicInstance) {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'your-api-key-here') {
      throw new Error(
        'ANTHROPIC_API_KEY environment variable not configured. ' +
        'Please add your Anthropic API key to Vercel environment variables.'
      );
    }

    anthropicInstance = new Anthropic({ apiKey });
  }

  return anthropicInstance;
}

export const anthropic = new Proxy({} as Anthropic, {
  get(_, prop) {
    const client = getAnthropicClient();
    const value = client[prop as keyof Anthropic];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

// Type definitions for chat messages
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Model constants
export const CLAUDE_MODEL = 'claude-sonnet-4-5-20250514' as const;
export const MAX_TOKENS = 2048;
