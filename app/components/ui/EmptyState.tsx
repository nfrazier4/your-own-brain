'use client';

import { LucideIcon } from 'lucide-react';
import { Icon } from './Icon';
import { Button } from './Button';
import { ReactNode } from 'react';

export interface EmptyStateProps {
  /**
   * Icon to display (Lucide icon component)
   */
  icon?: LucideIcon;

  /**
   * Heading text
   */
  heading: string;

  /**
   * Description text (1-2 sentences)
   */
  description?: string;

  /**
   * Primary action button
   */
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };

  /**
   * Secondary action or suggestion pills
   */
  suggestions?: Array<{
    label: string;
    onClick: () => void;
  }>;

  /**
   * Custom children to render below description
   */
  children?: ReactNode;

  /**
   * Custom className
   */
  className?: string;

  /**
   * Compact mode (smaller spacing, smaller icon)
   * @default false
   */
  compact?: boolean;
}

/**
 * Empty state component for "no content" scenarios
 *
 * Displays an icon, heading, description, and optional actions when there's no data to show.
 *
 * @example
 * ```tsx
 * import { EmptyState } from '@/components/ui/EmptyState';
 * import { MessageSquare, Calendar, Mail } from 'lucide-react';
 *
 * // Basic empty state
 * <EmptyState
 *   icon={MessageSquare}
 *   heading="No conversations yet"
 *   description="Start a conversation with Chief of Staff to capture your thoughts"
 *   action={{
 *     label: 'Start chatting',
 *     onClick: () => router.push('/chat'),
 *     icon: MessageSquare
 *   }}
 * />
 *
 * // With suggestions
 * <EmptyState
 *   icon={Calendar}
 *   heading="Calendar not connected"
 *   description="Connect your Google Calendar to see events and schedule tasks"
 *   action={{
 *     label: 'Connect Calendar',
 *     onClick: handleConnect
 *   }}
 *   suggestions={[
 *     { label: 'Learn more', onClick: () => {} },
 *     { label: 'Skip for now', onClick: () => {} }
 *   ]}
 * />
 *
 * // Compact mode
 * <EmptyState
 *   icon={Mail}
 *   heading="No new messages"
 *   compact
 * />
 * ```
 */
export function EmptyState({
  icon,
  heading,
  description,
  action,
  suggestions,
  children,
  className = '',
  compact = false,
}: EmptyStateProps) {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: compact ? '32px 20px' : '64px 20px',
    maxWidth: '480px',
    margin: '0 auto',
  };

  const iconContainerStyle: React.CSSProperties = {
    marginBottom: compact ? '16px' : '24px',
    color: 'var(--color-text-tertiary)',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: compact ? '18px' : '20px',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    fontFamily: "'Nunito', sans-serif",
    marginBottom: description ? '8px' : compact ? '16px' : '24px',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.5,
    marginBottom: compact ? '16px' : '24px',
  };

  const suggestionsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
    marginTop: compact ? '12px' : '16px',
  };

  const suggestionButtonStyle: React.CSSProperties = {
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    background: 'var(--color-border-light)',
    border: 'none',
    borderRadius: 'var(--radius-pill)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: "'Geist Sans', sans-serif",
  };

  return (
    <div className={className} style={containerStyle}>
      {icon && (
        <div style={iconContainerStyle}>
          <Icon icon={icon} size={compact ? 40 : 48} decorative />
        </div>
      )}

      <h3 style={headingStyle}>{heading}</h3>

      {description && <p style={descriptionStyle}>{description}</p>}

      {action && (
        <Button
          variant="primary"
          icon={action.icon}
          onClick={action.onClick}
          size={compact ? 'sm' : 'md'}
        >
          {action.label}
        </Button>
      )}

      {suggestions && suggestions.length > 0 && (
        <div style={suggestionsContainerStyle}>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={suggestion.onClick}
              style={suggestionButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-border-default)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-border-light)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
