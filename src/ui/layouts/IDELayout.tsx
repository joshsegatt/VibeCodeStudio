import { useState, useEffect } from 'react';
import { Code2, Play, X, ChevronUp, ChevronDown, GitBranch, AlertCircle, Zap, FileText, Eye, Terminal as TerminalIcon, Settings as SettingsIcon, Search } from 'lucide-react';
import { aiService } from '../../services/aiService';
import ActivityBar, { ActivityView } from '../sidebar/ActivityBar';
import FileTree from '../../features/explorer/FileTree';
import SearchPanel from '../sidebar/SearchPanel';
import GitPanel from '../sidebar/GitPanel';
import SettingsPanel from '../sidebar/SettingsPanel';
import DebugPanel from '../debug/DebugPanel';
import SnippetsPanel from '../snippets/SnippetsPanel';
import QuickActionsPanel from '../actions/QuickActionsPanel';
import MultiTabEditor from '../editor/MultiTabEditor';
import TerminalManager from '../terminal/TerminalManager';
import CommandPalette from '../command/CommandPalette';
import QuickOpen from '../components/QuickOpen';
import DragDropZone from '../components/DragDropZone';
import SafeFrame from '../preview/SafeFrame';
import WelcomeView from '../welcome/WelcomeView';
import { useAppStore } from '../../stores/appStore';
import { useProjectStore } from '../../stores/projectStore';
import { useGitStore } from '../../stores/gitStore';
import { ProjectParser } from '../../utils/ProjectParser';
import { useKeyboardShortcuts, KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

type AgentMode = 'code' | 'architect' | 'debug' | 'review' | 'docs';

export default function IDELayout() {
    const { generateProject, currentModel, provider } = useAppStore();
    const { currentProjectPath, createMultipleFiles, openFiles, createProject, saveFile, closeTab } = useProjectStore();
    const { currentBranch, changes } = useGitStore();

    // View states
    const [activeView, setActiveView] = useState<'editor' | 'preview' | 'split'>('editor');
    const [splitRatio, setSplitRatio] = useState(50); // Percentage for editor width
    const [isDragging, setIsDragging] = useState(false);
    const [activityView, setActivityView] = useState<ActivityView>('explorer');
    const [showTerminal, setShowTerminal] = useState(false);
    const [showAIChat, setShowAIChat] = useState(false);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [showQuickOpen, setShowQuickOpen] = useState(false);

    // AI Assistant states
    const [agentMode, setAgentMode] = useState<AgentMode>('code');
    const [selectedModel, setSelectedModel] = useState(currentModel || 'qwen2.5-coder:1.5b');

    // Chat state
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: '👋 Hi! I can create complete projects for you. Try: "Create a React todo app"' }
    ]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Current file info for status bar
    const currentFile = openFiles.length > 0 ? openFiles[openFiles.length - 1] : null;
    const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
    const [showSidebar, setShowSidebar] = useState(true);

    // Migrate API keys to secure storage on mount
    useEffect(() => {
        const migrateKeys = async () => {
            try {
                await useAppStore.getState().migrateAPIKeys();
            } catch (error) {
                console.error('Failed to migrate API keys:', error);
            }
        };
        migrateKeys();
    }, []);

    // Initialize AI service with API keys
    useEffect(() => {
        const initializeAIService = async () => {
            const { getAPIKey } = useAppStore.getState();

            try {
                const openaiKey = await getAPIKey('openai');
                const anthropicKey = await getAPIKey('anthropic');
                const geminiKey = await getAPIKey('gemini');
                const openrouterKey = await getAPIKey('openrouter');

                if (openaiKey) aiService.setOpenAIKey(openaiKey);
                if (anthropicKey) aiService.setAnthropicKey(anthropicKey);
                if (geminiKey) aiService.setGeminiKey(geminiKey);
                if (openrouterKey) aiService.setOpenRouterKey(openrouterKey);
            } catch (error) {
                console.error('Failed to initialize AI service:', error);
            }
        };

        initializeAIService();
    }, []);

    // Initialize API keys in aiService
    useEffect(() => {
        const { apiKeys } = useAppStore.getState();
        if (apiKeys.openai) aiService.setOpenAIKey(apiKeys.openai);
        if (apiKeys.anthropic) aiService.setAnthropicKey(apiKeys.anthropic);
        if (apiKeys.gemini) aiService.setGeminiKey(apiKeys.gemini);
        if (apiKeys.openrouter) aiService.setOpenRouterKey(apiKeys.openrouter);
    }, []);

    // Update selected model when currentModel changes
    useEffect(() => {
        if (currentModel) {
            setSelectedModel(currentModel);
        }
    }, [currentModel]);

    // Define keyboard shortcuts
    const shortcuts: KeyboardShortcut[] = [
        // Command Palette
        {
            id: 'commandPalette',
            key: 'p',
            ctrl: true,
            shift: true,
            description: 'Open Command Palette',
            category: 'View',
            action: () => setShowCommandPalette(true)
        },
        // Quick Open
        {
            id: 'quickOpen',
            key: 'p',
            ctrl: true,
            description: 'Quick Open File',
            category: 'File',
            action: () => setShowQuickOpen(true)
        },
        // File operations
        {
            id: 'file.save',
            key: 's',
            ctrl: true,
            description: 'Save current file',
            category: 'File',
            action: async () => {
                const currentFile = openFiles[openFiles.length - 1];
                if (currentFile) {
                    // Get content from Monaco editor
                    const monacoEditor = (window as any).monacoEditorInstance;
                    if (monacoEditor) {
                        const content = monacoEditor.getValue();
                        await saveFile(currentFile.path, content);
                    }
                }
            }
        },
        {
            id: 'file.close',
            key: 'w',
            ctrl: true,
            description: 'Close current tab',
            category: 'File',
            action: async () => {
                const currentFile = openFiles[openFiles.length - 1];
                if (currentFile) {
                    await closeTab(currentFile.path);
                }
            }
        },
        // View operations
        {
            id: 'view.toggleSidebar',
            key: 'b',
            ctrl: true,
            description: 'Toggle sidebar',
            category: 'View',
            action: () => setShowSidebar(!showSidebar)
        },
        {
            id: 'view.toggleTerminal',
            key: '`',
            ctrl: true,
            description: 'Toggle terminal',
            category: 'View',
            action: () => setShowTerminal(!showTerminal)
        },
        {
            id: 'view.toggleAI',
            key: 'i',
            ctrl: true,
            shift: true,
            description: 'Toggle AI Assistant',
            category: 'View',
            action: () => setShowAIChat(!showAIChat)
        },
        // Navigation
        {
            id: 'nav.explorer',
            key: 'e',
            ctrl: true,
            shift: true,
            description: 'Focus Explorer',
            category: 'View',
            action: () => setActivityView('explorer')
        },
        {
            id: 'nav.search',
            key: 'f',
            ctrl: true,
            shift: true,
            description: 'Focus Search',
            category: 'View',
            action: () => setActivityView('search')
        },
        {
            id: 'nav.git',
            key: 'g',
            ctrl: true,
            shift: true,
            description: 'Focus Git',
            category: 'View',
            action: () => setActivityView('git')
        },
    ];

    // Apply keyboard shortcuts
    useKeyboardShortcuts({ shortcuts });

    const handleSendMessage = async () => {
        if (!input.trim() || isGenerating) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setIsGenerating(true);

        const assistantIndex = messages.length + 1;
        setMessages(prev => [...prev, { role: 'assistant', content: '💭 Thinking...' }]);

        try {
            let fullResponse = '';
            let tokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
            let cost = 0;

            // Use aiService for streaming
            const chatMessages = messages.map(m => ({ role: m.role, content: m.content }));
            chatMessages.push({ role: 'user', content: userMessage });

            // Stream response
            for await (const chunk of aiService.chatStream({
                provider,
                model: selectedModel,
                messages: chatMessages,
                temperature: 0.7,
                maxTokens: 2000
            })) {
                fullResponse += chunk;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[assistantIndex] = { role: 'assistant', content: fullResponse };
                    return newMessages;
                });
            }

            // Try to parse as project if in architect mode
            if (agentMode === 'architect') {
                const project = ProjectParser.parseResponse(fullResponse);

                if (project && project.files.length > 0 && currentProjectPath) {
                    const files = ProjectParser.resolveFilePaths(project, currentProjectPath);
                    await createMultipleFiles(files);

                    setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[assistantIndex] = {
                            role: 'assistant',
                            content: `✅ Project created!\n\n📁 ${files.length} files:\n${files.map(f => `  - ${f.path.split('/').pop()}`).join('\n')}\n\nOpen files in Explorer!`
                        };
                        return newMessages;
                    });

                    setActivityView('explorer');
                }
            }

        } catch (error) {
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[assistantIndex] = {
                    role: 'assistant',
                    content: `❌ Error: ${error}`
                };
                return newMessages;
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const getAgentModeIcon = (mode: AgentMode) => {
        switch (mode) {
            case 'code': return '💻';
            case 'architect': return '🏗️';
            case 'debug': return '🐛';
            case 'review': return '👀';
            case 'docs': return '📚';
        }
    };

    const getAgentModeName = (mode: AgentMode) => {
        switch (mode) {
            case 'code': return 'Code Generation';
            case 'architect': return 'System Architect';
            case 'debug': return 'Debug Assistant';
            case 'review': return 'Code Reviewer';
            case 'docs': return 'Documentation';
        }
    };

    const getFileLanguage = (filename: string | null) => {
        if (!filename) return 'Plain Text';
        const ext = filename.split('.').pop()?.toLowerCase();
        const langMap: Record<string, string> = {
            'ts': 'TypeScript',
            'tsx': 'TypeScript React',
            'js': 'JavaScript',
            'jsx': 'JavaScript React',
            'py': 'Python',
            'rs': 'Rust',
            'go': 'Go',
            'java': 'Java',
            'cpp': 'C++',
            'c': 'C',
            'css': 'CSS',
            'html': 'HTML',
            'json': 'JSON',
            'md': 'Markdown',
        };
        return langMap[ext || ''] || 'Plain Text';
    };

    // Render sidebar panel
    const renderSidebarPanel = () => {
        switch (activityView) {
            case 'explorer':
                return <FileTree />;
            case 'search':
                return <SearchPanel />;
            case 'git':
                return <GitPanel />;
            case 'debug':
                return <DebugPanel />;
            case 'snippets':
                return <SnippetsPanel />;
            case 'actions':
                return <QuickActionsPanel />;
            case 'settings':
                return <SettingsPanel />;
            case 'chat':
                setShowAIChat(true);
                setActivityView('explorer');
                return <FileTree />;
        }
    };

    return (
        <div className="w-screen h-screen bg-[#1E1E1E] flex flex-col overflow-hidden antialiased">
            {/* Main horizontal layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Activity Bar */}
                <ActivityBar
                    activeView={activityView}
                    onViewChange={(view) => {
                        if (view === 'chat') {
                            setShowAIChat(!showAIChat);
                        } else {
                            setActivityView(view);
                        }
                    }}
                />

                {/* Sidebar */}
                {showSidebar && (
                    <div className="w-80 border-r border-[#2D2D2D] flex flex-col">
                        {renderSidebarPanel()}
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                    {/* Top Bar */}
                    <div className="h-12 border-b border-[#2D2D2D] flex items-center justify-between px-4">
                        <div className="flex items-center gap-2 bg-[#252526] rounded-lg p-1">
                            <button
                                onClick={() => setActiveView('editor')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeView === 'editor'
                                    ? 'bg-[#1E1E1E] text-white shadow-sm'
                                    : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                <Code2 size={16} />
                                <span>Editor</span>
                            </button>
                            <button
                                onClick={() => setActiveView('preview')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeView === 'preview'
                                    ? 'bg-[#1E1E1E] text-white shadow-sm'
                                    : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                <Play size={16} />
                                <span>Preview</span>
                            </button>
                        </div>

                        <div className="text-sm text-zinc-500">
                            {currentProjectPath ? (
                                <span className="text-white">{currentProjectPath.split('/').pop()}</span>
                            ) : (
                                <span>No project open</span>
                            )}
                        </div>
                    </div>

                    {/* Editor Content */}
                    <div className="flex-1 overflow-hidden">
                        {activeView === 'editor' && (
                            currentProjectPath ? <MultiTabEditor /> : <WelcomeView />
                        )}
                        {activeView === 'preview' && (
                            <SafeFrame />
                        )}
                    </div>
                </div>

                {/* Right Panel - AI Chat */}
                {showAIChat && (
                    <div className="w-96 border-l border-[#2D2D2D] flex flex-col bg-[#1E1E1E]">

                        {/* Refined Header */}
                        <div className="border-b border-[#2D2D2D] bg-[#252526]">
                            <div className="px-4 py-3">
                                {/* Title Row */}
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h2 className="text-sm font-semibold text-white">AI Assistant</h2>
                                        <p className="text-xs text-zinc-500 mt-0.5">Powered by {provider === 'ollama' ? 'Ollama' : 'LM Studio'}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowAIChat(false)}
                                        className="p-1.5 hover:bg-white/10 rounded transition-colors text-zinc-400 hover:text-white"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Status Badges Row */}
                                <div className="flex items-center gap-2">
                                    {/* Agent Mode Badge */}
                                    <div className="flex-1 flex items-center gap-2 px-2.5 py-1.5 bg-[#3C3C3C] border border-[#007ACC]/30 rounded-md">
                                        <div className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-yellow-400 animate-pulse' : 'bg-[#007ACC]'}`} />
                                        <span className="text-xs text-zinc-300 truncate">
                                            {getAgentModeName(agentMode)}
                                        </span>
                                    </div>

                                    {/* Model Badge */}
                                    <div className="flex-1 flex items-center gap-2 px-2.5 py-1.5 bg-[#3C3C3C] border border-[#007ACC]/30 rounded-md">
                                        <Code2 size={11} className="text-[#007ACC]" />
                                        <span className="text-xs font-mono text-zinc-300 truncate">
                                            {selectedModel.split(':')[0]}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Agent Mode & Model Selection */}
                        <div className="px-4 py-3 border-b border-[#2D2D2D] space-y-2.5 bg-[#252526]">
                            <div>
                                <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Agent Mode</label>
                                <select
                                    value={agentMode}
                                    onChange={(e) => setAgentMode(e.target.value as AgentMode)}
                                    className="w-full bg-[#3C3C3C] border border-[#3C3C3C] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#007ACC] transition-colors text-white"
                                >
                                    <option value="code">{getAgentModeIcon('code')} Code Generation</option>
                                    <option value="architect">{getAgentModeIcon('architect')} System Architect</option>
                                    <option value="debug">{getAgentModeIcon('debug')} Debug Assistant</option>
                                    <option value="review">{getAgentModeIcon('review')} Code Reviewer</option>
                                    <option value="docs">{getAgentModeIcon('docs')} Documentation</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Model</label>
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full bg-[#3C3C3C] border border-[#3C3C3C] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#007ACC] transition-colors text-white"
                                >
                                    <option value="qwen2.5-coder:1.5b">⚡ Flash (1.5b) - Fast</option>
                                    <option value="qwen2.5-coder:7b">⚖️ Balanced (7b) - Recommended</option>
                                    <option value="deepseek-coder-v2:16b">🧠 Intelligent (16b) - Best</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-1.5 text-xs">
                                    <div className={`w-2 h-2 rounded-full ${provider === 'ollama' ? 'bg-[#007ACC]' : 'bg-purple-500'} animate-pulse`} />
                                    <span className="text-zinc-400">{provider === 'ollama' ? 'Ollama' : 'LM Studio'}</span>
                                </div>
                                <div className={`px-2 py-0.5 rounded text-xs font-medium ${isGenerating ? 'bg-yellow-600 text-white' : 'bg-green-600/20 text-green-400'}`}>
                                    {isGenerating ? 'Generating...' : 'Ready'}
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-zinc-800 text-zinc-200'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="border-t border-[#2D2D2D] p-4">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                                placeholder={`Ask ${getAgentModeName(agentMode)}...`}
                                disabled={isGenerating || !currentProjectPath}
                                className="w-full bg-[#3C3C3C] border border-[#3C3C3C] rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#007ACC] resize-none transition-all max-h-32 disabled:opacity-50"
                                rows={3}
                            />
                            {!currentProjectPath && (
                                <p className="mt-2 text-xs text-amber-500 flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    Open a project first
                                </p>
                            )}
                            <div className="mt-2 text-xs text-zinc-600">
                                <span>Enter to send • Shift+Enter for new line</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Panel - Terminal */}
            {showTerminal && (
                <div className="h-64 border-t border-[#2D2D2D] flex flex-col">
                    <TerminalManager onClose={() => setShowTerminal(false)} />
                </div>
            )}

            {/* Status Bar - Functional */}
            <div className="h-6 bg-[#007ACC] text-white flex items-center justify-between px-3 text-xs font-medium select-none">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowTerminal(!showTerminal)}
                        className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-0.5 rounded transition-colors"
                        title="Toggle Terminal (Ctrl+`)"
                    >
                        {showTerminal ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                        <span>Terminal</span>
                    </button>

                    <button
                        onClick={() => setActivityView('git')}
                        className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-0.5 rounded transition-colors"
                        title="Open Git Panel"
                    >
                        <GitBranch size={12} />
                        <span>{currentBranch || 'main'}</span>
                        {changes.length > 0 && <span className="text-yellow-300">*</span>}
                    </button>

                    {changes.length > 0 && (
                        <span className="text-xs opacity-75">{changes.length} changes</span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAIChat(!showAIChat)}
                        className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-0.5 rounded transition-colors"
                        title="Toggle AI Assistant"
                    >
                        <Zap size={12} />
                        <span>{selectedModel.split(':')[0]}</span>
                    </button>

                    <span className="opacity-75">{getFileLanguage(currentFile?.path.split('/').pop() || null)}</span>
                    <span className="opacity-75">UTF-8</span>
                    <span className="opacity-75">LF</span>
                    <span className="opacity-75">Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
                </div>
            </div>

            {/* Command Palette */}
            <CommandPalette
                isOpen={showCommandPalette}
                onClose={() => setShowCommandPalette(false)}
                commands={[
                    { id: 'file.newProject', label: 'New Project', category: 'File' as const, icon: <FileText size={16} />, action: () => createProject() },
                    { id: 'view.explorer', label: 'Show Explorer', category: 'View' as const, icon: <FileText size={16} />, action: () => setActivityView('explorer') },
                    { id: 'view.search', label: 'Show Search', category: 'View' as const, icon: <Search size={16} />, action: () => setActivityView('search') },
                    { id: 'git.init', label: 'Git: Initialize Repository', category: 'Git' as const, icon: <GitBranch size={16} />, action: () => setActivityView('git') },
                    { id: 'git.status', label: 'Git: Show Changes', category: 'Git' as const, icon: <GitBranch size={16} />, action: () => setActivityView('git') },
                    { id: 'view.git', label: 'Show Git Panel', category: 'View' as const, icon: <GitBranch size={16} />, action: () => setActivityView('git') },
                    { id: 'terminal.toggle', label: 'Toggle Terminal', category: 'Terminal' as const, icon: <TerminalIcon size={16} />, action: () => setShowTerminal(!showTerminal) },
                    { id: 'ai.toggle', label: 'Toggle AI Assistant', category: 'AI' as const, icon: <Zap size={16} />, action: () => setShowAIChat(!showAIChat) },
                    { id: 'ai.modeCode', label: 'AI: Code Generation Mode', category: 'AI' as const, icon: <Zap size={16} />, action: () => { setAgentMode('code'); setShowAIChat(true); } },
                    { id: 'ai.modeArchitect', label: 'AI: System Architect Mode', category: 'AI' as const, icon: <Zap size={16} />, action: () => { setAgentMode('architect'); setShowAIChat(true); } },
                    { id: 'ai.modeDebug', label: 'AI: Debug Assistant Mode', category: 'AI' as const, icon: <Zap size={16} />, action: () => { setAgentMode('debug'); setShowAIChat(true); } },
                    { id: 'view.editor', label: 'Show Editor', category: 'View' as const, icon: <Code2 size={16} />, action: () => setActiveView('editor') },
                    { id: 'view.preview', label: 'Show Preview', category: 'View' as const, icon: <Eye size={16} />, action: () => setActiveView('preview') },
                    { id: 'settings.open', label: 'Open Settings', category: 'Settings' as const, icon: <SettingsIcon size={16} />, action: () => setActivityView('settings') },
                ]}
            />

            {/* Quick Open */}
            {showQuickOpen && (
                <QuickOpen onClose={() => setShowQuickOpen(false)} />
            )}

            {/* Drag & Drop Zone */}
            <DragDropZone
                onFolderDrop={async (path) => {
                    const { setCurrentProjectPath, loadFileTree } = useProjectStore.getState();
                    setCurrentProjectPath(path);
                    await loadFileTree(path);
                }}
            />
        </div>
    );
}
