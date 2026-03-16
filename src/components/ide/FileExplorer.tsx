import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight, ChevronDown, FileText, FileCode, FileJson, FileType,
  Image, File, Folder, FolderOpen, FilePlus, FolderPlus, Trash2, Pencil,
  SplitSquareHorizontal,
} from 'lucide-react';
import { useIDEStore } from '@/stores/ideStore';
import type { FileNode } from '@/types/ide';

const getFileIcon = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase();
  const size = 14;
  const sw = 1.5;
  switch (ext) {
    case 'tsx': case 'ts': return <FileCode size={size} strokeWidth={sw} className="text-accent-blue" />;
    case 'jsx': case 'js': return <FileCode size={size} strokeWidth={sw} className="text-accent-yellow" />;
    case 'css': return <FileType size={size} strokeWidth={sw} className="text-accent-purple" />;
    case 'json': return <FileJson size={size} strokeWidth={sw} className="text-accent-orange" />;
    case 'md': return <FileText size={size} strokeWidth={sw} className="text-text-secondary" />;
    case 'png': case 'jpg': case 'svg': return <Image size={size} strokeWidth={sw} className="text-accent-green" />;
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
    renameNode, deleteNode, createFile, createFolder,
  } = useIDEStore();
  const isExpanded = expandedFolders.has(node.id);
  const isSelected = selectedFileId === node.id;
  const isRenaming = renamingNodeId === node.id;
  const [creating, setCreating] = useState<'file' | 'folder' | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id, nodeType: node.type });
  };

  if (node.type === 'folder') {
    return (
      <>
        <button
          className={`file-tree-item w-full ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: depth * 12 + 8 }}
          onClick={() => toggleFolder(node.id)}
          onContextMenu={handleContextMenu}
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
          {/* Inline action buttons */}
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
  const { files, createFile, createFolder } = useIDEStore();
  const [creating, setCreating] = useState<'file' | 'folder' | null>(null);

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
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1">
        {files.map((node) => (
          <TreeItem key={node.id} node={node} depth={0} />
        ))}
      </div>
      <ContextMenu />
    </div>
  );
};

export default FileExplorer;
