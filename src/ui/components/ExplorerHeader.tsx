import { FolderOpen, GitBranch, Plus } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { useProjectStore } from '../../stores/projectStore';

interface ExplorerHeaderProps {
    onNewProject: () => void;
}

export default function ExplorerHeader({ onNewProject }: ExplorerHeaderProps) {
    const { setCurrentProjectPath, loadFileTree } = useProjectStore();

    console.log('🔍 ExplorerHeader rendering!'); // DEBUG

    const handleOpenFolder = async () => {
        try {
            const selected = await open({
                directory: true,
                multiple: false,
                title: 'Open Folder'
            });

            if (selected && typeof selected === 'string') {
                setCurrentProjectPath(selected);
                await loadFileTree(selected);
            }
        } catch (error) {
            console.error('Failed to open folder:', error);
        }
    };

    const handleGitClone = async () => {
        const url = prompt('Enter Git repository URL:');
        if (!url) return;

        const folderName = url.split('/').pop()?.replace('.git', '') || 'repo';

        try {
            const selected = await open({
                directory: true,
                multiple: false,
                title: 'Select destination folder'
            });

            if (selected && typeof selected === 'string') {
                // Clone using git command
                const { invoke } = await import('@tauri-apps/api/core');
                await invoke('execute_command', {
                    command: `git clone ${url}`,
                    cwd: selected
                });

                // Open the cloned folder
                const clonedPath = `${selected}/${folderName}`;
                setCurrentProjectPath(clonedPath);
                await loadFileTree(clonedPath);
            }
        } catch (error) {
            console.error('Failed to clone repository:', error);
            alert('Failed to clone repository. Make sure Git is installed.');
        }
    };

    return (
        <div className="px-3 py-2 border-b border-[#2D2D2D] bg-[#252526]">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Explorer</span>
            </div>

            {/* Action Buttons - More Visible */}
            <div className="flex flex-col gap-2">
                <button
                    onClick={handleOpenFolder}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors w-full"
                >
                    <FolderOpen size={16} />
                    <span>Open Folder</span>
                </button>

                <button
                    onClick={handleGitClone}
                    className="flex items-center gap-2 px-3 py-2 bg-[#3C3C3C] hover:bg-[#4C4C4C] rounded text-sm font-medium transition-colors w-full"
                >
                    <GitBranch size={16} />
                    <span>Clone Repository</span>
                </button>

                <button
                    onClick={onNewProject}
                    className="flex items-center gap-2 px-3 py-2 bg-[#3C3C3C] hover:bg-[#4C4C4C] rounded text-sm font-medium transition-colors w-full"
                >
                    <Plus size={16} />
                    <span>New Project</span>
                </button>
            </div>
        </div>
    );
}
