import { invoke } from '@tauri-apps/api/core';

export type TestFramework = 'jest' | 'vitest' | 'mocha';

export interface TestResult {
    testCode: string;
    framework: TestFramework;
    coverage: string[];
}

export async function generateTests(
    code: string,
    language: string = 'typescript',
    framework: TestFramework = 'jest'
): Promise<TestResult> {
    const prompt = buildTestPrompt(code, language, framework);

    try {
        const response = await invoke<string>('generate_text', {
            prompt,
            model: 'default'
        });

        const testCode = extractCodeFromResponse(response);
        const coverage = extractCoverage(response);

        return {
            testCode,
            framework,
            coverage
        };
    } catch (error) {
        console.error('Test generation failed:', error);
        throw error;
    }
}

function buildTestPrompt(code: string, language: string, framework: TestFramework): string {
    return `Generate comprehensive unit tests for this ${language} code using ${framework}.

Code to test:
\`\`\`${language}
${code}
\`\`\`

Requirements:
- Use ${framework} syntax
- Test happy path
- Test edge cases
- Test error handling
- Include mock data if needed
- Add descriptive test names

Provide complete, runnable test code.`;
}

function extractCodeFromResponse(response: string): string {
    const codeBlockMatch = response.match(/```[\w]*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
        return codeBlockMatch[1].trim();
    }
    return response.trim();
}

function extractCoverage(response: string): string[] {
    const coverage: string[] = [];

    if (response.includes('happy path') || response.includes('normal case')) {
        coverage.push('Happy path');
    }
    if (response.includes('edge case')) {
        coverage.push('Edge cases');
    }
    if (response.includes('error') || response.includes('exception')) {
        coverage.push('Error handling');
    }

    return coverage.length > 0 ? coverage : ['Basic tests'];
}
