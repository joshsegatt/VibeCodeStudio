import { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, ChevronUp, Replace, CaseSensitive, Regex, WholeWord } from 'lucide-react';

interface FindReplaceProps {
    onClose: () => void;
    editor: any; // Monaco editor instance
}

export default function FindReplace({ onClose, editor }: FindReplaceProps) {
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [showReplace, setShowReplace] = useState(false);
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [wholeWord, setWholeWord] = useState(false);
    const [useRegex, setUseRegex] = useState(false);
    const [matchCount, setMatchCount] = useState(0);
    const [currentMatch, setCurrentMatch] = useState(0);
    const findInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        findInputRef.current?.focus();

        // Get selected text if any
        if (editor) {
            const selection = editor.getSelection();
            const selectedText = editor.getModel()?.getValueInRange(selection);
            if (selectedText) {
                setFindText(selectedText);
            }
        }
    }, [editor]);

    useEffect(() => {
        if (!editor || !findText) {
            setMatchCount(0);
            setCurrentMatch(0);
            return;
        }

        // Trigger Monaco's find
        const findController = editor.getContribution('editor.contrib.findController');
        if (findController) {
            findController.start({
                searchString: findText,
                isRegex: useRegex,
                matchCase: caseSensitive,
                wholeWord: wholeWord,
            });
        }

        // Count matches
        const model = editor.getModel();
        if (model) {
            const matches = model.findMatches(
                findText,
                true,
                useRegex,
                caseSensitive,
                wholeWord ? findText : null,
                true
            );
            setMatchCount(matches.length);
        }
    }, [findText, caseSensitive, wholeWord, useRegex, editor]);

    const findNext = () => {
        if (!editor) return;
        const findController = editor.getContribution('editor.contrib.findController');
        findController?.moveToNextMatch();
        setCurrentMatch(prev => (prev < matchCount ? prev + 1 : 1));
    };

    const findPrevious = () => {
        if (!editor) return;
        const findController = editor.getContribution('editor.contrib.findController');
        findController?.moveToPreviousMatch();
        setCurrentMatch(prev => (prev > 1 ? prev - 1 : matchCount));
    };

    const replaceOne = () => {
        if (!editor || !findText) return;
        const findController = editor.getContribution('editor.contrib.findController');
        findController?.replace();
        findNext();
    };

    const replaceAll = () => {
        if (!editor || !findText) return;
        const findController = editor.getContribution('editor.contrib.findController');
        findController?.replaceAll();
        setMatchCount(0);
        setCurrentMatch(0);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'Enter') {
            if (e.shiftKey) {
                findPrevious();
            } else {
                findNext();
            }
        }
    };

    return (
        <div className="absolute top-0 right-0 z-50 bg-[#252526] border border-[#3C3C3C] rounded-md shadow-2xl m-4 min-w-96">
            {/* Find Section */}
            <div className="flex items-center gap-2 p-2 border-b border-[#3C3C3C]">
                <input
                    ref={findInputRef}
                    type="text"
                    value={findText}
                    onChange={(e) => setFindText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Find"
                    className="flex-1 bg-[#3C3C3C] text-white text-sm px-3 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                {/* Match counter */}
                {findText && (
                    <span className="text-xs text-zinc-400 px-2">
                        {matchCount > 0 ? `${currentMatch}/${matchCount}` : 'No results'}
                    </span>
                )}

                {/* Options */}
                <button
                    onClick={() => setCaseSensitive(!caseSensitive)}
                    className={`p-1.5 rounded transition-colors ${caseSensitive ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-[#3C3C3C]'
                        }`}
                    title="Match Case (Alt+C)"
                >
                    <CaseSensitive size={14} />
                </button>

                <button
                    onClick={() => setWholeWord(!wholeWord)}
                    className={`p-1.5 rounded transition-colors ${wholeWord ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-[#3C3C3C]'
                        }`}
                    title="Match Whole Word (Alt+W)"
                >
                    <WholeWord size={14} />
                </button>

                <button
                    onClick={() => setUseRegex(!useRegex)}
                    className={`p-1.5 rounded transition-colors ${useRegex ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-[#3C3C3C]'
                        }`}
                    title="Use Regular Expression (Alt+R)"
                >
                    <Regex size={14} />
                </button>

                {/* Navigation */}
                <button
                    onClick={findPrevious}
                    disabled={matchCount === 0}
                    className="p-1.5 text-zinc-400 hover:bg-[#3C3C3C] rounded disabled:opacity-30"
                    title="Previous Match (Shift+Enter)"
                >
                    <ChevronUp size={14} />
                </button>

                <button
                    onClick={findNext}
                    disabled={matchCount === 0}
                    className="p-1.5 text-zinc-400 hover:bg-[#3C3C3C] rounded disabled:opacity-30"
                    title="Next Match (Enter)"
                >
                    <ChevronDown size={14} />
                </button>

                {/* Toggle Replace */}
                <button
                    onClick={() => setShowReplace(!showReplace)}
                    className="p-1.5 text-zinc-400 hover:bg-[#3C3C3C] rounded"
                    title="Toggle Replace (Ctrl+H)"
                >
                    <Replace size={14} />
                </button>

                {/* Close */}
                <button
                    onClick={onClose}
                    className="p-1.5 text-zinc-400 hover:bg-[#3C3C3C] rounded"
                    title="Close (Esc)"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Replace Section */}
            {showReplace && (
                <div className="flex items-center gap-2 p-2">
                    <input
                        type="text"
                        value={replaceText}
                        onChange={(e) => setReplaceText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Replace"
                        className="flex-1 bg-[#3C3C3C] text-white text-sm px-3 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />

                    <button
                        onClick={replaceOne}
                        disabled={matchCount === 0}
                        className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Replace (Ctrl+Shift+1)"
                    >
                        Replace
                    </button>

                    <button
                        onClick={replaceAll}
                        disabled={matchCount === 0}
                        className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Replace All (Ctrl+Shift+Enter)"
                    >
                        Replace All
                    </button>
                </div>
            )}
        </div>
    );
}
