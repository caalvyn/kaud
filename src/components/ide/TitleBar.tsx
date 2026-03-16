import React from 'react';
import { Sparkles } from 'lucide-react';

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
        <span className="font-medium tracking-wide">KAUD</span>
        <span className="text-text-tertiary">—</span>
        <span className="text-text-tertiary">workspace</span>
      </div>

      <div className="w-[68px]" />
    </div>
  );
};

export default TitleBar;
