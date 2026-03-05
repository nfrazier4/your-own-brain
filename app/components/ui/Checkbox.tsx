'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { Icon } from './Icon';
import { ReactNode } from 'react';
import { animation } from '@/lib/design-tokens';

export interface CheckboxProps {
  /**
   * Checkbox label
   */
  label?: ReactNode;

  /**
   * Whether the checkbox is checked
   */
  checked?: boolean;

  /**
   * Callback when checked state changes
   */
  onCheckedChange?: (checked: boolean) => void;

  /**
   * Whether the checkbox is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the checkbox is required
   * @default false
   */
  required?: boolean;

  /**
   * Helper text to display below checkbox
   */
  helperText?: string;

  /**
   * Custom className
   */
  className?: string;

  /**
   * Unique ID for the checkbox
   */
  id?: string;
}

/**
 * Checkbox component with custom styling
 *
 * @example
 * ```tsx
 * import { Checkbox } from '@/components/ui/Checkbox';
 *
 * const [checked, setChecked] = useState(false);
 *
 * <Checkbox
 *   label="I agree to the terms and conditions"
 *   checked={checked}
 *   onCheckedChange={setChecked}
 *   required
 * />
 *
 * // With helper text
 * <Checkbox
 *   label="Send me email updates"
 *   helperText="We'll send you occasional updates about new features"
 *   checked={emailUpdates}
 *   onCheckedChange={setEmailUpdates}
 * />
 * ```
 */
export function Checkbox({
  label,
  checked,
  onCheckedChange,
  disabled = false,
  required = false,
  helperText,
  className = '',
  id,
}: CheckboxProps) {
  const checkboxId = id || `checkbox-${label?.toString().toLowerCase().replace(/\s+/g, '-')}`;

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

  const checkboxStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    borderRadius: 'var(--radius-sm)',
    border: `2px solid ${checked ? 'var(--color-accent-primary)' : 'var(--color-border-default)'}`,
    background: checked ? 'var(--color-accent-primary)' : 'var(--color-bg-elevated)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: `all ${animation.duration.fast} ${animation.easing.default}`,
    outline: 'none',
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
    marginLeft: '32px',
  };

  return (
    <div className={className} style={containerStyle}>
      <label htmlFor={checkboxId} style={labelContainerStyle}>
        <CheckboxPrimitive.Root
          id={checkboxId}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          required={required}
          style={checkboxStyle}
          onFocus={(e) => {
            if (disabled) return;
            e.currentTarget.style.boxShadow = 'var(--shadow-focus)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
          onMouseEnter={(e) => {
            if (disabled) return;
            if (!checked) {
              e.currentTarget.style.borderColor = 'var(--color-border-focus)';
            }
          }}
          onMouseLeave={(e) => {
            if (disabled) return;
            if (!checked) {
              e.currentTarget.style.borderColor = 'var(--color-border-default)';
            }
          }}
        >
          <CheckboxPrimitive.Indicator>
            <Icon
              icon={Check}
              size={16}
              color="var(--color-accent-text)"
              decorative
            />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>

        {label && <span style={labelStyle}>{label}</span>}
      </label>

      {helperText && <span style={helperTextStyle}>{helperText}</span>}
    </div>
  );
}
