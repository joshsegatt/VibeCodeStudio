import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';

interface TerminalTab {
    id: string;
    name: string;
    terminal: XTerm;
}

export default function MultiTerminal() {
    const [terminals, setTerminals] = useState<TerminalTab[]>([]);
    const [activeTerminal, setActiveTerminal] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const createTerminal = () => {
        const id = `term-${Date.now()}`;
        const term = new XTerm({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'JetBrains Mono, monospace',
            theme: {
                background: '#1E1E1E',
                foreground: '#CCCCCC',
            }
        });

        setTerminals(prev => [...prev, { id, name: `Terminal ${prev.length + 1}`, terminal: term }]);
        setActiveTerminal(id);
    };

    const closeTerminal = (id: string) => {
        setTerminals(prev => prev.filter(t => t.id !== id));
        if (activeTerminal === id) {
            setActiveTerminal(terminals[0]?.id || null);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#1E1E1E]">
            {/* Tabs */}
            <div className="flex items-center gap-1 px-2 py-1 border-b border-[#2D2D2D]">
                {terminals.map(term => (
                    <div
                        key={term.id}
                        className={`flex items-center gap-2 px-3 py-1 rounded cursor-pointer ${activeTerminal === term.id ? 'bg-[#2D2D2D]' : 'hover:bg-[#252526]'
                            }`}
                        onClick={() => setActiveTerminal(term.id)}
                    >
                        <span className="text-xs text-zinc-300">{term.name}</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); closeTerminal(term.id); }}
                            className="hover:text-white"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
                <button
                    onClick={createTerminal}
                    className="p-1 hover:bg-[#2D2D2D] rounded"
                    title="New Terminal"
                >
                    <Plus size={14} className="text-zinc-400" />
                </button>
            </div>

            {/* Terminal Container */}
            <div ref={containerRef} className="flex-1" />
        </div>
    );
}
