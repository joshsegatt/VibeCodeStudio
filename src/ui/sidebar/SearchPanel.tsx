import { useState } from 'react';
import { Search, FileText, Loader2, X } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { useProjectStore } from '../../stores/projectStore';
import { ErrorHandler } from '../../utils/errorHandler';

interface SearchResult {
    file_path: string;
    line_number: number;
    line_content: string;
    match_start: number;
    match_end: number;
}

export default function SearchPanel() {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [useRegex, setUseRegex] = useState(false);
    const [caseSensitive, setCaseSensitive] = useState(false);
    const { currentProjectPath, openFile } = useProjectStore();

    const handleSearch = async () => {
        if (!searchQuery.trim() || !currentProjectPath) {
            ErrorHandler.warning('Please enter a search query and open a project');
            return;
        }

        setIsSearching(true);

        try {
            const searchResults = await invoke<SearchResult[]>('search_in_files', {
                projectPath: currentProjectPath,
                query: searchQuery,
                isRegex: useRegex,
                caseSensitive: caseSensitive,
                maxResults: 1000
            });

            setResults(searchResults);

            if (searchResults.length === 0) {
                ErrorHandler.info('No results found');
            } else if (searchResults.length >= 1000) {
                ErrorHandler.warning('Results limited to 1000. Refine your search.');
            }
        } catch (error) {
            ErrorHandler.handle(error, 'Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    const handleOpenFile = async (result: SearchResult) => {
        try {
            await openFile(result.file_path);
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to open file');
        }
    };

    const highlightMatch = (content: string, start: number, end: number) => {
        return (
            <>
                {content.substring(0, start)}
                <span className="bg-yellow-500/30 text-yellow-200">
                    {content.substring(start, end)}
                </span>
                {content.substring(end)}
            </>
        );
    };

    return (
        <div className="h-full flex flex-col bg-[#1E1E1E]">
            {/* Header */}
            <div className="h-9 px-4 flex items-center justify-between border-b border-[#2D2D2D] flex-shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wide text-white">Search</span>
            </div>

            {/* Search Input */}
            <div className="p-4 space-y-3 border-b border-[#2D2D2D]">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search in files..."
                        className="w-full bg-[#3C3C3C] border border-[#2D2D2D] rounded px-10 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#007ACC]"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setResults([]);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Options */}
                <div className="flex gap-4 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-white">
                        <input
                            type="checkbox"
                            checked={caseSensitive}
                            onChange={(e) => setCaseSensitive(e.target.checked)}
                            className="rounded border-zinc-600 bg-[#3C3C3C]"
                        />
                        <span>Case Sensitive</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-white">
                        <input
                            type="checkbox"
                            checked={useRegex}
                            onChange={(e) => setUseRegex(e.target.checked)}
                            className="rounded border-zinc-600 bg-[#3C3C3C]"
                        />
                        <span>Regex</span>
                    </label>
                </div>

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="w-full bg-[#007ACC] hover:bg-[#005A9E] disabled:bg-[#3C3C3C] disabled:text-zinc-600 text-white py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                    {isSearching ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Searching...
                        </>
                    ) : (
                        <>
                            <Search size={16} />
                            Search
                        </>
                    )}
                </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
                {results.length > 0 && (
                    <div className="p-2">
                        <div className="text-xs text-zinc-500 px-2 py-1">
                            {results.length} result{results.length !== 1 ? 's' : ''} found
                        </div>
                        <div className="space-y-1">
                            {results.map((result, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleOpenFile(result)}
                                    className="w-full text-left p-2 hover:bg-[#2D2D2D] rounded transition-colors group"
                                >
                                    <div className="flex items-start gap-2">
                                        <FileText size={14} className="text-[#007ACC] mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-zinc-400 truncate">
                                                {result.file_path.split('/').pop()}
                                                <span className="text-zinc-600 ml-2">
                                                    Line {result.line_number}
                                                </span>
                                            </div>
                                            <div className="text-sm text-zinc-300 font-mono mt-1 truncate">
                                                {highlightMatch(
                                                    result.line_content.trim(),
                                                    result.match_start,
                                                    result.match_end
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {results.length === 0 && !isSearching && searchQuery && (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-8 text-center">
                        <Search size={48} className="mb-4 opacity-50" />
                        <p className="text-sm">No results found</p>
                        <p className="text-xs mt-2">Try a different search term</p>
                    </div>
                )}

                {!searchQuery && (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-8 text-center">
                        <Search size={48} className="mb-4 opacity-50" />
                        <p className="text-sm">Search in files</p>
                        <p className="text-xs mt-2">Enter a search term to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
}
