interface QuickEditRequest {
    code: string;
    selection: {
        start: number;
        end: number;
    };
    instruction: string;
    language: string;
}

interface QuickEditResponse {
    originalCode: string;
    editedCode: string;
    diff: string;
}

class QuickEditService {
    async performEdit(request: QuickEditRequest): Promise<QuickEditResponse> {
        const startTime = performance.now();

        try {
            // Get AI edit
            const editedCode = await this.callAI(request);

            // Generate diff
            const diff = this.generateDiff(request.code, editedCode);

            const elapsed = performance.now() - startTime;
            console.log(`⚡ Quick edit in ${elapsed.toFixed(0)}ms`);

            return {
                originalCode: request.code,
                editedCode,
                diff
            };
        } catch (error) {
            console.error('Quick edit error:', error);
            throw error;
        }
    }

    private async callAI(request: QuickEditRequest): Promise<string> {
        const prompt = this.buildPrompt(request);

        // Try Ollama first
        try {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'codellama:7b',
                    prompt,
                    stream: false,
                    options: {
                        temperature: 0.1,
                        top_p: 0.9,
                        num_predict: 500
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.response.trim();
            }
        } catch (e) {
            console.log('Ollama not available, trying OpenAI...');
        }

        // Fallback to OpenAI
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
                max_tokens: 500,
                temperature: 0.1
            })
        });

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    private buildPrompt(request: QuickEditRequest): string {
        return `You are a code editor. Edit the following ${request.language} code according to the instruction.

Original code:
\`\`\`${request.language}
${request.code}
\`\`\`

Instruction: ${request.instruction}

Return ONLY the edited code, no explanations. Keep the same structure and style.`;
    }

    private generateDiff(original: string, edited: string): string {
        const originalLines = original.split('\n');
        const editedLines = edited.split('\n');

        let diff = '';
        const maxLines = Math.max(originalLines.length, editedLines.length);

        for (let i = 0; i < maxLines; i++) {
            const origLine = originalLines[i] || '';
            const editLine = editedLines[i] || '';

            if (origLine !== editLine) {
                if (origLine) diff += `- ${origLine}\n`;
                if (editLine) diff += `+ ${editLine}\n`;
            } else {
                diff += `  ${origLine}\n`;
            }
        }

        return diff;
    }
}

export const quickEditService = new QuickEditService();
