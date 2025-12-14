import { useState } from 'react';
import { useGitStore } from '../../stores/gitStore';

export default function DiffViewer() {
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [diffContent, setDiffContent] = useState<string>('');

    const loadDiff = async (file: string) => {
        const { getDiff } = useGitStore.getState();
        const diff = await getDiff(file);
        setDiffContent(diff);
        setSelectedFile(file);
    };

    return (
        <div className="h-full flex flex-col bg-[#1E1E1E]">
            <div className="h-9 px-4 flex items-center border-b border-[#2D2D2D]">
                <span className="text-xs font-semibold uppercase text-white">Diff Viewer</span>
            </div>

            <div className="flex-1 overflow-auto p-4">
                {diffContent ? (
                    <pre className="text-sm text-zinc-300 font-mono">
                        {diffContent}
                    </pre>
                ) : (
                    <div className="text-sm text-zinc-500 italic">
                        Select a file to view diff
                    </div>
                )}
            </div>
        </div>
    );
}
