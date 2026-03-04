'use client';

import { useState, useRef, useEffect } from 'react';
import { T } from '@/lib/design-tokens';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isStreaming: boolean;
}

export function ChatInput({ value, onChange, onSend, isStreaming }: ChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isStreaming && value.trim()) {
      e.preventDefault();
      onSend();
    }
  };

  const canSend = value.trim() && !isStreaming;

  return (
    <div
      style={{
        padding: '16px 32px 24px',
        background: T.mainBg,
        borderTop: `1px solid ${T.border}`,
      }}
    >
      <div
        style={{
          background: T.cardBg,
          borderRadius: T.radius,
          border: `1px solid ${T.border}`,
          boxShadow: isFocused ? `0 0 0 3px ${T.yellow}55, ${T.shadowHover}` : T.shadow,
          transition: 'box-shadow 0.2s ease',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 12,
          padding: '12px 16px',
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="What can I help you with?"
          disabled={isStreaming}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: "'Nunito', sans-serif",
            fontSize: 15,
            fontWeight: 400,
            lineHeight: 1.55,
            color: T.text,
            background: 'transparent',
            minHeight: 24,
            maxHeight: 200,
          }}
          rows={1}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span
            style={{
              fontSize: 10,
              color: T.textMuted,
              fontWeight: 500,
            }}
          >
            ⌘↵
          </span>
          <button
            onClick={onSend}
            disabled={!canSend}
            style={{
              padding: '7px 18px',
              fontSize: 13,
              fontWeight: 600,
              background: canSend ? T.yellow : T.borderLight,
              color: canSend ? T.yellowText : T.textMuted,
              border: 'none',
              borderRadius: T.radiusPill,
              cursor: canSend ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s ease',
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {isStreaming ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
