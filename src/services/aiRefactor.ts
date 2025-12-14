import { invoke } from '@tauri-apps/api/core';

export type RefactorAction =
    | 'extract-function'
    | 'add-types'
    | 'optimize'
    | 'simplify'
    | 'add-comments';

export interface RefactorResult {
    originalCode: string;
    refactoredCode: string;
    explanation: string;
    action: RefactorAction;
}

export async function refactorCode(
    code: string,
    action: RefactorAction,
    language: string,
    context?: string
): Promise<RefactorResult> {
    try {
        const prompt = buildRefactorPrompt(code, action, language, context);

        const response = await invoke<string>('generate_text', {
            prompt,
            model: 'default'
        });

        const refactoredCode = extractCodeFromResponse(response);

        return {
            originalCode: code,
            refactoredCode,
            explanation: extractExplanation(response),
            action
        };
    } catch (error) {
        console.error('Refactoring failed:', error);
        throw error;
    }
}

function buildRefactorPrompt(code: string, action: RefactorAction, language: string, context?: string): string {
    const actionDescriptions = {
        'extract-function': 'Extract the selected code into a well-named function',
        'add-types': 'Add TypeScript types to improve type safety',
        'optimize': 'Optimize the code for better performance',
        'simplify': 'Simplify the logic while maintaining functionality',
        'add-comments': 'Add clear, concise comments explaining the code'
    };

    return `You are a senior developer. ${actionDescriptions[action]}.

${context ? `Context: ${context}\n` : ''}
Language: ${language}

Original code:
\`\`\`${language}
${code}
\`\`\`

Provide the refactored code in a code block, followed by a brief explanation.
Keep the same functionality. Only improve the code quality.`;
}

function extractCodeFromResponse(response: string): string {
    const codeBlockMatch = response.match(/```[\w]*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
        return codeBlockMatch[1].trim();
    }
    return response.trim();
}

function extractExplanation(response: string): string {
    const parts = response.split('```');
    if (parts.length > 2) {
        return parts[2].trim();
    }
    return 'Refactored successfully';
}

// Quick refactor actions
export const refactorActions = [
    { id: 'extract-function', label: 'Extract Function', icon: '📦' },
    { id: 'add-types', label: 'Add Types', icon: '🏷️' },
    { id: 'optimize', label: 'Optimize Code', icon: '⚡' },
    { id: 'simplify', label: 'Simplify Logic', icon: '✨' },
    { id: 'add-comments', label: 'Add Comments', icon: '💬' }
] as const;
