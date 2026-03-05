'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';

export interface BreadcrumbsProps {
  /**
   * Custom className
   */
  className?: string;

  /**
   * Whether to show breadcrumbs on mobile
   * @default true
   */
  showOnMobile?: boolean;
}

/**
 * Breadcrumbs component for navigation context
 *
 * Automatically generates breadcrumbs based on the current pathname.
 *
 * @example
 * ```tsx
 * import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
 *
 * <Breadcrumbs />
 * ```
 */
export function Breadcrumbs({ className = '', showOnMobile = true }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const pathSegments = pathname.split('/').filter(Boolean);

  // If we're on the home page or only one level deep, don't show breadcrumbs
  if (pathSegments.length === 0 || pathSegments.length === 1) {
    return null;
  }

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    const isLast = index === pathSegments.length - 1;

    return { href, label, isLast };
  });

  const containerStyle: React.CSSProperties = {
    display: showOnMobile ? 'flex' : 'none',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    fontFamily: 'var(--font-sans)',
  };

  const linkStyle: React.CSSProperties = {
    color: 'var(--color-text-secondary)',
    textDecoration: 'none',
    transition: 'color 0.15s ease',
  };

  const activeLinkStyle: React.CSSProperties = {
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  };

  return (
    <nav aria-label="Breadcrumb" className={className} style={containerStyle}>
      <ol style={{ display: 'flex', alignItems: 'center', gap: '8px', listStyle: 'none', margin: 0, padding: 0 }}>
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {index > 0 && (
              <Icon icon={ChevronRight} size={16} color="var(--color-text-tertiary)" decorative />
            )}
            {crumb.isLast ? (
              <span style={activeLinkStyle} aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                style={linkStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
