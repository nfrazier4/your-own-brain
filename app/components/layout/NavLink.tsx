'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { ReactNode } from 'react';
import { T } from '@/lib/design-tokens';

export interface NavLinkProps {
  /**
   * Link href
   */
  href: string;

  /**
   * Link label
   */
  label: string;

  /**
   * Icon to display
   */
  icon: LucideIcon;

  /**
   * Custom className
   */
  className?: string;

  /**
   * Whether to match exact path or path prefix
   * @default false (exact match)
   */
  matchPrefix?: boolean;
}

/**
 * Navigation link component with active state indication
 *
 * Automatically highlights when the current route matches.
 * Shows a yellow left border and bold text for active links.
 *
 * @example
 * ```tsx
 * import { NavLink } from '@/components/layout/NavLink';
 * import { MessageSquare } from 'lucide-react';
 *
 * <NavLink href="/chat" label="Chat" icon={MessageSquare} />
 * ```
 */
export function NavLink({ href, label, icon, className = '', matchPrefix = false }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = matchPrefix ? pathname.startsWith(href) : pathname === href;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '7px 10px',
    marginBottom: '1px',
    borderRadius: T.radiusSm,
    transition: 'all 0.15s ease',
    borderLeft: isActive ? `3px solid ${T.yellow}` : '3px solid transparent',
    paddingLeft: '7px', // Compensate for border
    background: 'transparent',
    position: 'relative',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: isActive ? 600 : 400,
    color: isActive ? T.text : T.textSub,
    transition: 'all 0.15s ease',
  };

  return (
    <Link href={href} style={{ textDecoration: 'none' }} className={className}>
      <div
        className="sidebar-item"
        style={containerStyle}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = T.borderLight;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <Icon
          icon={icon}
          size={16}
          color={isActive ? T.text : T.textSub}
          aria-label={label}
        />
        <span style={labelStyle}>{label}</span>
      </div>
    </Link>
  );
}
