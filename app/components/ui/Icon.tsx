import { LucideIcon } from 'lucide-react';

export interface IconProps {
  /**
   * Icon component from lucide-react
   */
  icon: LucideIcon;

  /**
   * Size of the icon
   * @default 20
   */
  size?: 16 | 20 | 24 | 32 | 40 | 48;

  /**
   * Color of the icon (CSS color value or 'currentColor')
   * @default 'currentColor'
   */
  color?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Accessible label for screen readers
   */
  'aria-label'?: string;

  /**
   * Whether this icon is decorative (hidden from screen readers)
   */
  decorative?: boolean;
}

/**
 * Standardized icon component wrapper for Lucide React icons
 *
 * @example
 * ```tsx
 * import { MessageSquare } from 'lucide-react';
 * import { Icon } from '@/components/ui/Icon';
 *
 * <Icon icon={MessageSquare} size={20} aria-label="Chat" />
 * ```
 */
export function Icon({
  icon: IconComponent,
  size = 20,
  color = 'currentColor',
  className = '',
  'aria-label': ariaLabel,
  decorative = false,
}: IconProps) {
  return (
    <IconComponent
      size={size}
      color={color}
      className={className}
      aria-hidden={decorative}
      aria-label={ariaLabel}
      strokeWidth={2}
      style={{
        flexShrink: 0,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    />
  );
}
