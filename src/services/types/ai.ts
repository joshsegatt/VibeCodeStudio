// AI Provider shared types

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatCompletionRequest {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
    max_tokens?: number;
    maxTokens?: number; // Alias for max_tokens
    stream?: boolean;
}

export interface ChatCompletionResponse {
    content: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    cost?: number;
}

export interface TokenUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}

export interface AIProvider {
    chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;
    chatStream?(request: ChatCompletionRequest): AsyncGenerator<string>;
}
