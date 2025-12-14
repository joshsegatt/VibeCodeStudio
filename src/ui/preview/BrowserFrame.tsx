import { ReactNode } from "react";
import { Smartphone, Tablet, Monitor, Lock } from "lucide-react";

interface BrowserFrameProps {
    children: ReactNode;
    viewMode: 'mobile' | 'tablet' | 'desktop';
    setViewMode: (mode: 'mobile' | 'tablet' | 'desktop') => void;
}

export default function BrowserFrame({ children, viewMode, setViewMode }: BrowserFrameProps) {
    return (
        <div className="w-full h-full flex flex-col bg-white rounded-xl overflow-hidden shadow-2xl border border-zinc-800">

            {/* Safari-like Address Bar */}
            <div className="h-11 bg-zinc-100 border-b border-zinc-300 flex items-center px-4 gap-3 flex-shrink-0">

                {/* Traffic Lights */}
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>

                {/* URL Bar */}
                <div className="flex-1 flex justify-center">
                    <div className="bg-white border border-zinc-300 rounded-lg px-3 py-1.5 flex items-center gap-2 w-96 shadow-sm">
                        <Lock size={12} className="text-zinc-500" />
                        <span className="text-xs text-zinc-700 font-medium">localhost:3000</span>
                    </div>
                </div>

                {/* Device Toggles */}
                <div className="flex gap-1 bg-zinc-200 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('mobile')}
                        className={`p-1.5 rounded transition-all ${viewMode === 'mobile'
                                ? 'bg-white text-zinc-900 shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-700'
                            }`}
                        title="Mobile"
                    >
                        <Smartphone size={14} />
                    </button>
                    <button
                        onClick={() => setViewMode('tablet')}
                        className={`p-1.5 rounded transition-all ${viewMode === 'tablet'
                                ? 'bg-white text-zinc-900 shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-700'
                            }`}
                        title="Tablet"
                    >
                        <Tablet size={14} />
                    </button>
                    <button
                        onClick={() => setViewMode('desktop')}
                        className={`p-1.5 rounded transition-all ${viewMode === 'desktop'
                                ? 'bg-white text-zinc-900 shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-700'
                            }`}
                        title="Desktop"
                    >
                        <Monitor size={14} />
                    </button>
                </div>
            </div>

            {/* Viewport */}
            <div className="flex-1 bg-zinc-900 flex items-center justify-center p-6 overflow-hidden">
                <div
                    className={`bg-white shadow-2xl transition-all duration-500 ease-out ${viewMode === 'mobile'
                            ? 'w-[375px] h-[812px] rounded-[3rem] border-[14px] border-zinc-950'
                            : viewMode === 'tablet'
                                ? 'w-[768px] h-[90%] rounded-2xl border-8 border-zinc-950'
                                : 'w-full h-full'
                        }`}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
