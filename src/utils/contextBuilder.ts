import { EditorContext } from '../hooks/useEditorContext';

export interface ContextPrompt {
    systemPrompt: string;
    userPrompt: string;
    fullPrompt: string;
}

export function buildContextPrompt(
    userMessage: string,
    context: EditorContext,
    includeFile: boolean = true,
    includeSelection: boolean = true
): ContextPrompt {
    const parts: string[] = [];

    // Add file context
    if (includeFile && context.currentFile) {
        parts.push(`Current file: ${context.currentFile}`);
        if (context.language) {
            parts.push(`Language: ${context.language}`);
        }
    }

    // Add selection context
    if (includeSelection && context.selectedText) {
        const lineCount = context.selectedText.split('\n').length;
        parts.push(`\nSelected code (${lineCount} lines):`);
        parts.push('```' + (context.language || ''));
        parts.push(context.selectedText);
        parts.push('```');
    }

    // Add cursor position
    if (context.cursorPosition) {
        parts.push(`\nCursor at line ${context.cursorPosition.line}, column ${context.cursorPosition.column}`);
    }

    const systemPrompt = parts.length > 0
        ? `You are an AI coding assistant. Here is the current context:\n\n${parts.join('\n')}`
        : 'You are an AI coding assistant.';

    const userPrompt = userMessage;
    const fullPrompt = parts.length > 0
        ? `${parts.join('\n')}\n\nUser question: ${userMessage}`
        : userMessage;

    return {
        systemPrompt,
        userPrompt,
        fullPrompt
    };
}

export function truncateCode(code: string, maxLines: number = 100): string {
    const lines = code.split('\n');
    if (lines.length <= maxLines) {
        return code;
    }

    const half = Math.floor(maxLines / 2);
    const truncated = [
        ...lines.slice(0, half),
        `... (${lines.length - maxLines} lines truncated) ...`,
        ...lines.slice(-half)
    ];

    return truncated.join('\n');
}

export function formatContextSummary(context: EditorContext): string {
    const parts: string[] = [];

    if (context.currentFile) {
        const filename = context.currentFile.split(/[/\\]/).pop() || context.currentFile;
        parts.push(`📄 ${filename}`);
    }

    if (context.selectedText) {
        const lineCount = context.selectedText.split('\n').length;
        parts.push(`✂️ ${lineCount} line${lineCount > 1 ? 's' : ''} selected`);
    }

    if (context.cursorPosition) {
        parts.push(`📍 Line ${context.cursorPosition.line}`);
    }

    return parts.length > 0 ? parts.join(' • ') : 'No context';
}
