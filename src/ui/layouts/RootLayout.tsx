import { useState, useRef, useEffect } from "react";
import MonacoWrapper from "../editor/MonacoWrapper";
import BrowserFrame from "../preview/BrowserFrame";
import ChatSidebar from "../../features/chat/ChatSidebar";
import { useAppStore } from "../../stores/appStore";
import { Code2, Play } from "lucide-react";

export default function RootLayout() {
    const generatedCode = useAppStore((state) => state.generatedCode);
    const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
    const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (!iframeRef.current) return;
        const doc = iframeRef.current.contentDocument;
        if (!doc) return;

        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    body { margin: 0; padding: 0; }
                    * { box-sizing: border-box; }
                </style>
            </head>
            <body>
                ${generatedCode || '<div class="flex items-center justify-center h-screen text-gray-400">No code generated yet</div>'}
            </body>
            </html>
        `);
        doc.close();
    }, [generatedCode]);

    return (
        <div className="w-screen h-screen bg-[#09090b] text-zinc-100 grid grid-cols-[320px_1fr] overflow-hidden">

            {/* Left Sidebar - Intelligence Panel */}
            <div className="border-r border-white/10 bg-[#09090b] flex flex-col">
                <ChatSidebar />
            </div>

            {/* Main Workbench */}
            <div className="flex flex-col bg-[#09090b]">

                {/* Header - Tab Navigation */}
                <div className="h-10 border-b border-white/10 flex items-center px-4 bg-[#09090b]">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setActiveTab('code')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'code'
                                    ? 'bg-zinc-800 text-zinc-100'
                                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                                }`}
                        >
                            <Code2 size={14} />
                            <span>Code</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'preview'
                                    ? 'bg-zinc-800 text-zinc-100'
                                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                                }`}
                        >
                            <Play size={14} />
                            <span>Preview</span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden">
                    {activeTab === 'code' ? (
                        <MonacoWrapper />
                    ) : (
                        <div className="w-full h-full bg-zinc-950 p-6 flex items-center justify-center">
                            <BrowserFrame viewMode={viewMode} setViewMode={setViewMode}>
                                <iframe
                                    ref={iframeRef}
                                    className="w-full h-full bg-white"
                                    sandbox="allow-scripts allow-same-origin"
                                    title="Preview"
                                />
                            </BrowserFrame>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
