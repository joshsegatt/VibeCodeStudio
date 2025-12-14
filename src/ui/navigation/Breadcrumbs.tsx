import { ChevronRight, Home, Folder, File } from 'lucide-react';

interface BreadcrumbItem {
    name: string;
    path: string;
    type: 'root' | 'folder' | 'file';
}

interface BreadcrumbsProps {
    currentPath: string;
}

export default function Breadcrumbs({ currentPath }: BreadcrumbsProps) {
    const getBreadcrumbs = (): BreadcrumbItem[] => {
        if (!currentPath) return [];

        const parts = currentPath.split('/').filter(Boolean);
        const breadcrumbs: BreadcrumbItem[] = [
            { name: 'Home', path: '/', type: 'root' }
        ];

        let accPath = '';
        parts.forEach((part, index) => {
            accPath += `/${part}`;
            breadcrumbs.push({
                name: part,
                path: accPath,
                type: index === parts.length - 1 ? 'file' : 'folder'
            });
        });

        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    const getIcon = (type: string) => {
        switch (type) {
            case 'root': return <Home size={12} />;
            case 'folder': return <Folder size={12} />;
            case 'file': return <File size={12} />;
            default: return null;
        }
    };

    return (
        <div className="h-8 px-4 flex items-center gap-1 bg-[#252526] border-b border-[#2D2D2D] text-xs">
            {breadcrumbs.map((item, index) => (
                <div key={item.path} className="flex items-center gap-1">
                    {index > 0 && (
                        <ChevronRight size={12} className="text-zinc-600" />
                    )}
                    <button className="flex items-center gap-1 px-2 py-1 hover:bg-[#2D2D2D] rounded text-zinc-300 hover:text-white transition-colors">
                        {getIcon(item.type)}
                        <span>{item.name}</span>
                    </button>
                </div>
            ))}
        </div>
    );
}
