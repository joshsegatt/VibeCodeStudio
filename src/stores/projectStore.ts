import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export interface FileNode {
    name: string;
    path: string;
    is_directory: boolean;
    children?: FileNode[];
}

export interface FileEntry {
    path: string;
    content: string;
}

export interface OpenFile {
    path: string;
    isDirty: boolean;
}

export interface ProjectStore {
    currentProjectPath: string | null;
    fileTree: FileNode[];
    openFiles: OpenFile[];
    recentProjects: string[];
    activeFile: string | null;

    // Actions
    setProjectPath: (path: string) => void;
    setCurrentProjectPath: (path: string | null) => void;
    createProject: () => Promise<void>;
    loadFileTree: (path: string) => Promise<void>;
    openFile: (path: string) => Promise<string>;
    saveFile: (path: string, content: string) => Promise<void>;
    closeTab: (path: string, force?: boolean) => Promise<boolean>;
    markFileDirty: (path: string, isDirty: boolean) => void;
    createMultipleFiles: (files: FileEntry[]) => Promise<void>;
    openFileInTab: (path: string, content: string) => void;
    addRecentProject: (path: string) => void;
    clearRecentProjects: () => void;
}

// Load recent projects from localStorage
const loadRecentProjects = (): string[] => {
    try {
        const stored = localStorage.getItem('vibe-recent-projects');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

// Save recent projects to localStorage
const saveRecentProjects = (projects: string[]) => {
    try {
        localStorage.setItem('vibe-recent-projects', JSON.stringify(projects));
    } catch (error) {
        console.error('Failed to save recent projects:', error);
    }
};

export const useProjectStore = create<ProjectStore>((set, get) => ({
    currentProjectPath: null,
    fileTree: [],
    openFiles: [],
    recentProjects: loadRecentProjects(),
    activeFile: null,

    setProjectPath: (path) => set({ currentProjectPath: path }),
    setCurrentProjectPath: (path) => set({ currentProjectPath: path }),

    addRecentProject: (path) => set((state) => {
        // Remove if already exists
        const filtered = state.recentProjects.filter(p => p !== path);
        // Add to beginning
        const updated = [path, ...filtered].slice(0, 10); // Keep max 10
        saveRecentProjects(updated);
        return { recentProjects: updated };
    }),

    clearRecentProjects: () => set(() => {
        saveRecentProjects([]);
        return { recentProjects: [] };
    }), // Alias

    openFileInTab: (path, content) => {
        set((state) => {
            const fileExists = state.openFiles.some(f => f.path === path);
            return {
                openFiles: fileExists
                    ? state.openFiles
                    : [...state.openFiles, { path, isDirty: false }],
                activeFile: path
            };
        });
    },

    markFileDirty: (path, isDirty) => {
        set((state) => ({
            openFiles: state.openFiles.map(f =>
                f.path === path ? { ...f, isDirty } : f
            )
        }));
    },

    closeTab: async (path, force = false) => {
        const state = get();
        const file = state.openFiles.find(f => f.path === path);

        // Check if file has unsaved changes
        if (!force && file?.isDirty) {
            const confirmed = confirm(
                `${path.split('/').pop()} has unsaved changes. Close anyway?`
            );

            if (!confirmed) {
                return false;
            }
        }

        // Remove from open files
        set((state) => {
            const newOpenFiles = state.openFiles.filter(f => f.path !== path);
            const newActiveFile = state.activeFile === path
                ? (newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1].path : null)
                : state.activeFile;

            return {
                openFiles: newOpenFiles,
                activeFile: newActiveFile
            };
        });

        return true;
    },

    createProject: async () => {
        try {
            // Ask for project name
            const projectName = prompt('Enter project name:');
            if (!projectName) return;

            // Let user choose where to create the project
            const { open } = await import('@tauri-apps/plugin-dialog');
            const selectedFolder = await open({
                directory: true,
                multiple: false,
                title: 'Select folder to create project in'
            });

            if (!selectedFolder || typeof selectedFolder !== 'string') {
                return;
            }

            // Create project folder
            const projectPath = await invoke<string>('create_project_folder', {
                path: selectedFolder,
                name: projectName
            });

            set({ currentProjectPath: projectPath });
            await get().loadFileTree(projectPath);
        } catch (error) {
            console.error('Failed to create project:', error);
        }
    },

    loadFileTree: async (path: string) => {
        try {
            const tree = await invoke<FileNode[]>('list_directory', { path });
            set({ fileTree: tree });
        } catch (error) {
            console.error('Failed to load file tree:', error);
        }
    },

    openFile: async (path: string) => {
        try {
            const content = await invoke<string>('read_file', { path });
            set((state) => {
                const fileExists = state.openFiles.some(f => f.path === path);
                return {
                    openFiles: fileExists
                        ? state.openFiles
                        : [...state.openFiles, { path, isDirty: false }],
                    activeFile: path
                };
            });
            return content;
        } catch (error) {
            console.error('Failed to open file:', error);
            throw error;
        }
    },

    saveFile: async (path: string, content: string) => {
        const { ErrorHandler } = await import('../utils/errorHandler');

        try {
            await invoke('write_file', { path, content });

            // Mark file as not dirty after successful save
            set((state) => ({
                openFiles: state.openFiles.map(f =>
                    f.path === path ? { ...f, isDirty: false } : f
                )
            }));

            ErrorHandler.success(`Saved ${path.split('/').pop()}`);
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to save file');
            throw error;
        }
    },

    createMultipleFiles: async (files: FileEntry[]) => {
        try {
            await invoke('create_multiple_files', { files });

            // Reload file tree
            const projectPath = get().currentProjectPath;
            if (projectPath) {
                await get().loadFileTree(projectPath);
            }
        } catch (error) {
            console.error('Failed to create files:', error);
            throw error;
        }
    }
}));
