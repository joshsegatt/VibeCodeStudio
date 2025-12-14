import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useProjectStore } from '../../stores/projectStore';

interface TerminalProps {
    terminalId?: string;
    onClose?: () => void;
}

export default function Terminal({ terminalId = '1' }: TerminalProps) {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTerm | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const currentCommandRef = useRef(''); // Use ref instead of state for immediate updates
    const { currentProjectPath } = useProjectStore();

    useEffect(() => {
        if (!terminalRef.current) return;

        // Initialize xterm
        const term = new XTerm({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Consolas, "Courier New", monospace',
            theme: {
                background: '#1E1E1E',
                foreground: '#CCCCCC',
                cursor: '#FFFFFF',
                black: '#000000',
                red: '#CD3131',
                green: '#0DBC79',
                yellow: '#E5E510',
                blue: '#2472C8',
                magenta: '#BC3FBC',
                cyan: '#11A8CD',
                white: '#E5E5E5',
                brightBlack: '#666666',
                brightRed: '#F14C4C',
                brightGreen: '#23D18B',
                brightYellow: '#F5F543',
                brightBlue: '#3B8EEA',
                brightMagenta: '#D670D6',
                brightCyan: '#29B8DB',
                brightWhite: '#E5E5E5',
            },
            rows: 20,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();

        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        // Get shell info
        invoke<string>('get_shell_info').then(shell => {
            term.writeln(`\x1b[1;32m${shell}\x1b[0m - Vibe Studio Terminal ${terminalId}`);
            term.writeln(`Working directory: ${currentProjectPath || 'No project open'}`);
            term.writeln('');
            writePrompt(term);
        });

        // Handle input
        term.onData((data) => {
            const code = data.charCodeAt(0);

            if (code === 13) { // Enter
                term.writeln('');
                if (currentCommandRef.current.trim()) {
                    executeCommand(currentCommandRef.current.trim(), term);
                    currentCommandRef.current = '';
                } else {
                    writePrompt(term);
                }
            } else if (code === 127) { // Backspace
                if (currentCommandRef.current.length > 0) {
                    currentCommandRef.current = currentCommandRef.current.slice(0, -1);
                    term.write('\b \b');
                }
            } else if (code >= 32) { // Printable characters
                currentCommandRef.current += data;
                term.write(data);
            }
        });

        // Listen for output events
        const unlistenOutput = listen('terminal-output', (event: any) => {
            term.writeln(event.payload);
        });

        const unlistenError = listen('terminal-error', (event: any) => {
            term.writeln(`\x1b[1;31m${event.payload}\x1b[0m`);
        });

        const unlistenExit = listen('terminal-exit', (event: any) => {
            const code = event.payload as number;
            if (code !== 0) {
                term.writeln(`\x1b[1;31mProcess exited with code ${code}\x1b[0m`);
            }
            writePrompt(term);
        });

        // Handle resize
        const handleResize = () => {
            fitAddon.fit();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            unlistenOutput.then(fn => fn());
            unlistenError.then(fn => fn());
            unlistenExit.then(fn => fn());
            term.dispose();
        };
    }, [currentProjectPath]);

    const writePrompt = (term: XTerm) => {
        const cwd = currentProjectPath?.split(/[/\\]/).pop() || '~';
        term.write(`\x1b[1;34m${cwd}\x1b[0m > `);
    };

    const executeCommand = async (command: string, term: XTerm) => {
        const cwd = currentProjectPath || 'C:\\Users\\josh\\Desktop';

        try {
            await invoke('execute_command', {
                command,
                cwd
            });
        } catch (error) {
            term.writeln(`\x1b[1;31mError: ${error}\x1b[0m`);
            writePrompt(term);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#1E1E1E]">
            {/* Terminal Content - No header, managed by TerminalManager */}
            <div ref={terminalRef} className="flex-1 p-2" />
        </div>
    );
}
