import { useEffect, useRef } from 'react';
import {
    FileText,
    FolderPlus,
    FilePlus,
    Edit3,
    Trash2,
    Copy,
    FolderOpen,
    Scissors,
    Clipboard
} from 'lucide-react';

export interface ContextMenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    action: () => void;
    separator?: boolean;
    disabled?: boolean;
}

interface ContextMenuProps {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    // Adjust position if menu would go off screen
    useEffect(() => {
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let adjustedX = x;
            let adjustedY = y;

            if (rect.right > viewportWidth) {
                adjustedX = viewportWidth - rect.width - 10;
            }

            if (rect.bottom > viewportHeight) {
                adjustedY = viewportHeight - rect.height - 10;
            }

            menuRef.current.style.left = `${adjustedX}px`;
            menuRef.current.style.top = `${adjustedY}px`;
        }
    }, [x, y]);

    return (
        <div
            ref={menuRef}
            className="fixed z-50 min-w-48 bg-[#252526] border border-[#3C3C3C] rounded-md shadow-2xl py-1"
            style={{ left: x, top: y }}
        >
            {items.map((item, index) => (
                <div key={item.id}>
                    {item.separator && index > 0 && (
                        <div className="h-px bg-[#3C3C3C] my-1" />
                    )}
                    <button
                        onClick={() => {
                            if (!item.disabled) {
                                item.action();
                                onClose();
                            }
                        }}
                        disabled={item.disabled}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${item.disabled
                                ? 'text-zinc-600 cursor-not-allowed'
                                : 'text-zinc-300 hover:bg-[#2D2D2D] hover:text-white'
                            }`}
                    >
                        <span className={item.disabled ? 'text-zinc-600' : 'text-zinc-400'}>
                            {item.icon}
                        </span>
                        <span>{item.label}</span>
                    </button>
                </div>
            ))}
        </div>
    );
}

// Export common icons for reuse
export const ContextMenuIcons = {
    NewFile: <FilePlus size={16} />,
    NewFolder: <FolderPlus size={16} />,
    Rename: <Edit3 size={16} />,
    Delete: <Trash2 size={16} />,
    Copy: <Copy size={16} />,
    Cut: <Scissors size={16} />,
    Paste: <Clipboard size={16} />,
    Reveal: <FolderOpen size={16} />,
    File: <FileText size={16} />,
};
