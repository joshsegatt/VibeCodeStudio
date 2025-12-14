import { useEffect } from "react";
import { useAppStore } from "./stores/appStore";
import IDELayout from "./ui/layouts/IDELayout";
import { listen } from "@tauri-apps/api/event";
import { Toaster } from 'react-hot-toast';

function App() {
    const { setProgress, setStatus } = useAppStore();

    useEffect(() => {
        const unlisten = listen("download-progress", (event: any) => {
            const payload = event.payload as { percent: number; status: string };
            setProgress(payload.percent);
            setStatus(payload.status);
        });

        return () => {
            unlisten.then((fn) => fn());
        };
    }, [setProgress, setStatus]);

    return (
        <>
            <IDELayout />
            <Toaster />
        </>
    );
}

export default App;
