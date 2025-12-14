import { invoke } from '@tauri-apps/api/core';

export interface DocResult {
    documentation: string;
    type: 'jsdoc' | 'readme' | 'explanation';
}

export async function generateJSDoc(code: string, language: string = 'typescript'): Promise<string> {
    const prompt = `Generate JSDoc comments for this ${language} code. Include @param, @returns, and description.

Code:
\`\`\`${language}
${code}
\`\`\`

Provide only the JSDoc comment block, ready to paste above the code.`;

    try {
        const response = await invoke<string>('generate_text', {
            prompt,
            model: 'default'
        });

        return extractDocFromResponse(response);
    } catch (error) {
        console.error('JSDoc generation failed:', error);
        return '/** Generated documentation failed */';
    }
}

export async function generateREADME(projectPath: string, files: string[]): Promise<string> {
    const prompt = `Generate a professional README.md for this project.

Project path: ${projectPath}
Files: ${files.slice(0, 10).join(', ')}${files.length > 10 ? '...' : ''}

Include:
- Project title and description
- Installation instructions
- Usage examples
- Features list
- Tech stack

Keep it concise and professional.`;

    try {
        const response = await invoke<string>('generate_text', {
            prompt,
            model: 'default'
        });

        return response.trim();
    } catch (error) {
        console.error('README generation failed:', error);
        return '# Project\n\nGeneration failed.';
    }
}

export async function explainCode(code: string, language: string = 'typescript'): Promise<string> {
    const prompt = `Explain this ${language} code in simple terms. What does it do? How does it work?

Code:
\`\`\`${language}
${code}
\`\`\`

Provide a clear, concise explanation suitable for someone learning.`;

    try {
        const response = await invoke<string>('generate_text', {
            prompt,
            model: 'default'
        });

        return response.trim();
    } catch (error) {
        console.error('Code explanation failed:', error);
        return 'Explanation failed.';
    }
}

function extractDocFromResponse(response: string): string {
    const docMatch = response.match(/\/\*\*[\s\S]*?\*\//);
    if (docMatch) {
        return docMatch[0];
    }
    return response.trim();
}
