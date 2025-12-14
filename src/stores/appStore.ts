import { create } from 'zustand';
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { persist, createJSONStorage } from 'zustand/middleware';
import { ModelId } from "../config/models";

export type AppPhase = 'onboarding' | 'menu' | 'studio';

export interface APIKeys {
    openai?: string;
    anthropic?: string;
    gemini?: string;
    openrouter?: string;
}

interface AppStore {
    // State Machine
    appPhase: AppPhase;

    // Core Data
    currentModel: string;
    systemPrompt: string;
    provider: string;
    apiKeys: APIKeys;

    // UI State
    isDownloading: boolean;
    downloadProgress: number; // 0 to 100
    downloadStatus: string;
    generatedCode: string;
    currentResponse: string; // Current AI response being streamed

    // Actions
    setPhase: (phase: AppPhase) => void;
    setSystemPrompt: (prompt: string) => void;
    setCurrentModel: (model: string) => void;
    setProvider: (provider: string) => void;
    setAPIKey: (provider: keyof APIKeys, key: string) => Promise<void>;
    getAPIKey: (provider: keyof APIKeys) => Promise<string | undefined>;
    migrateAPIKeys: () => Promise<void>;
    setDownloading: (isDownloading: boolean) => void;
    setProgress: (progress: number) => void;
    setStatus: (status: string) => void;
    setCode: (code: string) => void;
    setCurrentResponse: (response: string) => void;
    // Streaming Actions
    generateCode: (prompt: string, onResponse: (response: string) => void) => Promise<void>;
    generateProject: (prompt: string, onResponse: (response: string) => void) => Promise<string>;
}

export const useAppStore = create<AppStore>()(
    persist(
        (set, get) => ({
            // Initial State
            appPhase: 'onboarding',
            currentModel: 'qwen2.5-coder:7b',
            systemPrompt: "You are a helpful AI coding assistant. You can chat naturally and help users create code in ANY programming language. When users ask you to create something, provide the complete working code directly in markdown code blocks. Do NOT just give instructions - write the actual code.",
            provider: 'Ollama',
            apiKeys: {},
            isDownloading: false,
            downloadProgress: 0,
            downloadStatus: "",
            generatedCode: "",
            currentResponse: "",

            // Actions
            setPhase: (phase) => set({ appPhase: phase }),
            setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
            setCurrentModel: (model) => set({ currentModel: model }),
            setProvider: (provider) => set({ provider }),

            setAPIKey: async (provider, key) => {
                try {
                    await invoke('store_api_key', { provider, key });
                    // Also update in-memory cache
                    set((state) => ({
                        apiKeys: { ...state.apiKeys, [provider]: key }
                    }));
                } catch (error) {
                    console.error('Failed to store API key:', error);
                    throw error;
                }
            },

            getAPIKey: async (provider) => {
                try {
                    const key = await invoke<string>('get_api_key', { provider });
                    return key || undefined;
                } catch (error) {
                    console.error('Failed to get API key:', error);
                    return undefined;
                }
            },

            migrateAPIKeys: async () => {
                try {
                    // Check for old localStorage keys
                    const oldKeysStr = localStorage.getItem('vibe-studio-storage');
                    if (!oldKeysStr) return;

                    const oldData = JSON.parse(oldKeysStr);
                    const oldKeys = oldData?.state?.apiKeys;

                    if (oldKeys && typeof oldKeys === 'object') {
                        // Migrate each key to secure storage
                        for (const [provider, key] of Object.entries(oldKeys)) {
                            if (key && typeof key === 'string') {
                                await invoke('store_api_key', { provider, key });
                            }
                        }

                        // Clear old keys from localStorage
                        const newData = { ...oldData };
                        if (newData.state) {
                            newData.state.apiKeys = {};
                        }
                        localStorage.setItem('vibe-studio-storage', JSON.stringify(newData));
                    }
                } catch (error) {
                    console.error('Failed to migrate API keys:', error);
                }
            },
            setDownloading: (isDownloading) => set({ isDownloading }),
            setProgress: (progress) => set({ downloadProgress: progress }),
            setStatus: (status) => set({ downloadStatus: status }),
            setCode: (code) => set({ generatedCode: code }),
            setCurrentResponse: (response) => set({ currentResponse: response }),

            generateCode: async (prompt: string, onResponse: (response: string) => void) => {
                const state = get();
                if (!state.currentModel) return;

                // Reset current response
                set({ currentResponse: "" });

                // Prepare Listener
                let fullResponse = "";
                const unlistenToken = await listen('generate-token', (event: any) => {
                    const payload = event.payload as { token: string };
                    fullResponse += payload.token;

                    // Update current response in real-time
                    set({ currentResponse: fullResponse });
                    onResponse(fullResponse);

                    // Try to extract code block from response
                    const codeBlockMatch = fullResponse.match(/```(?:tsx|jsx|html|typescript|javascript|python|rust|go)?\n([\s\S]*?)```/);

                    if (codeBlockMatch && codeBlockMatch[1]) {
                        // Found a complete code block
                        set({ generatedCode: codeBlockMatch[1].trim() });
                    } else {
                        // Check if code block has started but not finished
                        const startMatch = fullResponse.match(/```(?:tsx|jsx|html|typescript|javascript|python|rust|go)?\n([\s\S]*?)$/);
                        if (startMatch && startMatch[1]) {
                            // Streaming code block content
                            set({ generatedCode: startMatch[1].trim() });
                        }
                    }
                });

                const unlistenFinish = await listen('generate-finished', () => {
                    unlistenToken();
                    unlistenFinish();
                });

                try {
                    await invoke('generate_code', {
                        model: state.currentModel,
                        prompt: prompt,
                        provider: state.provider,
                        history: ""
                    });
                } catch (e) {
                    console.error("Generation failed", e);
                    unlistenToken();
                    unlistenFinish();
                    throw e;
                }
            },

            // New: Generate entire project with multiple files
            generateProject: async (prompt: string, onResponse: (response: string) => void): Promise<string> => {
                const state = get();
                if (!state.currentModel) throw new Error("No model selected");

                // Enhanced prompt for project generation
                const projectPrompt = `${prompt}

IMPORTANT: Generate a complete project structure. For each file:
1. Start with a comment indicating the file path (e.g., // src/App.tsx)
2. Then provide the complete code in a code block

Example format:
// src/App.tsx
\`\`\`tsx
export default function App() {
  return <div>Hello</div>
}
\`\`\`

// src/main.tsx
\`\`\`tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
\`\`\`

Generate ALL necessary files for a working project.`;

                let fullResponse = "";

                const unlistenToken = await listen('generate-token', (event: any) => {
                    const payload = event.payload as { token: string };
                    fullResponse += payload.token;
                    set({ currentResponse: fullResponse });
                    onResponse(fullResponse);
                });

                const unlistenFinish = await listen('generate-finished', () => {
                    unlistenToken();
                    unlistenFinish();
                });

                try {
                    await invoke('generate_code', {
                        model: state.currentModel,
                        prompt: projectPrompt,
                        provider: state.provider,
                        history: ""
                    });

                    return fullResponse;
                } catch (e) {
                    console.error("Project generation failed", e);
                    unlistenToken();
                    unlistenFinish();
                    throw e;
                }
            },
        }),
        {
            name: 'vibe-studio-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                appPhase: state.appPhase,
                currentModel: state.currentModel,
                systemPrompt: state.systemPrompt,
                provider: state.provider,
            }),
        }
    )
);
