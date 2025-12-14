import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../../stores/appStore";
import { Terminal, Smartphone, Tablet, Monitor, Maximize2, Minimize2 } from "lucide-react";

type ViewMode = 'mobile' | 'tablet' | 'desktop';

export default function SmartPreview() {
    const generatedCode = useAppStore((state) => state.generatedCode);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [showConsole, setShowConsole] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('desktop');
    const [hasError, setHasError] = useState(false);
    const [runtimeError, setRuntimeError] = useState<string | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Auto-inject Tailwind and Error Handling
    useEffect(() => {
        if (!iframeRef.current) return;

        const doc = iframeRef.current.contentDocument;
        if (!doc) return;

        setHasError(false);
        setRuntimeError(null);
        setLogs([]);

        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
                <script>
                    tailwind.config = {
                        theme: {
                            extend: {
                                colors: {
                                    primary: '#FF6F00',
                                    secondary: '#1e293b'
                                }
                            }
                        }
                    }
                </script>
                <style>
                    body { background-color: white; color: black; margin: 0; }
                    /* Hide scrollbar for clean look */
                    ::-webkit-scrollbar { display: none; }
                </style>
                <script>
                    window.onerror = function(msg, source, lineno, colno, error) {
                        window.parent.postMessage({type: 'console-error', msg: msg + ' at line ' + lineno, level: 'error'}, '*');
                    };
                    console.error = function(...args) {
                        window.parent.postMessage({type: 'console-error', msg: args.join(' '), level: 'error'}, '*');
                    };
                    console.log = function(...args) {
                        window.parent.postMessage({type: 'console-log', msg: args.join(' '), level: 'info'}, '*');
                    };
                </script>
            </head>
            <body>
                ${generatedCode}
            </body>
            </html>
        `);
        doc.close();

    }, [generatedCode]);

    // Listen for Console Logs/Errors from Iframe
    useEffect(() => {
        const handler = (e: MessageEvent) => {
            if (!e.data) return;

            if (e.data.type === 'console-error') {
                setLogs(prev => [...prev, `[ERR] ${e.data.msg}`]);
                setHasError(true);
                setRuntimeError(e.data.msg);
                setShowConsole(true);
            } else if (e.data.type === 'console-log') {
                setLogs(prev => [...prev, `[LOG] ${e.data.msg}`]);
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, []);

    // Width calculation
    const getWidth = () => {
        if (isFullScreen) return '100%';
        switch (viewMode) {
            case 'mobile': return '375px';
            case 'tablet': return '768px';
            case 'desktop': return '100%';
        }
    };

    return (
        <div className={`w-full h-full relative flex flex-col bg-[#111] items-center ${isFullScreen ? 'fixed inset-0 z-50' : ''}`}>

            {/* Toolbar */}
            <div className="absolute top-4 z-20 flex space-x-2 bg-black/80 backdrop-blur border border-white/10 p-1 rounded-lg shadow-xl">
                <button
                    onClick={() => setViewMode('mobile')}
                    className={`p-2 rounded hover:bg-white/10 transition-colors ${viewMode === 'mobile' ? 'text-primary bg-white/10' : 'text-gray-400'}`}
                    title="Mobile (375px)"
                >
                    <Smartphone size={16} />
                </button>
                <button
                    onClick={() => setViewMode('tablet')}
                    className={`p-2 rounded hover:bg-white/10 transition-colors ${viewMode === 'tablet' ? 'text-primary bg-white/10' : 'text-gray-400'}`}
                    title="Tablet (768px)"
                >
                    <Tablet size={16} />
                </button>
                <button
                    onClick={() => setViewMode('desktop')}
                    className={`p-2 rounded hover:bg-white/10 transition-colors ${viewMode === 'desktop' ? 'text-primary bg-white/10' : 'text-gray-400'}`}
                    title="Desktop (Full)"
                >
                    <Monitor size={16} />
                </button>
                <div className="w-px bg-white/10 h-6 self-center" />
                <button
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className={`p-2 rounded hover:bg-white/10 transition-colors ${isFullScreen ? 'text-primary bg-white/10' : 'text-gray-400'}`}
                    title="Toggle Full Screen"
                >
                    {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
            </div>

            {/* Preview Container */}
            <div className={`transition-all duration-500 ease-in-out relative flex-1 my-8 border border-white/10 bg-white shadow-2xl overflow-hidden ${viewMode !== 'desktop' && !isFullScreen ? 'rounded-[30px] border-[8px] border-[#333]' : 'w-full rounded-none border-0'
                }`} style={{ width: getWidth(), margin: isFullScreen ? 0 : undefined, height: isFullScreen ? '100%' : undefined }}>

                {runtimeError && (
                    <div className="absolute inset-0 z-50 bg-red-900/90 text-white p-8 overflow-auto backdrop-blur-sm flex flex-col items-center justify-center text-center">
                        <Terminal size={48} className="mb-4 text-red-200" />
                        <h2 className="text-xl font-bold mb-2">Runtime Error</h2>
                        <code className="bg-black/50 p-4 rounded text-sm font-mono break-all max-w-full block">
                            {runtimeError}
                        </code>
                        <button
                            onClick={() => setRuntimeError(null)}
                            className="mt-6 px-4 py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors"
                        >
                            Dismiss Overlay
                        </button>
                    </div>
                )}

                <iframe
                    ref={iframeRef}
                    className="w-full h-full bg-white"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    title="Smart Preview"
                />
            </div>

            {/* Console Drawer */}
            <div className={`absolute bottom-0 left-0 right-0 bg-black/95 text-white transition-all duration-300 border-t border-white/20 flex flex-col z-40 ${showConsole ? 'h-48' : 'h-8'}`}>
                <button
                    onClick={() => setShowConsole(!showConsole)}
                    className="h-8 flex items-center px-4 bg-white/5 hover:bg-white/10 w-full text-xs font-mono space-x-2"
                >
                    <Terminal size={12} className={hasError ? "text-red-500" : "text-green-500"} />
                    <span className="flex-1 text-left">CONSOLE {logs.length > 0 && `(${logs.length})`}</span>
                    <span className="text-gray-500">{showConsole ? '▼' : '▲'}</span>
                </button>
                {showConsole && (
                    <div className="flex-1 overflow-auto p-2 space-y-1 font-mono text-[10px]">
                        {logs.length === 0 ? <span className="text-gray-600 italic">Console is empty. Vibe clean.</span> : logs.map((log, i) => (
                            <div key={i} className={`border-b border-white/5 pb-0.5 ${log.startsWith('[ERR]') ? 'text-red-400' : 'text-gray-300'}`}>
                                {log}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
