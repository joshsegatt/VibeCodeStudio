import { useEffect } from 'react';

export interface KeyboardShortcut {
    id: string;
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    description: string;
    action: () => void;
    category: 'File' | 'Edit' | 'View' | 'Terminal' | 'Git' | 'AI';
}

interface UseKeyboardShortcutsProps {
    shortcuts: KeyboardShortcut[];
    enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in input/textarea
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            for (const shortcut of shortcuts) {
                const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
                const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
                const altMatch = shortcut.alt ? e.altKey : !e.altKey;
                const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

                if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
                    e.preventDefault();
                    shortcut.action();
                    break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts, enabled]);
}

export function formatShortcut(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];

    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    parts.push(shortcut.key.toUpperCase());

    return parts.join('+');
}

export const defaultShortcuts: KeyboardShortcut[] = [
    // File operations
    {
        id: 'file.save',
        key: 's',
        ctrl: true,
        description: 'Save current file',
        category: 'File',
        action: () => console.log('Save file')
    },
    {
        id: 'file.saveAll',
        key: 's',
        ctrl: true,
        shift: true,
        description: 'Save all files',
        category: 'File',
        action: () => console.log('Save all files')
    },
    {
        id: 'file.close',
        key: 'w',
        ctrl: true,
        description: 'Close current tab',
        category: 'File',
        action: () => console.log('Close tab')
    },
    {
        id: 'file.quickOpen',
        key: 'p',
        ctrl: true,
        description: 'Quick open file',
        category: 'File',
        action: () => console.log('Quick open')
    },

    // Edit operations
    {
        id: 'edit.find',
        key: 'f',
        ctrl: true,
        description: 'Find in file',
        category: 'Edit',
        action: () => console.log('Find')
    },
    {
        id: 'edit.replace',
        key: 'h',
        ctrl: true,
        description: 'Replace in file',
        category: 'Edit',
        action: () => console.log('Replace')
    },

    // View operations
    {
        id: 'view.toggleSidebar',
        key: 'b',
        ctrl: true,
        description: 'Toggle sidebar',
        category: 'View',
        action: () => console.log('Toggle sidebar')
    },
    {
        id: 'view.toggleTerminal',
        key: '`',
        ctrl: true,
        description: 'Toggle terminal',
        category: 'View',
        action: () => console.log('Toggle terminal')
    },

    // Terminal operations
    {
        id: 'terminal.new',
        key: 't',
        ctrl: true,
        shift: true,
        description: 'New terminal',
        category: 'Terminal',
        action: () => console.log('New terminal')
    },
    {
        id: 'terminal.clear',
        key: 'k',
        ctrl: true,
        description: 'Clear terminal',
        category: 'Terminal',
        action: () => console.log('Clear terminal')
    },
];
