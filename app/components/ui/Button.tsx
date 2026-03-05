'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Icon } from './Icon';
import { animation } from '@/lib/design-tokens';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';

  /**
   * Button size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether the button is in a loading state
   * @default false
   */
  loading?: boolean;

  /**
   * Optional icon to display (left side)
   */
  icon?: LucideIcon;

  /**
   * Optional icon to display (right side)
   */
  iconRight?: LucideIcon;

  /**
   * Whether this button contains only an icon (no text)
   * @default false
   */
  iconOnly?: boolean;

  /**
   * Button children (text/content)
   */
  children?: ReactNode;

  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;
}

/**
 * Button component with multiple variants and sizes
 *
 * @example
 * ```tsx
 * import { Button } from '@/components/ui/Button';
 * import { Save, Trash } from 'lucide-react';
 *
 * // Primary button
 * <Button>Save Changes</Button>
 *
 * // With icon
 * <Button icon={Save}>Save</Button>
 *
 * // Loading state
 * <Button loading>Saving...</Button>
 *
 * // Danger variant
 * <Button variant="danger" icon={Trash}>Delete</Button>
 *
 * // Icon only
 * <Button icon={Save} iconOnly aria-label="Save" />
 * ```
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  iconOnly = false,
  children,
  fullWidth = false,
  disabled,
  className = '',
  style,
  ...props
}: ButtonProps) {
  const sizeStyles = {
    sm: {
      height: '32px',
      padding: iconOnly ? '0' : '0 12px',
      fontSize: '12px',
      minWidth: iconOnly ? '32px' : 'auto',
    },
    md: {
      height: '40px',
      padding: iconOnly ? '0' : '0 20px',
      fontSize: '14px',
      minWidth: iconOnly ? '40px' : 'auto',
    },
    lg: {
      height: '48px',
      padding: iconOnly ? '0' : '0 24px',
      fontSize: '16px',
      minWidth: iconOnly ? '48px' : 'auto',
    },
  };

  const variantStyles: Record<string, any> = {
    primary: {
      background: 'var(--color-accent-primary)',
      color: 'var(--color-accent-text)',
      border: 'none',
      hover: {
        background: 'var(--color-accent-hover)',
      },
      active: {
        background: 'var(--color-accent-active)',
      },
    },
    secondary: {
      background: 'var(--color-bg-elevated)',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-border-default)',
      hover: {
        background: 'var(--color-border-light)',
      },
      active: {
        background: 'var(--color-border-default)',
      },
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-text-primary)',
      border: 'none',
      hover: {
        background: 'var(--color-border-light)',
      },
      active: {
        background: 'var(--color-border-default)',
      },
    },
    danger: {
      background: 'var(--color-error)',
      color: '#FFFFFF',
      border: 'none',
      hover: {
        background: '#E63029',
      },
      active: {
        background: '#CC2A24',
      },
    },
    link: {
      background: 'transparent',
      color: 'var(--color-accent-primary)',
      border: 'none',
      hover: {
        textDecoration: 'underline',
      },
      active: {},
    },
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 16;

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: iconOnly ? 0 : '8px',
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: `all ${animation.duration.fast} ${animation.easing.default}`,
    opacity: disabled || loading ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    textDecoration: 'none',
    ...currentSize,
    ...currentVariant,
    ...(iconOnly && { aspectRatio: '1' }),
    ...style,
  };

  return (
    <button
      className={className}
      style={baseStyles}
      disabled={disabled || loading}
      onMouseEnter={(e) => {
        if (disabled || loading) return;
        Object.assign(e.currentTarget.style, {
          transform: 'scale(1.02)',
          ...currentVariant.hover,
        });
      }}
      onMouseLeave={(e) => {
        if (disabled || loading) return;
        Object.assign(e.currentTarget.style, {
          transform: 'scale(1)',
          background: currentVariant.background,
          textDecoration: variant === 'link' ? 'none' : undefined,
        });
      }}
      onMouseDown={(e) => {
        if (disabled || loading) return;
        Object.assign(e.currentTarget.style, {
          transform: 'scale(0.98)',
          ...currentVariant.active,
        });
      }}
      onMouseUp={(e) => {
        if (disabled || loading) return;
        Object.assign(e.currentTarget.style, {
          transform: 'scale(1.02)',
        });
      }}
      {...props}
    >
      {loading ? (
        <span
          style={{
            width: iconSize,
            height: iconSize,
            border: `2px solid ${variant === 'primary' || variant === 'danger' ? '#FFFFFF' : 'var(--color-text-primary)'}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      ) : icon ? (
        <Icon icon={icon} size={iconSize} decorative={iconOnly} />
      ) : null}

      {!iconOnly && children}

      {iconRight && !loading && (
        <Icon icon={iconRight} size={iconSize} decorative />
      )}
    </button>
  );
}
