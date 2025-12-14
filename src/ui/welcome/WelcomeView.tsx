import { useProjectStore } from '../../stores/projectStore';
import { useEffect, useState } from 'react';

export default function WelcomeView() {
    const { setCurrentProjectPath, recentProjects } = useProjectStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleOpenRecent = (path: string) => {
        setCurrentProjectPath(path);
    };

    // Generate random stars
    const stars = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        duration: Math.random() * 3 + 2
    }));

    return (
        <div className="flex-1 flex items-center justify-center bg-[#1E1E1E] overflow-hidden relative">
            {/* Starfield Background */}
            <div className="absolute inset-0">
                {stars.map((star) => (
                    <div
                        key={star.id}
                        className="absolute rounded-full bg-white"
                        style={{
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            opacity: star.opacity,
                            animation: `twinkle ${star.duration}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            {/* Main Content - Vertically and Horizontally Centered */}
            <div className={`relative z-10 text-center px-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {/* Logo */}
                <div className="mb-8">
                    <h1 className="text-5xl font-bold text-white mb-3"
                        style={{
                            textShadow: `
                                2px 2px 0px #007ACC,
                                4px 4px 0px #0066AA,
                                6px 6px 10px rgba(0, 0, 0, 0.3)
                            `
                        }}>
                        Vibe Studio
                    </h1>
                    <p className="text-zinc-500 text-sm">AI-Powered Development Environment</p>
                </div>

                {/* Recent Projects */}
                {recentProjects && recentProjects.length > 0 && (
                    <div className="max-w-sm mx-auto">
                        <div className="text-xs text-zinc-600 mb-3 uppercase tracking-wider">Recent Projects</div>
                        <div className="space-y-2">
                            {recentProjects.slice(0, 3).map((project, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleOpenRecent(project)}
                                    className="w-full px-4 py-2 bg-[#252526] hover:bg-[#2D2D2D] border border-[#2D2D2D] hover:border-[#007ACC] rounded-lg transition-all text-left"
                                >
                                    <div className="text-sm text-zinc-300 truncate">
                                        {project.split(/[/\\]/).pop()}
                                    </div>
                                    <div className="text-xs text-zinc-600 truncate">{project}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Hint */}
                <div className="mt-12 text-xs text-zinc-700">
                    Open Explorer to start • <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded">Ctrl+Shift+E</kbd>
                </div>
            </div>

            {/* CSS Animation for Stars */}
            <style>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
