import React from 'react';
import { Download, FolderOpen, Trash2 } from 'lucide-react';
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

const exportAsZip = async (files: FileNode[]) => {
  // Simple manual ZIP is complex — export files individually in a folder structure via a combined text file
  // For a proper ZIP, we'd need JSZip. Instead, let's export each file individually or a single concatenated bundle.
  // We'll do individual file downloads for now, or a single JSON export.
  const allFiles = collectFiles(files);
  const exportData = JSON.stringify(allFiles, null, 2);
  downloadFile('kaud-workspace.json', exportData);
};

const SaveExportBar: React.FC = () => {
  const { files, tabs, rightTabs, markAllSaved, clearWorkspace } = useIDEStore();
  const hasModified = tabs.some(t => t.isModified) || rightTabs.some(t => t.isModified);
  const modifiedCount = [...tabs, ...rightTabs].filter(t => t.isModified).length;

  const handleExportAll = () => {
    exportAsZip(files);
    markAllSaved();
  };

  const handleExportCurrent = () => {
    const activeTab = tabs.find(t => t.id === useIDEStore.getState().activeTabId);
    if (!activeTab) return;
    const findFile = (nodes: FileNode[], id: string): FileNode | null => {
      for (const n of nodes) {
        if (n.id === id) return n;
        if (n.children) { const f = findFile(n.children, id); if (f) return f; }
      }
      return null;
    };
    const file = findFile(files, activeTab.fileId);
    if (file) {
      downloadFile(file.name, file.content || '');
    }
  };

  const handleClearWorkspace = () => {
    if (hasModified) {
      if (!confirm('You have unsaved changes. Clear workspace anyway?')) return;
    }
    clearWorkspace();
  };

  return (
    <div className="flex items-center gap-1.5 px-2">
      {hasModified && (
        <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
          style={{ background: 'hsl(var(--accent-orange) / 0.15)', color: 'hsl(var(--accent-orange))' }}>
          {modifiedCount} unsaved
        </span>
      )}
      <button
        onClick={handleExportCurrent}
        className="p-1 text-text-tertiary hover:text-foreground transition-colors"
        title="Download current file"
      >
        <Download size={13} />
      </button>
      <button
        onClick={handleExportAll}
        className="p-1 text-text-tertiary hover:text-foreground transition-colors"
        title="Export workspace as JSON"
      >
        <FolderOpen size={13} />
      </button>
      <button
        onClick={handleClearWorkspace}
        className="p-1 text-text-tertiary hover:text-accent-red transition-colors"
        title="Clear workspace"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
};

export default SaveExportBar;
