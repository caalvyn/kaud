import React from 'react';
import { useIDEStore } from '@/stores/ideStore';
import { Terminal, AlertTriangle, FileOutput, Bug } from 'lucide-react';
import TerminalPanel from './TerminalPanel';
import type { BottomPanelView } from '@/types/ide';

const panelTabs: { view: BottomPanelView; label: string; icon: React.ElementType }[] = [
  { view: 'terminal', label: 'Terminal', icon: Terminal },
  { view: 'problems', label: 'Problems', icon: AlertTriangle },
  { view: 'output', label: 'Output', icon: FileOutput },
  { view: 'debug', label: 'Debug Console', icon: Bug },
];

const BottomPanel: React.FC = () => {
  const { bottomPanelView, setBottomPanelView, problems } = useIDEStore();

  return (
    <div className="flex flex-col h-full" style={{ background: 'hsl(var(--panel-bg))' }}>
      <div className="flex items-center border-b border-border px-2 gap-0.5" style={{ height: 32 }}>
        {panelTabs.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => setBottomPanelView(view)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-sm transition-colors ${
              bottomPanelView === view
                ? 'text-foreground bg-surface-2'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            <Icon size={12} />
            {label}
            {view === 'problems' && problems.length > 0 && (
              <span className="ml-1 px-1 rounded-full text-[9px] font-bold bg-accent-orange text-primary-foreground">
                {problems.length}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        {bottomPanelView === 'terminal' && <TerminalPanel />}
        {bottomPanelView === 'problems' && (
          <div className="p-3 overflow-y-auto h-full space-y-1">
            {problems.map((p, i) => (
              <div key={i} className="flex items-start gap-2 text-xs py-1 px-2 rounded hover:bg-surface-2 transition-colors cursor-pointer">
                {p.severity === 'error' && <span className="text-accent-red mt-0.5">●</span>}
                {p.severity === 'warning' && <span className="text-accent-orange mt-0.5">●</span>}
                {p.severity === 'info' && <span className="text-accent-blue mt-0.5">●</span>}
                <div>
                  <span className="text-text-secondary">{p.message}</span>
                  <span className="text-text-tertiary ml-2">{p.file}:{p.line}:{p.col}</span>
                  <span className="text-text-tertiary ml-2">[{p.source}]</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {bottomPanelView === 'output' && (
          <div className="p-3 text-xs text-text-tertiary font-mono">
            [Info] Build completed successfully in 312ms{'\n'}
            [Info] Watching for file changes...
          </div>
        )}
        {bottomPanelView === 'debug' && (
          <div className="p-3 text-xs text-text-tertiary text-center">No active debug session</div>
        )}
      </div>
    </div>
  );
};

export default BottomPanel;
