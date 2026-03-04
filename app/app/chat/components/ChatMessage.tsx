'use client';

import { T, CHAT_TOKENS } from '@/lib/design-tokens';
import type { Message } from '@/lib/anthropic';
import { parseTaskCards, hasTaskCards } from '@/lib/task-parser';
import { TaskCard } from './TaskCard';

interface ChatMessageProps {
  message: Message;
  isNew?: boolean;
  onTaskApproved?: () => void;
}

export function ChatMessage({ message, isNew, onTaskApproved }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // Parse content for task cards (assistant messages only)
  const parts = !isUser && hasTaskCards(message.content)
    ? parseTaskCards(message.content)
    : [{ text: message.content }];

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
      <div style={{ maxWidth: '70%' }}>
        {/* Text content */}
        {parts.map((part, index) => (
          <div key={index}>
            {part.text && (
              <div
                style={{
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
                  marginBottom: part.taskCard ? 0 : 0,
                }}
              >
                {part.text}
              </div>
            )}
            {/* Task card */}
            {part.taskCard && (
              <TaskCard data={part.taskCard} onApproved={onTaskApproved} />
            )}
          </div>
        ))}
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
