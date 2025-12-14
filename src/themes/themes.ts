export interface Theme {
    id: string;
    name: string;
    type: 'dark' | 'light';
    colors: {
        // Editor
        editorBackground: string;
        editorForeground: string;
        editorLineHighlight: string;
        editorSelection: string;
        editorCursor: string;

        // UI
        sidebarBackground: string;
        sidebarForeground: string;
        activityBarBackground: string;
        activityBarForeground: string;
        statusBarBackground: string;
        statusBarForeground: string;
        titleBarBackground: string;
        titleBarForeground: string;

        // Terminal
        terminalBackground: string;
        terminalForeground: string;

        // Accents
        accentPrimary: string;
        accentSecondary: string;
        border: string;

        // Text
        textPrimary: string;
        textSecondary: string;
        textMuted: string;
    };
    monacoTheme: string; // Monaco built-in theme name
}

export const themes: Record<string, Theme> = {
    'dark-plus': {
        id: 'dark-plus',
        name: 'Dark+ (default)',
        type: 'dark',
        colors: {
            editorBackground: '#1E1E1E',
            editorForeground: '#D4D4D4',
            editorLineHighlight: '#2A2A2A',
            editorSelection: '#264F78',
            editorCursor: '#AEAFAD',

            sidebarBackground: '#252526',
            sidebarForeground: '#CCCCCC',
            activityBarBackground: '#333333',
            activityBarForeground: '#FFFFFF',
            statusBarBackground: '#007ACC',
            statusBarForeground: '#FFFFFF',
            titleBarBackground: '#3C3C3C',
            titleBarForeground: '#CCCCCC',

            terminalBackground: '#1E1E1E',
            terminalForeground: '#CCCCCC',

            accentPrimary: '#007ACC',
            accentSecondary: '#0E639C',
            border: '#3C3C3C',

            textPrimary: '#FFFFFF',
            textSecondary: '#CCCCCC',
            textMuted: '#858585',
        },
        monacoTheme: 'vs-dark'
    },

    'monokai': {
        id: 'monokai',
        name: 'Monokai',
        type: 'dark',
        colors: {
            editorBackground: '#272822',
            editorForeground: '#F8F8F2',
            editorLineHighlight: '#3E3D32',
            editorSelection: '#49483E',
            editorCursor: '#F8F8F0',

            sidebarBackground: '#1E1F1C',
            sidebarForeground: '#F8F8F2',
            activityBarBackground: '#2C2C24',
            activityBarForeground: '#F8F8F2',
            statusBarBackground: '#66D9EF',
            statusBarForeground: '#272822',
            titleBarBackground: '#3E3D32',
            titleBarForeground: '#F8F8F2',

            terminalBackground: '#272822',
            terminalForeground: '#F8F8F2',

            accentPrimary: '#66D9EF',
            accentSecondary: '#A6E22E',
            border: '#49483E',

            textPrimary: '#F8F8F2',
            textSecondary: '#CFCFC2',
            textMuted: '#75715E',
        },
        monacoTheme: 'vs-dark'
    },

    'dracula': {
        id: 'dracula',
        name: 'Dracula',
        type: 'dark',
        colors: {
            editorBackground: '#282A36',
            editorForeground: '#F8F8F2',
            editorLineHighlight: '#44475A',
            editorSelection: '#44475A',
            editorCursor: '#F8F8F0',

            sidebarBackground: '#21222C',
            sidebarForeground: '#F8F8F2',
            activityBarBackground: '#191A21',
            activityBarForeground: '#F8F8F2',
            statusBarBackground: '#BD93F9',
            statusBarForeground: '#282A36',
            titleBarBackground: '#21222C',
            titleBarForeground: '#F8F8F2',

            terminalBackground: '#282A36',
            terminalForeground: '#F8F8F2',

            accentPrimary: '#BD93F9',
            accentSecondary: '#FF79C6',
            border: '#44475A',

            textPrimary: '#F8F8F2',
            textSecondary: '#E6E6E6',
            textMuted: '#6272A4',
        },
        monacoTheme: 'vs-dark'
    }
};

export const defaultTheme = themes['dark-plus'];
