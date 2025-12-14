import { Play, Square, ChevronRight, ArrowDown, ArrowUp } from 'lucide-react';
import { useDebugStore } from '../../stores/debugStore';

export default function DebugPanel() {
    const { isDebugging, breakpoints, startDebug, stopDebug } = useDebugStore();

    const handleStepOver = () => {
        console.log('Step Over');
        // TODO: Implement step over logic
    };

    const handleStepInto = () => {
        console.log('Step Into');
        // TODO: Implement step into logic
    };

    const handleStepOut = () => {
        console.log('Step Out');
        // TODO: Implement step out logic
    };

    return (
        <div className="h-full flex flex-col bg-[#1E1E1E]">
            <div className="h-9 px-4 flex items-center border-b border-[#2D2D2D]">
                <span className="text-xs font-semibold uppercase text-white">Debug</span>
            </div>

            <div className="p-4 space-y-4">
                {/* Controls */}
                <div className="flex gap-2">
                    {!isDebugging ? (
                        <button
                            onClick={startDebug}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                        >
                            <Play size={14} />
                            Start
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={stopDebug}
                                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                            >
                                <Square size={14} />
                                Stop
                            </button>
                            <button onClick={handleStepOver} className="p-1.5 hover:bg-[#2D2D2D] rounded" title="Step Over">
                                <ChevronRight size={16} className="text-zinc-400" />
                            </button>
                            <button onClick={handleStepInto} className="p-1.5 hover:bg-[#2D2D2D] rounded" title="Step Into">
                                <ArrowDown size={16} className="text-zinc-400" />
                            </button>
                            <button onClick={handleStepOut} className="p-1.5 hover:bg-[#2D2D2D] rounded" title="Step Out">
                                <ArrowUp size={16} className="text-zinc-400" />
                            </button>
                        </>
                    )}
                </div>

                {/* Breakpoints */}
                <div>
                    <div className="text-xs text-zinc-500 mb-2">
                        Breakpoints ({breakpoints.length})
                    </div>
                    {breakpoints.map((bp, i) => (
                        <div key={i} className="text-sm text-zinc-300 py-1">
                            {bp.file}:{bp.line}
                        </div>
                    ))}
                </div>

                {/* Variables */}
                {isDebugging && (
                    <div>
                        <div className="text-xs text-zinc-500 mb-2">
                            Variables
                        </div>
                        <div className="text-sm text-zinc-400 italic">
                            No variables (not connected to runtime)
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
