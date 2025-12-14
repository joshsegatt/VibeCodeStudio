// AI Provider Types
export type ProviderType = 'local' | 'cloud';

export interface AIModel {
    id: string;
    name: string;
    provider: string;
    contextWindow: number;
    costPer1kTokens?: {
        input: number;
        output: number;
    };
}

export interface AIProvider {
    name: string;
    type: ProviderType;
    models: AIModel[];
    requiresApiKey: boolean;
    endpoint?: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ChatCompletionRequest {
    provider: string;
    model: string;
    messages: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
}

export interface ChatCompletionResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    cost?: number;
}

// Available Providers
export const AI_PROVIDERS: AIProvider[] = [
    // Local Providers
    {
        name: 'Ollama',
        type: 'local',
        requiresApiKey: false,
        endpoint: 'http://localhost:11434',
        models: [
            { id: 'qwen2.5-coder:1.5b', name: 'Qwen 2.5 Coder 1.5B', provider: 'Ollama', contextWindow: 32768 },
            { id: 'qwen2.5-coder:7b', name: 'Qwen 2.5 Coder 7B', provider: 'Ollama', contextWindow: 32768 },
            { id: 'deepseek-coder-v2:16b', name: 'DeepSeek Coder V2 16B', provider: 'Ollama', contextWindow: 16384 },
            { id: 'codellama:7b', name: 'Code Llama 7B', provider: 'Ollama', contextWindow: 16384 },
        ]
    },
    {
        name: 'LM Studio',
        type: 'local',
        requiresApiKey: false,
        endpoint: 'http://localhost:1234',
        models: [
            { id: 'local-model', name: 'Local Model', provider: 'LM Studio', contextWindow: 8192 },
        ]
    },
    // Cloud Providers
    {
        name: 'OpenAI',
        type: 'cloud',
        requiresApiKey: true,
        models: [
            {
                id: 'gpt-4-turbo-preview',
                name: 'GPT-4 Turbo',
                provider: 'OpenAI',
                contextWindow: 128000,
                costPer1kTokens: { input: 0.01, output: 0.03 }
            },
            {
                id: 'gpt-4',
                name: 'GPT-4',
                provider: 'OpenAI',
                contextWindow: 8192,
                costPer1kTokens: { input: 0.03, output: 0.06 }
            },
            {
                id: 'gpt-3.5-turbo',
                name: 'GPT-3.5 Turbo',
                provider: 'OpenAI',
                contextWindow: 16385,
                costPer1kTokens: { input: 0.0005, output: 0.0015 }
            },
        ]
    },
    {
        name: 'Anthropic',
        type: 'cloud',
        requiresApiKey: true,
        models: [
            {
                id: 'claude-3-opus-20240229',
                name: 'Claude 3 Opus',
                provider: 'Anthropic',
                contextWindow: 200000,
                costPer1kTokens: { input: 0.015, output: 0.075 }
            },
            {
                id: 'claude-3-sonnet-20240229',
                name: 'Claude 3 Sonnet',
                provider: 'Anthropic',
                contextWindow: 200000,
                costPer1kTokens: { input: 0.003, output: 0.015 }
            },
            {
                id: 'claude-3-haiku-20240307',
                name: 'Claude 3 Haiku',
                provider: 'Anthropic',
                contextWindow: 200000,
                costPer1kTokens: { input: 0.00025, output: 0.00125 }
            },
        ]
    },
    {
        name: 'Google Gemini',
        type: 'cloud',
        requiresApiKey: true,
        models: [
            {
                id: 'gemini-pro',
                name: 'Gemini Pro',
                provider: 'Google',
                contextWindow: 32768,
                costPer1kTokens: { input: 0.00025, output: 0.0005 }
            },
            {
                id: 'gemini-pro-vision',
                name: 'Gemini Pro Vision',
                provider: 'Google',
                contextWindow: 16384,
                costPer1kTokens: { input: 0.00025, output: 0.0005 }
            },
        ]
    },
    {
        name: 'OpenRouter',
        type: 'cloud',
        requiresApiKey: true,
        endpoint: 'https://openrouter.ai/api/v1',
        models: [
            { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus (OpenRouter)', provider: 'OpenRouter', contextWindow: 200000 },
            { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo (OpenRouter)', provider: 'OpenRouter', contextWindow: 128000 },
            { id: 'google/gemini-pro', name: 'Gemini Pro (OpenRouter)', provider: 'OpenRouter', contextWindow: 32768 },
            { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B (OpenRouter)', provider: 'OpenRouter', contextWindow: 8192 },
        ]
    },
];
