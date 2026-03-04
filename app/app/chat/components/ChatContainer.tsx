'use client';

import { useEffect, useRef } from 'react';
import { T } from '@/lib/design-tokens';
import type { Message } from '@/lib/anthropic';
import { ChatMessage } from './ChatMessage';
import { StreamingIndicator } from './StreamingIndicator';

interface ChatContainerProps {
  messages: Message[];
  isStreaming: boolean;
}

export function ChatContainer({ messages, isStreaming }: ChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 32px',
        background: T.mainBg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {messages.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '60px 20px',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 8 }}>
            Welcome to Chief of Staff
          </h2>
          <p style={{ fontSize: 14, color: T.textSub, maxWidth: 400, lineHeight: 1.6 }}>
            Your personal life integration layer. I have context from your brain, calendar, and Slack.
            What would you like to work on?
          </p>

          <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {[
              "What do I need to deal with today?",
              "What's the status of OAIA spring cohort?",
              "Summarize my recent work",
            ].map((suggestion, i) => (
              <div
                key={i}
                style={{
                  padding: '6px 14px',
                  background: T.cardBg,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radiusPill,
                  fontSize: 12,
                  color: T.textSub,
                  fontStyle: 'italic',
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              isNew={index === messages.length - 1}
            />
          ))}
          {isStreaming && <StreamingIndicator />}
        </>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
