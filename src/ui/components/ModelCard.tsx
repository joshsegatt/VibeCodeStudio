import { ModelId, ModelConfig } from "../../config/models";
import { Zap, BrainCircuit, ArrowRight } from "lucide-react";

interface ModelCardProps {
    model: ModelConfig;
    onSelect: (id: ModelId) => void;
    disabled?: boolean;
    index: number;
}

export default function ModelCard({ model, onSelect, disabled, index }: ModelCardProps) {
    const isVelocity = index === 0;

    return (
        <button
            disabled={disabled}
            onClick={() => onSelect(model.id)}
            className={`group relative w-full h-full min-h-[400px] rounded-[32px] border transition-all duration-500 overflow-hidden flex flex-col justify-between p-10 text-left hover:scale-[1.01] active:scale-[0.99]
                ${isVelocity
                    ? 'bg-black/40 border-cyan-500/20 hover:border-cyan-500/50 hover:shadow-[0_0_50px_-10px_rgba(6,182,212,0.3)]'
                    : 'bg-black/40 border-purple-500/20 hover:border-purple-500/50 hover:shadow-[0_0_50px_-10px_rgba(168,85,247,0.3)]'
                }
            `}
        >
            {/* Background Gradients */}
            <div className={`absolute inset-0 opacity-20 transition-opacity duration-700 group-hover:opacity-40
                ${isVelocity
                    ? 'bg-gradient-to-br from-cyan-900/40 via-transparent to-transparent'
                    : 'bg-gradient-to-bl from-purple-900/40 via-transparent to-transparent'
                }
            `} />

            {/* Top Shine */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Header Content */}
            <div className="relative z-10 space-y-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border backdrop-blur-md transition-colors duration-500
                    ${isVelocity
                        ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black group-hover:scale-110'
                        : 'bg-purple-500/10 border-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-white group-hover:scale-110'
                    }
                `}>
                    {isVelocity ? <Zap size={32} strokeWidth={1.5} /> : <BrainCircuit size={32} strokeWidth={1.5} />}
                </div>

                <div>
                    <h2 className="text-4xl font-black tracking-tight text-white mb-2">
                        {model.name}
                    </h2>
                    <div className="flex items-center space-x-2">
                        <span className={`text-xs font-bold tracking-widest uppercase px-2 py-1 rounded bg-white/5 border border-white/10
                            ${isVelocity ? 'text-cyan-400' : 'text-purple-400'}
                        `}>
                            {model.role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Description & Action */}
            <div className="relative z-10 space-y-8 mt-12">
                <p className="text-gray-400 text-lg font-light leading-relaxed">
                    {model.description}
                </p>

                <div className="flex items-center space-x-4 group-hover:translate-x-2 transition-transform duration-300">
                    <span className={`text-sm font-bold tracking-wider uppercase flex items-center
                        ${isVelocity ? 'text-cyan-400' : 'text-purple-400'}
                    `}>
                        Deploy Engine <ArrowRight size={16} className="ml-2" />
                    </span>
                </div>
            </div>
        </button>
    );
}
