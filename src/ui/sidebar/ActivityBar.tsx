import { Files, Search, GitBranch, MessageSquare, Settings, Bug, Sparkles, Zap } from 'lucide-react';

export type ActivityView = 'explorer' | 'search' | 'git' | 'debug' | 'snippets' | 'actions' | 'chat' | 'settings';

interface ActivityBarProps {
    activeView: ActivityView;
    onViewChange: (view: ActivityView) => void;
}

export default function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
    const activities = [
        { id: 'explorer' as ActivityView, icon: Files, label: 'Explorer' },
        { id: 'search' as ActivityView, icon: Search, label: 'Search' },
        { id: 'git' as ActivityView, icon: GitBranch, label: 'Source Control' },
        { id: 'debug' as ActivityView, icon: Bug, label: 'Debug' },
        { id: 'snippets' as ActivityView, icon: Sparkles, label: 'Snippets' },
        { id: 'actions' as ActivityView, icon: Zap, label: 'Quick Actions' },
        { id: 'chat' as ActivityView, icon: MessageSquare, label: 'AI Chat' },
        { id: 'settings' as ActivityView, icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="w-12 bg-[#181818] border-r border-[#2D2D2D] flex flex-col items-center py-2 gap-1">
            {activities.map((activity) => {
                const Icon = activity.icon;
                const isActive = activeView === activity.id;

                return (
                    <button
                        key={activity.id}
                        onClick={() => onViewChange(activity.id)}
                        className={`group relative w-12 h-12 flex items-center justify-center transition-colors ${isActive ? 'text-white' : 'text-zinc-500 hover:text-white'
                            }`}
                        title={activity.label}
                    >
                        <Icon size={20} />
                        {isActive && (
                            <div className="absolute left-0 w-0.5 h-6 bg-white rounded-r" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
