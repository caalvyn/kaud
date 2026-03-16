import React, { useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { useIDEStore } from '@/stores/ideStore';
import type { FileNode } from '@/types/ide';
import { FolderOpen, Sparkles } from 'lucide-react';

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

const MonacoEditor: React.FC = () => {
  const { tabs, activeTabId, files, updateFileContent } = useIDEStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  const activeFile = useMemo(() => {
    if (!activeTab) return null;
    return findFile(files, activeTab.fileId);
  }, [activeTab, files]);

  if (!activeTab || !activeFile) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6" style={{ background: 'hsl(var(--editor-bg))' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center glass-surface">
          <Sparkles size={28} className="text-text-tertiary" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-1">Lumina</h2>
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

  const langMap: Record<string, string> = {
    typescript: 'typescript',
    javascript: 'javascript',
    css: 'css',
    json: 'json',
    markdown: 'markdown',
    html: 'html',
    python: 'python',
  };

  return (
    <div className="h-full" style={{ background: 'hsl(var(--editor-bg))' }}>
      <Editor
        theme="vs-dark"
        language={langMap[activeFile.language || ''] || 'plaintext'}
        value={activeFile.content || ''}
        onChange={(value) => updateFileContent(activeFile.id, value || '')}
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

export default MonacoEditor;
