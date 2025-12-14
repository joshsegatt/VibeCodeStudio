import { invoke } from '@tauri-apps/api/core';

export interface ReviewSuggestion {
    line: number;
    column?: number;
    endLine?: number;
    endColumn?: number;
    severity: 'error' | 'warning' | 'info';
    message: string;
    category: 'performance' | 'security' | 'style' | 'logic' | 'best-practice';
    fix?: string;
}

export interface CodeReviewResult {
    suggestions: ReviewSuggestion[];
    summary: string;
    analyzedAt: number;
}

// Cache to avoid re-analyzing same code
const reviewCache = new Map<string, CodeReviewResult>();

export async function analyzeCode(
    code: string,
    language: string,
    filePath?: string
): Promise<CodeReviewResult> {
    // Create cache key
    const cacheKey = `${language}:${code.substring(0, 100)}`;

    // Check cache
    const cached = reviewCache.get(cacheKey);
    if (cached && Date.now() - cached.analyzedAt < 60000) { // 1 minute cache
        return cached;
    }

    try {
        // Build AI prompt for code review
        const prompt = buildReviewPrompt(code, language, filePath);

        // Call AI service (using existing Ollama/LMStudio)
        const response = await invoke<string>('generate_text', {
            prompt,
            model: 'default' // Use current model from settings
        });

        // Parse AI response into suggestions
        const suggestions = parseReviewResponse(response);

        const result: CodeReviewResult = {
            suggestions,
            summary: `Found ${suggestions.length} suggestions`,
            analyzedAt: Date.now()
        };

        // Cache result
        reviewCache.set(cacheKey, result);

        return result;
    } catch (error) {
        console.error('Code review failed:', error);
        return {
            suggestions: [],
            summary: 'Review failed',
            analyzedAt: Date.now()
        };
    }
}

function buildReviewPrompt(code: string, language: string, filePath?: string): string {
    return `You are a senior code reviewer. Analyze this ${language} code and provide specific suggestions for improvement.

${filePath ? `File: ${filePath}\n` : ''}
Code:
\`\`\`${language}
${code}
\`\`\`

Provide suggestions in this exact JSON format:
{
  "suggestions": [
    {
      "line": <line_number>,
      "severity": "error" | "warning" | "info",
      "category": "performance" | "security" | "style" | "logic" | "best-practice",
      "message": "Brief description of the issue",
      "fix": "Optional: suggested fix"
    }
  ]
}

Focus on:
- Performance issues
- Security vulnerabilities
- Code style and readability
- Logic errors
- Best practices

Be concise and actionable. Only suggest real improvements.`;
}

function parseReviewResponse(response: string): ReviewSuggestion[] {
    try {
        // Try to extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return [];
        }

        const parsed = JSON.parse(jsonMatch[0]);

        if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
            return parsed.suggestions.map((s: any) => ({
                line: s.line || 1,
                column: s.column,
                endLine: s.endLine,
                endColumn: s.endColumn,
                severity: s.severity || 'info',
                category: s.category || 'best-practice',
                message: s.message || 'No message',
                fix: s.fix
            }));
        }

        return [];
    } catch (error) {
        console.error('Failed to parse review response:', error);
        return [];
    }
}

// Debounced version for real-time analysis
let debounceTimer: NodeJS.Timeout | null = null;

export function analyzeCodeDebounced(
    code: string,
    language: string,
    filePath: string | undefined,
    callback: (result: CodeReviewResult) => void,
    delay: number = 2000
): void {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(async () => {
        const result = await analyzeCode(code, language, filePath);
        callback(result);
    }, delay);
}

export function clearReviewCache(): void {
    reviewCache.clear();
}
