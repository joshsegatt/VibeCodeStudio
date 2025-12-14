import { ChevronRight, Folder, FileText } from 'lucide-react';
import { useState } from 'react';

interface BreadcrumbsProps {
    filePath: string;
    onNavigate?: (path: string) => void;
}

export default function Breadcrumbs({ filePath, onNavigate }: BreadcrumbsProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (!filePath) {
        return null;
    }

    // Split path into segments
    const segments = filePath.split(/[/\\]/).filter(Boolean);

    // Build cumulative paths for navigation
    const paths = segments.map((_, index) => {
        return segments.slice(0, index + 1).join('/');
    });

    const handleClick = (index: number) => {
        if (onNavigate && index < segments.length - 1) {
            onNavigate(paths[index]);
        }
    };

    return (
        <div className="h-8 px-4 flex items-center gap-1 bg-[#252526] border-b border-[#2D2D2D] text-xs overflow-x-auto">
            {segments.map((segment, index) => {
                const isLast = index === segments.length - 1;
                const isFolder = index < segments.length - 1;

                return (
                    <div key={index} className="flex items-center gap-1 flex-shrink-0">
                        {/* Segment */}
                        <button
                            onClick={() => handleClick(index)}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${isLast
                                    ? 'text-white font-medium'
                                    : 'text-zinc-400 hover:bg-[#2D2D2D] hover:text-white cursor-pointer'
                                }`}
                            disabled={isLast}
                        >
                            {isFolder ? (
                                <Folder size={12} className={isLast ? 'text-blue-400' : 'text-zinc-500'} />
                            ) : (
                                <FileText size={12} className="text-blue-400" />
                            )}
                            <span>{segment}</span>
                        </button>

                        {/* Separator */}
                        {!isLast && (
                            <ChevronRight size={12} className="text-zinc-600" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
