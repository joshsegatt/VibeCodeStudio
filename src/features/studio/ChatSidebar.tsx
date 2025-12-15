import { useState, useRef, useEffect } from "react";
import { Settings, Sparkles, Send, Code2, Eraser } from "lucide-react";
import { useAppStore } from "../../stores/appStore";

export default function ChatSidebar() {
    const { systemPrompt, setSystemPrompt, agentMode, setAgentMode, currentModel, generateCode } = useAppStore();
    const [showSettings, setShowSettings] = useState(false);
    const [input, setInput] = useState("");
    const endRef = useRef<HTMLDivElement>(null);

    // Mock chat history for UI
    const [history, setHistory] = useState([
        { role: 'assistant', content: `Ready. ${currentModel?.replace(':', ' ').toUpperCase()}` }
    ]);

    const scrollToBottom = () => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setHistory(prev => [...prev, userMsg]);
        setInput("");

        setHistory(prev => [...prev, { role: 'assistant', content: "Working..." }]);

        // Construct history JSON string properly if needed by backend, 
        // but currently our simplified store might just pass string? 
        // We'll rely on the store's handling.

        try {
            await generateCode(input, (response) => {
                setHistory(prev => {
                    const newHist = [...prev];
                    newHist[newHist.length - 1] = { role: 'assistant', content: response };
                    return newHist;
                });
            });
        } catch (e) {
            setHistory(prev => [...prev, { role: 'assistant', content: `Error: ${e}` }]);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-[#0A0A0A] to-[#0F0F0F] border-r border-white/5 font-sans">

            {/* Premium Elite Header */}
            <div className="relative border-b border-white/5 bg-gradient-to-r from-zinc-900/50 to-zinc-800/50 backdrop-blur-xl">
                {/* Top Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

                <div className="px-6 py-4">
                    {/* Title Row */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg blur-md opacity-50" />
                            <div className="relative p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg">
                                <Sparkles size={16} className="text-white" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-base font-semibold text-white tracking-tight">
                                AI Assistant
                            </h2>
                            <p className="text-xs text-zinc-500">
                                Powered by Advanced Intelligence
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setHistory([])}
                                className="p-1.5 hover:bg-white/10 rounded text-zinc-500 hover:text-zinc-100 transition-colors"
                                title="Clear Chat"
                            >
                                <Eraser size={14} />
                            </button>
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className={`p-1.5 rounded transition-colors ${showSettings ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-zinc-500 hover:text-zinc-100'}`}
                            >
                                <Settings size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Badges Row */}
                    <div className="flex items-center gap-3">
                        {/* Agent Mode Badge */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-lg backdrop-blur-sm">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                            <span className="text-xs font-medium text-blue-300 uppercase tracking-wider">
                                {agentMode === 'architect' ? 'Architect' : 'Assistant'}
                            </span>
                        </div>

                        {/* Model Badge */}
                        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg backdrop-blur-sm">
                            <Code2 size={12} className="text-purple-300" />
                            <span className="text-xs font-mono text-purple-200 truncate">
                                {currentModel?.split(':')[0] || 'No Model'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Accent Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
            </div>

            {/* Settings Drawer */}
            {showSettings && (
                <div className="p-4 border-b border-white/5 bg-[#0F0F10] animate-in slide-in-from-top-2">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Operation Mode</label>
                            <div className="flex bg-[#09090b] rounded-lg border border-white/5 p-1">
                                <button
                                    onClick={() => setAgentMode?.('normal')}
                                    className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all ${agentMode === 'normal' ? 'bg-[#27272a] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Efficient
                                </button>
                                <button
                                    onClick={() => setAgentMode?.('architect')}
                                    className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all ${agentMode === 'architect' ? 'bg-[#27272a] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Architect
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">System Prompt (Override)</label>
                            <textarea
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                className="w-full h-24 bg-[#09090b] border border-white/5 rounded-lg p-2.5 text-[10px] text-zinc-300 focus:outline-none focus:border-zinc-700 resize-none font-mono leading-relaxed"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Area - Native Messaging Feel */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {history.map((msg, i) => (
                    <div key={i} className={`flex flex-col space-y-1.5 animate-in fade-in duration-300 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center space-x-2">
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${msg.role === 'assistant' ? 'text-indigo-400' : 'text-zinc-500'}`}>
                                {msg.role === 'assistant' ? 'AI' : 'User'}
                            </span>
                        </div>



                        <div className={`p-3 rounded-2xl text-[13px] leading-relaxed max-w-[90%] shadow-sm ${msg.role === 'user'
                            ? 'bg-[#27272a] text-zinc-100 border border-white/5 rounded-br-none'
                            : 'bg-transparent text-zinc-300 pl-0 border-l-2 border-indigo-500/30 rounded-none'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>

            {/* Input Area - Docked Bottom */}
            <div className="p-4 border-t border-white/5 bg-[#0F0F10]">
                <div className="relative group">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                        placeholder="Ask Antigravity..."
                        className="w-full bg-[#18181B] border border-white/5 rounded-xl pl-4 pr-10 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all resize-none shadow-inner placeholder:text-zinc-600 h-[50px] min-h-[50px] max-h-32"
                        rows={1}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="absolute right-2 bottom-2 p-1.5 bg-white text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-0 disabled:pointer-events-none"
                    >
                        <Send size={14} />
                    </button>
                </div>
                <div className="flex items-center justify-between mt-3 px-1 opacity-40 hover:opacity-100 transition-opacity">
                    <span className="text-[9px] text-zinc-500 font-mono flex items-center">
                        {agentMode === 'architect' && <Sparkles size={8} className="mr-1 text-purple-500" />}
                        {agentMode === 'architect' ? 'ARCHITECT' : 'STANDARD'}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono tracking-tighter">
                        {currentModel?.split(':')[0]}
                    </span>
                </div>
            </div>
        </div>
    );
}
