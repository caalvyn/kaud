import React, { useMemo, useRef, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useIDEStore } from '@/stores/ideStore';
import type { FileNode } from '@/types/ide';
import { SplitSquareHorizontal } from 'lucide-react';
import EditorTabs from './EditorTabs';
import EditorToolbar from './EditorToolbar';
import WelcomeScreen from './WelcomeScreen';
import type { editor as monacoEditor } from 'monaco-editor';

const findFile = (nodes: FileNode[], id: string): FileNode | null => {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const f = findFile(n.children, id);
      if (f) return f;
    }
  }
  return null;
};

const langMap: Record<string, string> = {
  typescript: 'typescript', javascript: 'javascript', css: 'css',
  json: 'json', markdown: 'markdown', html: 'html', python: 'python',
  rust: 'rust', go: 'go', dockerfile: 'dockerfile', svelte: 'svelte',
};

const EditorPane: React.FC<{
  fileId: string | null;
  files: FileNode[];
  onChange: (fileId: string, content: string) => void;
  editorRef: React.MutableRefObject<monacoEditor.IStandaloneCodeEditor | null>;
}> = ({ fileId, files, onChange, editorRef }) => {
  const file = useMemo(() => fileId ? findFile(files, fileId) : null, [fileId, files]);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full text-text-tertiary text-xs" style={{ background: 'hsl(var(--editor-bg))' }}>
        No file selected
      </div>
    );
  }

  return (
    <div className="h-full" style={{ background: 'hsl(var(--editor-bg))' }}>
      <Editor
        theme="vs-dark"
        language={langMap[file.language || ''] || 'plaintext'}
        value={file.content || ''}
        onChange={(value) => onChange(file.id, value || '')}
        onMount={handleMount}
        options={{
          fontSize: 13,
          fontFamily: "var(--font-mono)",
          fontLigatures: true,
          lineHeight: 20,
          minimap: { enabled: true, scale: 1 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          renderLineHighlight: 'gutter',
          padding: { top: 12, bottom: 12 },
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true, indentation: true },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
        }}
      />
    </div>
  );
};

const MonacoEditor: React.FC = () => {
  const {
    tabs, activeTabId, rightTabs, activeRightTabId,
    files, updateFileContent, splitEditorOpen, toggleSplitEditor,
    setActiveTab, closeTab, setActiveRightTab, closeRightTab,
  } = useIDEStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activeRightTab = rightTabs.find((t) => t.id === activeRightTabId);
  const leftEditorRef = useRef<monacoEditor.IStandaloneCodeEditor | null>(null);
  const rightEditorRef = useRef<monacoEditor.IStandaloneCodeEditor | null>(null);

  const handleToolbarAction = useCallback((action: string) => {
    // Use whichever editor was last focused, default to left
    const editor = leftEditorRef.current;
    if (!editor) return;

    switch (action) {
      case 'undo':
        editor.trigger('toolbar', 'undo', null);
        break;
      case 'redo':
        editor.trigger('toolbar', 'redo', null);
        break;
      case 'cut':
        editor.focus();
        document.execCommand('cut');
        break;
      case 'copy':
        editor.focus();
        document.execCommand('copy');
        break;
      case 'paste':
        editor.focus();
        navigator.clipboard.readText().then((text) => {
          editor.trigger('toolbar', 'paste', null);
          const selection = editor.getSelection();
          if (selection) {
            editor.executeEdits('toolbar', [{ range: selection, text }]);
          }
        }).catch(() => {});
        break;
      case 'selectAll':
        editor.trigger('toolbar', 'editor.action.selectAll', null);
        break;
      case 'find':
        editor.trigger('toolbar', 'actions.find', null);
        break;
      case 'replace':
        editor.trigger('toolbar', 'editor.action.startFindReplaceAction', null);
        break;
      case 'indent':
        editor.trigger('toolbar', 'editor.action.indentLines', null);
        break;
      case 'outdent':
        editor.trigger('toolbar', 'editor.action.outdentLines', null);
        break;
      case 'toggleWordWrap':
        editor.trigger('toolbar', 'editor.action.toggleWordWrap', null);
        break;
      case 'format':
        editor.trigger('toolbar', 'editor.action.formatDocument', null);
        break;
      case 'commentLine':
        editor.trigger('toolbar', 'editor.action.commentLine', null);
        break;
    }
    editor.focus();
  }, []);

  if (!activeTab) {
    return <WelcomeScreen />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tabs row */}
      <div className="flex items-center justify-between" style={{ background: 'hsl(var(--tab-inactive))' }}>
        <div className="flex items-center flex-1 overflow-x-auto">
          <EditorTabs tabs={tabs} activeTabId={activeTabId} onSelect={setActiveTab} onClose={closeTab} />
        </div>
        <button
          onClick={toggleSplitEditor}
          className={`px-2 py-1.5 text-text-tertiary hover:text-foreground transition-colors flex-shrink-0 ${splitEditorOpen ? 'text-accent-blue' : ''}`}
          title="Split Editor"
        >
          <SplitSquareHorizontal size={14} />
        </button>
      </div>

      {/* Editor toolbar */}
      <EditorToolbar onAction={handleToolbarAction} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left pane */}
        <div className={`${splitEditorOpen ? 'w-1/2 border-r border-border' : 'w-full'} overflow-hidden`}>
          <EditorPane fileId={activeTab?.fileId || null} files={files} onChange={updateFileContent} editorRef={leftEditorRef} />
        </div>

        {/* Right pane */}
        {splitEditorOpen && (
          <div className="w-1/2 flex flex-col overflow-hidden">
            {rightTabs.length > 0 && (
              <div className="flex items-center overflow-x-auto" style={{ background: 'hsl(var(--tab-inactive))' }}>
                <EditorTabs tabs={rightTabs} activeTabId={activeRightTabId} onSelect={setActiveRightTab} onClose={closeRightTab} />
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <EditorPane fileId={activeRightTab?.fileId || null} files={files} onChange={updateFileContent} editorRef={rightEditorRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonacoEditor;
