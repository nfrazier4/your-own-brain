'use client';

import { TextareaHTMLAttributes, forwardRef, useEffect, useRef } from 'react';
import { animation } from '@/lib/design-tokens';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Textarea label
   */
  label?: string;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Helper text to display below textarea
   */
  helperText?: string;

  /**
   * Whether this field is required
   * @default false
   */
  required?: boolean;

  /**
   * Full width textarea
   * @default true
   */
  fullWidth?: boolean;

  /**
   * Auto-resize textarea as content grows
   * @default true
   */
  autoResize?: boolean;

  /**
   * Minimum number of rows
   * @default 3
   */
  minRows?: number;

  /**
   * Maximum number of rows (for auto-resize)
   */
  maxRows?: number;
}

/**
 * Multiline textarea component with label, error state, and auto-resize
 *
 * @example
 * ```tsx
 * import { Textarea } from '@/components/ui/Textarea';
 *
 * // Basic textarea
 * <Textarea
 *   label="Description"
 *   placeholder="Enter a description..."
 *   required
 * />
 *
 * // With error
 * <Textarea
 *   label="Notes"
 *   error="Please enter at least 10 characters"
 *   value="short"
 * />
 *
 * // With auto-resize
 * <Textarea
 *   label="Message"
 *   autoResize
 *   minRows={2}
 *   maxRows={10}
 * />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      fullWidth = true,
      autoResize = true,
      minRows = 3,
      maxRows,
      className = '',
      style,
      id,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = error ? `${textareaId}-error` : undefined;
    const helperId = helperText ? `${textareaId}-helper` : undefined;

    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as any) || internalRef;

    // Auto-resize function
    const handleResize = () => {
      if (!autoResize || !textareaRef.current) return;

      const textarea = textareaRef.current;
      textarea.style.height = 'auto';

      const lineHeight = 20; // Approximate line height
      const minHeight = lineHeight * minRows;
      const maxHeight = maxRows ? lineHeight * maxRows : Infinity;

      const newHeight = Math.min(
        Math.max(textarea.scrollHeight, minHeight),
        maxHeight
      );

      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = newHeight >= maxHeight ? 'auto' : 'hidden';
    };

    // Resize on mount and value change
    useEffect(() => {
      handleResize();
    }, [value]);

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      width: fullWidth ? '100%' : 'auto',
      ...style,
    };

    const textareaStyle: React.CSSProperties = {
      width: '100%',
      minHeight: `${minRows * 20}px`,
      padding: '10px 12px',
      fontSize: '14px',
      fontFamily: "'Geist Sans', sans-serif",
      color: 'var(--color-text-primary)',
      background: 'var(--color-bg-elevated)',
      border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border-default)'}`,
      borderRadius: 'var(--radius-md)',
      outline: 'none',
      resize: autoResize ? 'none' : 'vertical',
      transition: `all ${animation.duration.fast} ${animation.easing.default}`,
      lineHeight: '20px',
    };

    const labelStyle: React.CSSProperties = {
      fontSize: '14px',
      fontWeight: 600,
      color: 'var(--color-text-primary)',
      fontFamily: "'Nunito', sans-serif",
    };

    const helperTextStyle: React.CSSProperties = {
      fontSize: '12px',
      color: error ? 'var(--color-error)' : 'var(--color-text-secondary)',
      lineHeight: 1.5,
    };

    return (
      <div className={className} style={containerStyle}>
        {label && (
          <label htmlFor={textareaId} style={labelStyle}>
            {label}
            {required && (
              <span style={{ color: 'var(--color-error)', marginLeft: '4px' }}>
                *
              </span>
            )}
          </label>
        )}

        <textarea
          ref={textareaRef}
          id={textareaId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          style={textareaStyle}
          value={value}
          onChange={(e) => {
            onChange?.(e);
            handleResize();
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error
              ? 'var(--color-error)'
              : 'var(--color-border-focus)';
            e.currentTarget.style.boxShadow = error
              ? '0 0 0 3px rgba(255, 59, 48, 0.15)'
              : 'var(--shadow-focus)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error
              ? 'var(--color-error)'
              : 'var(--color-border-default)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          {...props}
        />

        {error && (
          <span id={errorId} role="alert" style={helperTextStyle}>
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={helperId} style={helperTextStyle}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
