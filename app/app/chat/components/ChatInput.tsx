'use client';

import { useState, useRef, useEffect } from 'react';
import { T } from '@/lib/design-tokens';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isStreaming: boolean;
  onFileSelect?: (file: File) => void;
  selectedFile?: File | null;
  onRemoveFile?: () => void;
}

export function ChatInput({ value, onChange, onSend, isStreaming, onFileSelect, selectedFile, onRemoveFile }: ChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isStreaming && (value.trim() || selectedFile)) {
      e.preventDefault();
      onSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  const canSend = (value.trim() || selectedFile) && !isStreaming;

  return (
    <div
      style={{
        padding: '16px 32px 24px',
        background: T.mainBg,
        borderTop: `1px solid ${T.border}`,
      }}
    >
      {/* File preview */}
      {selectedFile && (
        <div
          style={{
            marginBottom: 12,
            padding: '10px 14px',
            background: T.cardBg,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusSm,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: T.shadow,
          }}
        >
          <span style={{ fontSize: 20 }}>
            {selectedFile.type.startsWith('image/') ? '🖼️' :
             selectedFile.type.includes('pdf') ? '📄' :
             selectedFile.type.includes('document') ? '📝' : '📎'}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedFile.name}
            </div>
            <div style={{ fontSize: 11, color: T.textMuted }}>
              {(selectedFile.size / 1024).toFixed(1)} KB
            </div>
          </div>
          <button
            onClick={onRemoveFile}
            style={{
              padding: '4px 8px',
              background: 'transparent',
              border: 'none',
              color: T.textMuted,
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>
      )}

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
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* File upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isStreaming || !!selectedFile}
          style={{
            padding: '6px',
            background: 'transparent',
            border: 'none',
            cursor: isStreaming || selectedFile ? 'not-allowed' : 'pointer',
            fontSize: 18,
            color: selectedFile ? T.textMuted : T.textSub,
            display: 'flex',
            alignItems: 'center',
            opacity: selectedFile ? 0.5 : 1,
          }}
          title="Upload file"
        >
          📎
        </button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={selectedFile ? "Add a message about this file..." : "What can I help you with?"}
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
