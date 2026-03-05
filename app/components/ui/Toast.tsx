'use client';

import { Toaster as Sonner, toast as sonnerToast } from 'sonner';
import { useTheme } from '@/lib/theme-provider';

/**
 * Toast notification provider component
 *
 * Add this to your root layout to enable toast notifications throughout the app.
 * Uses sonner library for elegant, performant toast notifications.
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * import { Toaster } from '@/components/ui/Toast';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <Toaster />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function Toaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme}
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={5000}
      toastOptions={{
        style: {
          background: 'var(--color-bg-elevated)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border-default)',
          borderRadius: '11px',
          boxShadow: 'var(--shadow-lg)',
          fontFamily: "'Geist Sans', sans-serif",
          fontSize: '14px',
        },
        className: 'toast',
      }}
    />
  );
}

/**
 * Toast notification API
 *
 * Provides methods to show different types of toast notifications.
 *
 * @example
 * ```tsx
 * import { toast } from '@/components/ui/Toast';
 *
 * // Success
 * toast.success('Changes saved successfully');
 *
 * // Error
 * toast.error('Failed to save changes');
 *
 * // Info
 * toast.info('New update available');
 *
 * // Warning
 * toast.warning('Your session will expire soon');
 *
 * // Promise-based (shows loading → success/error)
 * toast.promise(
 *   saveChanges(),
 *   {
 *     loading: 'Saving changes...',
 *     success: 'Changes saved!',
 *     error: 'Failed to save',
 *   }
 * );
 *
 * // With custom action
 * toast.success('File uploaded', {
 *   action: {
 *     label: 'View',
 *     onClick: () => router.push('/files')
 *   }
 * });
 * ```
 */
export const toast = {
  /**
   * Show a success toast
   */
  success: (message: string, options?: any) => {
    return sonnerToast.success(message, options);
  },

  /**
   * Show an error toast
   */
  error: (message: string, options?: any) => {
    return sonnerToast.error(message, {
      duration: 7000, // Errors stay longer
      ...options,
    });
  },

  /**
   * Show an info toast
   */
  info: (message: string, options?: any) => {
    return sonnerToast.info(message, options);
  },

  /**
   * Show a warning toast
   */
  warning: (message: string, options?: any) => {
    return sonnerToast.warning(message, options);
  },

  /**
   * Show a loading toast
   */
  loading: (message: string, options?: any) => {
    return sonnerToast.loading(message, options);
  },

  /**
   * Show a promise-based toast (loading → success/error)
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },

  /**
   * Dismiss a specific toast or all toasts
   */
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId);
  },
};
