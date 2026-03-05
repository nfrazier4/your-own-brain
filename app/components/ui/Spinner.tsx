'use client';

import { CSSProperties } from 'react';

export interface SpinnerProps {
  /**
   * Size of the spinner in pixels
   * @default 20
   */
  size?: 16 | 20 | 24 | 32 | 40;

  /**
   * Color of the spinner
   * @default 'var(--color-accent-primary)'
   */
  color?: string;

  /**
   * Thickness of the spinner border
   * @default 2
   */
  thickness?: number;

  /**
   * Custom className
   */
  className?: string;

  /**
   * Custom inline styles
   */
  style?: CSSProperties;

  /**
   * Accessible label for screen readers
   */
  label?: string;
}

/**
 * Spinner loading indicator
 *
 * Circular spinner for loading states, centered content, or inline loading.
 *
 * @example
 * ```tsx
 * import { Spinner } from '@/components/ui/Spinner';
 *
 * // Basic spinner
 * <Spinner />
 *
 * // Large spinner
 * <Spinner size={40} />
 *
 * // Custom color
 * <Spinner color="var(--color-error)" />
 *
 * // Centered in container
 * <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
 *   <Spinner size={32} label="Loading content..." />
 * </div>
 *
 * // Inside a button (handled by Button component)
 * <Button loading>Saving...</Button>
 * ```
 */
export function Spinner({
  size = 20,
  color = 'var(--color-accent-primary)',
  thickness = 2,
  className = '',
  style,
  label = 'Loading',
}: SpinnerProps) {
  const spinnerStyle: CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    border: `${thickness}px solid transparent`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
    flexShrink: 0,
    ...style,
  };

  return (
    <div
      className={className}
      style={spinnerStyle}
      role="status"
      aria-label={label}
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * Full-page spinner overlay
 *
 * Covers the entire viewport with a backdrop and centered spinner.
 *
 * @example
 * ```tsx
 * import { SpinnerOverlay } from '@/components/ui/Spinner';
 *
 * {isLoading && <SpinnerOverlay message="Loading your data..." />}
 * ```
 */
export function SpinnerOverlay({
  message,
  size = 40,
}: {
  message?: string;
  size?: 16 | 20 | 24 | 32 | 40;
}) {
  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'var(--color-bg-overlay)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    zIndex: 9999,
  };

  const messageStyle: CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    fontFamily: "'Nunito', sans-serif",
  };

  return (
    <div style={overlayStyle}>
      <Spinner size={size} label={message || 'Loading'} />
      {message && <p style={messageStyle}>{message}</p>}
    </div>
  );
}
