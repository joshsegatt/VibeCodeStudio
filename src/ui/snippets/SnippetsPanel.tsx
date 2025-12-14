import { useState } from 'react';
import { Wand2, Code, FileCode, Sparkles } from 'lucide-react';

interface Snippet {
    id: string;
    name: string;
    description: string;
    code: string;
    language: string;
}

const DEFAULT_SNIPPETS: Snippet[] = [
    {
        id: 'react-component',
        name: 'React Component',
        description: 'Functional React component with TypeScript',
        language: 'typescript',
        code: `import { FC } from 'react';

interface Props {
  // Add props here
}

export const Component: FC<Props> = (props) => {
  return (
    <div>
      {/* Component content */}
    </div>
  );
};`
    },
    {
        id: 'async-function',
        name: 'Async Function',
        description: 'Async/await function with error handling',
        language: 'typescript',
        code: `async function fetchData() {
  try {
    const response = await fetch('API_URL');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}`
    },
    {
        id: 'zustand-store',
        name: 'Zustand Store',
        description: 'Zustand state management store',
        language: 'typescript',
        code: `import { create } from 'zustand';

interface State {
  // State properties
}

interface Actions {
  // Actions
}

export const useStore = create<State & Actions>((set) => ({
  // Initial state
  // Actions implementation
}));`
    }
];

export default function SnippetsPanel() {
    const [snippets] = useState<Snippet[]>(DEFAULT_SNIPPETS);
    const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);

    const insertSnippet = (snippet: Snippet) => {
        // Copy to clipboard
        navigator.clipboard.writeText(snippet.code);
        console.log('Snippet copied to clipboard:', snippet.name);
    };

    return (
        <div className="h-full flex flex-col bg-[#1E1E1E]">
            <div className="h-9 px-4 flex items-center border-b border-[#2D2D2D]">
                <Sparkles size={14} className="mr-2 text-blue-400" />
                <span className="text-xs font-semibold uppercase text-white">Snippets</span>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-2">
                {snippets.map(snippet => (
                    <div
                        key={snippet.id}
                        onClick={() => setSelectedSnippet(snippet)}
                        className="p-3 bg-[#252526] hover:bg-[#2D2D2D] rounded cursor-pointer border border-transparent hover:border-blue-500/30 transition-all"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Code size={14} className="text-blue-400" />
                            <span className="text-sm font-medium text-white">{snippet.name}</span>
                        </div>
                        <p className="text-xs text-zinc-400">{snippet.description}</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); insertSnippet(snippet); }}
                            className="mt-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                        >
                            Copy to Clipboard
                        </button>
                    </div>
                ))}
            </div>

            {selectedSnippet && (
                <div className="border-t border-[#2D2D2D] p-4">
                    <div className="text-xs text-zinc-500 mb-2">Preview:</div>
                    <pre className="text-xs text-zinc-300 bg-[#0D0D0D] p-2 rounded overflow-auto max-h-32">
                        {selectedSnippet.code}
                    </pre>
                </div>
            )}
        </div>
    );
}
