import { useEffect, useState, useRef } from 'react';
import { completionService } from '../../services/aiCompletion';

interface InlineCompletionProps {
    editor: any;
    position: { line: number; column: number };
    suggestion: string;
    onAccept: () => void;
    onDismiss: () => void;
}

export default function InlineCompletion({
    editor,
    position,
    suggestion,
    onAccept,
    onDismiss
}: InlineCompletionProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab' && visible) {
                e.preventDefault();
                onAccept();
                setVisible(false);
            } else if (e.key === 'Escape') {
                onDismiss();
                setVisible(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [visible, onAccept, onDismiss]);

    if (!visible || !suggestion) return null;

    return (
        <div className="inline-completion-widget">
            <span className="text-zinc-500 italic font-mono text-sm">
                {suggestion}
            </span>
            <div className="inline-completion-hint text-xs text-zinc-600 ml-2">
                Tab to accept • Esc to dismiss
            </div>
        </div>
    );
}

// Monaco integration hook
export function useAICompletion(editor: any, language: string) {
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [position, setPosition] = useState<any>(null);

    useEffect(() => {
        if (!editor) return;

        const disposable = editor.onDidChangeModelContent((e: any) => {
            const model = editor.getModel();
            if (!model) return;

            const pos = editor.getPosition();
            const code = model.getValue();
            const cursorOffset = model.getOffsetAt(pos);

            // Debounced AI completion request
            completionService.debounce(async () => {
                const result = await completionService.getCompletion({
                    code,
                    cursorPosition: cursorOffset,
                    language
                });

                if (result && result.confidence > 0.7) {
                    setSuggestion(result.suggestion);
                    setPosition(pos);
                } else {
                    setSuggestion(null);
                }
            });
        });

        return () => disposable.dispose();
    }, [editor, language]);

    const acceptSuggestion = () => {
        if (!editor || !suggestion) return;

        const pos = editor.getPosition();
        editor.executeEdits('ai-completion', [{
            range: new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column),
            text: suggestion
        }]);

        setSuggestion(null);
    };

    const dismissSuggestion = () => {
        setSuggestion(null);
    };

    return {
        suggestion,
        position,
        acceptSuggestion,
        dismissSuggestion
    };
}
