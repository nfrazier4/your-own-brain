'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { ReactNode } from 'react';
import { animation } from '@/lib/design-tokens';

export interface SwitchProps {
  /**
   * Switch label
   */
  label?: ReactNode;

  /**
   * Whether the switch is checked
   */
  checked?: boolean;

  /**
   * Callback when checked state changes
   */
  onCheckedChange?: (checked: boolean) => void;

  /**
   * Whether the switch is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Helper text to display below switch
   */
  helperText?: string;

  /**
   * Custom className
   */
  className?: string;

  /**
   * Unique ID for the switch
   */
  id?: string;

  /**
   * Size of the switch
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Toggle switch component
 *
 * Perfect for binary settings like dark mode, notifications, etc.
 *
 * @example
 * ```tsx
 * import { Switch } from '@/components/ui/Switch';
 *
 * const [enabled, setEnabled] = useState(false);
 *
 * // Basic switch
 * <Switch
 *   label="Enable notifications"
 *   checked={enabled}
 *   onCheckedChange={setEnabled}
 * />
 *
 * // With helper text
 * <Switch
 *   label="Dark mode"
 *   helperText="Use dark theme for reduced eye strain"
 *   checked={darkMode}
 *   onCheckedChange={setDarkMode}
 * />
 *
 * // Small size
 * <Switch
 *   label="Auto-save"
 *   checked={autoSave}
 *   onCheckedChange={setAutoSave}
 *   size="sm"
 * />
 * ```
 */
export function Switch({
  label,
  checked,
  onCheckedChange,
  disabled = false,
  helperText,
  className = '',
  id,
  size = 'md',
}: SwitchProps) {
  const switchId = id || `switch-${label?.toString().toLowerCase().replace(/\s+/g, '-')}`;

  const sizeStyles = {
    sm: {
      width: '36px',
      height: '20px',
      thumbSize: '16px',
      thumbTranslate: '18px',
    },
    md: {
      width: '44px',
      height: '24px',
      thumbSize: '20px',
      thumbTranslate: '22px',
    },
    lg: {
      width: '52px',
      height: '28px',
      thumbSize: '24px',
      thumbTranslate: '26px',
    },
  };

  const currentSize = sizeStyles[size];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const labelContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };

  const switchStyle: React.CSSProperties = {
    width: currentSize.width,
    height: currentSize.height,
    borderRadius: '100px',
    background: checked ? 'var(--color-accent-primary)' : 'var(--color-border-default)',
    position: 'relative',
    transition: `all ${animation.duration.fast} ${animation.easing.default}`,
    outline: 'none',
    border: 'none',
    flexShrink: 0,
  };

  const thumbStyle: React.CSSProperties = {
    display: 'block',
    width: currentSize.thumbSize,
    height: currentSize.thumbSize,
    background: checked ? 'var(--color-accent-text)' : '#FFFFFF',
    borderRadius: '100px',
    transition: `transform ${animation.duration.fast} ${animation.easing.spring}`,
    transform: checked ? `translateX(${currentSize.thumbTranslate})` : 'translateX(2px)',
    willChange: 'transform',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    fontFamily: "'Geist Sans', sans-serif",
    lineHeight: 1.5,
  };

  const helperTextStyle: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.5,
    marginLeft: size === 'sm' ? '48px' : size === 'lg' ? '64px' : '56px',
  };

  return (
    <div className={className} style={containerStyle}>
      <label htmlFor={switchId} style={labelContainerStyle}>
        <SwitchPrimitive.Root
          id={switchId}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          style={switchStyle}
          onFocus={(e) => {
            if (disabled) return;
            e.currentTarget.style.boxShadow = 'var(--shadow-focus)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
          onMouseEnter={(e) => {
            if (disabled) return;
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            if (disabled) return;
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <SwitchPrimitive.Thumb style={thumbStyle} />
        </SwitchPrimitive.Root>

        {label && <span style={labelStyle}>{label}</span>}
      </label>

      {helperText && <span style={helperTextStyle}>{helperText}</span>}
    </div>
  );
}
