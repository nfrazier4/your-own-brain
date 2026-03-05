import { anthropic, CLAUDE_MODEL, MAX_TOKENS, type Message } from '@/lib/anthropic';
import { buildContextForClaude, formatContextForPrompt } from '@/lib/context-builder';

export const runtime = 'nodejs';

/**
 * POST /api/chat
 * Streaming chat endpoint with Claude Sonnet 4.5
 *
 * Request body: { messages: Message[] }
 * Response: Server-Sent Events stream
 */
interface FileAttachment {
  name: string;
  type: string;
  data: string; // base64
}

export async function POST(req: Request) {
  try {
    const { messages, file } = await req.json() as { messages: Message[]; file?: FileAttachment };

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid request: messages array required', { status: 400 });
    }

    // Fetch context in parallel (profile + memories + calendar + slack)
    const context = await buildContextForClaude();
    const formattedContext = formatContextForPrompt(context);

    // Build system prompt with full context
    const systemPrompt = `You are Nate's Chief of Staff - a proactive, ADHD-friendly personal assistant.

${formattedContext}

## Your Role
You help Nate manage his complex, multi-context life across 4 areas (OAIA, Swell, Partio, Personal). You:
- Provide concise, actionable responses (1-2 sentences unless asked for more)
- Proactively reference relevant memories and context
- Help create structured tasks when appropriate
- Reduce cognitive load by surfacing what matters
- Ask clarifying questions for vague requests

## Task Card Format
When suggesting a task, use this EXACT format (include the triple backticks and "task-card" label):

\`\`\`task-card
{
  "title": "Clear, actionable task description",
  "area": "oaia|swell|partio|personal|work",
  "type": "thought|decision|person|meeting|insight",
  "dueDate": "2026-03-07"
}
\`\`\`

**Examples:**

User: "Remind me to follow up with Dan about the Silver Line timeline next week"
Assistant: I'll create a task for that.

\`\`\`task-card
{
  "title": "Follow up with Dan about Silver Line Electric timeline",
  "area": "swell",
  "type": "person",
  "dueDate": "2026-03-10"
}
\`\`\`

User: "I need to prep for the OAIA mentor speed dating event"
Assistant: Let me create a task for your OAIA prep.

\`\`\`task-card
{
  "title": "Prepare for OAIA mentor speed dating event",
  "area": "oaia",
  "type": "meeting"
}
\`\`\`

**Important:**
- Only create task cards when the user explicitly asks for a task/reminder OR when you identify a clear action item
- Don't create task cards for every response - only when appropriate
- Keep titles clear and actionable (start with a verb when possible)
- Choose the most relevant area and type
- dueDate is optional - only include if user specifies or it's clear from context

## Guidelines
- **Be concise**: ADHD-friendly responses, one clear action at a time
- **Reference context**: Use recent memories, calendar events, Slack mentions
- **Stay in character**: You're a Chief of Staff, not a generic assistant
- **Proactive**: Surface relevant info without being asked
- **Action-oriented**: Always include next steps when appropriate`;

    // Format messages with file attachment support
    const formattedMessages = messages.map((m, index) => {
      // If this is the last message and has a file attachment
      if (index === messages.length - 1 && file) {
        // Image file - use vision
        if (file.type.startsWith('image/')) {
          return {
            role: m.role,
            content: [
              {
                type: 'image' as const,
                source: {
                  type: 'base64' as const,
                  media_type: file.type as any,
                  data: file.data,
                },
              },
              {
                type: 'text' as const,
                text: m.content || 'What do you see in this image?',
              },
            ],
          };
        }
        // PDF or document - add context in text
        else if (file.type.includes('pdf') || file.type.includes('document')) {
          return {
            role: m.role,
            content: `[User attached file: ${file.name}]\n\n${m.content || 'Please analyze this document.'}`,
          };
        }
      }

      // Regular text message
      return {
        role: m.role,
        content: m.content,
      };
    });

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream Claude's response
          const messageStream = await anthropic.messages.stream({
            model: CLAUDE_MODEL,
            max_tokens: MAX_TOKENS,
            system: systemPrompt,
            messages: formattedMessages as any,
          });

          // Forward each chunk as SSE
          for await (const event of messageStream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const sseData = `data: ${JSON.stringify({
                type: 'content_block_delta',
                delta: { text: event.delta.text }
              })}\n\n`;
              controller.enqueue(new TextEncoder().encode(sseData));
            }
          }

          // Send completion signal
          controller.enqueue(new TextEncoder().encode('data: {"type":"message_stop"}\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = `data: ${JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
