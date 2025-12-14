import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Theme, themes, defaultTheme } from '../themes/themes';

interface ThemeState {
    currentTheme: Theme;
    setTheme: (themeId: string) => void;
    applyTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            currentTheme: defaultTheme,

            setTheme: (themeId: string) => {
                const theme = themes[themeId];
                if (theme) {
                    console.log('🎨 Changing theme to:', theme.name);
                    set({ currentTheme: theme });
                    useThemeStore.getState().applyTheme(theme);
                }
            },

            applyTheme: (theme: Theme) => {
                console.log('🎨 Applying theme:', theme.name);
                // Apply CSS variables to root
                const root = document.documentElement;

                root.style.setProperty('--editor-bg', theme.colors.editorBackground);
                root.style.setProperty('--editor-fg', theme.colors.editorForeground);
                root.style.setProperty('--editor-line-highlight', theme.colors.editorLineHighlight);
                root.style.setProperty('--editor-selection', theme.colors.editorSelection);
                root.style.setProperty('--editor-cursor', theme.colors.editorCursor);

                root.style.setProperty('--sidebar-bg', theme.colors.sidebarBackground);
                root.style.setProperty('--sidebar-fg', theme.colors.sidebarForeground);
                root.style.setProperty('--activity-bar-bg', theme.colors.activityBarBackground);
                root.style.setProperty('--activity-bar-fg', theme.colors.activityBarForeground);
                root.style.setProperty('--status-bar-bg', theme.colors.statusBarBackground);
                root.style.setProperty('--status-bar-fg', theme.colors.statusBarForeground);
                root.style.setProperty('--title-bar-bg', theme.colors.titleBarBackground);
                root.style.setProperty('--title-bar-fg', theme.colors.titleBarForeground);

                root.style.setProperty('--terminal-bg', theme.colors.terminalBackground);
                root.style.setProperty('--terminal-fg', theme.colors.terminalForeground);

                root.style.setProperty('--accent-primary', theme.colors.accentPrimary);
                root.style.setProperty('--accent-secondary', theme.colors.accentSecondary);
                root.style.setProperty('--border-color', theme.colors.border);

                root.style.setProperty('--text-primary', theme.colors.textPrimary);
                root.style.setProperty('--text-secondary', theme.colors.textSecondary);
                root.style.setProperty('--text-muted', theme.colors.textMuted);

                // Set data attribute for theme type
                root.setAttribute('data-theme', theme.type);

                console.log('✅ Theme applied! CSS variables set.');
            }
        }),
        {
            name: 'vibe-theme',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ currentTheme: state.currentTheme })
        }
    )
);
