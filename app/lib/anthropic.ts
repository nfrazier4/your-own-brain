import Anthropic from '@anthropic-ai/sdk';

// Claude SDK client singleton (server-side only)
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Type definitions for chat messages
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Model constants
export const CLAUDE_MODEL = 'claude-sonnet-4-5-20250514' as const;
export const MAX_TOKENS = 2048;
