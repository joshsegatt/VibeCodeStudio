import { useState, useEffect, useRef } from 'react';
import { Search, FileText, GitBranch, Eye, Terminal, Zap, Settings, X } from 'lucide-react';

interface Command {
    id: string;
    label: string;
    category: 'File' | 'Git' | 'View' | 'Terminal' | 'AI' | 'Settings';
    icon: React.ReactNode;
    action: () => void;
    keywords?: string[];
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    commands: Command[];
}

export default function CommandPalette({ isOpen, onClose, commands }: CommandPaletteProps) {
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setSearch('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    filteredCommands[selectedIndex].action();
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, search]);

    const filteredCommands = commands.filter(cmd => {
        const searchLower = search.toLowerCase();
        return (
            cmd.label.toLowerCase().includes(searchLower) ||
            cmd.category.toLowerCase().includes(searchLower) ||
            cmd.keywords?.some(k => k.toLowerCase().includes(searchLower))
        );
    });

    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-[#252526] rounded-lg shadow-2xl border border-[#3C3C3C] overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#3C3C3C]">
                    <Search size={18} className="text-zinc-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Type a command or search..."
                        className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder:text-zinc-500"
                    />
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        <X size={16} className="text-zinc-400" />
                    </button>
                </div>

                {/* Commands List */}
                <div className="max-h-96 overflow-y-auto">
                    {filteredCommands.length === 0 ? (
                        <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                            No commands found
                        </div>
                    ) : (
                        <div className="py-2">
                            {filteredCommands.map((cmd, index) => (
                                <button
                                    key={cmd.id}
                                    onClick={() => {
                                        cmd.action();
                                        onClose();
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${index === selectedIndex
                                            ? 'bg-[#007ACC] text-white'
                                            : 'text-zinc-300 hover:bg-[#2D2D2D]'
                                        }`}
                                >
                                    <span className={index === selectedIndex ? 'text-white' : 'text-zinc-400'}>
                                        {cmd.icon}
                                    </span>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">{cmd.label}</div>
                                        <div className={`text-xs ${index === selectedIndex ? 'text-blue-200' : 'text-zinc-500'}`}>
                                            {cmd.category}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-[#3C3C3C] flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-4">
                        <span>↑↓ Navigate</span>
                        <span>Enter Select</span>
                        <span>Esc Close</span>
                    </div>
                    <span>{filteredCommands.length} commands</span>
                </div>
            </div>
        </div>
    );
}
