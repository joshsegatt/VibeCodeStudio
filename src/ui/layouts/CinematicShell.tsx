import { ReactNode } from "react";
import StarField from "../../3d/StarField";
import TitleBar from "./TitleBar";

interface CinematicShellProps {
    children: ReactNode;
}

export default function CinematicShell({ children }: CinematicShellProps) {
    return (
        <div className="relative w-screen h-screen overflow-hidden text-white font-sans selection:bg-primary/30 bg-transparent flex items-center justify-center p-4">
            {/* 3D Background - Fixed to viewport */}
            <div className="fixed inset-0 z-0">
                <StarField />
            </div>

            {/* Main Application Window Container */}
            <div className="relative z-10 w-full h-full max-w-[1400px] max-h-[900px] flex flex-col bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/5">

                <TitleBar />

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden relative bg-black/50">
                    {children}
                </div>
            </div>
        </div>
    );
}
