'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { Icon } from './Icon';
import { ReactNode } from 'react';
import { animation } from '@/lib/design-tokens';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /**
   * Select label
   */
  label?: string;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Current selected value
   */
  value?: string;

  /**
   * Callback when value changes
   */
  onValueChange?: (value: string) => void;

  /**
   * Select options
   */
  options: SelectOption[];

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Helper text to display below select
   */
  helperText?: string;

  /**
   * Whether this field is required
   * @default false
   */
  required?: boolean;

  /**
   * Whether the select is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Full width select
   * @default true
   */
  fullWidth?: boolean;

  /**
   * Custom className
   */
  className?: string;
}

/**
 * Select dropdown component with keyboard navigation
 *
 * @example
 * ```tsx
 * import { Select } from '@/components/ui/Select';
 *
 * const [value, setValue] = useState('');
 *
 * <Select
 *   label="Category"
 *   placeholder="Select a category"
 *   value={value}
 *   onValueChange={setValue}
 *   options={[
 *     { value: 'work', label: 'Work' },
 *     { value: 'personal', label: 'Personal' },
 *     { value: 'idea', label: 'Idea' },
 *   ]}
 *   required
 * />
 * ```
 */
export function Select({
  label,
  placeholder = 'Select an option',
  value,
  onValueChange,
  options,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  className = '',
}: SelectProps) {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: fullWidth ? '100%' : 'auto',
  };

  const triggerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '40px',
    padding: '0 12px',
    fontSize: '14px',
    fontFamily: "'Geist Sans', sans-serif",
    color: value ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
    background: 'var(--color-bg-elevated)',
    border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border-default)'}`,
    borderRadius: 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    outline: 'none',
    transition: `all ${animation.duration.fast} ${animation.easing.default}`,
  };

  const contentStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-elevated)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border-default)',
    boxShadow: 'var(--shadow-lg)',
    padding: '4px',
    minWidth: '160px',
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 1000,
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    fontSize: '14px',
    fontFamily: "'Geist Sans', sans-serif",
    color: 'var(--color-text-primary)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    outline: 'none',
    transition: `all ${animation.duration.fast} ${animation.easing.default}`,
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
        <label style={labelStyle}>
          {label}
          {required && (
            <span style={{ color: 'var(--color-error)', marginLeft: '4px' }}>
              *
            </span>
          )}
        </label>
      )}

      <SelectPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
      >
        <SelectPrimitive.Trigger
          style={triggerStyle}
          aria-invalid={!!error}
          onFocus={(e) => {
            if (disabled) return;
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
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <Icon icon={ChevronDown} size={16} decorative />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            style={contentStyle}
          >
            <SelectPrimitive.Viewport>
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  style={itemStyle}
                  onMouseEnter={(e) => {
                    if (option.disabled) return;
                    e.currentTarget.style.background = 'var(--color-border-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <SelectPrimitive.ItemText>
                    {option.label}
                  </SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator>
                    <Icon icon={Check} size={16} color="var(--color-accent-primary)" decorative />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {error && (
        <span role="alert" style={helperTextStyle}>
          {error}
        </span>
      )}

      {helperText && !error && <span style={helperTextStyle}>{helperText}</span>}
    </div>
  );
}
