import React, { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';

// Self-host Monaco Editor worker
self.MonacoEnvironment = {
  getWorkerUrl: function () {
    return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
      self.MonacoEnvironment = {
        baseUrl: 'https://unpkg.com/monaco-editor@0.45.0/min/'
      };
      importScripts('https://unpkg.com/monaco-editor@0.45.0/min/vs/base/worker/workerMain.js');`
    )}`;
  }
};

// Configure Monaco Editor
monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: true,
  noSyntaxValidation: false,
});

monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: true,
  noSyntaxValidation: false,
});

const CodeEditor = ({ code, onChange, language }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const containerRef = useRef(null);

  const getMonacoLanguage = (lang) => {
    switch (lang) {
      case 'cpp':
      case 'c':
        return 'cpp';
      case 'py':
        return 'python';
      case 'js':
        return 'javascript';
      case 'java':
        return 'java';
      default:
        return 'cpp';
    }
  };

  useEffect(() => {
    if (editorRef.current && !monacoRef.current) {
      // Initialize Monaco Editor
      monacoRef.current = monaco.editor.create(editorRef.current, {
        value: code,
        language: getMonacoLanguage(language),
        theme: 'vs-dark',
        fontSize: 14,
        lineHeight: 20,
        fontFamily: '"Fira Code", "JetBrains Mono", "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        glyphMargin: false,
        folding: true,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 3,
        renderLineHighlight: 'line',
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: false,
        cursorStyle: 'line',
        automaticLayout: true,
        // Enable IDE features
        autoIndent: 'full',
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        autoSurround: 'languageDefined',
        bracketPairColorization: { enabled: true },
        formatOnPaste: true,
        formatOnType: true,
        tabCompletion: 'on',
        wordBasedSuggestions: true,
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'on',
        acceptSuggestionOnCommitCharacter: true,
        snippetSuggestions: 'top',
        quickSuggestions: {
          other: true,
          comments: true,
          strings: true
        },
        parameterHints: { enabled: true },
        hover: { enabled: true },
        contextmenu: true,
        mouseWheelZoom: true,
        multiCursorModifier: 'ctrlCmd',
        accessibilitySupport: 'auto',
        find: {
          addExtraSpaceOnTop: false,
          autoFindInSelection: 'never',
          seedSearchStringFromSelection: 'always'
        },
        padding: { top: 10, bottom: 10 }
      });

      // Add change listener
      monacoRef.current.onDidChangeModelContent(() => {
        const value = monacoRef.current.getValue();
        onChange(value);
      });

      // Add custom snippets for common patterns
      monaco.languages.registerCompletionItemProvider(getMonacoLanguage(language), {
        provideCompletionItems: () => {
          const suggestions = [];
          
          if (getMonacoLanguage(language) === 'cpp') {
            suggestions.push({
              label: 'main',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'int main() {\n    ${0}\n    return 0;\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Main function template'
            });
            suggestions.push({
              label: 'for',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n    ${0}\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'For loop template'
            });
            suggestions.push({
              label: 'while',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'while (${1:condition}) {\n    ${0}\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'While loop template'
            });
            suggestions.push({
              label: 'iostream',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '#include <iostream>\nusing namespace std;\n\n${0}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Include iostream with namespace'
            });
          }
          
          return { suggestions };
        }
      });

      // Focus the editor
      monacoRef.current.focus();
    }

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose();
        monacoRef.current = null;
      }
    };
  }, []);

  // Update editor content when code prop changes
  useEffect(() => {
    if (monacoRef.current && code !== monacoRef.current.getValue()) {
      const model = monacoRef.current.getModel();
      if (model) {
        model.setValue(code);
      }
    }
  }, [code]);

  // Update editor language when language prop changes
  useEffect(() => {
    if (monacoRef.current) {
      const model = monacoRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, getMonacoLanguage(language));
      }
    }
  }, [language]);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (monacoRef.current) {
        monacoRef.current.layout();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-gray-900 border-0"
      style={{ minHeight: '100%' }}
    >
      <div 
        ref={editorRef}
        className="w-full h-full"
        style={{ 
          height: '100%',
          minHeight: '400px'
        }}
      />
    </div>
  );
};

export default CodeEditor;
