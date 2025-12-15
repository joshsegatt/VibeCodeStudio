import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { ErrorHandler } from '../utils/errorHandler';

export interface GitChange {
    file: string;
    status: 'modified' | 'added' | 'deleted' | 'untracked';
}

export interface GitCommit {
    hash: string;
    message: string;
    author: string;
    date: string;
}

export interface GitStatus {
    branch: string;
    changes: GitChange[];
}

export interface GitStore {
    currentBranch: string | null;
    changes: GitChange[];
    commits: GitCommit[];
    isInitialized: boolean;

    // Actions
    initRepo: (path: string) => Promise<void>;
    getStatus: (path: string) => Promise<void>;
    stageFile: (path: string, file: string) => Promise<void>;
    stageAll: (path: string) => Promise<void>;
    commit: (path: string, message: string) => Promise<void>;
    push: (path: string, remote: string, branch: string) => Promise<void>;
    pull: (path: string) => Promise<void>;
    getBranches: (path: string) => Promise<string[]>;
    checkout: (path: string, branch: string) => Promise<void>;
    getDiff: (path: string, file?: string) => Promise<string>;
    getHistory: (path: string, limit: number) => Promise<void>;
}

export const useGitStore = create<GitStore>((set, get) => ({
    currentBranch: null,
    changes: [],
    commits: [],
    isInitialized: false,

    initRepo: async (path: string) => {
        try {
            await invoke('git_init', { path });
            set({ isInitialized: true });
            await get().getStatus(path);
            ErrorHandler.success('Git repository initialized');
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to initialize repository');
            throw error;
        }
    },

    getStatus: async (path: string) => {
        try {
            const status = await invoke<GitStatus>('git_status', { path });
            set({
                currentBranch: status.branch,
                changes: status.changes as GitChange[],
                isInitialized: true
            });
        } catch (error) {
            console.error('Failed to get status:', error);
            set({ isInitialized: false });
        }
    },

    stageFile: async (path: string, file: string) => {
        try {
            await invoke('git_add', { path, files: [file] });
            await get().getStatus(path);
            ErrorHandler.success(`Staged ${file.split('/').pop()}`);
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to stage file');
            throw error;
        }
    },

    stageAll: async (path: string) => {
        try {
            const files = get().changes.map(c => c.file);
            await invoke('git_add', { path, files });
            await get().getStatus(path);
            ErrorHandler.success(`Staged ${files.length} file(s)`);
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to stage all');
            throw error;
        }
    },

    commit: async (path: string, message: string) => {
        try {
            await invoke<string>('git_commit', { path, message });
            await get().getStatus(path);
            await get().getHistory(path, 10);
            ErrorHandler.success(`Committed: ${message.substring(0, 50)}`);
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to commit');
            throw error;
        }
    },

    push: async (path: string, remote: string = 'origin', branch?: string) => {
        try {
            const branchName = branch || get().currentBranch || 'main';
            await invoke('git_push', { path, remote, branch: branchName });
            ErrorHandler.success(`Pushed to ${remote}/${branchName}`);
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to push');
            throw error;
        }
    },

    pull: async (path: string) => {
        try {
            await invoke('git_pull', { path });
            await get().getStatus(path);
            ErrorHandler.success('Pulled latest changes');
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to pull');
            throw error;
        }
    },

    getBranches: async (path: string) => {
        try {
            const branches = await invoke<string[]>('git_branch_list', { path });
            return branches;
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to get branches');
            return [];
        }
    },

    checkout: async (path: string, branch: string) => {
        try {
            await invoke('git_checkout', { path, branch });
            await get().getStatus(path);
            ErrorHandler.success(`Switched to ${branch}`);
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to checkout');
            throw error;
        }
    },

    getDiff: async (path: string, file?: string) => {
        try {
            const diff = await invoke<string>('git_diff', { path, file: file || '' });
            return diff;
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to get diff');
            return '';
        }
    },

    getHistory: async (path: string, limit: number = 10) => {
        try {
            const commits = await invoke<GitCommit[]>('git_commit_history', { path, limit });
            set({ commits });
        } catch (error) {
            console.error('Failed to get history:', error);
        }
    },
}));
