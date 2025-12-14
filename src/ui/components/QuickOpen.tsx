import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, FileText } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import FileIcon from './FileIcon';

interface QuickOpenProps {
    onClose: () => void;
}

interface FileMatch {
    path: string;
    name: string;
    score: number;
    isRecent?: boolean;
}

export default function QuickOpen({ onClose }: QuickOpenProps) {
    const { fileTree, openFile, currentProjectPath } = useProjectStore();
    const [searchText, setSearchText] = useState('');
    const [matches, setMatches] = useState<FileMatch[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentFiles, setRecentFiles] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load recent files from localStorage
    useEffect(() => {
        const recent = localStorage.getItem('recentFiles');
        if (recent) {
            setRecentFiles(JSON.parse(recent));
        }
    }, []);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Fuzzy search algorithm
    const fuzzyMatch = (pattern: string, str: string): number => {
        pattern = pattern.toLowerCase();
        str = str.toLowerCase();

        let patternIdx = 0;
        let score = 0;
        let consecutiveMatches = 0;

        for (let i = 0; i < str.length; i++) {
            if (pattern[patternIdx] === str[i]) {
                score += 1 + consecutiveMatches;
                consecutiveMatches++;
                patternIdx++;

                if (patternIdx === pattern.length) {
                    return score;
                }
            } else {
                consecutiveMatches = 0;
            }
        }

        return patternIdx === pattern.length ? score : 0;
    };

    // Flatten file tree
    const getAllFiles = (nodes: any[], parentPath = ''): string[] => {
        let files: string[] = [];

        for (const node of nodes) {
            const fullPath = parentPath ? `${parentPath}/${node.name}` : node.name;

            if (node.is_directory && node.children) {
                files = files.concat(getAllFiles(node.children, fullPath));
            } else if (!node.is_directory) {
                files.push(node.path);
            }
        }

        return files;
    };

    // Search files
    useEffect(() => {
        if (!searchText.trim()) {
            // Show recent files when no search
            const recentMatches: FileMatch[] = recentFiles.slice(0, 5).map(path => ({
                path,
                name: path.split(/[/\\]/).pop() || path,
                score: 100,
                isRecent: true
            }));
            setMatches(recentMatches);
            setSelectedIndex(0);
            return;
        }

        const allFiles = getAllFiles(fileTree);
        const results: FileMatch[] = [];

        for (const filePath of allFiles) {
            const fileName = filePath.split(/[/\\]/).pop() || filePath;
            const score = fuzzyMatch(searchText, fileName);

            if (score > 0) {
                results.push({
                    path: filePath,
                    name: fileName,
                    score,
                    isRecent: recentFiles.includes(filePath)
                });
            }
        }

        // Sort by score (descending), recent files first
        results.sort((a, b) => {
            if (a.isRecent && !b.isRecent) return -1;
            if (!a.isRecent && b.isRecent) return 1;
            return b.score - a.score;
        });

        setMatches(results.slice(0, 10)); // Top 10 results
        setSelectedIndex(0);
    }, [searchText, fileTree, recentFiles]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < matches.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : matches.length - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (matches[selectedIndex]) {
                handleSelectFile(matches[selectedIndex].path);
            }
        }
    };

    const handleSelectFile = async (filePath: string) => {
        try {
            await openFile(filePath);

            // Add to recent files
            const newRecent = [filePath, ...recentFiles.filter(f => f !== filePath)].slice(0, 10);
            setRecentFiles(newRecent);
            localStorage.setItem('recentFiles', JSON.stringify(newRecent));

            onClose();
        } catch (error) {
            console.error('Failed to open file:', error);
        }
    };

    const getRelativePath = (fullPath: string): string => {
        if (!currentProjectPath) return fullPath;
        return fullPath.replace(currentProjectPath + '/', '');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50">
            <div className="w-full max-w-2xl bg-[#252526] border border-[#3C3C3C] rounded-lg shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-[#3C3C3C]">
                    <Search size={18} className="text-zinc-500" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search files by name..."
                        className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                    />
                    <button
                        onClick={onClose}
                        className="p-1 text-zinc-500 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto">
                    {matches.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500">
                            <FileText size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-sm">
                                {searchText ? 'No files found' : 'No recent files'}
                            </p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {matches.map((match, index) => (
                                <div
                                    key={match.path}
                                    onClick={() => handleSelectFile(match.path)}
                                    className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${index === selectedIndex
                                            ? 'bg-blue-600 text-white'
                                            : 'text-zinc-300 hover:bg-[#2D2D2D]'
                                        }`}
                                >
                                    {match.isRecent && (
                                        <Clock size={14} className="text-blue-400" />
                                    )}
                                    <FileIcon fileName={match.name} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">
                                            {match.name}
                                        </div>
                                        <div className={`text-xs truncate ${index === selectedIndex ? 'text-blue-200' : 'text-zinc-500'
                                            }`}>
                                            {getRelativePath(match.path)}
                                        </div>
                                    </div>
                                    {index === selectedIndex && (
                                        <span className="text-xs text-blue-200">Enter</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-[#3C3C3C] bg-[#1E1E1E]">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>↑↓ Navigate • Enter Open • Esc Close</span>
                        <span>{matches.length} files</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
