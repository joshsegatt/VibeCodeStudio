import Anthropic from '@anthropic-ai/sdk';
import type { ChatMessage, ChatCompletionRequest, ChatCompletionResponse } from '../types/ai';

export class AnthropicProvider {
    private client: Anthropic | null = null;
    private apiKey: string | null = null;

    constructor(apiKey?: string) {
        if (apiKey) {
            this.setApiKey(apiKey);
        }
    }

    setApiKey(apiKey: string) {
        this.apiKey = apiKey;
        this.client = new Anthropic({
            apiKey,
            dangerouslyAllowBrowser: true
        });
    }

    async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
        if (!this.client) {
            throw new Error('Anthropic API key not set');
        }

        try {
            // Convert messages format
            const messages = request.messages
                .filter((m: ChatMessage) => m.role !== 'system')
                .map((m: ChatMessage) => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content
                }));

            const systemMessage = request.messages.find((m: ChatMessage) => m.role === 'system')?.content;

            const response = await this.client.messages.create({
                model: request.model,
                max_tokens: request.maxTokens ?? 2000,
                temperature: request.temperature ?? 0.7,
                system: systemMessage,
                messages,
            });

            const content = response.content[0]?.type === 'text' ? response.content[0].text : '';

            // Calculate cost
            let cost = 0;
            if (response.usage) {
                const model = this.getModelCost(request.model);
                if (model) {
                    cost = (response.usage.input_tokens / 1000) * model.input +
                        (response.usage.output_tokens / 1000) * model.output;
                }
            }

            return {
                content,
                usage: response.usage ? {
                    prompt_tokens: response.usage.input_tokens,
                    completion_tokens: response.usage.output_tokens,
                    total_tokens: response.usage.input_tokens + response.usage.output_tokens,
                } : undefined,
                cost,
            };
        } catch (error: any) {
            throw new Error(`Anthropic API error: ${error.message}`);
        }
    }

    async *chatStream(request: ChatCompletionRequest): AsyncGenerator<string> {
        if (!this.client) {
            throw new Error('Anthropic API key not set');
        }

        try {
            const messages = request.messages
                .filter((m: ChatMessage) => m.role !== 'system')
                .map((m: ChatMessage) => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content
                }));

            const systemMessage = request.messages.find((m: ChatMessage) => m.role === 'system')?.content;

            const stream = await this.client.messages.create({
                model: request.model,
                max_tokens: request.maxTokens ?? 2000,
                temperature: request.temperature ?? 0.7,
                system: systemMessage,
                messages,
                stream: true,
            });

            for await (const event of stream) {
                if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                    yield event.delta.text;
                }
            }
        } catch (error: any) {
            throw new Error(`Anthropic streaming error: ${error.message}`);
        }
    }

    private getModelCost(modelId: string): { input: number; output: number } | null {
        const costs: Record<string, { input: number; output: number }> = {
            'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
            'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
            'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
        };
        return costs[modelId] || null;
    }
}
