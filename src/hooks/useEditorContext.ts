import { useEffect, useState, useCallback } from 'react';
import { useProjectStore } from '../stores/projectStore';

export interface EditorContext {
    currentFile: string | null;
    selectedText: string | null;
    cursorPosition: { line: number; column: number } | null;
    language: string | null;
    hasContext: boolean;
}

export function useEditorContext() {
    const { activeFile } = useProjectStore();
    const [context, setContext] = useState<EditorContext>({
        currentFile: null,
        selectedText: null,
        cursorPosition: null,
        language: null,
        hasContext: false
    });

    // Update current file when active file changes
    useEffect(() => {
        if (activeFile) {
            const extension = activeFile.split('.').pop() || '';
            const languageMap: Record<string, string> = {
                'ts': 'typescript',
                'tsx': 'typescriptreact',
                'js': 'javascript',
                'jsx': 'javascriptreact',
                'py': 'python',
                'rs': 'rust',
                'go': 'go',
                'java': 'java',
                'cpp': 'cpp',
                'c': 'c',
                'css': 'css',
                'html': 'html',
                'json': 'json',
                'md': 'markdown'
            };

            setContext(prev => ({
                ...prev,
                currentFile: activeFile,
                language: languageMap[extension] || extension,
                hasContext: true
            }));
        } else {
            setContext(prev => ({
                ...prev,
                currentFile: null,
                language: null,
                hasContext: !!prev.selectedText
            }));
        }
    }, [activeFile]);

    // Update selected text
    const updateSelection = useCallback((text: string | null) => {
        setContext(prev => ({
            ...prev,
            selectedText: text,
            hasContext: !!prev.currentFile || !!text
        }));
    }, []);

    // Update cursor position
    const updateCursorPosition = useCallback((line: number, column: number) => {
        setContext(prev => ({
            ...prev,
            cursorPosition: { line, column }
        }));
    }, []);

    // Clear all context
    const clearContext = useCallback(() => {
        setContext({
            currentFile: null,
            selectedText: null,
            cursorPosition: null,
            language: null,
            hasContext: false
        });
    }, []);

    return {
        ...context,
        updateSelection,
        updateCursorPosition,
        clearContext
    };
}
