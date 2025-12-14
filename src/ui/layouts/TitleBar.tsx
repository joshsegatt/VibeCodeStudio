import { getCurrentWindow } from "@tauri-apps/api/window";
import { X, Minus, Square } from "lucide-react";

export default function TitleBar() {
    const appWindow = getCurrentWindow();

    return (
        <div className="h-10 w-full flex-shrink-0 flex items-center justify-between px-4 bg-white/5 border-b border-white/5 select-none relative z-50">
            {/* Brand - Non Draggable */}
            <div className="flex items-center space-x-2 pointer-events-none z-10">
                <div className="w-2 h-2 rounded-full bg-primary glow-text"></div>
                <span className="font-bold tracking-widest text-xs text-gray-300">
                    SGT VIBE CODING
                </span>
            </div>

            {/* Drag Region - Fills empty space */}
            <div data-tauri-drag-region className="absolute inset-0 z-0" />

            {/* Window Controls - Clickable (z-10 to sit above drag region) */}
            <div className="flex items-center space-x-2 z-10">
                <button
                    onClick={() => appWindow.minimize()}
                    className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white cursor-pointer"
                >
                    <Minus size={14} />
                </button>
                <button
                    onClick={() => appWindow.toggleMaximize()}
                    className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white cursor-pointer"
                >
                    <Square size={14} />
                </button>
                <button
                    onClick={() => appWindow.close()}
                    className="p-1.5 hover:bg-red-500/20 rounded-md transition-colors text-gray-400 hover:text-red-400 cursor-pointer"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}
