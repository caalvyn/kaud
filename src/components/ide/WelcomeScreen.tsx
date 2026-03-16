import React, { useRef } from 'react';
import { FolderOpen, Upload, FilePlus, Sparkles } from 'lucide-react';
import { useIDEStore } from '@/stores/ideStore';
import type { FileNode } from '@/types/ide';

const getLanguageFromName = (name: string): string => {
  const ext = name.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    css: 'css', json: 'json', md: 'markdown', html: 'html', py: 'python',
    rs: 'rust', go: 'go', yaml: 'yaml', yml: 'yaml', toml: 'toml',
    dockerfile: 'dockerfile', svelte: 'svelte',
  };
  return map[ext || ''] || 'plaintext';
};

const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve('');
    reader.readAsText(file);
  });

const buildTreeFromEntries = async (entries: FileSystemEntry[]): Promise<FileNode[]> => {
  const nodes: FileNode[] = [];

  const processEntry = async (entry: FileSystemEntry, parentPath: string): Promise<FileNode> => {
    const path = `${parentPath}/${entry.name}`;
    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry;
      const file = await new Promise<File>((resolve) => fileEntry.file(resolve));
      const content = await readFileAsText(file);
      return {
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: entry.name,
        type: 'file',
        path,
        language: getLanguageFromName(entry.name),
        content,
      };
    } else {
      const dirEntry = entry as FileSystemDirectoryEntry;
      const dirReader = dirEntry.createReader();
      const childEntries = await new Promise<FileSystemEntry[]>((resolve) => {
        dirReader.readEntries((entries) => resolve(entries));
      });
      const children = await Promise.all(childEntries.map((e) => processEntry(e, path)));
      return {
        id: `folder-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: entry.name,
        type: 'folder',
        path,
        children: children.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
          return a.name.localeCompare(b.name);
        }),
      };
    }
  };

  for (const entry of entries) {
    nodes.push(await processEntry(entry, ''));
  }
  return nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
};

const WelcomeScreen: React.FC = () => {
  const { importFiles, createFile } = useIDEStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleOpenFolder = async () => {
    // Try modern File System Access API first
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        const files = await readDirectoryHandle(dirHandle, '');
        importFiles(files);
        return;
      } catch (e) {
        // User cancelled or not supported
        if ((e as any)?.name === 'AbortError') return;
      }
    }
    // Fallback to input
    folderInputRef.current?.click();
  };

  const readDirectoryHandle = async (dirHandle: any, parentPath: string): Promise<FileNode[]> => {
    const nodes: FileNode[] = [];
    for await (const entry of dirHandle.values()) {
      const path = `${parentPath}/${entry.name}`;
      if (entry.kind === 'file') {
        const file = await entry.getFile();
        const content = await readFileAsText(file);
        nodes.push({
          id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: entry.name,
          type: 'file',
          path,
          language: getLanguageFromName(entry.name),
          content,
        });
      } else if (entry.kind === 'directory') {
        const children = await readDirectoryHandle(entry, path);
        nodes.push({
          id: `folder-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: entry.name,
          type: 'folder',
          path,
          children,
        });
      }
    }
    return nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const nodes: FileNode[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const content = await readFileAsText(file);
      nodes.push({
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        type: 'file',
        path: `/${file.name}`,
        language: getLanguageFromName(file.name),
        content,
      });
    }
    importFiles(nodes);
  };

  const handleFolderInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    // Build tree from webkitRelativePath
    const root: Record<string, FileNode> = {};
    const allFiles: { path: string; content: string; name: string }[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const content = await readFileAsText(file);
      allFiles.push({ path: (file as any).webkitRelativePath || file.name, content, name: file.name });
    }

    // Build tree structure
    const tree: FileNode[] = [];
    const folderMap = new Map<string, FileNode>();

    for (const f of allFiles) {
      const parts = f.path.split('/');
      let currentPath = '';

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isFile = i === parts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (isFile) {
          const fileNode: FileNode = {
            id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name: part,
            type: 'file',
            path: `/${currentPath}`,
            language: getLanguageFromName(part),
            content: f.content,
          };
          const parentPath = parts.slice(0, -1).join('/');
          const parent = folderMap.get(parentPath);
          if (parent) {
            parent.children!.push(fileNode);
          } else {
            tree.push(fileNode);
          }
        } else if (!folderMap.has(currentPath)) {
          const folderNode: FileNode = {
            id: `folder-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name: part,
            type: 'folder',
            path: `/${currentPath}`,
            children: [],
          };
          folderMap.set(currentPath, folderNode);
          const parentPath = parts.slice(0, i).join('/');
          const parent = parentPath ? folderMap.get(parentPath) : null;
          if (parent) {
            parent.children!.push(folderNode);
          } else {
            tree.push(folderNode);
          }
        }
      }
    }

    importFiles(tree);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const items = e.dataTransfer.items;
    if (!items) return;

    const entries: FileSystemEntry[] = [];
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry?.();
      if (entry) entries.push(entry);
    }

    if (entries.length > 0) {
      const nodes = await buildTreeFromEntries(entries);
      importFiles(nodes);
    }
  };

  const handleStartEmpty = () => {
    createFile('root', 'index.ts');
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-full w-full gap-8"
      style={{ background: 'hsl(var(--editor-bg))' }}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'hsl(var(--surface-2))' }}>
          <Sparkles size={28} className="text-text-tertiary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Welcome to KAUD</h2>
        <p className="text-xs text-text-tertiary max-w-xs text-center">
          Open a folder, import files, or start fresh. Drag & drop files anywhere to begin.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-64">
        <button
          onClick={handleOpenFolder}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all hover:brightness-110"
          style={{ background: 'hsl(var(--accent-blue))', color: 'hsl(var(--surface-0))' }}
        >
          <FolderOpen size={15} />
          Open Folder
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium text-text-secondary hover:text-foreground transition-all"
          style={{ background: 'hsl(var(--surface-2))', border: '1px solid hsl(var(--glass-border) / 0.3)' }}
        >
          <Upload size={15} />
          Import Files
        </button>

        <button
          onClick={handleStartEmpty}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium text-text-secondary hover:text-foreground transition-all"
          style={{ background: 'hsl(var(--surface-2))', border: '1px solid hsl(var(--glass-border) / 0.3)' }}
        >
          <FilePlus size={15} />
          Start Empty Project
        </button>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-text-tertiary mt-4">
        <span>
          <kbd className="px-1.5 py-0.5 rounded font-mono" style={{ background: 'hsl(var(--surface-2))', border: '1px solid hsl(var(--glass-border) / 0.3)' }}>⌘P</kbd>
          {' '}Command Palette
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded font-mono" style={{ background: 'hsl(var(--surface-2))', border: '1px solid hsl(var(--glass-border) / 0.3)' }}>⌘I</kbd>
          {' '}AI Chat
        </span>
      </div>

      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileInput} />
      <input ref={folderInputRef} type="file" multiple className="hidden" onChange={handleFolderInput} {...{ webkitdirectory: '', directory: '' } as any} />
    </div>
  );
};

export default WelcomeScreen;
