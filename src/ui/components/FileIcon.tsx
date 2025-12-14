import {
    FileText,
    FileCode,
    FileJson,
    FileImage,
    Settings,
    Database,
    Package,
    Braces,
    Code2,
    FileType,
    File
} from 'lucide-react';

interface FileIconProps {
    fileName: string;
    className?: string;
}

export function getFileIcon(fileName: string) {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    // TypeScript/JavaScript
    if (ext === 'ts' || ext === 'tsx') {
        return { icon: FileCode, color: 'text-blue-400' };
    }
    if (ext === 'js' || ext === 'jsx') {
        return { icon: FileCode, color: 'text-yellow-400' };
    }

    // Web
    if (ext === 'html' || ext === 'htm') {
        return { icon: Code2, color: 'text-orange-400' };
    }
    if (ext === 'css' || ext === 'scss' || ext === 'sass' || ext === 'less') {
        return { icon: Braces, color: 'text-blue-300' };
    }

    // Data formats
    if (ext === 'json') {
        return { icon: FileJson, color: 'text-yellow-300' };
    }
    if (ext === 'xml' || ext === 'yaml' || ext === 'yml' || ext === 'toml') {
        return { icon: FileType, color: 'text-purple-400' };
    }

    // Programming languages
    if (ext === 'py') {
        return { icon: FileCode, color: 'text-blue-500' };
    }
    if (ext === 'rs') {
        return { icon: FileCode, color: 'text-orange-500' };
    }
    if (ext === 'go') {
        return { icon: FileCode, color: 'text-cyan-400' };
    }
    if (ext === 'java') {
        return { icon: FileCode, color: 'text-red-400' };
    }
    if (ext === 'cpp' || ext === 'c' || ext === 'h' || ext === 'hpp') {
        return { icon: FileCode, color: 'text-blue-600' };
    }
    if (ext === 'rb') {
        return { icon: FileCode, color: 'text-red-500' };
    }
    if (ext === 'php') {
        return { icon: FileCode, color: 'text-purple-500' };
    }

    // Images
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext)) {
        return { icon: FileImage, color: 'text-green-400' };
    }

    // Config files
    if (['config', 'conf', 'env', 'ini'].includes(ext)) {
        return { icon: Settings, color: 'text-zinc-400' };
    }

    // Database
    if (['sql', 'db', 'sqlite', 'sqlite3'].includes(ext)) {
        return { icon: Database, color: 'text-cyan-500' };
    }

    // Package files
    if (['package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'Cargo.toml', 'Cargo.lock', 'go.mod', 'go.sum'].includes(fileName)) {
        return { icon: Package, color: 'text-green-500' };
    }

    // Markdown
    if (ext === 'md' || ext === 'mdx') {
        return { icon: FileText, color: 'text-blue-200' };
    }

    // Text files
    if (ext === 'txt' || ext === 'log') {
        return { icon: FileText, color: 'text-zinc-400' };
    }

    // Default
    return { icon: File, color: 'text-zinc-500' };
}

export default function FileIcon({ fileName, className = '' }: FileIconProps) {
    const { icon: Icon, color } = getFileIcon(fileName);

    return <Icon size={14} className={`${color} ${className}`} />;
}
