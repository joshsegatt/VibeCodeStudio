import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useEditorStore } from '../stores/editorStore';

interface UseAutoSaveProps {
    filePath: string;
    content: string;
    enabled?: boolean;
}

export function useAutoSave({ filePath, content, enabled = true }: UseAutoSaveProps) {
    const { autoSave, autoSaveDelay, markFileAsUnsaved, markFileAsSaved } = useEditorStore();
    const timeoutRef = useRef<NodeJS.Timeout>();
    const previousContentRef = useRef<string>(content);
    const isSavingRef = useRef(false);

    useEffect(() => {
        // Don't auto-save if disabled globally or locally
        if (!autoSave || !enabled || !filePath) {
            return;
        }

        // Check if content actually changed
        if (content === previousContentRef.current) {
            return;
        }

        // Mark as unsaved
        markFileAsUnsaved(filePath);

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout for auto-save
        timeoutRef.current = setTimeout(async () => {
            if (isSavingRef.current) return;

            try {
                isSavingRef.current = true;
                await invoke('write_file', { path: filePath, content });
                markFileAsSaved(filePath);
                previousContentRef.current = content;
                console.log(`✅ Auto-saved: ${filePath}`);
            } catch (error) {
                console.error('Auto-save failed:', error);
            } finally {
                isSavingRef.current = false;
            }
        }, autoSaveDelay);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [content, filePath, autoSave, autoSaveDelay, enabled, markFileAsUnsaved, markFileAsSaved]);

    // Manual save function
    const saveNow = async () => {
        if (!filePath || isSavingRef.current) return;

        try {
            isSavingRef.current = true;
            await invoke('write_file', { path: filePath, content });
            markFileAsSaved(filePath);
            previousContentRef.current = content;
            console.log(`💾 Manually saved: ${filePath}`);
        } catch (error) {
            console.error('Save failed:', error);
            throw error;
        } finally {
            isSavingRef.current = false;
        }
    };

    return { saveNow };
}
