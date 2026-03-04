'use client';

import { T, CHAT_TOKENS } from '@/lib/design-tokens';
import type { Message } from '@/lib/anthropic';

interface ChatMessageProps {
  message: Message;
  isNew?: boolean;
}

export function ChatMessage({ message, isNew }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={isNew ? 'message-enter' : ''}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 16,
        animation: isNew ? 'messageSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
      }}
    >
      <div
        style={{
          maxWidth: '70%',
          padding: '12px 16px',
          borderRadius: T.radius,
          background: isUser ? CHAT_TOKENS.userBubbleBg : CHAT_TOKENS.assistantBubbleBg,
          color: isUser ? CHAT_TOKENS.userBubbleText : CHAT_TOKENS.assistantBubbleText,
          fontSize: 14,
          lineHeight: 1.55,
          fontWeight: 400,
          boxShadow: T.shadow,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {message.content}
      </div>

      <style jsx>{`
        @keyframes messageSlideIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
