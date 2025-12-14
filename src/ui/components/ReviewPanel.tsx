import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, AlertTriangle, Info, X, ChevronRight } from 'lucide-react';
import { ReviewSuggestion } from '../../services/aiReview';

interface ReviewPanelProps {
    suggestions: ReviewSuggestion[];
    onClose: () => void;
    onJumpToLine: (line: number) => void;
    onApplyFix?: (suggestion: ReviewSuggestion) => void;
}

export default function ReviewPanel({ suggestions, onClose, onJumpToLine, onApplyFix }: ReviewPanelProps) {
    const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');
    const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());

    const filteredSuggestions = suggestions.filter((s, idx) => {
        if (dismissedIds.has(idx)) return false;
        if (filter === 'all') return true;
        return s.severity === filter;
    });

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'error': return <AlertCircle size={14} className="text-red-400" />;
            case 'warning': return <AlertTriangle size={14} className="text-yellow-400" />;
            case 'info': return <Info size={14} className="text-blue-400" />;
            default: return <Info size={14} className="text-gray-400" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'error': return 'border-red-500/30 bg-red-500/5';
            case 'warning': return 'border-yellow-500/30 bg-yellow-500/5';
            case 'info': return 'border-blue-500/30 bg-blue-500/5';
            default: return 'border-gray-500/30 bg-gray-500/5';
        }
    };

    const handleDismiss = (idx: number) => {
        setDismissedIds(prev => new Set([...prev, idx]));
    };

    const counts = {
        error: suggestions.filter(s => s.severity === 'error').length,
        warning: suggestions.filter(s => s.severity === 'warning').length,
        info: suggestions.filter(s => s.severity === 'info').length
    };

    return (
        <div className="h-full flex flex-col bg-[#1E1E1E] text-white border-l border-[#3C3C3C]">
            {/* Header */}
            <div className="h-12 px-4 flex items-center justify-between border-b border-[#3C3C3C] flex-shrink-0">
                <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-blue-400" />
                    <span className="text-sm font-semibold">AI Code Review</span>
                    <span className="text-xs text-zinc-500">
                        ({filteredSuggestions.length} suggestions)
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Filters */}
            <div className="px-4 py-3 border-b border-[#3C3C3C] flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 text-xs rounded transition-colors ${filter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-[#3C3C3C] text-zinc-400 hover:bg-[#4C4C4C]'
                        }`}
                >
                    All ({suggestions.length})
                </button>
                <button
                    onClick={() => setFilter('error')}
                    className={`px-3 py-1.5 text-xs rounded transition-colors ${filter === 'error'
                            ? 'bg-red-600 text-white'
                            : 'bg-[#3C3C3C] text-zinc-400 hover:bg-[#4C4C4C]'
                        }`}
                >
                    Errors ({counts.error})
                </button>
                <button
                    onClick={() => setFilter('warning')}
                    className={`px-3 py-1.5 text-xs rounded transition-colors ${filter === 'warning'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-[#3C3C3C] text-zinc-400 hover:bg-[#4C4C4C]'
                        }`}
                >
                    Warnings ({counts.warning})
                </button>
                <button
                    onClick={() => setFilter('info')}
                    className={`px-3 py-1.5 text-xs rounded transition-colors ${filter === 'info'
                            ? 'bg-blue-600 text-white'
                            : 'bg-[#3C3C3C] text-zinc-400 hover:bg-[#4C4C4C]'
                        }`}
                >
                    Info ({counts.info})
                </button>
            </div>

            {/* Suggestions List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredSuggestions.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-sm">
                        {dismissedIds.size > 0
                            ? 'All suggestions dismissed'
                            : 'No suggestions found'}
                    </div>
                ) : (
                    filteredSuggestions.map((suggestion, idx) => (
                        <div
                            key={idx}
                            className={`p-3 rounded-lg border ${getSeverityColor(suggestion.severity)} hover:bg-white/5 transition-colors cursor-pointer`}
                            onClick={() => onJumpToLine(suggestion.line)}
                        >
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                    {getSeverityIcon(suggestion.severity)}
                                    <span className="text-xs font-semibold text-zinc-300">
                                        Line {suggestion.line}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-zinc-400">
                                        {suggestion.category}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDismiss(idx);
                                    }}
                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                    title="Dismiss"
                                >
                                    <X size={12} className="text-zinc-500" />
                                </button>
                            </div>

                            <p className="text-sm text-zinc-300 mb-2">
                                {suggestion.message}
                            </p>

                            {suggestion.fix && onApplyFix && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onApplyFix(suggestion);
                                    }}
                                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    <ChevronRight size={12} />
                                    Apply fix
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
