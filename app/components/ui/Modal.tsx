'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Icon } from './Icon';
import { ReactNode } from 'react';
import { animation } from '@/lib/design-tokens';

export interface ModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;

  /**
   * Callback when the modal open state changes
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Modal title
   */
  title?: string;

  /**
   * Modal description (optional, for accessibility)
   */
  description?: string;

  /**
   * Modal content
   */
  children: ReactNode;

  /**
   * Size of the modal
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'full';

  /**
   * Whether to show the close button
   * @default true
   */
  showClose?: boolean;

  /**
   * Custom className for the content
   */
  className?: string;
}

/**
 * Modal/Dialog component built on Radix UI Dialog
 *
 * Features:
 * - Backdrop with blur effect
 * - Focus trap and restore
 * - Close on Escape
 * - Multiple sizes
 * - Smooth animations
 * - Fully accessible
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * <Modal
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Confirm Action"
 *   description="Are you sure you want to continue?"
 * >
 *   <p>Modal content here</p>
 *   <button onClick={() => setOpen(false)}>Cancel</button>
 * </Modal>
 * ```
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
  className = '',
}: ModalProps) {
  const sizeMap = {
    sm: '400px',
    md: '600px',
    lg: '800px',
    full: '95vw',
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--color-bg-overlay)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            animation: `fadeIn ${animation.duration.base} ${animation.easing.default}`,
          }}
        />

        {/* Content */}
        <Dialog.Content
          className={className}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: sizeMap[size],
            width: '90vw',
            maxHeight: '85vh',
            overflowY: 'auto',
            backgroundColor: 'var(--color-bg-elevated)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            padding: '32px',
            zIndex: 1001,
            animation: `slideUp ${animation.duration.base} ${animation.easing.out}`,
          }}
        >
          {/* Header */}
          {(title || showClose) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: description ? '8px' : '24px',
              }}
            >
              {title && (
                <Dialog.Title
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    fontFamily: "var(--font-display)",
                    margin: 0,
                    paddingRight: showClose ? '32px' : 0,
                  }}
                >
                  {title}
                </Dialog.Title>
              )}

              {showClose && (
                <Dialog.Close
                  aria-label="Close modal"
                  style={{
                    position: 'absolute',
                    top: '24px',
                    right: '24px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-secondary)',
                    transition: `all ${animation.duration.fast} ${animation.easing.default}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-border-light)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }}
                >
                  <Icon icon={X} size={20} decorative />
                </Dialog.Close>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <Dialog.Description
              style={{
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5,
                marginBottom: '24px',
              }}
            >
              {description}
            </Dialog.Description>
          )}

          {/* Children */}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Add keyframe animations to globals.css if not already present
const styles = `
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, -48%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}
`;
