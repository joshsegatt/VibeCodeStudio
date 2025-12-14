import { GitBranch, Plus, RefreshCw, Upload, Download, Check, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGitStore } from '../../stores/gitStore';
import { useProjectStore } from '../../stores/projectStore';

export default function GitPanel() {
    const { currentProjectPath } = useProjectStore();
    const {
        isInitialized,
        currentBranch,
        changes,
        initRepo,
        getStatus,
        stageFile,
        stageAll,
        commit,
        push,
        pull
    } = useGitStore();

    const [stagedFiles, setStagedFiles] = useState<string[]>([]);
    const [commitMessage, setCommitMessage] = useState('');

    // Load Git status when project changes
    useEffect(() => {
        if (currentProjectPath) {
            getStatus(currentProjectPath);
        }
    }, [currentProjectPath, getStatus]);

    const handleInitRepo = async () => {
        if (!currentProjectPath) return;
        try {
            await initRepo(currentProjectPath);
        } catch (error) {
            console.error('Failed to init repo:', error);
        }
    };

    const handleStageFile = async (file: string) => {
        if (!currentProjectPath) return;

        if (stagedFiles.includes(file)) {
            setStagedFiles(stagedFiles.filter(f => f !== file));
        } else {
            try {
                await stageFile(currentProjectPath, file);
                setStagedFiles([...stagedFiles, file]);
            } catch (error) {
                console.error('Failed to stage file:', error);
            }
        }
    };

    const handleStageAll = async () => {
        if (!currentProjectPath) return;
        try {
            await stageAll(currentProjectPath);
            setStagedFiles(changes.map(c => c.file));
        } catch (error) {
            console.error('Failed to stage all:', error);
        }
    };

    const handleCommit = async () => {
        if (!commitMessage.trim() || stagedFiles.length === 0 || !currentProjectPath) return;

        try {
            await commit(currentProjectPath, commitMessage);
            setCommitMessage('');
            setStagedFiles([]);
        } catch (error) {
            console.error('Failed to commit:', error);
        }
    };

    const handlePush = async () => {
        if (!currentProjectPath || !currentBranch) return;
        try {
            await push(currentProjectPath, 'origin', currentBranch);
        } catch (error) {
            console.error('Failed to push:', error);
        }
    };

    const handlePull = async () => {
        if (!currentProjectPath) return;
        try {
            await pull(currentProjectPath);
        } catch (error) {
            console.error('Failed to pull:', error);
        }
    };

    const handleRefresh = async () => {
        if (!currentProjectPath) return;
        try {
            await getStatus(currentProjectPath);
        } catch (error) {
            console.error('Failed to refresh:', error);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'modified': return <span className="text-yellow-500">M</span>;
            case 'added': return <span className="text-green-500">A</span>;
            case 'deleted': return <span className="text-red-500">D</span>;
            case 'untracked': return <span className="text-blue-500">U</span>;
            default: return <span className="text-zinc-500">?</span>;
        }
    };

    if (!isInitialized) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#1E1E1E] text-white p-6">
                <GitBranch size={64} className="mb-6 opacity-30" />
                <h3 className="text-lg font-semibold mb-2">No Git Repository</h3>
                <p className="text-sm text-zinc-400 text-center mb-6">
                    Initialize a Git repository to start tracking changes
                </p>
                <button
                    onClick={handleInitRepo}
                    disabled={!currentProjectPath}
                    className="flex items-center gap-2 px-4 py-2 bg-[#007ACC] hover:bg-[#005A9E] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus size={16} />
                    <span>Initialize Repository</span>
                </button>
                {!currentProjectPath && (
                    <p className="mt-4 text-xs text-zinc-500">Open a project first</p>
                )}
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#1E1E1E] text-white">
            {/* Header */}
            <div className="h-9 px-4 flex items-center justify-between border-b border-[#2D2D2D]">
                <span className="text-xs font-semibold uppercase tracking-wide">Source Control</span>
                <div className="flex gap-1">
                    <button
                        onClick={handleRefresh}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={14} />
                    </button>
                    <button
                        onClick={handlePull}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Pull"
                    >
                        <Download size={14} />
                    </button>
                    <button
                        onClick={handlePush}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Push"
                    >
                        <Upload size={14} />
                    </button>
                </div>
            </div>

            {/* Branch info */}
            <div className="px-4 py-2 border-b border-[#2D2D2D] flex items-center gap-2">
                <GitBranch size={14} className="text-zinc-400" />
                <span className="text-sm">{currentBranch || 'main'}</span>
            </div>

            {/* Commit message */}
            <div className="p-3 border-b border-[#2D2D2D]">
                <textarea
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Message (Ctrl+Enter to commit)"
                    className="w-full bg-[#3C3C3C] border border-[#3C3C3C] rounded px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#007ACC]"
                    rows={3}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                            handleCommit();
                        }
                    }}
                />
                <div className="mt-2 flex gap-2">
                    <button
                        onClick={handleCommit}
                        disabled={!commitMessage.trim() || stagedFiles.length === 0}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#007ACC] hover:bg-[#005A9E] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Check size={16} />
                        <span>Commit ({stagedFiles.length})</span>
                    </button>
                    <button
                        onClick={handleStageAll}
                        disabled={changes.length === 0}
                        className="px-4 py-2 bg-[#3C3C3C] hover:bg-[#4C4C4C] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        Stage All
                    </button>
                </div>
            </div>

            {/* Changes list */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                    <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2 px-2">
                        Changes ({changes.length})
                    </div>
                    <div className="space-y-0.5">
                        {changes.map((change, idx) => {
                            const isStaged = stagedFiles.includes(change.file);
                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleStageFile(change.file)}
                                    className="group flex items-center gap-2 px-2 py-1.5 hover:bg-[#2D2D2D] rounded cursor-pointer transition-colors"
                                >
                                    <div className="w-4 h-4 flex items-center justify-center">
                                        {isStaged ? (
                                            <Check size={12} className="text-green-500" />
                                        ) : (
                                            <div className="w-3 h-3 border border-zinc-600 rounded group-hover:border-zinc-400" />
                                        )}
                                    </div>
                                    <FileText size={14} className="text-zinc-500" />
                                    <span className="flex-1 text-sm truncate">{change.file}</span>
                                    <div className="w-4 text-xs font-mono">
                                        {getStatusIcon(change.status)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
