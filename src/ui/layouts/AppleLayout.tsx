import { useState, useRef, useEffect } from "react";
import { Code2, Play, Smartphone, Monitor, Lock, Send, Sparkles, ChevronDown, Settings, LogOut } from "lucide-react";
import MonacoWrapper from "../editor/MonacoWrapper";
import { useAppStore } from "../../stores/appStore";

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function AppleLayout() {
    const { generatedCode, currentModel, provider, generateCode, setPhase, setProvider } = useAppStore();
    const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
    const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('desktop');
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Olá! Sou seu assistente de código. Posso conversar com você e criar interfaces quando precisar. Como posso ajudar?' }
    ]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
                ${generatedCode || '<div class="flex items-center justify-center h-screen bg-gray-50"><div class="text-center"><div class="text-6xl mb-4">👋</div><p class="text-gray-600">Seu código aparecerá aqui</p></div></div>'}
            </body>
            </html>
        `);
        doc.close();
    }, [generatedCode]);

    useEffect(() => {
        // Scroll to bottom smoothly without affecting layout
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [input]);

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput("");
        setIsGenerating(true);

        // Add empty assistant message that will be updated
        const assistantMessageIndex = messages.length + 1;
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        try {
            await generateCode(userMessage, (response) => {
                // Update the assistant message in real-time
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[assistantMessageIndex] = { role: 'assistant', content: response };
                    return newMessages;
                });
            });

            // Check if code was generated and switch to preview
            if (generatedCode) {
                setTimeout(() => setActiveTab('preview'), 500);
            }
        } catch (error) {
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[assistantMessageIndex] = {
                    role: 'assistant',
                    content: '❌ Desculpe, ocorreu um erro. Verifique se o Ollama está rodando e tente novamente.'
                };
                return newMessages;
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleBackToSetup = () => {
        localStorage.removeItem('onboarding_complete');
        setPhase('onboarding');
    };

    return (
        <div className="w-screen h-screen bg-studio-bg grid grid-cols-[280px_1fr] overflow-hidden antialiased">

            {/* Sidebar - iMessage Style */}
            <div className="border-r border-studio-border bg-studio-panel/80 backdrop-blur-xl flex flex-col">

                {/* Top: Project Name */}
                <div className="h-14 border-b border-studio-border flex items-center px-4">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="flex items-center gap-2 text-white font-semibold text-sm hover:bg-white/5 px-3 py-2 rounded-lg transition-colors w-full"
                    >
                        <span>Vibe Coding</span>
                        <ChevronDown size={14} className={`ml-auto opacity-50 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <div className="border-b border-studio-border bg-zinc-900 p-4 space-y-3 animate-fade-in">
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-500 uppercase font-bold">Provider</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setProvider('ollama')}
                                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${provider === 'ollama'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                        }`}
                                >
                                    Ollama
                                </button>
                                <button
                                    onClick={() => setProvider('lmstudio')}
                                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${provider === 'lmstudio'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                        }`}
                                >
                                    LM Studio
                                </button>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-white/5">
                            <button
                                onClick={handleBackToSetup}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all"
                            >
                                <LogOut size={14} />
                                <span>Trocar Modelo</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Middle: Chat Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-800 text-zinc-200'
                                }`}>
                                {msg.content || (isGenerating && idx === messages.length - 1 ? '💭 Pensando...' : '')}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Bottom: Input */}
                <div className="border-t border-studio-border p-4">
                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                            placeholder="Digite sua mensagem..."
                            disabled={isGenerating}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 resize-none transition-all max-h-32 disabled:opacity-50"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isGenerating}
                            className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-zinc-600">
                        <span>Enter para enviar</span>
                        <span className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${provider === 'ollama' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                            {currentModel?.split(':')[0] || 'No model'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Workbench */}
            <div className="flex flex-col">

                {/* Tabs: Segmented Control */}
                <div className="h-14 border-b border-studio-border flex items-center justify-between px-6">
                    <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('code')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'code'
                                ? 'bg-white text-black shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            <Code2 size={16} />
                            <span>Code</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'preview'
                                ? 'bg-white text-black shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            <Play size={16} />
                            <span>Preview</span>
                        </button>
                    </div>

                    {activeTab === 'preview' && (
                        <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('mobile')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                <Smartphone size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('desktop')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                <Monitor size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {activeTab === 'code' ? (
                        <MonacoWrapper />
                    ) : (
                        <div className="w-full h-full bg-zinc-950 flex items-center justify-center p-8">
                            {/* Safari-style Preview */}
                            <div className="w-full h-full flex flex-col bg-white rounded-xl overflow-hidden shadow-2xl">

                                {/* Safari Header */}
                                <div className="h-11 bg-zinc-100 border-b border-zinc-300 flex items-center px-4 gap-3 flex-shrink-0">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                    <div className="flex-1 flex justify-center">
                                        <div className="bg-white border border-zinc-300 rounded-lg px-3 py-1.5 flex items-center gap-2 w-96">
                                            <Lock size={12} className="text-zinc-500" />
                                            <span className="text-xs text-zinc-700 font-medium">localhost:3000</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Viewport */}
                                <div className="flex-1 bg-zinc-900 flex items-center justify-center p-6">
                                    <div className={`bg-white shadow-2xl transition-all duration-500 ${viewMode === 'mobile'
                                        ? 'w-[375px] h-[812px] rounded-[3rem] border-[14px] border-black'
                                        : 'w-full h-full'
                                        }`}>
                                        <iframe
                                            ref={iframeRef}
                                            className="w-full h-full bg-white"
                                            sandbox="allow-scripts allow-same-origin"
                                            title="Preview"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
