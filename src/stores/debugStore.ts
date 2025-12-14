import { create } from 'zustand';

interface Breakpoint {
    file: string;
    line: number;
}

interface DebugStore {
    breakpoints: Breakpoint[];
    isDebugging: boolean;
    currentLine: number | null;

    addBreakpoint: (file: string, line: number) => void;
    removeBreakpoint: (file: string, line: number) => void;
    toggleBreakpoint: (file: string, line: number) => void;
    startDebug: () => void;
    stopDebug: () => void;
}

export const useDebugStore = create<DebugStore>((set, get) => ({
    breakpoints: [],
    isDebugging: false,
    currentLine: null,

    addBreakpoint: (file, line) => {
        set((state) => ({
            breakpoints: [...state.breakpoints, { file, line }]
        }));
    },

    removeBreakpoint: (file, line) => {
        set((state) => ({
            breakpoints: state.breakpoints.filter(
                bp => !(bp.file === file && bp.line === line)
            )
        }));
    },

    toggleBreakpoint: (file, line) => {
        const { breakpoints } = get();
        const exists = breakpoints.some(bp => bp.file === file && bp.line === line);

        if (exists) {
            get().removeBreakpoint(file, line);
        } else {
            get().addBreakpoint(file, line);
        }
    },

    startDebug: () => set({ isDebugging: true }),
    stopDebug: () => set({ isDebugging: false, currentLine: null }),
}));
