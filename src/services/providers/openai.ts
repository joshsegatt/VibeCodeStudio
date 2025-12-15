import OpenAI from 'openai';
import type { ChatMessage, ChatCompletionRequest, ChatCompletionResponse } from '../types/ai';

export class OpenAIProvider {
    private client: OpenAI | null = null;
    private apiKey: string | null = null;

    constructor(apiKey?: string) {
        if (apiKey) {
            this.setApiKey(apiKey);
        }
    }

    setApiKey(apiKey: string) {
        this.apiKey = apiKey;
        this.client = new OpenAI({
            apiKey,
            dangerouslyAllowBrowser: true // For Tauri desktop app
        });
    }

    async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
        if (!this.client) {
            throw new Error('OpenAI API key not set');
        }

        try {
            const response = await this.client.chat.completions.create({
                model: request.model,
                messages: request.messages as any,
                temperature: request.temperature ?? 0.7,
                max_tokens: request.maxTokens ?? 2000,
                stream: false,
            });

            const content = response.choices[0]?.message?.content || '';
            const usage = response.usage;

            // Calculate cost
            let cost = 0;
            if (usage) {
                const model = this.getModelCost(request.model);
                if (model) {
                    cost = (usage.prompt_tokens / 1000) * model.input +
                        (usage.completion_tokens / 1000) * model.output;
                }
            }

            return {
                content,
                usage: usage ? {
                    prompt_tokens: usage.prompt_tokens,
                    completion_tokens: usage.completion_tokens,
                    total_tokens: usage.total_tokens,
                } : undefined,
                cost,
            };
        } catch (error: any) {
            throw new Error(`OpenAI API error: ${error.message}`);
        }
    }

    async *chatStream(request: ChatCompletionRequest): AsyncGenerator<string> {
        if (!this.client) {
            throw new Error('OpenAI API key not set');
        }

        try {
            const stream = await this.client.chat.completions.create({
                model: request.model,
                messages: request.messages as any,
                temperature: request.temperature ?? 0.7,
                max_tokens: request.maxTokens ?? 2000,
                stream: true,
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    yield content;
                }
            }
        } catch (error: any) {
            throw new Error(`OpenAI streaming error: ${error.message}`);
        }
    }

    private getModelCost(modelId: string): { input: number; output: number } | null {
        const costs: Record<string, { input: number; output: number }> = {
            'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
            'gpt-4': { input: 0.03, output: 0.06 },
            'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
        };
        return costs[modelId] || null;
    }
}
