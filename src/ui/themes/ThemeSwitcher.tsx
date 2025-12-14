import { useState } from 'react';
import { Palette, Check } from 'lucide-react';

interface Theme {
    id: string;
    name: string;
    description: string;
    colors: {
        bg: string;
        sidebar: string;
        accent: string;
    };
}

const THEMES: Theme[] = [
    {
        id: 'dark-plus',
        name: 'Dark+ (Default)',
        description: 'VS Code default dark theme',
        colors: { bg: '#1E1E1E', sidebar: '#252526', accent: '#007ACC' }
    },
    {
        id: 'monokai',
        name: 'Monokai',
        description: 'Classic Monokai theme',
        colors: { bg: '#272822', sidebar: '#1E1F1C', accent: '#F92672' }
    },
    {
        id: 'dracula',
        name: 'Dracula',
        description: 'Popular Dracula theme',
        colors: { bg: '#282A36', sidebar: '#21222C', accent: '#BD93F9' }
    },
    {
        id: 'github-dark',
        name: 'GitHub Dark',
        description: 'GitHub dark theme',
        colors: { bg: '#0D1117', sidebar: '#161B22', accent: '#58A6FF' }
    },
    {
        id: 'nord',
        name: 'Nord',
        description: 'Arctic nord theme',
        colors: { bg: '#2E3440', sidebar: '#3B4252', accent: '#88C0D0' }
    }
];

export default function ThemeSwitcher() {
    const [selectedTheme, setSelectedTheme] = useState('dark-plus');

    const applyTheme = (theme: Theme) => {
        setSelectedTheme(theme.id);
        // Apply theme to document
        document.documentElement.style.setProperty('--editor-bg', theme.colors.bg);
        document.documentElement.style.setProperty('--sidebar-bg', theme.colors.sidebar);
        document.documentElement.style.setProperty('--accent-color', theme.colors.accent);
        console.log('Theme applied:', theme.name);
    };

    return (
        <div className="h-full flex flex-col bg-[#1E1E1E]">
            <div className="h-9 px-4 flex items-center border-b border-[#2D2D2D]">
                <Palette size={14} className="mr-2 text-purple-400" />
                <span className="text-xs font-semibold uppercase text-white">Themes</span>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-2">
                {THEMES.map(theme => (
                    <button
                        key={theme.id}
                        onClick={() => applyTheme(theme)}
                        className={`w-full p-3 rounded text-left transition-all ${selectedTheme === theme.id
                                ? 'bg-[#2D2D2D] border border-purple-500/50'
                                : 'bg-[#252526] hover:bg-[#2D2D2D] border border-transparent'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-white">{theme.name}</span>
                            {selectedTheme === theme.id && (
                                <Check size={14} className="text-purple-400" />
                            )}
                        </div>
                        <p className="text-xs text-zinc-400 mb-2">{theme.description}</p>
                        <div className="flex gap-2">
                            <div
                                className="w-8 h-8 rounded border border-zinc-700"
                                style={{ backgroundColor: theme.colors.bg }}
                            />
                            <div
                                className="w-8 h-8 rounded border border-zinc-700"
                                style={{ backgroundColor: theme.colors.sidebar }}
                            />
                            <div
                                className="w-8 h-8 rounded border border-zinc-700"
                                style={{ backgroundColor: theme.colors.accent }}
                            />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
