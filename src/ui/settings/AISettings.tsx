import { Settings as SettingsIcon, Key, Cloud } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { AI_PROVIDERS } from '../../types/ai';
import { useState } from 'react';
import { aiService } from '../../services/aiService';

export default function AISettings() {
    const { apiKeys, setAPIKey, provider, setProvider, currentModel, setCurrentModel } = useAppStore();
    const [showKeys, setShowKeys] = useState(false);

    const handleAPIKeyChange = (providerKey: 'openai' | 'anthropic' | 'gemini' | 'openrouter', value: string) => {
        setAPIKey(providerKey, value);

        // Update aiService with new key
        switch (providerKey) {
            case 'openai':
                aiService.setOpenAIKey(value);
                break;
            case 'anthropic':
                aiService.setAnthropicKey(value);
                break;
            case 'gemini':
                aiService.setGeminiKey(value);
                break;
            case 'openrouter':
                aiService.setOpenRouterKey(value);
                break;
        }
    };

    const cloudProviders = AI_PROVIDERS.filter(p => p.type === 'cloud');
    const selectedProvider = AI_PROVIDERS.find(p => p.name === provider);
    const availableModels = selectedProvider?.models || [];

    return (
        <div className="h-full overflow-y-auto bg-[#1E1E1E]">
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <SettingsIcon size={24} />
                        Cloud AI Configuration
                    </h1>
                    <p className="text-zinc-500 text-sm">Configure cloud AI providers and API keys</p>
                </div>

                {/* Provider Selection */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-white mb-4">Cloud Providers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {cloudProviders.map((p) => (
                            <button
                                key={p.name}
                                onClick={() => setProvider(p.name)}
                                className={`w-full p-4 rounded-lg border transition-all text-left ${provider === p.name
                                    ? 'bg-[#007ACC]/10 border-[#007ACC] text-white'
                                    : 'bg-[#252526] border-[#2D2D2D] text-zinc-400 hover:border-[#007ACC]/50'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Cloud size={16} className="text-[#007ACC]" />
                                    <div className="font-medium">{p.name}</div>
                                </div>
                                <div className="text-xs text-zinc-500">
                                    {p.models.length} models • {p.models[0]?.contextWindow.toLocaleString()} tokens
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Model Selection - Only show if cloud provider selected */}
                {selectedProvider && selectedProvider.type === 'cloud' && (
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-white mb-4">Model</h2>
                        <select
                            value={currentModel}
                            onChange={(e) => setCurrentModel(e.target.value)}
                            className="w-full bg-[#3C3C3C] border border-[#2D2D2D] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#007ACC] transition-colors"
                        >
                            {availableModels.map((model) => (
                                <option key={model.id} value={model.id}>
                                    {model.name} ({model.contextWindow.toLocaleString()} tokens)
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* API Keys */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Key size={20} />
                            API Keys
                        </h2>
                        <button
                            onClick={() => setShowKeys(!showKeys)}
                            className="text-xs text-zinc-500 hover:text-white transition-colors"
                        >
                            {showKeys ? 'Hide' : 'Show'} Keys
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* OpenAI */}
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">OpenAI API Key</label>
                            <input
                                type={showKeys ? 'text' : 'password'}
                                value={apiKeys.openai || ''}
                                onChange={(e) => handleAPIKeyChange('openai', e.target.value)}
                                placeholder="sk-..."
                                className="w-full bg-[#3C3C3C] border border-[#2D2D2D] rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#007ACC] transition-colors font-mono text-sm"
                            />
                            <p className="text-xs text-zinc-600 mt-1">Get your key from platform.openai.com</p>
                        </div>

                        {/* Anthropic */}
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Anthropic API Key</label>
                            <input
                                type={showKeys ? 'text' : 'password'}
                                value={apiKeys.anthropic || ''}
                                onChange={(e) => handleAPIKeyChange('anthropic', e.target.value)}
                                placeholder="sk-ant-..."
                                className="w-full bg-[#3C3C3C] border border-[#2D2D2D] rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#007ACC] transition-colors font-mono text-sm"
                            />
                            <p className="text-xs text-zinc-600 mt-1">Get your key from console.anthropic.com</p>
                        </div>

                        {/* Google Gemini */}
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Google Gemini API Key</label>
                            <input
                                type={showKeys ? 'text' : 'password'}
                                value={apiKeys.gemini || ''}
                                onChange={(e) => handleAPIKeyChange('gemini', e.target.value)}
                                placeholder="AI..."
                                className="w-full bg-[#3C3C3C] border border-[#2D2D2D] rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#007ACC] transition-colors font-mono text-sm"
                            />
                            <p className="text-xs text-zinc-600 mt-1">Get your key from makersuite.google.com</p>
                        </div>

                        {/* OpenRouter */}
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">OpenRouter API Key</label>
                            <input
                                type={showKeys ? 'text' : 'password'}
                                value={apiKeys.openrouter || ''}
                                onChange={(e) => handleAPIKeyChange('openrouter', e.target.value)}
                                placeholder="sk-or-..."
                                className="w-full bg-[#3C3C3C] border border-[#2D2D2D] rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#007ACC] transition-colors font-mono text-sm"
                            />
                            <p className="text-xs text-zinc-600 mt-1">Get your key from openrouter.ai (100+ models)</p>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-sm text-blue-300">
                        <strong>💡 Tip:</strong> API keys are stored locally and encrypted. For local providers (Ollama/LM Studio), configure them in the General tab.
                    </p>
                </div>
            </div>
        </div>
    );
}
