import axios from 'axios';
import type { ChatMessage, ChatCompletionRequest, ChatCompletionResponse } from '../types/ai';

export class OpenRouterProvider {
    private apiKey: string | null = null;
    private endpoint = 'https://openrouter.ai/api/v1/chat/completions';

    constructor(apiKey?: string) {
        if (apiKey) {
            this.setApiKey(apiKey);
        }
    }

    setApiKey(apiKey: string) {
        this.apiKey = apiKey;
    }

    async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
        if (!this.apiKey) {
            throw new Error('OpenRouter API key not set');
        }

        try {
            const response = await axios.post(
                this.endpoint,
                {
                    model: request.model,
                    messages: request.messages,
                    temperature: request.temperature ?? 0.7,
                    max_tokens: request.maxTokens ?? 2000,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://vibe-studio.app',
                        'X-Title': 'Vibe Studio',
                    }
                }
            );

            const content = response.data.choices[0]?.message?.content || '';
            const usage = response.data.usage;

            return {
                content,
                usage: usage ? {
                    prompt_tokens: usage.prompt_tokens,
                    completion_tokens: usage.completion_tokens,
                    total_tokens: usage.total_tokens,
                } : undefined,
                cost: 0, // OpenRouter provides cost in response headers
            };
        } catch (error: any) {
            throw new Error(`OpenRouter API error: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    async *chatStream(request: ChatCompletionRequest): AsyncGenerator<string> {
        if (!this.apiKey) {
            throw new Error('OpenRouter API key not set');
        }

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://vibe-studio.app',
                    'X-Title': 'Vibe Studio',
                },
                body: JSON.stringify({
                    model: request.model,
                    messages: request.messages,
                    temperature: request.temperature ?? 0.7,
                    max_tokens: request.maxTokens ?? 2000,
                    stream: true,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No response body');
            }

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content;
                            if (content) {
                                yield content;
                            }
                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        } catch (error: any) {
            throw new Error(`OpenRouter streaming error: ${error.message}`);
        }
    }
}
