
export interface ModelConfig {
  id: string;
  name: string;
  role: string;
  description: string;
}

export const CuratedModels: ModelConfig[] = [
  {
    id: "qwen2.5-coder:1.5b",
    name: "VELOCITY",
    role: "Instant Prototyping",
    description: "The fastest engine for real-time UI scaffolding and rapid iteration.",
  },
  {
    id: "mistral-nemo",
    name: "INTELLIGENCE",
    role: "Architectural Reasoning",
    description: "Deep reasoning model for production-grade logic and complex state management.",
  },
];

export type ModelId = string;
