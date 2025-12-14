import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GeminiProvider } from './providers/gemini';
import { OpenRouterProvider } from './providers/openrouter';
import type { ChatCompletionRequest, ChatCompletionResponse } from '../types/ai';
import { invoke } from '@tauri-apps/api/core';

export class UnifiedAIService {
    private openai: OpenAIProvider;
    private anthropic: AnthropicProvider;
    private gemini: GeminiProvider;
    private openrouter: OpenRouterProvider;

    constructor() {
        this.openai = new OpenAIProvider();
        this.anthropic = new AnthropicProvider();
        this.gemini = new GeminiProvider();
        this.openrouter = new OpenRouterProvider();
    }

    // Set API keys
    setOpenAIKey(key: string) {
        this.openai.setApiKey(key);
    }

    setAnthropicKey(key: string) {
        this.anthropic.setApiKey(key);
    }

    setGeminiKey(key: string) {
        this.gemini.setApiKey(key);
    }

    setOpenRouterKey(key: string) {
        this.openrouter.setApiKey(key);
    }

    // Unified chat method
    async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
        const provider = this.getProvider(request.provider);

        // Handle local providers (Ollama/LM Studio)
        if (request.provider === 'Ollama' || request.provider === 'LM Studio') {
            return this.chatLocal(request);
        }

        // Handle cloud providers
        return provider.chat(request);
    }

    // Unified streaming method
    async *chatStream(request: ChatCompletionRequest): AsyncGenerator<string> {
        const provider = this.getProvider(request.provider);

        // Handle local providers
        if (request.provider === 'Ollama' || request.provider === 'LM Studio') {
            yield* this.chatStreamLocal(request);
            return;
        }

        // Handle cloud providers
        yield* provider.chatStream(request);
    }

    // Local provider chat (Ollama/LM Studio)
    private async chatLocal(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
        try {
            const response = await invoke<string>('generate_code', {
                prompt: request.messages[request.messages.length - 1].content,
                model: request.model,
            });

            return {
                content: response,
                usage: undefined,
                cost: 0,
            };
        } catch (error: any) {
            throw new Error(`Local provider error: ${error}`);
        }
    }

    // Local provider streaming
    private async *chatStreamLocal(request: ChatCompletionRequest): AsyncGenerator<string> {
        // For now, return non-streaming response
        // TODO: Implement streaming for local providers
        const response = await this.chatLocal(request);
        yield response.content;
    }

    // Get provider instance
    private getProvider(providerName: string): any {
        switch (providerName) {
            case 'OpenAI':
                return this.openai;
            case 'Anthropic':
                return this.anthropic;
            case 'Google Gemini':
                return this.gemini;
            case 'OpenRouter':
                return this.openrouter;
            default:
                throw new Error(`Unknown provider: ${providerName}`);
        }
    }
}

// Singleton instance
export const aiService = new UnifiedAIService();
