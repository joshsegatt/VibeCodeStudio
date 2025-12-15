import { useEffect, useState, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useAppStore } from "../../stores/appStore";
import { useProjectStore } from "../../stores/projectStore";
import { useThemeStore } from "../../stores/themeStore";
import { useDebugStore } from "../../stores/debugStore";
import FindReplace from "../components/FindReplace";
import InlineCompletion, { useAICompletion } from "../completion/InlineCompletion";
import QuickEditModal from "../quickedit/QuickEditModal";

interface MonacoWrapperProps {
    initialValue?: string;
    filePath?: string;
    language?: string;
}

export default function MonacoWrapper({ initialValue, filePath, language = 'typescript' }: MonacoWrapperProps = {}) {
    const monaco = useMonaco();
    const generatedCode = useAppStore((state) => state.generatedCode);
    const setCode = useAppStore((state) => state.setCode);
    const { markFileDirty } = useProjectStore();
    const { currentTheme } = useThemeStore();
    const [showFindReplace, setShowFindReplace] = useState(false);
    const [showQuickEdit, setShowQuickEdit] = useState(false);
    const [selectedCode, setSelectedCode] = useState('');
    const editorRef = useRef<any>(null);
    const decorationsRef = useRef<string[]>([]);

    // AI Completion integration
    const { suggestion, position, acceptSuggestion, dismissSuggestion } = useAICompletion(
        editorRef.current,
        language
    );

    // Configure TypeScript language features
    useEffect(() => {
        if (!monaco) return;

        try {
            // TypeScript configuration
            const tsDefaults = (monaco.languages as any).typescript?.typescriptDefaults;

            if (tsDefaults) {
                tsDefaults.setCompilerOptions({
                    target: 99, // ES2020
                    allowNonTsExtensions: true,
                    moduleResolution: 2, // NodeJs
                    module: 99, // ESNext
                    noEmit: true,
                    esModuleInterop: true,
                    jsx: 2, // React
                    allowJs: true,
                    lib: ['es2020', 'dom'],
                });

                tsDefaults.setDiagnosticsOptions({
                    noSemanticValidation: false,
                    noSyntaxValidation: false,
                    noSuggestionDiagnostics: false,
                });

                console.log('✅ TypeScript IntelliSense enabled');
            }

            // JavaScript configuration
            const jsDefaults = (monaco.languages as any).typescript?.javascriptDefaults;

            if (jsDefaults) {
                jsDefaults.setCompilerOptions({
                    target: 99,
                    allowNonTsExtensions: true,
                    moduleResolution: 2,
                    module: 99,
                    noEmit: true,
                    esModuleInterop: true,
                    jsx: 2,
                    allowJs: true,
                    checkJs: true,
                    lib: ['es2020', 'dom'],
                });

                jsDefaults.setDiagnosticsOptions({
                    noSemanticValidation: false,
                    noSyntaxValidation: false,
                    noSuggestionDiagnostics: false,
                });

                console.log('✅ JavaScript IntelliSense enabled');
            }
        } catch (error) {
            console.log('ℹ️ Using Monaco default configuration');
        }
    }, [monaco]);

    // Configure Python and JSON support
    useEffect(() => {
        if (!monaco) return;

        // Python language configuration
        monaco.languages.registerCompletionItemProvider('python', {
            provideCompletionItems: (model, position) => ({
                suggestions: [
                    {
                        label: 'def',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'def ${1:function_name}(${2:params}):\n    ${3:pass}',
                        range: {
                            startLineNumber: position.lineNumber,
                            startColumn: position.column,
                            endLineNumber: position.lineNumber,
                            endColumn: position.column
                        }
                    },
                    {
                        label: 'class',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'class ${1:ClassName}:\n    ${2:pass}',
                        range: {
                            startLineNumber: position.lineNumber,
                            startColumn: position.column,
                            endLineNumber: position.lineNumber,
                            endColumn: position.column
                        }
                    },
                    {
                        label: 'if',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'if ${1:condition}:\n    ${2:pass}',
                        range: {
                            startLineNumber: position.lineNumber,
                            startColumn: position.column,
                            endLineNumber: position.lineNumber,
                            endColumn: position.column
                        }
                    },
                    {
                        label: 'for',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'for ${1:item} in ${2:items}:\n    ${3:pass}',
                        range: {
                            startLineNumber: position.lineNumber,
                            startColumn: position.column,
                            endLineNumber: position.lineNumber,
                            endColumn: position.column
                        }
                    },
                ]
            })
        });

        console.log('✅ Python support enabled');
        console.log('✅ JSON/YAML support enabled (built-in)');
    }, [monaco]);

    // Apply theme to Monaco
    useEffect(() => {
        if (monaco) {
            // Set Monaco theme based on current theme
            monaco.editor.setTheme(currentTheme.monacoTheme);
        }
    }, [monaco, currentTheme]);

    // Auto-scroll effect
    useEffect(() => {
        if (monaco && generatedCode) {
            const editors = monaco.editor.getEditors();
            if (editors.length > 0) {
                const editor = editors[0];
                const model = editor.getModel();
                if (model) {
                    const lineCount = model.getLineCount();
                    editor.revealLine(lineCount);
                }
            }
        }
    }, [generatedCode, monaco]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+F or Ctrl+F for find
            if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
                e.preventDefault();
                setShowFindReplace(true);
            }
            // Cmd+K or Ctrl+K for quick edit
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                const editor = editorRef.current;
                if (editor) {
                    const selection = editor.getSelection();
                    const model = editor.getModel();
                    if (model && selection) {
                        const code = model.getValueInRange(selection);
                        if (code) {
                            setSelectedCode(code);
                            setShowQuickEdit(true);
                        }
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;

        // Add breakpoint gutter click handler
        editor.onMouseDown((e: any) => {
            if (e.target.type === 2) { // GUTTER_GLYPH_MARGIN
                const { toggleBreakpoint } = useDebugStore.getState();
                const line = e.target.position.lineNumber;
                toggleBreakpoint(filePath || 'unknown', line);

                // Update decorations
                updateBreakpointDecorations(editor);
            }
        });
    };

    const updateBreakpointDecorations = (editor: any) => {
        const { breakpoints } = useDebugStore.getState();
        const fileBreakpoints = breakpoints.filter(bp => bp.file === filePath);

        const newDecorations = fileBreakpoints.map(bp => ({
            range: new (window as any).monaco.Range(bp.line, 1, bp.line, 1),
            options: {
                isWholeLine: true,
                linesDecorationsClassName: 'breakpoint-decoration',
                glyphMarginClassName: 'breakpoint-glyph'
            }
        }));

        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
    };

    return (
        <div className="w-full h-full relative">
            {/* Find & Replace Widget */}
            {showFindReplace && (
                <FindReplace
                    onClose={() => setShowFindReplace(false)}
                    editor={editorRef.current}
                />
            )}

            {showQuickEdit && (
                <QuickEditModal
                    isOpen={showQuickEdit}
                    onClose={() => setShowQuickEdit(false)}
                    selectedCode={selectedCode}
                    language={language}
                    onApply={(editedCode) => {
                        const editor = editorRef.current;
                        if (editor) {
                            const selection = editor.getSelection();
                            if (selection) {
                                editor.executeEdits('quick-edit', [{
                                    range: selection,
                                    text: editedCode
                                }]);
                            }
                        }
                    }}
                />
            )}
            <Editor
                height="100%"
                defaultLanguage="typescript"
                value={initialValue || generatedCode}
                onChange={(value) => {
                    setCode(value || "");
                    // Mark file as dirty when content changes
                    if (filePath && value !== initialValue) {
                        markFileDirty(filePath, true);
                    }
                }}
                onMount={(editor) => {
                    handleEditorDidMount(editor);
                    // Expose editor instance globally for Ctrl+S
                    (window as any).monacoEditorInstance = editor;
                }}
                theme={currentTheme.monacoTheme}
                options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: "on",
                    padding: { top: 16 },
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                    parameterHints: { enabled: true },
                    formatOnPaste: true,
                    formatOnType: true,
                }}
            />
        </div>
    );
}
