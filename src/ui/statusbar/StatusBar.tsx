import { GitBranch, ArrowUp, ArrowDown, Circle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StatusBarProps {
    currentFile?: string;
    cursorPosition?: { line: number; column: number };
}

export default function StatusBar({ currentFile, cursorPosition }: StatusBarProps) {
    const [gitBranch, setGitBranch] = useState<string>('main');
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const [syncStatus, setSyncStatus] = useState<{ pull: number; push: number }>({ pull: 0, push: 0 });

    // Get file language from extension
    const getLanguage = (filename?: string) => {
        if (!filename) return 'Plain Text';
        const ext = filename.split('.').pop()?.toLowerCase();
        const langMap: Record<string, string> = {
            'tsx': 'TypeScript React',
            'ts': 'TypeScript',
            'jsx': 'JavaScript React',
            'js': 'JavaScript',
            'py': 'Python',
            'rs': 'Rust',
            'go': 'Go',
            'json': 'JSON',
            'md': 'Markdown',
            'css': 'CSS',
            'html': 'HTML',
        };
        return langMap[ext || ''] || 'Plain Text';
    };

    return (
        <div className="h-6 bg-[#007ACC] text-white flex items-center justify-between px-3 text-xs font-medium select-none">
            {/* Left section */}
            <div className="flex items-center gap-4">
                {/* Git branch */}
                <button className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-0.5 rounded transition-colors">
                    <GitBranch size={14} />
                    <span>{gitBranch}</span>
                    {hasChanges && <span className="text-yellow-300">*</span>}
                </button>

                {/* Sync status */}
                {(syncStatus.pull > 0 || syncStatus.push > 0) && (
                    <div className="flex items-center gap-2">
                        {syncStatus.pull > 0 && (
                            <div className="flex items-center gap-1">
                                <ArrowDown size={12} />
                                <span>{syncStatus.pull}</span>
                            </div>
                        )}
                        {syncStatus.push > 0 && (
                            <div className="flex items-center gap-1">
                                <ArrowUp size={12} />
                                <span>{syncStatus.push}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Notifications */}
                <button className="flex items-center gap-1 hover:bg-white/10 px-2 py-0.5 rounded transition-colors">
                    <Circle size={10} className="fill-current" />
                    <span>0</span>
                </button>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
                {/* Language */}
                <button className="hover:bg-white/10 px-2 py-0.5 rounded transition-colors">
                    {getLanguage(currentFile)}
                </button>

                {/* Encoding */}
                <button className="hover:bg-white/10 px-2 py-0.5 rounded transition-colors">
                    UTF-8
                </button>

                {/* Line ending */}
                <button className="hover:bg-white/10 px-2 py-0.5 rounded transition-colors">
                    LF
                </button>

                {/* Cursor position */}
                {cursorPosition && (
                    <div className="px-2">
                        Ln {cursorPosition.line}, Col {cursorPosition.column}
                    </div>
                )}
            </div>
        </div>
    );
}
