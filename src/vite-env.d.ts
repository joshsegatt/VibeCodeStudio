/// <reference types="vite/client" />
/// <reference types="node" />

// NodeJS namespace for browser environment
declare namespace NodeJS {
    type Timeout = number;
    type Timer = number;
}

// Monaco global for editor
declare const monaco: any;

// Module declarations for packages without types
declare module 'xterm' {
    export class Terminal {
        constructor(options?: any);
        open(container: HTMLElement): void;
        write(data: string): void;
        onData(callback: (data: string) => void): void;
        dispose(): void;
        loadAddon(addon: any): void;
    }
}

declare module 'xterm-addon-fit' {
    export class FitAddon {
        constructor();
        fit(): void;
    }
}

declare module 'react-syntax-highlighter' {
    import { Component } from 'react';
    export class Prism extends Component<any> { }
    export default class SyntaxHighlighter extends Component<any> { }
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
    export const vscDarkPlus: any;
}

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

// ReactMarkdown type overrides for flexible components
declare module 'react-markdown' {
    import { Component } from 'react';

    export interface Options {
        children: string;
        className?: string;
        components?: any;
        [key: string]: any;
    }

    export default class ReactMarkdown extends Component<Options> { }
}
