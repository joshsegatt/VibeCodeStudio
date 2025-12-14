import { useState } from 'react';
import { FolderOpen, Upload } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';

interface DragDropZoneProps {
    onFolderDrop: (path: string) => void;
}

export default function DragDropZone({ onFolderDrop }: DragDropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const { currentProjectPath } = useProjectStore();

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        // Get dropped files/folders
        const items = Array.from(e.dataTransfer.items);

        for (const item of items) {
            if (item.kind === 'file') {
                const entry = item.webkitGetAsEntry?.();

                if (entry?.isDirectory) {
                    // Get the full path from the entry
                    // Note: In Tauri, we need to use the file system API
                    const file = item.getAsFile();
                    if (file) {
                        // @ts-ignore - path property exists in Tauri
                        const folderPath = file.path;
                        if (folderPath) {
                            onFolderDrop(folderPath);
                            return;
                        }
                    }
                }
            }
        }

        // Fallback: show message if drag & drop didn't work
        alert('Drag & drop not fully supported yet. Please use "Open Folder" button.');
    };

    // Don't show if project is already open
    if (currentProjectPath) {
        return null;
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`absolute inset-0 z-50 flex items-center justify-center transition-all ${isDragging
                    ? 'bg-blue-500/20 backdrop-blur-sm'
                    : 'pointer-events-none'
                }`}
        >
            {isDragging && (
                <div className="bg-[#252526] border-2 border-blue-500 border-dashed rounded-lg p-12 text-center">
                    <Upload size={64} className="mx-auto mb-4 text-blue-400" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        Drop Folder Here
                    </h3>
                    <p className="text-sm text-zinc-400">
                        Release to open folder in Vibe Studio
                    </p>
                </div>
            )}
        </div>
    );
}
