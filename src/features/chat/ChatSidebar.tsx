import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, FileText, Scissors, X, Code2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../../stores/appStore";
import { useEditorContext } from "../../hooks/useEditorContext";
import { buildContextPrompt, formatContextSummary } from "../../utils/contextBuilder";
import MarkdownMessage from "../../ui/components/MarkdownMessage";

interface ChatSidebarProps {
    selectedText?: string | null;
}

export default function ChatSidebar({ selectedText }: ChatSidebarProps) {
    const { currentModel, generateCode } = useAppStore();
    const editorContext = useEditorContext();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
        { role: 'assistant', content: 'Ready to build. What would you like to create?' }
    ]);
    const [useContext, setUseContext] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Update selection in context when prop changes
    useEffect(() => {
        if (selectedText) {
            editorContext.updateSelection(selectedText);
        }
    }, [selectedText]); // Remove editorContext from deps to avoid infinite loop

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        // Build context-aware prompt
        const contextPrompt = useContext
            ? buildContextPrompt(input, editorContext)
            : { fullPrompt: input, systemPrompt: '', userPrompt: input };

        const userMessage = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");

        setMessages(prev => [...prev, { role: 'assistant', content: '...' }]);

        try {
            // Use context-aware prompt
            await generateCode(contextPrompt.fullPrompt, (response) => {
                // Update last message with streaming response
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'assistant', content: response };
                    return newMessages;
                });
            });
        } catch (error) {
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'assistant', content: 'Error generating code.' };
                return newMessages;
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [input]);

    const contextSummary = formatContextSummary(editorContext);
    const hasContext = editorContext.hasContext;

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-[#0A0A0A] to-[#0F0F0F]">

            {/* Premium Header */}
            <div className="relative border-b border-white/5 bg-gradient-to-r from-zinc-900/50 to-zinc-800/50 backdrop-blur-xl">
                {/* Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

                <div className="px-6 py-4">
                    {/* Top Row: Title */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg blur-md opacity-50" />
                            <div className="relative p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg">
                                <Sparkles size={16} className="text-white" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-white tracking-tight">
                                AI Assistant
                            </h2>
                            <p className="text-xs text-zinc-500">
                                Powered by Advanced Intelligence
                            </p>
                        </div>
                    </div>

                    {/* Bottom Row: Agent Mode & Model */}
                    <div className="flex items-center gap-3">
                        {/* Agent Mode Badge */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-lg backdrop-blur-sm">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                            <span className="text-xs font-medium text-blue-300 uppercase tracking-wider">
                                AI Assistant
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

            {/* Context Preview Card */}
            {hasContext && (
                <div className="mx-4 mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                            <Code2 size={14} className="text-blue-400 flex-shrink-0" />
                            <span className="text-xs font-semibold text-blue-300">Context</span>
                        </div>
                        <button
                            onClick={() => editorContext.clearContext()}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            title="Clear context"
                        >
                            <X size={12} className="text-zinc-400" />
                        </button>
                    </div>

                    <div className="space-y-1.5">
                        {editorContext.currentFile && (
                            <div className="flex items-center gap-2 text-xs text-zinc-300">
                                <FileText size={12} className="text-blue-400" />
                                <span className="font-mono truncate">
                                    {editorContext.currentFile.split(/[/\\]/).pop()}
                                </span>
                            </div>
                        )}

                        {editorContext.selectedText && (
                            <div className="flex items-center gap-2 text-xs text-zinc-300">
                                <Scissors size={12} className="text-green-400" />
                                <span>
                                    {editorContext.selectedText.split('\n').length} lines selected
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                        <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={useContext}
                                onChange={(e) => setUseContext(e.target.checked)}
                                className="rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                            />
                            <span>Include in prompts</span>
                        </label>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{
                                duration: 0.3,
                                ease: [0.4, 0, 0.2, 1]
                            }}
                            className="space-y-2"
                        >
                            {/* Message Bubble */}
                            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-lg ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                                    : 'bg-zinc-900/50 backdrop-blur-sm text-zinc-100 border border-white/10'
                                    }`}>
                                    {msg.role === 'assistant' ? (
                                        <MarkdownMessage content={msg.content} role={msg.role} />
                                    ) : (
                                        <p className="leading-relaxed">{msg.content}</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Premium Input Area */}
            <div className="border-t border-white/5 bg-gradient-to-r from-zinc-900/50 to-zinc-800/50 backdrop-blur-xl p-4 flex-shrink-0">
                <div className="relative">
                    {/* Glow Effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-20 blur transition-opacity" />

                    <div className="relative group">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={hasContext && useContext
                                ? "Ask about your code..."
                                : "What would you like to create?"}
                            className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all max-h-32 overflow-y-auto backdrop-blur-sm"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="absolute right-2 bottom-2 p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg disabled:shadow-none"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>

                {/* Status Text */}
                <div className="mt-2 text-xs text-center">
                    {hasContext && useContext ? (
                        <span className="text-zinc-500">
                            <span className="text-indigo-400 font-medium">{contextSummary}</span>
                            <span className="mx-2">•</span>
                            <span className="text-zinc-600">Press Enter to send</span>
                        </span>
                    ) : (
                        <span className="text-zinc-600">
                            Press <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-xs">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-xs">Shift+Enter</kbd> for new line
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
