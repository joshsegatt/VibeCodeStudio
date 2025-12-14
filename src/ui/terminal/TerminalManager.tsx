import { useState } from 'react';
import { Plus, X, SplitSquareHorizontal, SplitSquareVertical } from 'lucide-react';
import Terminal from './Terminal';

interface TerminalPane {
    id: string;
    name: string;
}

interface SplitLayout {
    type: 'single' | 'horizontal' | 'vertical';
    panes: TerminalPane[];
    activeId: string;
}

interface TerminalGroup {
    id: string;
    name: string;
    layout: SplitLayout;
}

interface TerminalManagerProps {
    onClose?: () => void;
}

export default function TerminalManager({ onClose }: TerminalManagerProps) {
    const [groups, setGroups] = useState<TerminalGroup[]>([
        {
            id: '1',
            name: 'Terminal 1',
            layout: {
                type: 'single',
                panes: [{ id: '1-1', name: 'bash' }],
                activeId: '1-1'
            }
        }
    ]);
    const [activeGroupId, setActiveGroupId] = useState('1');
    const [nextGroupId, setNextGroupId] = useState(2);
    const [nextPaneId, setNextPaneId] = useState(2);

    const activeGroup = groups.find(g => g.id === activeGroupId) || groups[0];

    const addNewTerminalGroup = () => {
        const newGroup: TerminalGroup = {
            id: nextGroupId.toString(),
            name: `Terminal ${nextGroupId}`,
            layout: {
                type: 'single',
                panes: [{ id: `${nextGroupId}-1`, name: 'bash' }],
                activeId: `${nextGroupId}-1`
            }
        };
        setGroups([...groups, newGroup]);
        setActiveGroupId(newGroup.id);
        setNextGroupId(nextGroupId + 1);
        setNextPaneId(nextPaneId + 1);
    };

    const closeTerminalGroup = (groupId: string) => {
        if (groups.length === 1) {
            onClose?.();
            return;
        }

        const newGroups = groups.filter(g => g.id !== groupId);
        setGroups(newGroups);

        if (activeGroupId === groupId) {
            setActiveGroupId(newGroups[0].id);
        }
    };

    const splitHorizontal = () => {
        const newPane: TerminalPane = {
            id: `${activeGroupId}-${nextPaneId}`,
            name: 'bash'
        };

        setGroups(groups.map(g => {
            if (g.id === activeGroupId) {
                return {
                    ...g,
                    layout: {
                        type: 'horizontal',
                        panes: [...g.layout.panes, newPane],
                        activeId: newPane.id
                    }
                };
            }
            return g;
        }));
        setNextPaneId(nextPaneId + 1);
    };

    const splitVertical = () => {
        const newPane: TerminalPane = {
            id: `${activeGroupId}-${nextPaneId}`,
            name: 'bash'
        };

        setGroups(groups.map(g => {
            if (g.id === activeGroupId) {
                return {
                    ...g,
                    layout: {
                        type: 'vertical',
                        panes: [...g.layout.panes, newPane],
                        activeId: newPane.id
                    }
                };
            }
            return g;
        }));
        setNextPaneId(nextPaneId + 1);
    };

    const closePane = (paneId: string) => {
        setGroups(groups.map(g => {
            if (g.id === activeGroupId) {
                const newPanes = g.layout.panes.filter(p => p.id !== paneId);

                if (newPanes.length === 0) {
                    return g; // Will be handled by closeTerminalGroup
                }

                const newActiveId = g.layout.activeId === paneId ? newPanes[0].id : g.layout.activeId;

                return {
                    ...g,
                    layout: {
                        type: newPanes.length === 1 ? 'single' : g.layout.type,
                        panes: newPanes,
                        activeId: newActiveId
                    }
                };
            }
            return g;
        }));
    };

    const setActivePane = (paneId: string) => {
        setGroups(groups.map(g => {
            if (g.id === activeGroupId) {
                return {
                    ...g,
                    layout: { ...g.layout, activeId: paneId }
                };
            }
            return g;
        }));
    };

    const renderPanes = (layout: SplitLayout) => {
        if (layout.type === 'single') {
            return (
                <div className="h-full">
                    <Terminal
                        terminalId={layout.panes[0].id}
                        onClose={onClose}
                    />
                </div>
            );
        }

        const containerClass = layout.type === 'horizontal'
            ? 'flex flex-row h-full'
            : 'flex flex-col h-full';

        return (
            <div className={containerClass}>
                {layout.panes.map((pane, index) => (
                    <div
                        key={pane.id}
                        className={`relative ${layout.type === 'horizontal' ? 'flex-1' : 'flex-1'} ${index < layout.panes.length - 1
                                ? layout.type === 'horizontal'
                                    ? 'border-r border-[#2D2D2D]'
                                    : 'border-b border-[#2D2D2D]'
                                : ''
                            }`}
                        onClick={() => setActivePane(pane.id)}
                    >
                        {/* Pane Header (only for splits) */}
                        {layout.panes.length > 1 && (
                            <div className={`absolute top-0 left-0 right-0 z-10 h-6 flex items-center justify-between px-2 ${layout.activeId === pane.id
                                    ? 'bg-[#252526] border-b border-blue-500'
                                    : 'bg-[#1E1E1E] border-b border-[#2D2D2D]'
                                }`}>
                                <span className={`text-xs font-medium ${layout.activeId === pane.id ? 'text-white' : 'text-zinc-500'
                                    }`}>
                                    {pane.name}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        closePane(pane.id);
                                    }}
                                    className="p-0.5 hover:bg-white/10 rounded transition-colors"
                                >
                                    <X size={10} className="text-zinc-400" />
                                </button>
                            </div>
                        )}

                        {/* Terminal Content */}
                        <div className={`h-full ${layout.panes.length > 1 ? 'pt-6' : ''}`}>
                            <Terminal
                                terminalId={pane.id}
                                onClose={onClose}
                            />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-[#1E1E1E]">
            {/* Terminal Tabs */}
            <div className="h-9 flex items-center bg-[#252526] border-b border-[#2D2D2D]">
                {/* Tabs */}
                <div className="flex-1 flex items-center overflow-x-auto">
                    {groups.map(group => (
                        <div
                            key={group.id}
                            className={`group flex items-center gap-2 px-3 py-1.5 border-r border-[#2D2D2D] cursor-pointer transition-colors ${activeGroupId === group.id
                                    ? 'bg-[#1E1E1E] text-white'
                                    : 'text-zinc-400 hover:bg-[#2D2D2D] hover:text-white'
                                }`}
                            onClick={() => setActiveGroupId(group.id)}
                        >
                            <span className="text-xs font-medium">{group.name}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeTerminalGroup(group.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded transition-opacity"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-1 px-2 border-l border-[#2D2D2D]">
                    {/* Split Buttons */}
                    <button
                        onClick={splitHorizontal}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                        title="Split Right"
                    >
                        <SplitSquareVertical size={14} className="text-zinc-400" />
                    </button>
                    <button
                        onClick={splitVertical}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                        title="Split Down"
                    >
                        <SplitSquareHorizontal size={14} className="text-zinc-400" />
                    </button>

                    <div className="w-px h-4 bg-[#3C3C3C] mx-1" />

                    {/* New Terminal Tab */}
                    <button
                        onClick={addNewTerminalGroup}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors"
                        title="New Terminal"
                    >
                        <Plus size={14} className="text-zinc-400" />
                    </button>
                </div>
            </div>

            {/* Active Terminal Group */}
            <div className="flex-1 overflow-hidden">
                {renderPanes(activeGroup.layout)}
            </div>
        </div>
    );
}
