// src/shared/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';

export type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  meta?: boolean; // Cmd on Mac
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  description?: string;
};

/**
 * Hook to register keyboard shortcuts
 * @example
 * useKeyboardShortcuts([
 *   { key: 'k', meta: true, ctrl: true, callback: () => openSearch() },
 *   { key: 'n', meta: true, ctrl: true, callback: () => newChat() }
 * ])
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey : true;
        const metaMatches = shortcut.meta ? event.metaKey : true;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;

        // Check if all conditions match
        if (
          keyMatches &&
          (shortcut.ctrl === undefined || ctrlMatches) &&
          (shortcut.meta === undefined || metaMatches) &&
          (shortcut.shift === undefined || shiftMatches) &&
          (shortcut.alt === undefined || altMatches)
        ) {
          // Prevent shortcuts when typing in input/textarea
          const target = event.target as HTMLElement;
          if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
          ) {
            continue;
          }

          event.preventDefault();
          shortcut.callback();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}

