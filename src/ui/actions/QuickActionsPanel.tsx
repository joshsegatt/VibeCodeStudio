import { useState } from 'react';
import { Zap, Code2, FileText, Wand2 } from 'lucide-react';

interface QuickAction {
    id: string;
    name: string;
    description: string;
    icon: any;
    action: () => void;
}

export default function QuickActionsPanel() {
    const formatDocument = () => {
        const editor = (window as any).monacoEditorInstance;
        if (editor) {
            editor.getAction('editor.action.formatDocument')?.run();
            console.log('✅ Document formatted');
        } else {
            console.log('❌ No editor found');
        }
    };

    const aiRefactor = () => {
        // Trigger Cmd+K with refactor instruction
        const editor = (window as any).monacoEditorInstance;
        if (editor) {
            const selection = editor.getSelection();
            const model = editor.getModel();
            if (model && selection) {
                const code = model.getValueInRange(selection);
                if (code) {
                    // Trigger quick edit modal
                    window.dispatchEvent(new CustomEvent('quickEdit', {
                        detail: { code, instruction: 'Refactor this code to be more efficient and readable' }
                    }));
                    console.log('✅ AI Refactor triggered');
                } else {
                    alert('Please select code to refactor');
                }
            }
        }
    };

    const generateDocs = () => {
        const editor = (window as any).monacoEditorInstance;
        if (editor) {
            const selection = editor.getSelection();
            const model = editor.getModel();
            if (model && selection) {
                const code = model.getValueInRange(selection);
                if (code) {
                    window.dispatchEvent(new CustomEvent('quickEdit', {
                        detail: { code, instruction: 'Add JSDoc documentation to this code' }
                    }));
                    console.log('✅ Generate Docs triggered');
                } else {
                    alert('Please select code to document');
                }
            }
        }
    };

    const optimizeCode = () => {
        const editor = (window as any).monacoEditorInstance;
        if (editor) {
            const selection = editor.getSelection();
            const model = editor.getModel();
            if (model && selection) {
                const code = model.getValueInRange(selection);
                if (code) {
                    window.dispatchEvent(new CustomEvent('quickEdit', {
                        detail: { code, instruction: 'Optimize this code for better performance' }
                    }));
                    console.log('✅ Optimize Code triggered');
                } else {
                    alert('Please select code to optimize');
                }
            }
        }
    };

    const quickActions: QuickAction[] = [
        {
            id: 'format',
            name: 'Format Document',
            description: 'Auto-format current file',
            icon: Code2,
            action: formatDocument
        },
        {
            id: 'refactor',
            name: 'AI Refactor',
            description: 'Refactor with AI suggestions',
            icon: Wand2,
            action: aiRefactor
        },
        {
            id: 'generate-docs',
            name: 'Generate Docs',
            description: 'Auto-generate documentation',
            icon: FileText,
            action: generateDocs
        },
        {
            id: 'optimize',
            name: 'Optimize Code',
            description: 'AI-powered optimization',
            icon: Zap,
            action: optimizeCode
        }
    ];

    return (
        <div className="h-full flex flex-col bg-[#1E1E1E]">
            <div className="h-9 px-4 flex items-center border-b border-[#2D2D2D]">
                <Zap size={14} className="mr-2 text-yellow-400" />
                <span className="text-xs font-semibold uppercase text-white">Quick Actions</span>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-2">
                {quickActions.map(action => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.id}
                            onClick={action.action}
                            className="w-full p-3 bg-[#252526] hover:bg-[#2D2D2D] rounded text-left border border-transparent hover:border-yellow-500/30 transition-all"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Icon size={14} className="text-yellow-400" />
                                <span className="text-sm font-medium text-white">{action.name}</span>
                            </div>
                            <p className="text-xs text-zinc-400">{action.description}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
