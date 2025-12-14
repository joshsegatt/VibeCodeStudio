interface CompletionRequest {
    code: string;
    cursorPosition: number;
    language: string;
    context?: string[];
}

interface CompletionResponse {
    suggestion: string;
    confidence: number;
}

class AICompletionService {
    private cache: Map<string, CompletionResponse> = new Map();
    private debounceTimer: number | null = null;
    private readonly DEBOUNCE_MS = 150;
    private readonly CACHE_TTL = 60000; // 1 minute

    async getCompletion(request: CompletionRequest): Promise<CompletionResponse | null> {
        // Check cache first
        const cacheKey = this.getCacheKey(request);
        const cached = this.cache.get(cacheKey);
        if (cached) {
            console.log('✅ Cache hit');
            return cached;
        }

        try {
            const startTime = performance.now();

            // Call AI service
            const response = await this.callAI(request);

            const elapsed = performance.now() - startTime;
            console.log(`⚡ Completion in ${elapsed.toFixed(0)}ms`);

            // Cache result
            this.cache.set(cacheKey, response);
            setTimeout(() => this.cache.delete(cacheKey), this.CACHE_TTL);

            return response;
        } catch (error) {
            console.error('Completion error:', error);
            return null;
        }
    }

    private async callAI(request: CompletionRequest): Promise<CompletionResponse> {
        const context = this.buildContext(request);
        const prompt = this.buildPrompt(request, context);

        try {
            // Try Ollama first (local, fast)
            const response = await this.callOllama(prompt);
            if (response) return response;

            // Fallback to OpenAI
            return await this.callOpenAI(prompt);
        } catch (error) {
            console.error('AI call failed:', error);
            throw error;
        }
    }

    private async callOllama(prompt: string): Promise<CompletionResponse | null> {
        try {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'codellama:7b',
                    prompt,
                    stream: true, // Enable streaming for faster first token
                    options: {
                        temperature: 0.2,
                        top_p: 0.9,
                        num_predict: 100,
                        stop: ['\n\n', '```'] // Stop early for completions
                    }
                })
            });

            if (!response.ok) return null;

            // Stream response for faster perceived performance
            const reader = response.body?.getReader();
            if (!reader) return null;

            let fullResponse = '';
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.response) {
                            fullResponse += data.response;
                        }
                        if (data.done) break;
                    } catch (e) {
                        // Skip invalid JSON
                    }
                }
            }

            return {
                suggestion: fullResponse.trim(),
                confidence: 0.85
            };
        } catch {
            return null;
        }
    }

    private async callOpenAI(prompt: string): Promise<CompletionResponse> {
        // TODO: Integrate with your existing OpenAI service
        const apiKey = localStorage.getItem('openai_api_key');

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 100,
                temperature: 0.2,
                stream: false
            })
        });

        const data = await response.json();
        return {
            suggestion: data.choices[0].message.content.trim(),
            confidence: 0.9
        };
    }

    private buildContext(request: CompletionRequest): string {
        // Build smart context from file
        const lines = request.code.split('\n');
        const imports = lines.filter(l => l.includes('import')).join('\n');
        const recentCode = request.code.slice(-500); // Last 500 chars

        return `${imports}\n\n${recentCode}`;
    }

    private buildPrompt(request: CompletionRequest, context: string): string {
        return `Complete the following ${request.language} code. Only return the completion, no explanations.

Context:
${context}

Complete from cursor position. Be concise and accurate.`;
    }

    private getCacheKey(request: CompletionRequest): string {
        return `${request.language}:${request.code.slice(-100)}:${request.cursorPosition}`;
    }

    debounce(fn: () => void): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = window.setTimeout(fn, this.DEBOUNCE_MS);
    }

    clearCache(): void {
        this.cache.clear();
    }
}

export const completionService = new AICompletionService();
