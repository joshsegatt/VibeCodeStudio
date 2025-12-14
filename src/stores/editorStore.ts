import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface EditorSettings {
    autoSave: boolean;
    autoSaveDelay: number; // milliseconds
    fontSize: number;
    tabSize: number;
    wordWrap: boolean;
    minimap: boolean;
    lineNumbers: boolean;
}

interface EditorStore extends EditorSettings {
    // Unsaved changes tracking
    unsavedFiles: Set<string>;
    lastSavedTime: Record<string, number>;

    // Actions
    setAutoSave: (enabled: boolean) => void;
    setAutoSaveDelay: (delay: number) => void;
    setFontSize: (size: number) => void;
    setTabSize: (size: number) => void;
    setWordWrap: (enabled: boolean) => void;
    setMinimap: (enabled: boolean) => void;
    setLineNumbers: (enabled: boolean) => void;

    // File tracking
    markFileAsUnsaved: (path: string) => void;
    markFileAsSaved: (path: string) => void;
    isFileUnsaved: (path: string) => boolean;
    getLastSavedTime: (path: string) => number | null;
}

export const useEditorStore = create<EditorStore>()(
    persist(
        (set, get) => ({
            // Default settings
            autoSave: true,
            autoSaveDelay: 1000, // 1 second
            fontSize: 14,
            tabSize: 2,
            wordWrap: false,
            minimap: true,
            lineNumbers: true,

            // Tracking
            unsavedFiles: new Set(),
            lastSavedTime: {},

            // Settings actions
            setAutoSave: (enabled) => set({ autoSave: enabled }),
            setAutoSaveDelay: (delay) => set({ autoSaveDelay: delay }),
            setFontSize: (size) => set({ fontSize: size }),
            setTabSize: (size) => set({ tabSize: size }),
            setWordWrap: (enabled) => set({ wordWrap: enabled }),
            setMinimap: (enabled) => set({ minimap: enabled }),
            setLineNumbers: (enabled) => set({ lineNumbers: enabled }),

            // File tracking actions
            markFileAsUnsaved: (path) => {
                const unsaved = new Set(get().unsavedFiles);
                unsaved.add(path);
                set({ unsavedFiles: unsaved });
            },

            markFileAsSaved: (path) => {
                const unsaved = new Set(get().unsavedFiles);
                unsaved.delete(path);
                const lastSaved = { ...get().lastSavedTime };
                lastSaved[path] = Date.now();
                set({ unsavedFiles: unsaved, lastSavedTime: lastSaved });
            },

            isFileUnsaved: (path) => {
                return get().unsavedFiles.has(path);
            },

            getLastSavedTime: (path) => {
                return get().lastSavedTime[path] || null;
            },
        }),
        {
            name: 'editor-settings',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                autoSave: state.autoSave,
                autoSaveDelay: state.autoSaveDelay,
                fontSize: state.fontSize,
                tabSize: state.tabSize,
                wordWrap: state.wordWrap,
                minimap: state.minimap,
                lineNumbers: state.lineNumbers,
            }),
        }
    )
);
