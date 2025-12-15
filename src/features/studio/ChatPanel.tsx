import { useState } from "react";
import { Settings, Bot, User, Sparkles, Send, Box, Code2 } from "lucide-react";
import { useAppStore } from "../../stores/appStore";

export default function ChatPanel() {
    const { systemPrompt, setSystemPrompt, agentMode, setAgentMode, currentModel, currentPlan } = useAppStore();
    const [showSettings, setShowSettings] = useState(false);
    const [input, setInput] = useState("");
    // Mock chat history for UI - Real implementation would connect to backend or LLM
    const [history, setHistory] = useState([
        { role: 'assistant', content: `Welcome to Vibe Studio. I am running on ${currentModel}. How can I assist you?` }
    ]);

    const { generateCode } = useAppStore(); // Get action

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setHistory(prev => [...prev, userMsg]);
        setInput("");

        setHistory(prev => [...prev, { role: 'assistant', content: "Thinking..." }]);

        try {
            await generateCode(input);
            // In a real chat app we would stream the assistant text to the chat history too.
            // For this Vibe Coding MVP, we focus on the Editor output.
            setHistory(prev => {
                const newHist = [...prev];
                newHist[newHist.length - 1] = { role: 'assistant', content: "Code generated in editor." };
                return newHist;
            });
        } catch (e) {
            setHistory(prev => [...prev, { role: 'assistant', content: `Error: ${e}` }]);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#080808]">
            {/* Header */}
            <div className="h-10 flex items-center justify-between px-4 border-b border-white/5 bg-white/5 backdrop-blur-md">
                <div className="flex items-center space-x-2">
                    <Bot size={14} className="text-primary" />
                    <span className="text-xs font-bold tracking-wider text-gray-300">INTELLIGENCE</span>
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-1.5 rounded-md transition-colors ${showSettings ? 'bg-primary text-white' : 'hover:bg-white/10 text-gray-400'}`}
                >
                    <Settings size={14} />
                </button>
            </div>

            {/* Settings Drawer */}
            {showSettings && (
                <div className="p-4 border-b border-white/5 bg-[#0A0A0A] animate-in slide-in-from-top-2">
                    <div className="space-y-4">
                        {/* Agent Mode */}
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Agent Mode</label>
                            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                                <button
                                    onClick={() => setAgentMode?.('normal')}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${agentMode === 'normal' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-white'}`}
                                >
                                    NORMAL
                                </button>
                                <button
                                    onClick={() => setAgentMode?.('architect')}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${agentMode === 'architect' ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'text-gray-500 hover:text-white'}`}
                                >
                                    ARCHITECT
                                </button>
                            </div>
                        </div>

                        {/* System Prompt */}
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">System Prompt</label>
                            <textarea
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                className="w-full h-24 bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-gray-300 focus:outline-none focus:border-primary/50 resize-none font-mono"
                                placeholder="Define the AI's persona..."
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {history.map((msg, i) => (
                    <div key={i} className={`flex space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${msg.role === 'assistant' ? 'bg-black border-white/10' : 'bg-primary/10 border-primary/20'}`}>
                            {msg.role === 'assistant' ? <Sparkles size={14} className="text-primary" /> : <User size={14} className="text-white" />}
                        </div>
                        <div className={`max-w-[85%] flex flex-col space-y-2`}>
                            {/* Thinking Accordion (Plan) */}
                            {msg.role === 'assistant' && i === history.length - 1 && currentPlan && (
                                <div className="animate-in slide-in-from-top-2">
                                    <details className="group bg-white/5 border border-white/5 rounded-lg open:bg-white/10 transition-all">
                                        <summary className="flex items-center cursor-pointer p-2 text-xs font-mono text-gray-400 select-none">
                                            <span className="mr-2 group-open:rotate-90 transition-transform">▸</span>
                                            Thinking Strategy
                                        </summary>
                                        <div className="p-3 pt-0 text-xs text-gray-300 font-mono whitespace-pre-wrap border-t border-white/5 mt-1">
                                            {currentPlan}
                                        </div>
                                    </details>
                                </div>
                            )}

                            <div className={`rounded-2xl p-3 text-sm leading-relaxed ${msg.role === 'assistant'
                                ? 'bg-white/5 border border-white/5 text-gray-300 rounded-tl-none'
                                : 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Logic Area (Agent Status) */}
            <div className={`h-8 flex items-center px-4 space-x-2 border-t border-white/5 ${agentMode === 'architect' ? 'bg-purple-900/10' : 'bg-white/2'}`}>
                {agentMode === 'architect' && <Code2 size={12} className="text-purple-400 animate-pulse" />}
                <span className={`text-[10px] font-mono tracking-wider ${agentMode === 'architect' ? 'text-purple-400' : 'text-gray-600'}`}>
                    {agentMode === 'architect' ? 'ARCHITECT AGENT ACTIVE' : 'READY'}
                </span>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-[#0A0A0A]">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                        placeholder="Build something..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all resize-none h-12 max-h-32 min-h-[48px]"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="absolute right-2 bottom-2 p-1.5 bg-primary/20 hover:bg-primary text-primary hover:text-white rounded-lg transition-colors disabled:opacity-0 disabled:pointer-events-none"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
