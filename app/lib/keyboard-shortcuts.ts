'use client';

import { useEffect } from 'react';

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  /**
   * Unique identifier for the shortcut
   */
  id: string;

  /**
   * Key combination (e.g., 'k', '/', ',')
   */
  key: string;

  /**
   * Whether Cmd (Mac) / Ctrl (Windows/Linux) is required
   * @default false
   */
  ctrlKey?: boolean;

  /**
   * Whether Shift is required
   * @default false
   */
  shiftKey?: boolean;

  /**
   * Whether Alt is required
   * @default false
   */
  altKey?: boolean;

  /**
   * Description of what the shortcut does
   */
  description: string;

  /**
   * Category for grouping shortcuts
   */
  category: 'navigation' | 'actions' | 'views' | 'general';

  /**
   * Handler function when shortcut is triggered
   */
  handler: (event: KeyboardEvent) => void;

  /**
   * Whether the shortcut is enabled
   * @default true
   */
  enabled?: boolean;
}

/**
 * Global keyboard shortcuts registry
 */
class ShortcutsRegistry {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private listeners: Set<(shortcuts: KeyboardShortcut[]) => void> = new Set();

  /**
   * Register a keyboard shortcut
   */
  register(shortcut: KeyboardShortcut) {
    this.shortcuts.set(shortcut.id, shortcut);
    this.notifyListeners();
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(id: string) {
    this.shortcuts.delete(id);
    this.notifyListeners();
  }

  /**
   * Get all registered shortcuts
   */
  getAll(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get shortcuts by category
   */
  getByCategory(category: KeyboardShortcut['category']): KeyboardShortcut[] {
    return this.getAll().filter((s) => s.category === category);
  }

  /**
   * Handle keyboard event
   */
  handleKeyEvent(event: KeyboardEvent) {
    const isMac = typeof window !== 'undefined' && /Mac/.test(navigator.platform);
    const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

    for (const shortcut of this.shortcuts.values()) {
      if (shortcut.enabled === false) continue;

      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = (shortcut.ctrlKey ?? false) === ctrlKey;
      const shiftMatches = (shortcut.shiftKey ?? false) === event.shiftKey;
      const altMatches = (shortcut.altKey ?? false) === event.altKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
        // Prevent default browser behavior
        event.preventDefault();
        event.stopPropagation();

        // Call the handler
        shortcut.handler(event);
        break;
      }
    }
  }

  /**
   * Subscribe to shortcut changes
   */
  subscribe(listener: (shortcuts: KeyboardShortcut[]) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners() {
    const shortcuts = this.getAll();
    this.listeners.forEach((listener) => listener(shortcuts));
  }

  /**
   * Format shortcut key combination for display
   */
  formatShortcut(shortcut: KeyboardShortcut): string {
    const isMac = typeof window !== 'undefined' && /Mac/.test(navigator.platform);
    const parts: string[] = [];

    if (shortcut.ctrlKey) {
      parts.push(isMac ? '⌘' : 'Ctrl');
    }
    if (shortcut.shiftKey) {
      parts.push(isMac ? '⇧' : 'Shift');
    }
    if (shortcut.altKey) {
      parts.push(isMac ? '⌥' : 'Alt');
    }

    parts.push(shortcut.key.toUpperCase());

    return parts.join(isMac ? '' : '+');
  }
}

// Global singleton instance
export const shortcuts = new ShortcutsRegistry();

/**
 * Hook to use keyboard shortcuts
 *
 * Registers keyboard shortcuts and handles cleanup.
 *
 * @example
 * ```tsx
 * import { useKeyboardShortcuts } from '@/lib/keyboard-shortcuts';
 *
 * function MyComponent() {
 *   useKeyboardShortcuts([
 *     {
 *       id: 'save',
 *       key: 's',
 *       ctrlKey: true,
 *       description: 'Save changes',
 *       category: 'actions',
 *       handler: () => handleSave(),
 *     },
 *   ]);
 * }
 * ```
 */
export function useKeyboardShortcuts(shortcutDefinitions: KeyboardShortcut[]) {
  useEffect(() => {
    // Register shortcuts
    shortcutDefinitions.forEach((shortcut) => {
      shortcuts.register(shortcut);
    });

    // Global keyboard event listener
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        // Exception: Allow Cmd+K and Cmd+/ even in inputs
        const isMac = /Mac/.test(navigator.platform);
        const isCtrlK = (isMac ? event.metaKey : event.ctrlKey) && event.key === 'k';
        const isCtrlSlash = (isMac ? event.metaKey : event.ctrlKey) && event.key === '/';

        if (!isCtrlK && !isCtrlSlash) {
          return;
        }
      }

      shortcuts.handleKeyEvent(event);
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      shortcutDefinitions.forEach((shortcut) => {
        shortcuts.unregister(shortcut.id);
      });
    };
  }, [shortcutDefinitions]);
}

/**
 * Hook to get all registered shortcuts
 *
 * Useful for displaying shortcuts in a help modal.
 *
 * @example
 * ```tsx
 * import { useShortcutsList } from '@/lib/keyboard-shortcuts';
 *
 * function ShortcutsHelp() {
 *   const shortcuts = useShortcutsList();
 *   // Display shortcuts...
 * }
 * ```
 */
export function useShortcutsList() {
  const [shortcutsList, setShortcutsList] = React.useState<KeyboardShortcut[]>(
    shortcuts.getAll()
  );

  useEffect(() => {
    return shortcuts.subscribe((newShortcuts) => {
      setShortcutsList(newShortcuts);
    });
  }, []);

  return shortcutsList;
}

// Import React for useState
import React from 'react';
