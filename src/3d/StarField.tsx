import { Canvas } from "@react-three/fiber";
import { Stars, Sparkles } from "@react-three/drei";

export default function StarField() {
    return (
        <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none bg-background">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <Stars
                    radius={100}
                    depth={50}
                    count={5000}
                    factor={4}
                    saturation={0}
                    fade
                    speed={1}
                />
                <Sparkles
                    count={100}
                    scale={10}
                    size={2}
                    speed={0.3}
                    opacity={0.2}
                    color="#FF6F00"
                />
            </Canvas>
        </div>
    );
}
