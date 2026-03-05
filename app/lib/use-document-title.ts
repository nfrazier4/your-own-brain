'use client';

import { useEffect } from 'react';

/**
 * Hook to set the document title dynamically
 *
 * Updates the document title and announces the change to screen readers.
 *
 * @example
 * ```tsx
 * import { useDocumentTitle } from '@/lib/use-document-title';
 *
 * function ChatPage() {
 *   useDocumentTitle('Chat');
 *   // ...
 * }
 * ```
 */
export function useDocumentTitle(title: string, suffix: string = 'Chief of Staff') {
  useEffect(() => {
    const fullTitle = suffix ? `${title} - ${suffix}` : title;
    document.title = fullTitle;

    // Announce title change to screen readers
    // Create a temporary live region to announce the change
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = `Navigated to ${title}`;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [title, suffix]);
}
