import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus } from 'lucide-react';
import { useProjectStore, FileNode } from '../../stores/projectStore';
import ContextMenu, { ContextMenuItem, ContextMenuIcons } from '../../ui/components/ContextMenu';
import FileIcon from '../../ui/components/FileIcon';
import ExplorerHeader from '../../ui/components/ExplorerHeader';
import { invoke } from '@tauri-apps/api/core';

export default function FileTree() {
    const { currentProjectPath, fileTree, loadFileTree, openFile, createProject } = useProjectStore();
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileNode } | null>(null);
    const [renaming, setRenaming] = useState<string | null>(null);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        if (currentProjectPath) {
            loadFileTree(currentProjectPath);
        }
    }, [currentProjectPath, loadFileTree]);

    const toggleFolder = (path: string) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(path)) {
            newExpanded.delete(path);
        } else {
            newExpanded.add(path);
        }
        setExpandedFolders(newExpanded);
    };

    const handleFileClick = async (path: string) => {
        try {
            await openFile(path);
        } catch (error) {
            console.error('Failed to open file:', error);
        }
    };

    const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, node });
    };

    const handleRename = async (node: FileNode) => {
        setRenaming(node.path);
        setNewName(node.name);
    };

    const confirmRename = async (oldPath: string) => {
        if (!newName.trim() || newName === oldPath.split(/[/\\]/).pop()) {
            setRenaming(null);
            return;
        }

        try {
            const directory = oldPath.substring(0, oldPath.lastIndexOf(/[/\\]/.exec(oldPath)?.[0] || '/'));
            const newPath = `${directory}/${newName}`;

            await invoke('rename_file', { oldPath, newPath });

            if (currentProjectPath) {
                await loadFileTree(currentProjectPath);
            }
        } catch (error) {
            console.error('Failed to rename:', error);
        } finally {
            setRenaming(null);
            setNewName('');
        }
    };

    const handleDelete = async (path: string) => {
        if (!confirm(`Are you sure you want to delete ${path.split(/[/\\]/).pop()}?`)) {
            return;
        }

        try {
            await invoke('delete_file', { path });

            if (currentProjectPath) {
                await loadFileTree(currentProjectPath);
            }
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const handleNewFile = async (parentPath: string) => {
        const fileName = prompt('Enter file name:');
        if (!fileName) return;

        try {
            const filePath = `${parentPath}/${fileName}`;
            await invoke('write_file', { path: filePath, content: '' });

            if (currentProjectPath) {
                await loadFileTree(currentProjectPath);
            }

            // Expand parent folder
            setExpandedFolders(prev => new Set(prev).add(parentPath));
        } catch (error) {
            console.error('Failed to create file:', error);
        }
    };

    const handleNewFolder = async (parentPath: string) => {
        const folderName = prompt('Enter folder name:');
        if (!folderName) return;

        try {
            const folderPath = `${parentPath}/${folderName}`;
            await invoke('create_directory', { path: folderPath });

            if (currentProjectPath) {
                await loadFileTree(currentProjectPath);
            }

            // Expand parent folder
            setExpandedFolders(prev => new Set(prev).add(parentPath));
        } catch (error) {
            console.error('Failed to create folder:', error);
        }
    };

    const copyPath = (path: string) => {
        navigator.clipboard.writeText(path);
    };

    const getContextMenuItems = (node: FileNode): ContextMenuItem[] => {
        const items: ContextMenuItem[] = [];

        if (node.is_directory) {
            items.push(
                { id: 'new-file', label: 'New File', icon: ContextMenuIcons.NewFile, action: () => handleNewFile(node.path) },
                { id: 'new-folder', label: 'New Folder', icon: ContextMenuIcons.NewFolder, action: () => handleNewFolder(node.path) },
                { id: 'sep1', label: '', icon: null, action: () => { }, separator: true },
            );
        }

        items.push(
            { id: 'rename', label: 'Rename', icon: ContextMenuIcons.Rename, action: () => handleRename(node) },
            { id: 'delete', label: 'Delete', icon: ContextMenuIcons.Delete, action: () => handleDelete(node.path) },
            { id: 'sep2', label: '', icon: null, action: () => { }, separator: true },
            { id: 'copy-path', label: 'Copy Path', icon: ContextMenuIcons.Copy, action: () => copyPath(node.path) },
        );

        return items;
    };

    const renderNode = (node: FileNode, depth: number = 0) => {
        const isExpanded = expandedFolders.has(node.path);
        const paddingLeft = `${depth * 12 + 8}px`;
        const isRenaming = renaming === node.path;

        if (node.is_directory) {
            return (
                <div key={node.path}>
                    <div
                        onClick={() => toggleFolder(node.path)}
                        onContextMenu={(e) => handleContextMenu(e, node)}
                        className="flex items-center gap-1 px-2 py-1 hover:bg-[#2D2D2D] cursor-pointer transition-colors group"
                        style={{ paddingLeft }}
                    >
                        {isExpanded ? (
                            <ChevronDown size={14} className="text-zinc-500" />
                        ) : (
                            <ChevronRight size={14} className="text-zinc-500" />
                        )}
                        {isExpanded ? (
                            <FolderOpen size={14} className="text-blue-400" />
                        ) : (
                            <Folder size={14} className="text-blue-400" />
                        )}
                        {isRenaming ? (
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onBlur={() => confirmRename(node.path)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') confirmRename(node.path);
                                    if (e.key === 'Escape') setRenaming(null);
                                }}
                                autoFocus
                                className="flex-1 bg-[#3C3C3C] text-white text-xs px-1 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <span className="text-xs text-zinc-300">{node.name}</span>
                        )}
                    </div>
                    {isExpanded && node.children && (
                        <div>
                            {node.children.map(child => renderNode(child, depth + 1))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div
                key={node.path}
                onClick={() => handleFileClick(node.path)}
                onContextMenu={(e) => handleContextMenu(e, node)}
                className="flex items-center gap-1 px-2 py-1 hover:bg-[#2D2D2D] cursor-pointer transition-colors group"
                style={{ paddingLeft }}
            >
                <FileIcon fileName={node.name} />
                {isRenaming ? (
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={() => confirmRename(node.path)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') confirmRename(node.path);
                            if (e.key === 'Escape') setRenaming(null);
                        }}
                        autoFocus
                        className="flex-1 bg-[#3C3C3C] text-white text-xs px-1 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span className="text-xs text-zinc-300">{node.name}</span>
                )}
            </div>
        );
    };

    // REMOVED OLD CONDITIONAL RENDER - ExplorerHeader now always shows

    return (
        <div className="h-full flex flex-col bg-[#1E1E1E] text-white overflow-hidden">
            {/* Always show header with Open Folder button */}
            <ExplorerHeader onNewProject={createProject} />

            <div className="flex-1 overflow-y-auto">
                {!currentProjectPath || fileTree.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <Folder size={48} className="text-zinc-600 mb-4" />
                        <h3 className="text-sm font-semibold text-zinc-400 mb-2">No Folder Open</h3>
                        <p className="text-xs text-zinc-600 mb-4 max-w-xs">
                            Open a folder to start working
                        </p>
                        <p className="text-xs text-zinc-500">
                            💡 Use the "Open Folder" button above
                        </p>
                    </div>
                ) : (
                    fileTree.map(node => renderNode(node))
                )}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    items={getContextMenuItems(contextMenu.node)}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    );
}
