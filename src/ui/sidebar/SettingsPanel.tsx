import { Palette, Moon, Code2, GitBranch, Zap, Globe, Keyboard, Brain } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useEditorStore } from '../../stores/editorStore';
import { useThemeStore } from '../../stores/themeStore';
import { themes } from '../../themes/themes';
import AISettings from '../settings/AISettings';

export default function SettingsPanel() {
    const [activeTab, setActiveTab] = useState<'general' | 'ai'>('general');
    const { provider, setProvider } = useAppStore();

    console.log('SettingsPanel rendered - activeTab:', activeTab, 'provider:', provider);
    const {
        autoSave,
        setAutoSave,
        autoSaveDelay,
        setAutoSaveDelay,
        fontSize,
        setFontSize,
        tabSize,
        setTabSize,
        wordWrap,
        setWordWrap,
        minimap,
        setMinimap,
        lineNumbers,
        setLineNumbers
    } = useEditorStore();

    const { currentTheme, setTheme } = useThemeStore();

    // Git settings
    const [gitUsername, setGitUsername] = useState('');
    const [gitEmail, setGitEmail] = useState('');

    // LLM settings
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(2048);
    const [lmStudioUrl, setLmStudioUrl] = useState('http://localhost:1234');

    return (
        <div className="h-full flex flex-col bg-[#1E1E1E] text-white overflow-hidden">
            {/* Header */}
            <div className="h-9 px-4 flex items-center justify-between border-b border-[#2D2D2D] flex-shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wide">Settings</span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#2D2D2D] bg-[#252526]">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'general'
                        ? 'text-white border-b-2 border-[#007ACC]'
                        : 'text-zinc-500 hover:text-white'
                        }`}
                >
                    General
                </button>
                <button
                    onClick={() => setActiveTab('ai')}
                    className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'ai'
                        ? 'text-white border-b-2 border-[#007ACC]'
                        : 'text-zinc-500 hover:text-white'
                        }`}
                >
                    <Brain size={16} />
                    AI Configuration
                </button>
            </div>

            {/* Content */}
            {activeTab === 'ai' ? (
                <AISettings />
            ) : (
                <div className="flex-1 overflow-y-auto">
                    {/* Settings sections */}
                    <div className="p-4 space-y-6">
                        {/* Appearance */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold flex items-center gap-2 text-blue-400">
                                <Palette size={16} />
                                Appearance
                            </h3>

                            <div className="pl-6 space-y-3">
                                {/* Theme Selector */}
                                <div>
                                    <label className="text-xs text-zinc-400 mb-2 block">Color Theme</label>
                                    <select
                                        value={currentTheme.id}
                                        onChange={(e) => setTheme(e.target.value)}
                                        className="w-full bg-[#3C3C3C] text-white text-sm px-3 py-2 rounded border border-[#4C4C4C] focus:outline-none focus:border-blue-500"
                                    >
                                        {Object.values(themes).map(theme => (
                                            <option key={theme.id} value={theme.id}>
                                                {theme.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 bg-[#3C3C3C] rounded border border-[#3C3C3C]">
                                    <Moon size={14} className="text-blue-400" />
                                    <span className="text-xs">Dark Mode (Default)</span>
                                </div>
                            </div>
                        </div>

                        {/* Editor */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold flex items-center gap-2 text-green-400">
                                <Code2 size={16} />
                                Editor
                            </h3>

                            <div className="space-y-3 pl-6">
                                <label className="block">
                                    <span className="text-xs text-zinc-400 mb-2 block">Font Size</span>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="range"
                                            min="10"
                                            max="24"
                                            value={fontSize}
                                            onChange={(e) => setFontSize(Number(e.target.value))}
                                            className="flex-1 h-1 bg-[#3C3C3C] rounded-lg appearance-none cursor-pointer accent-[#007ACC]"
                                        />
                                        <span className="text-xs w-10 text-right text-white font-mono">{fontSize}px</span>
                                    </div>
                                </label>

                                <label className="block">
                                    <span className="text-xs text-zinc-400 mb-2 block">Tab Size</span>
                                    <select
                                        value={tabSize}
                                        onChange={(e) => setTabSize(Number(e.target.value))}
                                        className="w-full bg-[#3C3C3C] border border-[#3C3C3C] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#007ACC]"
                                    >
                                        <option value={2}>2 spaces</option>
                                        <option value={4}>4 spaces</option>
                                        <option value={8}>8 spaces</option>
                                    </select>
                                </label>

                                <div className="space-y-2">
                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">Auto Save</span>
                                        <input
                                            type="checkbox"
                                            checked={autoSave}
                                            onChange={(e) => setAutoSave(e.target.checked)}
                                            className="w-4 h-4 rounded border-zinc-600 bg-[#3C3C3C] checked:bg-[#007ACC] cursor-pointer"
                                        />
                                    </label>

                                    {autoSave && (
                                        <label className="block pl-4">
                                            <span className="text-xs text-zinc-400 mb-2 block">Auto Save Delay (ms)</span>
                                            <input
                                                type="number"
                                                value={autoSaveDelay}
                                                onChange={(e) => setAutoSaveDelay(Number(e.target.value))}
                                                min="500"
                                                max="5000"
                                                step="100"
                                                className="w-full bg-[#3C3C3C] border border-[#3C3C3C] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#007ACC]"
                                            />
                                            <p className="mt-1 text-xs text-zinc-600">Recommended: 1000ms (1 second)</p>
                                        </label>
                                    )}

                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">Word Wrap</span>
                                        <input
                                            type="checkbox"
                                            checked={wordWrap}
                                            onChange={(e) => setWordWrap(e.target.checked)}
                                            className="w-4 h-4 rounded border-zinc-600 bg-[#3C3C3C] checked:bg-[#007ACC] cursor-pointer"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">Minimap</span>
                                        <input
                                            type="checkbox"
                                            checked={minimap}
                                            onChange={(e) => setMinimap(e.target.checked)}
                                            className="w-4 h-4 rounded border-zinc-600 bg-[#3C3C3C] checked:bg-[#007ACC] cursor-pointer"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">Line Numbers</span>
                                        <input
                                            type="checkbox"
                                            checked={lineNumbers}
                                            onChange={(e) => setLineNumbers(e.target.checked)}
                                            className="w-4 h-4 rounded border-zinc-600 bg-[#3C3C3C] checked:bg-[#007ACC] cursor-pointer"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Git */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold flex items-center gap-2 text-orange-400">
                                <GitBranch size={16} />
                                Git Configuration
                            </h3>

                            <div className="space-y-3 pl-6">
                                <label className="block">
                                    <span className="text-xs text-zinc-400 mb-2 block">User Name</span>
                                    <input
                                        type="text"
                                        value={gitUsername}
                                        onChange={(e) => setGitUsername(e.target.value)}
                                        placeholder="Your Name"
                                        className="w-full bg-[#3C3C3C] border border-[#3C3C3C] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#007ACC]"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-xs text-zinc-400 mb-2 block">Email</span>
                                    <input
                                        type="email"
                                        value={gitEmail}
                                        onChange={(e) => setGitEmail(e.target.value)}
                                        placeholder="your.email@example.com"
                                        className="w-full bg-[#3C3C3C] border border-[#3C3C3C] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#007ACC]"
                                    />
                                </label>

                                <button className="w-full px-3 py-2 bg-[#007ACC] hover:bg-[#005A9E] rounded text-sm font-medium transition-colors">
                                    Save Git Config
                                </button>
                            </div>
                        </div>

                        {/* AI Model */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold flex items-center gap-2 text-purple-400">
                                <Zap size={16} />
                                AI Model Settings
                            </h3>

                            <div className="space-y-3 pl-6">
                                <label className="block">
                                    <span className="text-xs text-zinc-400 mb-2 block">Provider</span>
                                    <select
                                        value={provider}
                                        onChange={(e) => setProvider(e.target.value as 'ollama' | 'lmstudio')}
                                        className="w-full bg-[#3C3C3C] border border-[#3C3C3C] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#007ACC]"
                                    >
                                        <option value="ollama">Ollama (Local)</option>
                                        <option value="lmstudio">LM Studio (Local)</option>
                                    </select>
                                </label>

                                {provider === 'lmstudio' && (
                                    <label className="block">
                                        <span className="text-xs text-zinc-400 mb-2 block">LM Studio Server URL</span>
                                        <input
                                            type="text"
                                            value={lmStudioUrl}
                                            onChange={(e) => setLmStudioUrl(e.target.value)}
                                            placeholder="http://localhost:1234"
                                            className="w-full bg-[#3C3C3C] border border-[#3C3C3C] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#007ACC] font-mono"
                                        />
                                        <p className="mt-1 text-xs text-zinc-500">
                                            Make sure LM Studio server is running
                                        </p>
                                    </label>
                                )}

                                <label className="block">
                                    <span className="text-xs text-zinc-400 mb-2 block">Temperature ({temperature})</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={temperature}
                                        onChange={(e) => setTemperature(Number(e.target.value))}
                                        className="w-full h-1 bg-[#3C3C3C] rounded-lg appearance-none cursor-pointer accent-[#007ACC]"
                                    />
                                    <div className="flex justify-between text-xs text-zinc-600 mt-1">
                                        <span>Precise</span>
                                        <span>Creative</span>
                                    </div>
                                </label>

                                <label className="block">
                                    <span className="text-xs text-zinc-400 mb-2 block">Max Tokens</span>
                                    <input
                                        type="number"
                                        value={maxTokens}
                                        onChange={(e) => setMaxTokens(Number(e.target.value))}
                                        className="w-full bg-[#3C3C3C] border border-[#3C3C3C] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#007ACC]"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Keyboard Shortcuts */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold flex items-center gap-2 text-cyan-400">
                                <Keyboard size={16} />
                                Keyboard Shortcuts
                            </h3>

                            <div className="space-y-2 pl-6">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-400">Save File</span>
                                    <kbd className="px-2 py-1 bg-[#3C3C3C] rounded font-mono">Ctrl+S</kbd>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-400">Quick Open</span>
                                    <kbd className="px-2 py-1 bg-[#3C3C3C] rounded font-mono">Ctrl+P</kbd>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-400">Command Palette</span>
                                    <kbd className="px-2 py-1 bg-[#3C3C3C] rounded font-mono">Ctrl+Shift+P</kbd>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-400">Toggle Terminal</span>
                                    <kbd className="px-2 py-1 bg-[#3C3C3C] rounded font-mono">Ctrl+`</kbd>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-400">Toggle Sidebar</span>
                                    <kbd className="px-2 py-1 bg-[#3C3C3C] rounded font-mono">Ctrl+B</kbd>
                                </div>
                            </div>
                        </div>

                        {/* About */}
                        <div className="space-y-3 pb-4">
                            <h3 className="text-sm font-semibold flex items-center gap-2 text-zinc-400">
                                <Globe size={16} />
                                About
                            </h3>

                            <div className="pl-6 space-y-2 text-xs text-zinc-500">
                                <div className="flex justify-between">
                                    <span>Version</span>
                                    <span className="text-white">0.2.0</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Build</span>
                                    <span className="text-white">Professional IDE</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Platform</span>
                                    <span className="text-white">Tauri v2</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
