import React from 'react';
import { Minus, Square, X, Sparkles } from 'lucide-react';

const TitleBar: React.FC = () => {
  return (
    <div
      className="flex items-center justify-between select-none"
      style={{
        height: 38,
        background: 'hsl(var(--titlebar-bg))',
        borderBottom: '1px solid hsl(var(--glass-border) / 0.3)',
      }}
    >
      <div className="flex items-center gap-2 pl-4">
        <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(0, 65%, 55%)' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(45, 80%, 55%)' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(145, 55%, 48%)' }} />
      </div>

      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <Sparkles size={12} className="text-accent-blue" />
        <span className="font-medium tracking-wide">Lumina</span>
        <span className="text-text-tertiary">—</span>
        <span className="text-text-tertiary">lumina-project</span>
      </div>

      <div className="flex items-center">
        <button className="px-3 py-2 text-text-tertiary hover:text-foreground hover:bg-surface-2 transition-colors">
          <Minus size={14} />
        </button>
        <button className="px-3 py-2 text-text-tertiary hover:text-foreground hover:bg-surface-2 transition-colors">
          <Square size={12} />
        </button>
        <button className="px-3 py-2 text-text-tertiary hover:text-foreground hover:bg-accent-red transition-colors">
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
