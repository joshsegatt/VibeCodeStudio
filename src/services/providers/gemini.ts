import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChatMessage, ChatCompletionRequest, ChatCompletionResponse } from '../types/ai';

export class GeminiProvider {
    private client: GoogleGenerativeAI | null = null;
    private apiKey: string | null = null;

    constructor(apiKey?: string) {
        if (apiKey) {
            this.setApiKey(apiKey);
        }
    }

    setApiKey(apiKey: string) {
        this.apiKey = apiKey;
        this.client = new GoogleGenerativeAI(apiKey);
    }

    async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
        if (!this.client) {
            throw new Error('Google Gemini API key not set');
        }

        try {
            const model = this.client.getGenerativeModel({ model: request.model });

            // Convert messages to Gemini format
            const history = request.messages
                .filter((m: ChatMessage) => m.role !== 'system')
                .map((m: ChatMessage) => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content }]
                }));

            const lastMessage = history.pop();
            if (!lastMessage) {
                throw new Error('No messages provided');
            }

            const chat = model.startChat({ history: history.slice(0, -1) });
            const result = await chat.sendMessage(lastMessage.parts[0].text);
            const response = await result.response;
            const content = response.text();

            return {
                content,
                usage: undefined, // Gemini doesn't provide token usage in free tier
                cost: 0,
            };
        } catch (error: any) {
            throw new Error(`Google Gemini API error: ${error.message}`);
        }
    }

    async *chatStream(request: ChatCompletionRequest): AsyncGenerator<string> {
        if (!this.client) {
            throw new Error('Google Gemini API key not set');
        }

        try {
            const model = this.client.getGenerativeModel({ model: request.model });

            const history = request.messages
                .filter((m: ChatMessage) => m.role !== 'system')
                .map((m: ChatMessage) => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content }]
                }));

            const lastMessage = history.pop();
            if (!lastMessage) {
                throw new Error('No messages provided');
            }

            const chat = model.startChat({ history: history.slice(0, -1) });
            const result = await chat.sendMessageStream(lastMessage.parts[0].text);

            for await (const chunk of result.stream) {
                const text = chunk.text();
                if (text) {
                    yield text;
                }
            }
        } catch (error: any) {
            throw new Error(`Google Gemini streaming error: ${error.message}`);
        }
    }
}
