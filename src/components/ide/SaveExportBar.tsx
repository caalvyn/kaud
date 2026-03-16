import React, { useState, useEffect, useCallback } from 'react';
import { Download, FolderDown, Save, Check, Trash2 } from 'lucide-react';
import JSZip from 'jszip';
import { useIDEStore } from '@/stores/ideStore';
import type { FileNode } from '@/types/ide';

const collectFiles = (nodes: FileNode[], prefix = ''): { path: string; content: string }[] => {
  const result: { path: string; content: string }[] = [];
  for (const node of nodes) {
    const path = prefix ? `${prefix}/${node.name}` : node.name;
    if (node.type === 'file') {
      result.push({ path, content: node.content || '' });
    } else if (node.children) {
      result.push(...collectFiles(node.children, path));
    }
  }
  return result;
};

const getMimeType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    js: 'application/javascript', ts: 'application/typescript',
    jsx: 'text/jsx', tsx: 'text/tsx',
    json: 'application/json', html: 'text/html', htm: 'text/html',
    css: 'text/css', scss: 'text/x-scss', less: 'text/x-less',
    xml: 'application/xml', svg: 'image/svg+xml',
    md: 'text/markdown', txt: 'text/plain',
    py: 'text/x-python', rb: 'text/x-ruby',
    sh: 'application/x-sh', yaml: 'text/yaml', yml: 'text/yaml',
  };
  return mimeMap[ext || ''] || 'text/plain';
};

const downloadFile = (filename: string, content: string) => {
  const blob = new Blob([content], { type: getMimeType(filename) });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const findFileById = (nodes: FileNode[], id: string): FileNode | null => {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) { const f = findFileById(n.children, id); if (f) return f; }
  }
  return null;
};

const SaveExportBar: React.FC = () => {
  const { files, tabs, rightTabs, markAllSaved, clearWorkspace, activeTabId } = useIDEStore();
  const hasModified = tabs.some(t => t.isModified) || rightTabs.some(t => t.isModified);
  const modifiedCount = [...tabs, ...rightTabs].filter(t => t.isModified).length;
  const [showSaved, setShowSaved] = useState(false);

  const handleSaveCurrent = useCallback(() => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab) return;
    const file = findFileById(files, activeTab.fileId);
    if (file) {
      downloadFile(file.name, file.content || '');
      setShowSaved(true);
    }
  }, [tabs, activeTabId, files]);

  const handleExportAll = async () => {
    const allFiles = collectFiles(files);
    if (allFiles.length === 0) return;

    // Create a zip with proper folder structure
    const zip = new JSZip();
    for (const file of allFiles) {
      zip.file(file.path, file.content);
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workspace.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    markAllSaved();
    setShowSaved(true);
  };

  const handleClearWorkspace = () => {
    if (hasModified) {
      if (!confirm('You have unsaved changes. Clear workspace anyway?')) return;
    }
    clearWorkspace();
  };

  // Ctrl+S shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveCurrent();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSaveCurrent]);

  // Flash "Saved!" indicator
  useEffect(() => {
    if (showSaved) {
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSaved]);

  return (
    <div className="flex items-center gap-1.5 px-2">
      {/* Saved flash */}
      {showSaved && (
        <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium animate-fade-in"
          style={{ background: 'hsl(var(--accent-green) / 0.15)', color: 'hsl(var(--accent-green))' }}>
          <Check size={10} /> Saved
        </span>
      )}

      {/* Unsaved indicator */}
      {hasModified && !showSaved && (
        <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
          style={{ background: 'hsl(var(--accent-orange) / 0.15)', color: 'hsl(var(--accent-orange))' }}>
          {modifiedCount} unsaved
        </span>
      )}

      {/* Save current file */}
      <button
        onClick={handleSaveCurrent}
        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors"
        style={{ color: 'hsl(0 0% 100% / 0.85)' }}
        title="Save current file (Ctrl+S)"
      >
        <Save size={12} />
        <span className="hidden sm:inline">Save</span>
      </button>

      {/* Export all */}
      <button
        onClick={handleExportAll}
        className="p-1 transition-colors"
        style={{ color: 'hsl(0 0% 100% / 0.65)' }}
        title="Export all files"
      >
        <FolderDown size={13} />
      </button>

      {/* Clear workspace */}
      <button
        onClick={handleClearWorkspace}
        className="p-1 transition-colors hover:text-accent-red"
        style={{ color: 'hsl(0 0% 100% / 0.45)' }}
        title="Clear workspace"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
};

export default SaveExportBar;
