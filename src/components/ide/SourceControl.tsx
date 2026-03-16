import React from 'react';
import { Plus, Minus, Check, GitBranch } from 'lucide-react';
import { useIDEStore } from '@/stores/ideStore';

const statusColors: Record<string, string> = {
  modified: 'text-accent-orange',
  added: 'text-accent-green',
  deleted: 'text-accent-red',
  untracked: 'text-text-tertiary',
};

const statusLetters: Record<string, string> = {
  modified: 'M',
  added: 'A',
  deleted: 'D',
  untracked: 'U',
};

const SourceControl: React.FC = () => {
  const { gitChanges, gitBranch, stageFile, unstageFile } = useIDEStore();
  const staged = gitChanges.filter((c) => c.staged);
  const unstaged = gitChanges.filter((c) => !c.staged);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-semibold text-text-tertiary">
        Source Control
      </div>
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
          <GitBranch size={13} /> <span className="font-medium">{gitBranch}</span>
        </div>
        <input
          placeholder="Commit message"
          className="w-full px-2.5 py-1.5 rounded-md text-xs bg-surface-2 border-none outline-none text-foreground placeholder:text-text-tertiary font-sans"
        />
        <button className="w-full mt-2 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5">
          <Check size={13} /> Commit
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-1">
        {staged.length > 0 && (
          <div className="mb-2">
            <div className="px-3 py-1 text-[10px] uppercase tracking-widest font-semibold text-text-tertiary">
              Staged ({staged.length})
            </div>
            {staged.map((c) => (
              <button key={c.file} onClick={() => unstageFile(c.file)} className="file-tree-item w-full justify-between group">
                <span className="truncate text-text-secondary">{c.file}</span>
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] font-mono font-bold ${statusColors[c.status]}`}>{statusLetters[c.status]}</span>
                  <Minus size={12} className="opacity-0 group-hover:opacity-100 text-text-tertiary" />
                </div>
              </button>
            ))}
          </div>
        )}
        <div>
          <div className="px-3 py-1 text-[10px] uppercase tracking-widest font-semibold text-text-tertiary">
            Changes ({unstaged.length})
          </div>
          {unstaged.map((c) => (
            <button key={c.file} onClick={() => stageFile(c.file)} className="file-tree-item w-full justify-between group">
              <span className="truncate text-text-secondary">{c.file}</span>
              <div className="flex items-center gap-1">
                <span className={`text-[10px] font-mono font-bold ${statusColors[c.status]}`}>{statusLetters[c.status]}</span>
                <Plus size={12} className="opacity-0 group-hover:opacity-100 text-text-tertiary" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SourceControl;
