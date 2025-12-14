import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import MonacoWrapper from './MonacoWrapper';
import Breadcrumbs from '../components/Breadcrumbs';
import { useProjectStore } from '../../stores/projectStore';

interface Tab {
    path: string;
    name: string;
    content: string;
}

export default function MultiTabEditor() {
    const { openFiles, activeFile, openFile, closeTab: closeTabStore, markFileDirty } = useProjectStore();
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [activeTabPath, setActiveTabPath] = useState<string | null>(null);

    useEffect(() => {
        // Sync tabs with openFiles from store
        const loadTabs = async () => {
            const newTabs: Tab[] = [];
            for (const fileObj of openFiles) {
                try {
                    const filePath = typeof fileObj === 'string' ? fileObj : fileObj.path;
                    const content = await openFile(filePath);
                    const name = filePath.split('/').pop() || filePath;
                    newTabs.push({ path: filePath, name, content });
                } catch (error) {
                    console.error('Failed to load file:', error);
                }
            }
            setTabs(newTabs);
        };
        loadTabs();
    }, [openFiles]);

    useEffect(() => {
        if (activeFile) {
            setActiveTabPath(activeFile);
        }
    }, [activeFile]);

    const closeTab = async (path: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await closeTabStore(path);
    };

    const activeTab = tabs.find(tab => tab.path === activeTabPath);

    return (
        <div className="h-full flex flex-col">
            {/* Tabs Bar */}
            {tabs.length > 0 && (
                <div className="h-10 bg-[#0A0A0A] border-b border-studio-border flex items-center overflow-x-auto">
                    {tabs.map(tab => (
                        <div
                            key={tab.path}
                            onClick={() => setActiveTabPath(tab.path)}
                            className={`group flex items-center gap-2 px-4 h-full border-r border-studio-border cursor-pointer transition-colors ${activeTabPath === tab.path
                                ? 'bg-studio-bg text-white'
                                : 'bg-[#0A0A0A] text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="text-sm font-medium truncate max-w-[150px] flex items-center gap-1">
                                {openFiles.find(f => (typeof f === 'string' ? f : f.path) === tab.path && typeof f !== 'string')?.isDirty && (
                                    <span className="text-orange-400">●</span>
                                )}
                                {tab.name}
                            </span>
                            <button
                                onClick={(e) => closeTab(tab.path, e)}
                                className="opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded p-0.5 transition-opacity"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Breadcrumbs */}
            {activeTab && (
                <Breadcrumbs
                    filePath={activeTab.path}
                    onNavigate={(path) => {
                        // Could implement folder navigation here
                        console.log('Navigate to:', path);
                    }}
                />
            )}

            {/* Editor */}
            <div className="flex-1">
                {activeTab ? (
                    <MonacoWrapper
                        initialValue={activeTab.content}
                        filePath={activeTab.path}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-zinc-500">
                        <div className="text-center">
                            <p className="text-lg mb-2">No file open</p>
                            <p className="text-sm">Open a file from the explorer or generate code</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
