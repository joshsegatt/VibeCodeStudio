import { useState, useEffect } from "react";
import { Sparkles, Download, Check, Zap, Brain, Server, ArrowRight, Info } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useAppStore } from "../../stores/appStore";

type OnboardingStep = 'welcome' | 'instructions' | 'provider' | 'models';
type Provider = 'ollama' | 'lmstudio';

const models = [
    { id: "qwen2.5-coder:1.5b", name: "Flash", description: "Protótipos instantâneos", size: "~900MB" },
    { id: "qwen2.5-coder:7b", name: "Balanced", description: "Equilíbrio perfeito", size: "~4.7GB" },
    { id: "deepseek-coder-v2:16b", name: "Intelligent", description: "Raciocínio complexo", size: "~9GB" },
];

export default function CinematicIntro() {
    const [step, setStep] = useState<OnboardingStep>('welcome');
    const [provider, setProvider] = useState<Provider>('ollama');
    const [ollamaReady, setOllamaReady] = useState(false);
    const [lmStudioUrl, setLmStudioUrl] = useState("http://localhost:1234");
    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [downloadStatus, setDownloadStatus] = useState("");
    const { setModel, setPhase, setProvider: setStoreProvider } = useAppStore();

    useEffect(() => {
        if (step === 'provider') {
            checkOllama();
        }
    }, [step]);

    useEffect(() => {
        // Listen for download progress
        const unlisten = listen('download-progress', (event: any) => {
            const payload = event.payload as { percent: number, status: string };
            setDownloadProgress(payload.percent);
            setDownloadStatus(payload.status);
        });

        return () => {
            unlisten.then(f => f());
        };
    }, []);

    const checkOllama = async () => {
        try {
            const status = await invoke<boolean>("check_ollama_status");
            setOllamaReady(status);
        } catch {
            setOllamaReady(false);
        }
    };

    const handleModelSelect = async (modelId: string) => {
        setSelectedModel(modelId);
        setDownloading(true);
        setDownloadProgress(0);
        setDownloadStatus("Iniciando download...");

        try {
            if (provider === 'ollama') {
                await invoke("download_model", { modelName: modelId });
                setModel(modelId as any);
                setTimeout(() => {
                    localStorage.setItem('onboarding_complete', 'true');
                    setPhase('studio');
                }, 800);
            }
            // LM Studio models are assumed to be already available or handled externally
            // For now, we only download for Ollama

        } catch (error) {
            console.error("Download failed:", error);
            setDownloading(false);
            setDownloadProgress(0);
        }
    };

    const handleProviderContinue = () => {
        // Save provider choice to store
        setStoreProvider(provider);

        if (provider === 'lmstudio') {
            // LM Studio: Skip model selection, go directly to studio
            setModel('lmstudio-model' as any);
            localStorage.setItem('onboarding_complete', 'true');
            setPhase('studio');
        } else {
            // Ollama: Go to model selection
            setStep('models');
        }
    };

    return (
        <div className="w-screen h-screen bg-studio-bg flex items-center justify-center antialiased">

            {/* Welcome Step */}
            {step === 'welcome' && (
                <div className="max-w-2xl text-center space-y-8 animate-fade-in px-8">
                    <div className="animate-pulse-glow">
                        <Sparkles size={72} className="text-white mx-auto" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-6xl font-bold text-white tracking-tighter">
                            Vibe Studio
                        </h1>
                        <p className="text-xl text-zinc-400 leading-relaxed">
                            Transforme ideias em código com inteligência artificial
                        </p>
                    </div>
                    <button
                        onClick={() => setStep('instructions')}
                        className="group flex items-center gap-3 mx-auto px-8 py-4 bg-white text-black rounded-2xl font-semibold shadow-2xl hover:shadow-white/20 transition-all hover:scale-105"
                    >
                        <span>Começar</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}

            {/* Instructions Step */}
            {step === 'instructions' && (
                <div className="max-w-4xl px-8 animate-fade-in">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-white tracking-tighter mb-3">
                            Como Funciona
                        </h2>
                        <p className="text-zinc-500">
                            Entenda o poder do Vibe Studio em 3 passos
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mb-12">
                        <div className="bg-studio-panel border border-studio-border rounded-2xl p-8 space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <span className="text-2xl font-bold text-blue-500">1</span>
                            </div>
                            <h3 className="text-xl font-bold text-white">Descreva</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Digite o que você quer criar na linguagem natural. Seja específico sobre cores, layout e funcionalidades.
                            </p>
                        </div>

                        <div className="bg-studio-panel border border-studio-border rounded-2xl p-8 space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <span className="text-2xl font-bold text-purple-500">2</span>
                            </div>
                            <h3 className="text-xl font-bold text-white">Gere</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                A IA processa sua descrição e gera código React + Tailwind CSS otimizado e pronto para produção.
                            </p>
                        </div>

                        <div className="bg-studio-panel border border-studio-border rounded-2xl p-8 space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <span className="text-2xl font-bold text-green-500">3</span>
                            </div>
                            <h3 className="text-xl font-bold text-white">Refine</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Visualize em tempo real, ajuste detalhes conversando com a IA e exporte quando estiver perfeito.
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mb-8">
                        <div className="flex gap-4">
                            <Info size={24} className="text-blue-400 flex-shrink-0 mt-1" />
                            <div className="space-y-2">
                                <h4 className="font-semibold text-white">Dicas para melhores resultados</h4>
                                <ul className="text-sm text-zinc-300 space-y-1 list-disc list-inside">
                                    <li>Use descrições detalhadas (ex: "card com gradiente azul e sombra suave")</li>
                                    <li>Especifique responsividade se necessário</li>
                                    <li>Peça iterações: "agora adicione um botão laranja no canto"</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={() => setStep('provider')}
                            className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-semibold shadow-2xl hover:shadow-white/20 transition-all hover:scale-105"
                        >
                            <span>Continuar</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Provider Selection */}
            {step === 'provider' && (
                <div className="max-w-4xl px-8 animate-fade-in">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-white tracking-tighter mb-3">
                            Escolha seu Provedor de IA
                        </h2>
                        <p className="text-zinc-500">
                            Conecte-se ao Ollama ou LM Studio local
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        {/* Ollama Option */}
                        <button
                            onClick={() => setProvider('ollama')}
                            className={`group relative p-8 rounded-3xl border-2 transition-all duration-300 text-left ${provider === 'ollama'
                                ? 'border-blue-500 bg-blue-500/10 shadow-2xl shadow-blue-500/20'
                                : 'border-studio-border bg-studio-panel hover:border-white/20'
                                }`}
                        >
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                        <Server size={28} className="text-white" />
                                    </div>
                                    {provider === 'ollama' && (
                                        <Check size={24} className="text-blue-500" />
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Ollama</h3>
                                    <p className="text-sm text-zinc-400 mb-4">
                                        Recomendado para iniciantes. Instalação simples e modelos otimizados.
                                    </p>
                                    {!ollamaReady && (
                                        <a
                                            href="https://ollama.ai/download"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                                        >
                                            <Download size={16} />
                                            <span>Baixar Ollama</span>
                                        </a>
                                    )}
                                    {ollamaReady && (
                                        <div className="flex items-center gap-2 text-sm text-green-400">
                                            <Check size={16} />
                                            <span>Conectado</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>

                        {/* LM Studio Option */}
                        <button
                            onClick={() => setProvider('lmstudio')}
                            className={`group relative p-8 rounded-3xl border-2 transition-all duration-300 text-left ${provider === 'lmstudio'
                                ? 'border-purple-500 bg-purple-500/10 shadow-2xl shadow-purple-500/20'
                                : 'border-studio-border bg-studio-panel hover:border-white/20'
                                }`}
                        >
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <Brain size={28} className="text-white" />
                                    </div>
                                    {provider === 'lmstudio' && (
                                        <Check size={24} className="text-purple-500" />
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">LM Studio</h3>
                                    <p className="text-sm text-zinc-400 mb-4">
                                        Para usuários avançados. Mais controle sobre modelos e parâmetros.
                                    </p>
                                    <input
                                        type="text"
                                        value={lmStudioUrl}
                                        onChange={(e) => setLmStudioUrl(e.target.value)}
                                        placeholder="http://localhost:1234"
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>
                        </button>
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={handleProviderContinue}
                            disabled={provider === 'ollama' && !ollamaReady}
                            className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-semibold shadow-2xl hover:shadow-white/20 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>{provider === 'lmstudio' ? 'Entrar no Studio' : 'Escolher Modelo'}</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Model Selection */}
            {step === 'models' && (
                <div className="max-w-5xl px-8 animate-fade-in">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-white tracking-tighter mb-3">
                            Selecione o Modelo
                        </h2>
                        <p className="text-zinc-500">
                            Cada modelo tem características únicas de velocidade e qualidade
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        {models.map((model, idx) => {
                            const gradients = [
                                'from-cyan-400 via-blue-500 to-indigo-600',
                                'from-purple-400 via-pink-500 to-rose-600',
                                'from-amber-400 via-orange-500 to-red-600'
                            ];
                            const gradient = gradients[idx];
                            const isSelected = selectedModel === model.id;
                            const isDownloading = isSelected && downloading;

                            return (
                                <button
                                    key={model.id}
                                    onClick={() => handleModelSelect(model.id)}
                                    disabled={downloading}
                                    className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${isSelected
                                        ? 'border-white/30 bg-white/5 shadow-2xl'
                                        : 'border-studio-border bg-studio-panel hover:border-white/10 hover:bg-white/5'
                                        } ${downloading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <div className="text-center space-y-4">
                                        {/* 3D Icon */}
                                        <div className="relative w-20 h-20 mx-auto">
                                            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity`} />
                                            <div className={`relative w-20 h-20 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform`}>
                                                <div className="text-4xl">
                                                    {idx === 0 ? '⚡' : idx === 1 ? '🧠' : '🚀'}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">
                                                {model.name}
                                            </h3>
                                            <p className="text-sm text-zinc-400 mb-1">
                                                {model.description}
                                            </p>
                                            <p className="text-xs text-zinc-600">
                                                {model.size}
                                            </p>
                                        </div>

                                        {/* Download Progress Overlay */}
                                        {isDownloading && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-2xl backdrop-blur-sm">
                                                <div className="w-full px-6 space-y-3">
                                                    <div className="text-white text-sm font-medium text-center">
                                                        Baixando modelo...
                                                    </div>
                                                    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-full bg-gradient-to-r ${gradient} transition-all duration-300`}
                                                            style={{ width: `${downloadProgress}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-zinc-400 text-xs text-center">
                                                        {downloadProgress}% - {downloadStatus}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
