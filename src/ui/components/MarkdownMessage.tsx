import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface MarkdownMessageProps {
    content: string;
    role: 'user' | 'assistant';
}

export default function MarkdownMessage({ content, role }: MarkdownMessageProps) {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <ReactMarkdown
            className="markdown-content"
            components={{
                // Code blocks with syntax highlighting
                code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');

                    return !inline && match ? (
                        <div className="relative group my-4">
                            {/* Language badge */}
                            <div className="flex items-center justify-between px-4 py-2 bg-[#1E1E1E] border-b border-white/10 rounded-t-lg">
                                <span className="text-xs font-mono text-zinc-400 uppercase">
                                    {match[1]}
                                </span>
                                <button
                                    onClick={() => copyCode(codeString)}
                                    className="flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                >
                                    {copiedCode === codeString ? (
                                        <>
                                            <Check size={12} />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={12} />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Code with syntax highlighting */}
                            <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                className="!mt-0 !rounded-t-none !rounded-b-lg"
                                customStyle={{
                                    margin: 0,
                                    padding: '1rem',
                                    fontSize: '14px',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    lineHeight: '1.5'
                                }}
                                {...props}
                            >
                                {codeString}
                            </SyntaxHighlighter>
                        </div>
                    ) : (
                        <code
                            className="px-1.5 py-0.5 bg-white/10 rounded text-sm font-mono text-blue-300"
                            {...props}
                        >
                            {children}
                        </code>
                    );
                },

                // Headings
                h1: ({ children }) => (
                    <h1 className="text-2xl font-bold mt-6 mb-4 text-white">
                        {children}
                    </h1>
                ),
                h2: ({ children }) => (
                    <h2 className="text-xl font-semibold mt-5 mb-3 text-white">
                        {children}
                    </h2>
                ),
                h3: ({ children }) => (
                    <h3 className="text-lg font-semibold mt-4 mb-2 text-white">
                        {children}
                    </h3>
                ),

                // Paragraphs
                p: ({ children }) => (
                    <p className="mb-3 leading-relaxed text-zinc-200">
                        {children}
                    </p>
                ),

                // Lists
                ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-3 space-y-1 text-zinc-200">
                        {children}
                    </ul>
                ),
                ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-3 space-y-1 text-zinc-200">
                        {children}
                    </ol>
                ),

                // Links
                a: ({ href, children }) => (
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline transition-colors"
                    >
                        {children}
                    </a>
                ),

                // Blockquotes
                blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-3 bg-blue-500/10 rounded-r text-zinc-300 italic">
                        {children}
                    </blockquote>
                ),

                // Strong/Bold
                strong: ({ children }) => (
                    <strong className="font-semibold text-white">
                        {children}
                    </strong>
                ),

                // Emphasis/Italic
                em: ({ children }) => (
                    <em className="italic text-zinc-300">
                        {children}
                    </em>
                )
            }}
        >
            {content}
        </ReactMarkdown>
    );
}
