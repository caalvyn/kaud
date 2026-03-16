import React, { useEffect, useState } from 'react';
import { ShieldAlert, RotateCcw, X } from 'lucide-react';
import { loadFromIndexedDB, clearIndexedDB } from '@/hooks/useAutoSave';
import { useIDEStore } from '@/stores/ideStore';
import type { FileNode } from '@/types/ide';

const RecoveryPrompt: React.FC = () => {
  const [recoveryData, setRecoveryData] = useState<{ files: FileNode[]; timestamp: number } | null>(null);
  const [show, setShow] = useState(false);
  const { files, importFiles } = useIDEStore();

  useEffect(() => {
    // Only check on initial mount when workspace is empty
    if (files.length > 0) return;
    loadFromIndexedDB().then((data) => {
      if (data && data.files.length > 0) {
        setRecoveryData(data);
        setShow(true);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRecover = () => {
    if (recoveryData) {
      importFiles(recoveryData.files);
      clearIndexedDB();
    }
    setShow(false);
  };

  const handleDismiss = () => {
    clearIndexedDB();
    setShow(false);
  };

  if (!show || !recoveryData) return null;

  const timeAgo = getTimeAgo(recoveryData.timestamp);
  const fileCount = countFiles(recoveryData.files);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: 'hsl(var(--surface-0) / 0.7)', backdropFilter: 'blur(8px)' }}>
      <div
        className="rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl animate-fade-in"
        style={{
          background: 'hsl(var(--surface-1))',
          border: '1px solid hsl(var(--glass-border))',
        }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg flex-shrink-0" style={{ background: 'hsl(var(--accent-orange) / 0.15)' }}>
            <ShieldAlert size={20} className="text-accent-orange" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Recover unsaved work?</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              We found an auto-saved workspace from <span className="text-text-primary font-medium">{timeAgo}</span> with{' '}
              <span className="text-text-primary font-medium">{fileCount} file{fileCount !== 1 ? 's' : ''}</span>.
              Would you like to restore it?
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRecover}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ background: 'hsl(var(--accent-blue))', color: 'hsl(var(--surface-0))' }}
          >
            <RotateCcw size={13} />
            Restore workspace
          </button>
          <button
            onClick={handleDismiss}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-text-secondary transition-colors"
            style={{ background: 'hsl(var(--surface-2))', border: '1px solid hsl(var(--glass-border) / 0.3)' }}
          >
            <X size={13} />
            Discard
          </button>
        </div>
      </div>
    </div>
  );
};

function countFiles(nodes: FileNode[]): number {
  let count = 0;
  for (const n of nodes) {
    if (n.type === 'file') count++;
    if (n.children) count += countFiles(n.children);
  }
  return count;
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default RecoveryPrompt;
