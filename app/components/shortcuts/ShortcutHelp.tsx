'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Keyboard } from 'lucide-react';
import { shortcuts, useKeyboardShortcuts, type KeyboardShortcut } from '@/lib/keyboard-shortcuts';

export interface ShortcutHelpProps {
  /**
   * Whether the help modal is open
   */
  open?: boolean;

  /**
   * Callback when modal open state changes
   */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Keyboard shortcuts help modal
 *
 * Displays all registered keyboard shortcuts grouped by category.
 * Can be triggered by pressing '?' key.
 *
 * @example
 * ```tsx
 * import { ShortcutHelp } from '@/components/shortcuts/ShortcutHelp';
 *
 * function Layout() {
 *   const [helpOpen, setHelpOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <button onClick={() => setHelpOpen(true)}>Show shortcuts</button>
 *       <ShortcutHelp open={helpOpen} onOpenChange={setHelpOpen} />
 *     </>
 *   );
 * }
 * ```
 */
export function ShortcutHelp({ open: controlledOpen, onOpenChange }: ShortcutHelpProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const [allShortcuts, setAllShortcuts] = useState<KeyboardShortcut[]>([]);

  // Register the '?' shortcut to open help
  useKeyboardShortcuts([
    {
      id: 'show-shortcuts-help',
      key: '?',
      shiftKey: true,
      description: 'Show keyboard shortcuts',
      category: 'general',
      handler: () => setOpen(true),
    },
  ]);

  // Subscribe to shortcuts changes
  useEffect(() => {
    setAllShortcuts(shortcuts.getAll());
    const unsubscribe = shortcuts.subscribe((newShortcuts) => {
      setAllShortcuts(newShortcuts);
    });
    return unsubscribe;
  }, []);

  // Group shortcuts by category
  const groupedShortcuts = allShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return {};
  }, {} as Record<string, KeyboardShortcut[]>);

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    actions: 'Actions',
    views: 'Views',
    general: 'General',
  };

  const categoryOrder: KeyboardShortcut['category'][] = ['navigation', 'views', 'actions', 'general'];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  };

  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-display)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '4px',
  };

  const shortcutRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid var(--color-border-light)',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-sans)',
  };

  const keysContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  };

  const keyStyle: React.CSSProperties = {
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-text-secondary)',
    background: 'var(--color-border-light)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
    minWidth: '24px',
    textAlign: 'center',
  };

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="Keyboard Shortcuts"
      description="Use these shortcuts to navigate faster"
      size="md"
    >
      <div style={containerStyle}>
        {categoryOrder.map((category) => {
          const categoryShortcuts = groupedShortcuts[category];
          if (!categoryShortcuts || categoryShortcuts.length === 0) return null;

          return (
            <div key={category} style={sectionStyle}>
              <h3 style={sectionHeaderStyle}>{categoryLabels[category]}</h3>
              {categoryShortcuts.map((shortcut) => {
                const formattedKeys = shortcuts.formatShortcut(shortcut);

                return (
                  <div key={shortcut.id} style={shortcutRowStyle}>
                    <span style={descriptionStyle}>{shortcut.description}</span>
                    <div style={keysContainerStyle}>
                      {formattedKeys.split('+').map((key, index) => (
                        <span key={index}>
                          <span style={keyStyle}>{key}</span>
                          {index < formattedKeys.split('+').length - 1 && (
                            <span style={{ margin: '0 2px', color: 'var(--color-text-tertiary)' }}>
                              +
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {allShortcuts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Keyboard
              size={48}
              color="var(--color-text-tertiary)"
              style={{ marginBottom: '16px' }}
            />
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              No keyboard shortcuts registered yet
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
