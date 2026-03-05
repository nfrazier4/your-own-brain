'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { Icon } from './Icon';
import { animation } from '@/lib/design-tokens';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Input label
   */
  label?: string;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Helper text to display below input
   */
  helperText?: string;

  /**
   * Optional icon to display on the left
   */
  icon?: LucideIcon;

  /**
   * Optional icon to display on the right
   */
  iconRight?: LucideIcon;

  /**
   * Whether this field is required
   * @default false
   */
  required?: boolean;

  /**
   * Full width input
   * @default true
   */
  fullWidth?: boolean;
}

/**
 * Text input component with label, error state, and helper text
 *
 * @example
 * ```tsx
 * import { Input } from '@/components/ui/Input';
 * import { Search, Mail } from 'lucide-react';
 *
 * // Basic input
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="you@example.com"
 *   required
 * />
 *
 * // With icon
 * <Input
 *   label="Search"
 *   icon={Search}
 *   placeholder="Search memories..."
 * />
 *
 * // With error
 * <Input
 *   label="Email"
 *   type="email"
 *   error="Invalid email address"
 *   value="invalid"
 * />
 *
 * // With helper text
 * <Input
 *   label="API Key"
 *   helperText="You can find this in your account settings"
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconRight,
      required = false,
      fullWidth = true,
      className = '',
      style,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      width: fullWidth ? '100%' : 'auto',
      ...style,
    };

    const inputWrapperStyle: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    };

    const inputStyle: React.CSSProperties = {
      width: '100%',
      height: '40px',
      padding: icon ? '0 12px 0 40px' : iconRight ? '0 40px 0 12px' : '0 12px',
      fontSize: '14px',
      fontFamily: "'Geist Sans', sans-serif",
      color: 'var(--color-text-primary)',
      background: 'var(--color-bg-elevated)',
      border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border-default)'}`,
      borderRadius: 'var(--radius-md)',
      outline: 'none',
      transition: `all ${animation.duration.fast} ${animation.easing.default}`,
    };

    const iconWrapperStyle: React.CSSProperties = {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      color: error ? 'var(--color-error)' : 'var(--color-text-secondary)',
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
          <label htmlFor={inputId} style={labelStyle}>
            {label}
            {required && (
              <span style={{ color: 'var(--color-error)', marginLeft: '4px' }}>
                *
              </span>
            )}
          </label>
        )}

        <div style={inputWrapperStyle}>
          {icon && (
            <div style={{ ...iconWrapperStyle, left: '12px' }}>
              <Icon icon={icon} size={16} decorative />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            style={inputStyle}
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

          {iconRight && (
            <div style={{ ...iconWrapperStyle, right: '12px' }}>
              <Icon icon={iconRight} size={16} decorative />
            </div>
          )}
        </div>

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

Input.displayName = 'Input';
