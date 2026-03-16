import React from 'react';
import {
  ChevronRight, ChevronDown, FileText, FileCode, FileJson, FileType,
  Image, File, Folder, FolderOpen,
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

const TreeItem: React.FC<{ node: FileNode; depth: number }> = ({ node, depth }) => {
  const { expandedFolders, toggleFolder, openFile, selectedFileId } = useIDEStore();
  const isExpanded = expandedFolders.has(node.id);
  const isSelected = selectedFileId === node.id;

  if (node.type === 'folder') {
    return (
      <>
        <button
          className={`file-tree-item w-full ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: depth * 12 + 8 }}
          onClick={() => toggleFolder(node.id)}
        >
          {isExpanded
            ? <ChevronDown size={12} className="text-text-tertiary flex-shrink-0" />
            : <ChevronRight size={12} className="text-text-tertiary flex-shrink-0" />
          }
          {isExpanded
            ? <FolderOpen size={14} strokeWidth={1.5} className="text-accent-blue flex-shrink-0" />
            : <Folder size={14} strokeWidth={1.5} className="text-text-secondary flex-shrink-0" />
          }
          <span className="truncate">{node.name}</span>
        </button>
        {isExpanded && node.children?.map((child) => (
          <TreeItem key={child.id} node={child} depth={depth + 1} />
        ))}
      </>
    );
  }

  return (
    <button
      className={`file-tree-item w-full ${isSelected ? 'selected' : ''}`}
      style={{ paddingLeft: depth * 12 + 20 }}
      onClick={() => openFile(node)}
    >
      {getFileIcon(node.name)}
      <span className="truncate">{node.name}</span>
    </button>
  );
};

const FileExplorer: React.FC = () => {
  const { files } = useIDEStore();

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-semibold text-text-tertiary">
        Explorer
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1">
        {files.map((node) => (
          <TreeItem key={node.id} node={node} depth={0} />
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
