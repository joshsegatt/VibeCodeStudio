import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../../stores/appStore";
import { Terminal, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export default function WelcomeScreen() {
    const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'running' | 'not-running'>('checking');
    const setPhase = useAppStore((state) => state.setPhase);

    const checkOllama = async () => {
        setOllamaStatus('checking');
        try {
            // Mapping check_ollama_status to the command we registered
            const isRunning = await invoke<boolean>("check_ollama_status");
            setOllamaStatus(isRunning ? 'running' : 'not-running');
        } catch (error) {
            console.error("Ollama check failed:", error);
            setOllamaStatus('not-running');
        }
    };

    useEffect(() => {
        checkOllama();
        const interval = setInterval(checkOllama, 5000); // Auto-retry every 5s
        return () => clearInterval(interval);
    }, []);

    const handleContinue = () => {
        if (ollamaStatus === 'running') {
            setPhase('menu');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full relative z-10 p-8">
            <div className="max-w-2xl w-full text-center space-y-8">

                {/* Header */}
                <div className="space-y-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl mx-auto flex items-center justify-center mb-6 ring-1 ring-primary/50 shadow-[0_0_30px_rgba(255,111,0,0.3)]">
                        <Terminal size={32} className="text-primary" />
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter glow-text">
                        WELCOME TO VIBE
                    </h1>
                    <p className="text-xl text-gray-400 font-light">
                        The Local-First AI Engineering Environment
                    </p>
                </div>

                {/* Status Card */}
                <div className={`glass-panel p-8 rounded-2xl transition-all duration-500 ${ollamaStatus === 'running' ? 'border-green-500/30 bg-green-500/5' : 'border-white/10'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-white">System Check</h3>
                            <p className="text-sm text-gray-500">Verifying local inference engine...</p>
                        </div>
                        {ollamaStatus === 'checking' && <Loader2 className="animate-spin text-primary" />}
                        {ollamaStatus === 'running' && <CheckCircle2 className="text-green-500" size={28} />}
                        {ollamaStatus === 'not-running' && <AlertCircle className="text-red-500" size={28} />}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                            <div className="flex items-center space-x-3">
                                <span className="font-mono text-sm text-gray-300">Ollama Service</span>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${ollamaStatus === 'running' ? 'bg-green-500/20 text-green-400' :
                                    ollamaStatus === 'not-running' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                {ollamaStatus === 'running' ? 'OPERATIONAL' : ollamaStatus === 'not-running' ? 'NOT DETECTED' : 'CHECKING...'}
                            </span>
                        </div>
                    </div>

                    {ollamaStatus === 'not-running' && (
                        <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-left text-sm text-gray-300 space-y-2">
                            <p className="font-bold text-red-400">Action Required:</p>
                            <p>1. Ensure Ollama is installed (ollama.com).</p>
                            <p>2. Open your terminal and run <code className="bg-black/50 px-2 py-0.5 rounded text-white">ollama serve</code>.</p>
                            <button
                                onClick={checkOllama}
                                className="mt-2 text-xs text-white underline hover:text-primary transition-colors"
                            >
                                Retry Check
                            </button>
                        </div>
                    )}
                </div>

                {/* Continue Button */}
                <button
                    disabled={ollamaStatus !== 'running'}
                    onClick={handleContinue}
                    className="group relative w-full h-14 bg-white/5 hover:bg-primary hover:text-white rounded-xl border border-white/10 hover:border-primary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                    <div className="absolute inset-0 flex items-center justify-center space-x-2 font-bold tracking-widest uppercase text-sm">
                        <span>Enter Studio</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </button>

            </div>
        </div>
    );
}
