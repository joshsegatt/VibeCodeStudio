export interface FileEntry {
    path: string;
    content: string;
}

export interface ProjectStructure {
    name: string;
    description: string;
    files: FileEntry[];
}

export class ProjectParser {
    /**
     * Parse LLM response to extract project structure and files
     * Expected format:
     * 1. JSON structure block (optional)
     * 2. Multiple code blocks with file paths as comments
     */
    static parseResponse(response: string): ProjectStructure | null {
        const files: FileEntry[] = [];

        // Extract all code blocks with file paths
        // Pattern: // path/to/file.ext or # path/to/file.ext
        const codeBlockRegex = /```(\w+)?\n(?:\/\/|#)\s*(.+?)\n([\s\S]*?)```/g;

        let match;
        while ((match = codeBlockRegex.exec(response)) !== null) {
            const [, , filePath, content] = match;
            if (filePath && content) {
                files.push({
                    path: filePath.trim(),
                    content: content.trim()
                });
            }
        }

        // Alternative pattern: File path before code block
        const altPattern = /(?:File|Path):\s*`?([^`\n]+)`?\n```(\w+)?\n([\s\S]*?)```/g;
        while ((match = altPattern.exec(response)) !== null) {
            const [, filePath, , content] = match;
            if (filePath && content) {
                files.push({
                    path: filePath.trim(),
                    content: content.trim()
                });
            }
        }

        if (files.length === 0) {
            return null;
        }

        return {
            name: 'Generated Project',
            description: 'AI-generated project',
            files
        };
    }

    /**
     * Convert relative paths to absolute paths based on project root
     */
    static resolveFilePaths(structure: ProjectStructure, projectRoot: string): FileEntry[] {
        return structure.files.map(file => ({
            ...file,
            path: `${projectRoot}/${file.path}`.replace(/\\/g, '/')
        }));
    }

    /**
     * Group files by directory for better organization
     */
    static groupByDirectory(files: FileEntry[]): Map<string, FileEntry[]> {
        const grouped = new Map<string, FileEntry[]>();

        files.forEach(file => {
            const parts = file.path.split('/');
            const dir = parts.slice(0, -1).join('/') || '/';

            if (!grouped.has(dir)) {
                grouped.set(dir, []);
            }
            grouped.get(dir)!.push(file);
        });

        return grouped;
    }
}
