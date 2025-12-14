// Command Palette Integration Instructions for IDELayout.tsx
// Add these changes to integrate the Command Palette:

// 1. Add import at the top:
import CommandPalette from '../command/CommandPalette';
import { FileText, Eye, Terminal as TerminalIcon, Settings as SettingsIcon, Search } from 'lucide-react';

// 2. Add state variable (around line 31):
const [showCommandPalette, setShowCommandPalette] = useState(false);

// 3. Add keyboard listener (after other useEffects):
useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
            e.preventDefault();
            setShowCommandPalette(true);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
}, []);

// 4. Define commands array (before return statement):
const commands = [
    {
        id: 'file.newProject',
        label: 'New Project',
        category: 'File' as const,
        icon: <FileText size={16} />,
        action: () => createProject(),
        keywords: ['create', 'new', 'folder']
    },
    {
        id: 'view.explorer',
        label: 'Show Explorer',
        category: 'View' as const,
        icon: <FileText size={16} />,
        action: () => setActivityView('explorer'),
    },
    {
        id: 'view.search',
        label: 'Show Search',
        category: 'View' as const,
        icon: <Search size={16} />,
        action: () => setActivityView('search'),
    },
    {
        id: 'git.init',
        label: 'Git: Initialize Repository',
        category: 'Git' as const,
        icon: <GitBranch size={16} />,
        action: async () => {
            if (currentProjectPath) await init(currentProjectPath);
        },
    },
    {
        id: 'git.status',
        label: 'Git: Show Changes',
        category: 'Git' as const,
        icon: <GitBranch size={16} />,
        action: async () => {
            if (currentProjectPath) await status(currentProjectPath);
            setActivityView('git');
        },
    },
    {
        id: 'view.git',
        label: 'Show Git Panel',
        category: 'View' as const,
        icon: <GitBranch size={16} />,
        action: () => setActivityView('git'),
    },
    {
        id: 'terminal.toggle',
        label: 'Toggle Terminal',
        category: 'Terminal' as const,
        icon: <TerminalIcon size={16} />,
        action: () => setShowTerminal(!showTerminal),
    },
    {
        id: 'ai.toggle',
        label: 'Toggle AI Assistant',
        category: 'AI' as const,
        icon: <Zap size={16} />,
        action: () => setShowAIChat(!showAIChat),
    },
    {
        id: 'ai.modeCode',
        label: 'AI: Code Generation Mode',
        category: 'AI' as const,
        icon: <Zap size={16} />,
        action: () => {
            setAgentMode('code');
            setShowAIChat(true);
        },
    },
    {
        id: 'ai.modeArchitect',
        label: 'AI: System Architect Mode',
        category: 'AI' as const,
        icon: <Zap size={16} />,
        action: () => {
            setAgentMode('architect');
            setShowAIChat(true);
        },
    },
    {
        id: 'ai.modeDebug',
        label: 'AI: Debug Assistant Mode',
        category: 'AI' as const,
        icon: <Zap size={16} />,
        action: () => {
            setAgentMode('debug');
            setShowAIChat(true);
        },
    },
    {
        id: 'view.editor',
        label: 'Show Editor',
        category: 'View' as const,
        icon: <Code2 size={16} />,
        action: () => setActiveView('editor'),
    },
    {
        id: 'view.preview',
        label: 'Show Preview',
        category: 'View' as const,
        icon: <Eye size={16} />,
        action: () => setActiveView('preview'),
    },
    {
        id: 'settings.open',
        label: 'Open Settings',
        category: 'Settings' as const,
        icon: <SettingsIcon size={16} />,
        action: () => setActivityView('settings'),
    },
];

// 5. Add CommandPalette component before closing div (before </div> at the end):
<CommandPalette 
    isOpen={showCommandPalette}
    onClose={() => setShowCommandPalette(false)}
    commands={commands}
/>

// 6. Update imports to include createProject and git functions:
const { currentProjectPath, createMultipleFiles, openFiles, createProject } = useProjectStore();
const { currentBranch, changes, init, status } = useGitStore();
