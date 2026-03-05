'use client';

import { CSSProperties } from 'react';

export interface SkeletonProps {
  /**
   * Width of the skeleton
   * Can be number (px), string ('100%', '200px'), or undefined (defaults to 100%)
   */
  width?: number | string;

  /**
   * Height of the skeleton
   * Can be number (px), string ('20px', '2rem'), or undefined (defaults to 1rem)
   */
  height?: number | string;

  /**
   * Border radius
   * @default 'var(--radius-md)'
   */
  borderRadius?: number | string;

  /**
   * Variant of skeleton
   * @default 'rectangular'
   */
  variant?: 'rectangular' | 'circular' | 'text';

  /**
   * Custom className
   */
  className?: string;

  /**
   * Custom inline styles
   */
  style?: CSSProperties;

  /**
   * Whether to show shimmer animation
   * @default true
   */
  animated?: boolean;
}

/**
 * Skeleton loader component for loading states
 *
 * Shows a placeholder while content is loading, with optional shimmer animation.
 *
 * @example
 * ```tsx
 * import { Skeleton } from '@/components/ui/Skeleton';
 *
 * // Text skeleton
 * <Skeleton variant="text" width="200px" />
 *
 * // Avatar skeleton
 * <Skeleton variant="circular" width={40} height={40} />
 *
 * // Card skeleton
 * <div>
 *   <Skeleton width="100%" height={200} />
 *   <Skeleton variant="text" width="80%" />
 *   <Skeleton variant="text" width="60%" />
 * </div>
 *
 * // Custom card skeleton
 * function CardSkeleton() {
 *   return (
 *     <div style={{ padding: 20 }}>
 *       <Skeleton width="100%" height={160} style={{ marginBottom: 16 }} />
 *       <Skeleton variant="text" width="80%" />
 *       <Skeleton variant="text" width="60%" />
 *     </div>
 *   );
 * }
 * ```
 */
export function Skeleton({
  width,
  height,
  borderRadius,
  variant = 'rectangular',
  className = '',
  style,
  animated = true,
}: SkeletonProps) {
  const getDefaultDimensions = () => {
    if (variant === 'text') {
      return {
        width: width || '100%',
        height: height || '1rem',
        borderRadius: borderRadius || 'var(--radius-sm)',
      };
    }

    if (variant === 'circular') {
      const size = width || height || 40;
      return {
        width: size,
        height: size,
        borderRadius: '50%',
      };
    }

    // rectangular
    return {
      width: width || '100%',
      height: height || '200px',
      borderRadius: borderRadius || 'var(--radius-md)',
    };
  };

  const dimensions = getDefaultDimensions();

  const skeletonStyle: CSSProperties = {
    display: 'block',
    width: typeof dimensions.width === 'number' ? `${dimensions.width}px` : dimensions.width,
    height: typeof dimensions.height === 'number' ? `${dimensions.height}px` : dimensions.height,
    borderRadius: typeof dimensions.borderRadius === 'number' ? `${dimensions.borderRadius}px` : dimensions.borderRadius,
    background: 'var(--color-border-light)',
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  const shimmerStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, transparent, var(--color-bg-elevated), transparent)',
    animation: animated ? 'shimmer 2s infinite' : 'none',
  };

  return (
    <div className={className} style={skeletonStyle} aria-busy="true" aria-live="polite">
      {animated && <div style={shimmerStyle} />}
    </div>
  );
}

/**
 * Pre-built skeleton patterns for common use cases
 */
export const SkeletonPatterns = {
  /**
   * Avatar with text lines
   */
  AvatarWithText: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Skeleton variant="circular" width={40} height={40} />
      <div style={{ flex: 1 }}>
        <Skeleton variant="text" width="60%" height="16px" style={{ marginBottom: '8px' }} />
        <Skeleton variant="text" width="40%" height="14px" />
      </div>
    </div>
  ),

  /**
   * Card with image and text
   */
  Card: () => (
    <div>
      <Skeleton width="100%" height={160} style={{ marginBottom: '16px' }} />
      <Skeleton variant="text" width="80%" style={{ marginBottom: '8px' }} />
      <Skeleton variant="text" width="60%" />
    </div>
  ),

  /**
   * List of text lines
   */
  TextList: ({ lines = 3 }: { lines?: number }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  ),
};
