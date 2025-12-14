import { useState } from 'react';
import { X, Check, Loader } from 'lucide-react';
import { quickEditService } from '../../services/quickEdit';

interface QuickEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCode: string;
    language: string;
    onApply: (editedCode: string) => void;
}

export default function QuickEditModal({
    isOpen,
    onClose,
    selectedCode,
    language,
    onApply
}: QuickEditModalProps) {
    const [instruction, setInstruction] = useState('');
    const [diff, setDiff] = useState('');
    const [editedCode, setEditedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleEdit = async () => {
        if (!instruction.trim()) return;

        setIsLoading(true);
        try {
            const result = await quickEditService.performEdit({
                code: selectedCode,
                selection: { start: 0, end: selectedCode.length },
                instruction,
                language
            });

            setDiff(result.diff);
            setEditedCode(result.editedCode);
        } catch (error) {
            console.error('Edit failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = () => {
        if (editedCode) {
            onApply(editedCode);
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleEdit();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg w-[600px] max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#2D2D2D]">
                    <h2 className="text-white font-semibold">Quick Edit (Cmd+K)</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">
                        <X size={18} />
                    </button>
                </div>

                {/* Input */}
                <div className="p-4 border-b border-[#2D2D2D]">
                    <input
                        type="text"
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe the changes you want... (Cmd+Enter to apply)"
                        className="w-full bg-[#252526] text-white px-3 py-2 rounded border border-[#3C3C3C] focus:border-blue-500 focus:outline-none"
                        autoFocus
                    />
                </div>

                {/* Diff Viewer */}
                {diff && (
                    <div className="flex-1 overflow-auto p-4">
                        <div className="text-xs text-zinc-500 mb-2">Preview:</div>
                        <pre className="text-xs font-mono bg-[#0D0D0D] p-3 rounded overflow-auto">
                            {diff.split('\n').map((line, i) => (
                                <div
                                    key={i}
                                    className={
                                        line.startsWith('+') ? 'text-green-400' :
                                            line.startsWith('-') ? 'text-red-400' :
                                                'text-zinc-400'
                                    }
                                >
                                    {line}
                                </div>
                            ))}
                        </pre>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 p-4 border-t border-[#2D2D2D]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    {!diff && (
                        <button
                            onClick={handleEdit}
                            disabled={!instruction.trim() || isLoading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading && <Loader size={14} className="animate-spin" />}
                            Generate
                        </button>
                    )}
                    {diff && (
                        <button
                            onClick={handleApply}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2"
                        >
                            <Check size={14} />
                            Apply Changes
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
