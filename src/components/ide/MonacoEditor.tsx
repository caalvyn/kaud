import React, { useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { useIDEStore } from '@/stores/ideStore';
import type { FileNode } from '@/types/ide';
import { FolderOpen, Sparkles, SplitSquareHorizontal } from 'lucide-react';
import EditorTabs from './EditorTabs';

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
}> = ({ fileId, files, onChange }) => {
  const file = useMemo(() => fileId ? findFile(files, fileId) : null, [fileId, files]);

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

  if (!activeTab) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6" style={{ background: 'hsl(var(--editor-bg))' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center glass-surface">
          <Sparkles size={28} className="text-text-tertiary" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-1">KAUD</h2>
          <p className="text-xs text-text-tertiary mb-6">Modern AI-Powered Code Editor</p>
        </div>
        <div className="flex flex-col items-center gap-2 text-xs">
          <div className="flex items-center gap-2 text-text-tertiary">
            <FolderOpen size={14} />
            <span>Open a file from the explorer to start editing</span>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <span className="text-text-tertiary">
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: 'hsl(var(--surface-2))', border: '1px solid hsl(var(--glass-border) / 0.3)' }}>⌘P</kbd>
              {' '}Command Palette
            </span>
            <span className="text-text-tertiary">
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: 'hsl(var(--surface-2))', border: '1px solid hsl(var(--glass-border) / 0.3)' }}>⌘I</kbd>
              {' '}AI Chat
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Split toggle */}
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
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left pane */}
        <div className={`${splitEditorOpen ? 'w-1/2 border-r border-border' : 'w-full'} overflow-hidden`}>
          <EditorPane fileId={activeTab?.fileId || null} files={files} onChange={updateFileContent} />
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
              <EditorPane fileId={activeRightTab?.fileId || null} files={files} onChange={updateFileContent} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonacoEditor;
