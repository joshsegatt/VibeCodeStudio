import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../../stores/appStore";
import { Terminal, Smartphone, Monitor } from "lucide-react";

export default function SafeFrame() {
    const generatedCode = useAppStore((state) => state.generatedCode);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [showConsole, setShowConsole] = useState(false);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

    useEffect(() => {
        if (iframeRef.current) {
            const doc = iframeRef.current.contentDocument;
            if (doc) {
                doc.open();
                doc.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <script>
                            tailwind.config = {
                                theme: {
                                    extend: {
                                        colors: {
                                            border: "hsl(var(--border))",
                                            input: "hsl(var(--input))",
                                            ring: "hsl(var(--ring))",
                                            background: "hsl(var(--background))",
                                            foreground: "hsl(var(--foreground))",
                                            primary: {
                                                DEFAULT: "hsl(var(--primary))",
                                                foreground: "hsl(var(--primary-foreground))",
                                            },
                                        }
                                    }
                                }
                            }
                        </script>
                        <style>
                            /* Hide scrollbar for Chrome, Safari and Opera */
                            ::-webkit-scrollbar {
                                display: none;
                            }
                        </style>
                        <script>
                            window.onerror = function(msg, source, lineno, colno, error) {
                                window.parent.postMessage({type: 'console-error', msg: msg + ' at line ' + lineno}, '*');
                            };
                            console.error = function(...args) {
                                    window.parent.postMessage({type: 'console-error', msg: args.join(' ')}, '*');
                            }
                        </script>
                    </head>
                    <body class="bg-transparent h-full w-full overflow-hidden">
                        ${generatedCode}
                    </body>
                    </html>
                `);
                doc.close();
            }
        }
    }, [generatedCode]);

    useEffect(() => {
        const handler = (e: MessageEvent) => {
            if (e.data && e.data.type === 'console-error') {
                setLogs(prev => [...prev, e.data.msg]);
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, []);

    return (
        <div className="w-full h-full relative flex flex-col bg-[#111] items-center">

            {/* Toolbar */}
            <div className="absolute top-4 z-20 flex space-x-2 bg-black/80 backdrop-blur border border-white/10 p-1 rounded-lg">
                <button
                    onClick={() => setViewMode('desktop')}
                    className={`p-2 rounded hover:bg-white/10 transition-colors ${viewMode === 'desktop' ? 'text-primary bg-white/10' : 'text-gray-400'}`}
                >
                    <Monitor size={16} />
                </button>
                <div className="w-px bg-white/10 h-6 self-center" />
                <button
                    onClick={() => setViewMode('mobile')}
                    className={`p-2 rounded hover:bg-white/10 transition-colors ${viewMode === 'mobile' ? 'text-primary bg-white/10' : 'text-gray-400'}`}
                >
                    <Smartphone size={16} />
                </button>
            </div>

            {/* Container */}
            <div className={`transition-all duration-500 ease-in-out relative flex-1 my-8 border border-white/10 bg-white shadow-2xl overflow-hidden ${viewMode === 'mobile' ? 'w-[375px] rounded-[30px]' : 'w-full rounded-none border-0'
                }`}>
                <iframe
                    ref={iframeRef}
                    className="w-full h-full"
                    sandbox="allow-scripts allow-same-origin"
                    title="Preview"
                />
            </div>

            {/* Console */}
            <div className={`absolute bottom-0 left-0 right-0 bg-black/90 text-white transition-all duration-300 border-t border-white/20 flex flex-col z-30 ${showConsole ? 'h-40' : 'h-8'}`}>
                <button
                    onClick={() => setShowConsole(!showConsole)}
                    className="h-8 flex items-center px-4 bg-white/5 hover:bg-white/10 w-full text-xs font-mono space-x-2"
                >
                    <Terminal size={12} className={logs.length > 0 ? "text-red-400" : "text-gray-400"} />
                    <span className="flex-1 text-left">CONSOLE {logs.length > 0 && `(${logs.length})`}</span>
                    <span className="text-gray-500">{showConsole ? '▼' : '▲'}</span>
                </button>
                {showConsole && (
                    <div className="flex-1 overflow-auto p-2 space-y-1 font-mono text-[10px] text-red-300">
                        {logs.length === 0 ? <span className="text-gray-500 italic">No errors detected.</span> : logs.map((log, i) => (
                            <div key={i} className="border-b border-white/5 pb-1">{log}</div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
