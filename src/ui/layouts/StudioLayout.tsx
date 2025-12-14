import { useState, useRef, useEffect } from "react";
import MonacoWrapper from "../editor/MonacoWrapper";
import BrowserFrame from "../preview/BrowserFrame";
import ChatSidebar from "../../features/studio/ChatSidebar";
import { useAppStore } from "../../stores/appStore";
import { Save, FileCode, Play, FolderTree, Bot, Search } from "lucide-react";

export default function StudioLayout() {
    const generatedCode = useAppStore((state) => state.generatedCode);
    const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
    const [sidebarTab, setSidebarTab] = useState<'files' | 'chat'>('chat');

    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (!iframeRef.current) return;
        const doc = iframeRef.current.contentDocument;
        if (!doc) return;

        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
                <script>
                    tailwind.config = {
                        theme: {
                            extend: {
                                colors: { primary: '#FF6F00' }
                            }
                        }
                    }
                </script>
                <style>
                    body { background-color: white; color: black; margin: 0; }
                    ::-webkit-scrollbar { display: none; }
                </style>
            </head>
            <body>
                ${generatedCode}
            </body>
            </html>
        `);
        doc.close();
    }, [generatedCode]);


    const handleSave = async () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 800);
    };

    return (
        <div className="w-screen h-screen bg-[#0F0F10] text-zinc-300 flex overflow-hidden font-sans selection:bg-indigo-500/30">

            {/* Sidebar (Files & Chat) - 280px Fixed, Glassy Dark */}
            <div className="w-[280px] flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0F0F10]">
                {/* Sidebar Tabs - Apple Style Segmented Control Look */}
                <div className="h-12 border-b border-white/5 flex items-center px-4 space-x-4 bg-[#18181B]">
                    <button
                        onClick={() => setSidebarTab('files')}
                        className={`flex items-center space-x-2 text-[11px] font-medium transition-colors ${sidebarTab === 'files' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        <FolderTree size={14} />
                        <span>FILES</span>
                    </button>
                    <button
                        onClick={() => setSidebarTab('chat')}
                        className={`flex items-center space-x-2 text-[11px] font-medium transition-colors ${sidebarTab === 'chat' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        <Bot size={14} />
                        <span>ASSISTANT</span>
                    </button>

                    {/* Active Indicator (Simple Underline idea or just text color) */}
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-hidden relative">
                    {sidebarTab === 'files' ? (
                        <div className="p-3 space-y-2">
                            {/* Fake File Tree */}
                            <div className="flex items-center space-x-2 px-3 py-2 bg-indigo-500/10 rounded-md text-indigo-400 text-xs border border-indigo-500/10">
                                <FileCode size={13} />
                                <span className="font-medium tracking-tight">App.tsx</span>
                            </div>
                            <div className="flex items-center space-x-2 px-3 py-2 text-zinc-500 text-xs hover:text-zinc-200 cursor-pointer hover:bg-white/5 rounded-md transition-colors">
                                <FileCode size={13} />
                                <span className="font-medium tracking-tight">MainLayout.tsx</span>
                            </div>
                            <div className="flex items-center space-x-2 px-3 py-2 text-zinc-500 text-xs hover:text-zinc-200 cursor-pointer hover:bg-white/5 rounded-md transition-colors">
                                <FileCode size={13} />
                                <span className="font-medium tracking-tight">Button.tsx</span>
                            </div>
                            <div className="flex items-center space-x-2 px-3 py-2 text-zinc-500 text-xs hover:text-zinc-200 cursor-pointer hover:bg-white/5 rounded-md transition-colors">
                                <FileCode size={13} />
                                <span className="font-medium tracking-tight">globals.css</span>
                            </div>
                        </div>
                    ) : (
                        <ChatSidebar />
                    )}
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0F0F10]">

                {/* Top Toolbar (Editor Tabs + Actions) */}
                <div className="h-12 bg-[#0F0F10] border-b border-white/5 flex items-center justify-between px-4">
                    <div className="flex items-center h-full space-x-1">
                        <button
                            onClick={() => setActiveTab('editor')}
                            className={`h-[70%] px-4 rounded-md text-xs font-medium flex items-center space-x-2 transition-all border ${activeTab === 'editor'
                                    ? 'bg-[#18181B] text-zinc-100 border-white/10 shadow-sm'
                                    : 'text-zinc-500 border-transparent hover:bg-white/5'
                                }`}
                        >
                            <FileCode size={13} />
                            <span>Editor</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`h-[70%] px-4 rounded-md text-xs font-medium flex items-center space-x-2 transition-all border ${activeTab === 'preview'
                                    ? 'bg-[#18181B] text-zinc-100 border-white/10 shadow-sm'
                                    : 'text-zinc-500 border-transparent hover:bg-white/5'
                                }`}
                        >
                            <Play size={13} />
                            <span>Preview</span>
                        </button>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="relative group hidden md:block">
                            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-600" />
                            <input
                                type="text"
                                placeholder="Command Palette..."
                                className="bg-[#18181B] border border-white/5 rounded-md pl-8 pr-3 py-1.5 text-[10px] text-zinc-400 focus:outline-none focus:border-zinc-600 w-48 placeholder:text-zinc-700 transition-all"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-0.5">
                                <kbd className="text-[9px] bg-white/10 px-1 rounded text-zinc-500">Ctrl</kbd>
                                <kbd className="text-[9px] bg-white/10 px-1 rounded text-zinc-500">K</kbd>
                            </div>
                        </div>

                        <div className="h-4 w-[1px] bg-white/10 mx-2"></div>

                        {isSaving ? (
                            <span className="text-[10px] text-zinc-500 animate-pulse flex items-center">
                                <Save size={12} className="mr-1.5" /> Saving...
                            </span>
                        ) : (
                            <button
                                onClick={handleSave}
                                className="p-2 hover:bg-white/5 rounded-md text-zinc-400 hover:text-white transition-colors"
                            >
                                <Save size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 relative overflow-hidden flex">
                    {/* Editor Area (Always rendered if active, or hidden) */}
                    <div className={`flex-1 h-full ${activeTab === 'editor' ? 'block' : 'hidden'}`}>
                        <MonacoWrapper />
                    </div>

                    {/* Preview Area */}
                    <div className={`flex-1 h-full bg-[#18181B] p-6 flex items-center justify-center ${activeTab === 'preview' ? 'block' : 'hidden'}`}>
                        <BrowserFrame viewMode={viewMode} setViewMode={setViewMode}>
                            <iframe
                                ref={iframeRef}
                                className="w-full h-full bg-white"
                                sandbox="allow-scripts allow-same-origin"
                                title="Preview"
                            />
                        </BrowserFrame>
                    </div>
                </div>

            </div>
        </div>
    );
}
