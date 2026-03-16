import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight, ChevronDown, FileText, FileCode, FileJson, FileType,
  Image, File, Folder, FolderOpen, FilePlus, FolderPlus, Trash2, Pencil,
  SplitSquareHorizontal, Link, Unlink, FolderSync,
} from 'lucide-react';
import { useIDEStore } from '@/stores/ideStore';
import type { FileNode } from '@/types/ide';
import { linkFolder, unlinkFolder, isLinked, getLinkedName, onLinkChange, syncAllFiles } from '@/lib/workspaceSync';

const getFileIcon = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase();
  const size = 14;
  const sw = 1.5;
  // Color-coded icons matching VS Code style
  switch (ext) {
    case 'ts': return <FileCode size={size} strokeWidth={sw} className="text-accent-blue" />;
    case 'tsx': return <FileCode size={size} strokeWidth={sw} className="text-accent-blue" />;
    case 'js': return <FileCode size={size} strokeWidth={sw} className="text-accent-yellow" />;
    case 'jsx': return <FileCode size={size} strokeWidth={sw} className="text-accent-yellow" />;
    case 'html': case 'htm': return <FileCode size={size} strokeWidth={sw} className="text-accent-orange" />;
    case 'css': return <FileType size={size} strokeWidth={sw} className="text-accent-purple" />;
    case 'scss': case 'sass': case 'less': return <FileType size={size} strokeWidth={sw} className="text-accent-purple" />;
    case 'json': return <FileJson size={size} strokeWidth={sw} className="text-accent-orange" />;
    case 'md': case 'mdx': return <FileText size={size} strokeWidth={sw} className="text-text-secondary" />;
    case 'txt': case 'log': return <FileText size={size} strokeWidth={sw} className="text-text-tertiary" />;
    case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg': case 'webp': case 'ico':
      return <Image size={size} strokeWidth={sw} className="text-accent-green" />;
    case 'py': return <FileCode size={size} strokeWidth={sw} className="text-accent-blue" />;
    case 'rb': return <FileCode size={size} strokeWidth={sw} className="text-accent-red" />;
    case 'go': return <FileCode size={size} strokeWidth={sw} className="text-accent-blue" />;
    case 'rs': return <FileCode size={size} strokeWidth={sw} className="text-accent-orange" />;
    case 'java': case 'kt': return <FileCode size={size} strokeWidth={sw} className="text-accent-red" />;
    case 'php': return <FileCode size={size} strokeWidth={sw} className="text-accent-purple" />;
    case 'c': case 'cpp': case 'h': return <FileCode size={size} strokeWidth={sw} className="text-accent-blue" />;
    case 'sh': case 'bash': case 'zsh': return <FileCode size={size} strokeWidth={sw} className="text-accent-green" />;
    case 'yml': case 'yaml': case 'toml': return <FileJson size={size} strokeWidth={sw} className="text-accent-red" />;
    case 'xml': return <FileCode size={size} strokeWidth={sw} className="text-accent-orange" />;
    case 'sql': return <FileCode size={size} strokeWidth={sw} className="text-accent-blue" />;
    case 'env': return <FileText size={size} strokeWidth={sw} className="text-accent-yellow" />;
    case 'gitignore': case 'eslintrc': case 'prettierrc': return <FileText size={size} strokeWidth={sw} className="text-text-tertiary" />;
    default: return <File size={size} strokeWidth={sw} className="text-text-tertiary" />;
  }
};

const InlineInput: React.FC<{ defaultValue: string; onSubmit: (val: string) => void; onCancel: () => void }> = ({ defaultValue, onSubmit, onCancel }) => {
  const [val, setVal] = useState(defaultValue);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  return (
    <input
      ref={ref}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && val.trim()) onSubmit(val.trim());
        if (e.key === 'Escape') onCancel();
      }}
      onBlur={() => { if (val.trim()) onSubmit(val.trim()); else onCancel(); }}
      className="bg-surface-2 text-xs text-foreground border border-accent-blue rounded px-1 py-0.5 outline-none w-full font-sans"
    />
  );
};

const TreeItem: React.FC<{ node: FileNode; depth: number }> = ({ node, depth }) => {
  const {
    expandedFolders, toggleFolder, openFile, openFileInSplit, selectedFileId,
    contextMenu, setContextMenu, renamingNodeId, setRenamingNodeId,
    renameNode, deleteNode, createFile, createFolder, moveNode,
  } = useIDEStore();
  const isExpanded = expandedFolders.has(node.id);
  const isSelected = selectedFileId === node.id;
  const isRenaming = renamingNodeId === node.id;
  const [creating, setCreating] = useState<'file' | 'folder' | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id, nodeType: node.type });
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', node.id);
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (node.type !== 'folder') return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== node.id && node.type === 'folder') {
      moveNode(draggedId, node.id);
    }
  };

  if (node.type === 'folder') {
    return (
      <>
        <button
          className={`file-tree-item w-full ${isSelected ? 'selected' : ''} ${dragOver ? 'ring-1 ring-accent-blue bg-accent-blue/10' : ''}`}
          style={{ paddingLeft: depth * 12 + 8 }}
          onClick={() => toggleFolder(node.id)}
          onContextMenu={handleContextMenu}
          draggable
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isExpanded
            ? <ChevronDown size={12} className="text-text-tertiary flex-shrink-0" />
            : <ChevronRight size={12} className="text-text-tertiary flex-shrink-0" />
          }
          {isExpanded
            ? <FolderOpen size={14} strokeWidth={1.5} className="text-accent-blue flex-shrink-0" />
            : <Folder size={14} strokeWidth={1.5} className="text-text-secondary flex-shrink-0" />
          }
          {isRenaming ? (
            <InlineInput
              defaultValue={node.name}
              onSubmit={(val) => renameNode(node.id, val)}
              onCancel={() => setRenamingNodeId(null)}
            />
          ) : (
            <span className="truncate">{node.name}</span>
          )}
          <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
            <button onClick={(e) => { e.stopPropagation(); setCreating('file'); if (!isExpanded) toggleFolder(node.id); }}
              className="p-0.5 hover:text-foreground text-text-tertiary" title="New File">
              <FilePlus size={12} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setCreating('folder'); if (!isExpanded) toggleFolder(node.id); }}
              className="p-0.5 hover:text-foreground text-text-tertiary" title="New Folder">
              <FolderPlus size={12} />
            </button>
          </div>
        </button>
        {isExpanded && node.children?.map((child) => (
          <TreeItem key={child.id} node={child} depth={depth + 1} />
        ))}
        {isExpanded && creating && (
          <div style={{ paddingLeft: (depth + 1) * 12 + 20 }} className="py-0.5 px-2">
            <InlineInput
              defaultValue={creating === 'file' ? 'untitled.ts' : 'new-folder'}
              onSubmit={(val) => {
                if (creating === 'file') createFile(node.id, val);
                else createFolder(node.id, val);
                setCreating(null);
              }}
              onCancel={() => setCreating(null)}
            />
          </div>
        )}
      </>
    );
  }

  return (
    <button
      className={`file-tree-item w-full group ${isSelected ? 'selected' : ''}`}
      style={{ paddingLeft: depth * 12 + 20 }}
      onClick={() => openFile(node)}
      onContextMenu={handleContextMenu}
      draggable
      onDragStart={handleDragStart}
    >
      {getFileIcon(node.name)}
      {isRenaming ? (
        <InlineInput
          defaultValue={node.name}
          onSubmit={(val) => renameNode(node.id, val)}
          onCancel={() => setRenamingNodeId(null)}
        />
      ) : (
        <span className="truncate flex-1">{node.name}</span>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); openFileInSplit(node); }}
        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-foreground text-text-tertiary flex-shrink-0"
        title="Open in split"
      >
        <SplitSquareHorizontal size={12} />
      </button>
    </button>
  );
};

const ContextMenu: React.FC = () => {
  const { contextMenu, setContextMenu, setRenamingNodeId, deleteNode, createFile, createFolder } = useIDEStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setContextMenu(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [setContextMenu]);

  if (!contextMenu) return null;

  const items = contextMenu.nodeType === 'folder'
    ? [
      { label: 'New File', icon: FilePlus, action: () => { createFile(contextMenu.nodeId, 'untitled.ts'); setContextMenu(null); } },
      { label: 'New Folder', icon: FolderPlus, action: () => { createFolder(contextMenu.nodeId, 'new-folder'); setContextMenu(null); } },
      { label: 'Rename', icon: Pencil, action: () => { setRenamingNodeId(contextMenu.nodeId); setContextMenu(null); } },
      { label: 'Delete', icon: Trash2, action: () => { deleteNode(contextMenu.nodeId); setContextMenu(null); }, destructive: true },
    ]
    : [
      { label: 'Rename', icon: Pencil, action: () => { setRenamingNodeId(contextMenu.nodeId); setContextMenu(null); } },
      { label: 'Delete', icon: Trash2, action: () => { deleteNode(contextMenu.nodeId); setContextMenu(null); }, destructive: true },
    ];

  return (
    <div
      ref={ref}
      className="fixed z-50 py-1 rounded-lg shadow-xl min-w-[160px] animate-fade-in"
      style={{
        left: contextMenu.x, top: contextMenu.y,
        background: 'hsl(var(--surface-1))',
        border: '1px solid hsl(var(--glass-border))',
        boxShadow: '0 8px 32px -8px hsl(var(--glass-shadow) / 0.6)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={item.action}
          className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-surface-2 transition-colors ${
            (item as any).destructive ? 'text-accent-red' : 'text-text-secondary hover:text-foreground'
          }`}
        >
          <item.icon size={13} />
          {item.label}
        </button>
      ))}
    </div>
  );
};

const FileExplorer: React.FC = () => {
  const { files, createFile, createFolder, moveNode } = useIDEStore();
  const [creating, setCreating] = useState<'file' | 'folder' | null>(null);
  const [rootDragOver, setRootDragOver] = useState(false);

  const handleRootDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setRootDragOver(true);
  };

  const handleRootDragLeave = () => setRootDragOver(false);

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setRootDragOver(false);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId) {
      moveNode(draggedId, 'root');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-text-tertiary">Explorer</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCreating('file')}
            className="p-1 text-text-tertiary hover:text-foreground transition-colors"
            title="New File"
          >
            <FilePlus size={13} />
          </button>
          <button
            onClick={() => setCreating('folder')}
            className="p-1 text-text-tertiary hover:text-foreground transition-colors"
            title="New Folder"
          >
            <FolderPlus size={13} />
          </button>
        </div>
      </div>
      {creating && (
        <div className="px-4 pb-1">
          <InlineInput
            defaultValue={creating === 'file' ? 'untitled.ts' : 'new-folder'}
            onSubmit={(val) => {
              if (creating === 'file') createFile('root', val);
              else createFolder('root', val);
              setCreating(null);
            }}
            onCancel={() => setCreating(null)}
          />
        </div>
      )}
      <div
        className={`flex-1 overflow-y-auto overflow-x-hidden py-1 ${rootDragOver ? 'ring-1 ring-inset ring-accent-blue/50 bg-accent-blue/5' : ''}`}
        onDragOver={handleRootDragOver}
        onDragLeave={handleRootDragLeave}
        onDrop={handleRootDrop}
      >
        {files.length === 0 && !creating ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--surface-2))' }}>
              <FolderOpen size={24} className="text-text-tertiary" />
            </div>
            <div>
              <p className="text-xs text-text-secondary font-medium mb-1">No files yet</p>
              <p className="text-[11px] text-text-tertiary leading-relaxed">
                Create new files and folders to start building your project.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => setCreating('file')}
                className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                style={{ background: 'hsl(var(--accent-blue))', color: 'hsl(var(--surface-0))' }}
              >
                <FilePlus size={13} />
                New File
              </button>
              <button
                onClick={() => setCreating('folder')}
                className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-foreground transition-colors"
                style={{ background: 'hsl(var(--surface-2))', border: '1px solid hsl(var(--glass-border) / 0.3)' }}
              >
                <FolderPlus size={13} />
                New Folder
              </button>
            </div>
          </div>
        ) : (
          files.map((node) => (
            <TreeItem key={node.id} node={node} depth={0} />
          ))
        )}
      </div>
      <ContextMenu />
    </div>
  );
};

export default FileExplorer;
