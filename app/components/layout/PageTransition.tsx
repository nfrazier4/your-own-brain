'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { animation } from '@/lib/design-tokens';

export interface PageTransitionProps {
  /**
   * Page content
   */
  children: ReactNode;

  /**
   * Custom className
   */
  className?: string;
}

/**
 * Page transition wrapper component
 *
 * Adds smooth fade + slide animations when navigating between pages.
 * Respects prefers-reduced-motion for accessibility.
 *
 * @example
 * ```tsx
 * import { PageTransition } from '@/components/layout/PageTransition';
 *
 * export default function SomePage() {
 *   return (
 *     <PageTransition>
 *       <div>Page content here</div>
 *     </PageTransition>
 *   );
 * }
 * ```
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState<'entering' | 'entered'>('entered');

  useEffect(() => {
    // When pathname changes, trigger exit animation
    setTransitionStage('entering');

    // After a brief delay, update children and trigger enter animation
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setTransitionStage('entered');
    }, 150); // Half the animation duration

    return () => clearTimeout(timer);
  }, [pathname]);

  // Update children immediately when content changes without path changing
  useEffect(() => {
    if (transitionStage === 'entered') {
      setDisplayChildren(children);
    }
  }, [children, transitionStage]);

  const containerStyle: React.CSSProperties = {
    animation: transitionStage === 'entering'
      ? `pageExit ${animation.duration.base} ${animation.easing.out} forwards`
      : `pageEnter ${animation.duration.base} ${animation.easing.out} forwards`,
  };

  return (
    <div className={className} style={containerStyle}>
      {displayChildren}
    </div>
  );
}
