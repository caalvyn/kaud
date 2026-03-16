import React from 'react';
import { Download, Trash2, Star, ToggleLeft, ToggleRight } from 'lucide-react';
import { useIDEStore } from '@/stores/ideStore';

const formatDownloads = (n: number) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
};

const ExtensionManager: React.FC = () => {
  const { extensions, installExtension, toggleExtension } = useIDEStore();

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-semibold text-text-tertiary">
        Extensions
      </div>
      <div className="px-3 pb-2">
        <input
          placeholder="Search extensions..."
          className="w-full px-2.5 py-1.5 rounded-md text-xs bg-surface-2 border-none outline-none text-foreground placeholder:text-text-tertiary font-sans"
        />
      </div>
      <div className="flex-1 overflow-y-auto px-2 space-y-1.5">
        {extensions.map((ext) => (
          <div key={ext.id} className="extension-card">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-foreground truncate">{ext.name}</span>
                  <span className="text-[10px] text-text-tertiary">v{ext.version}</span>
                </div>
                <div className="text-[10px] text-text-tertiary mt-0.5">{ext.publisher}</div>
                <div className="text-[11px] text-text-secondary mt-1 line-clamp-2">{ext.description}</div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-0.5 text-[10px] text-text-tertiary">
                    <Download size={10} /> {formatDownloads(ext.downloads)}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] text-accent-yellow">
                    <Star size={10} fill="currentColor" /> {ext.rating}
                  </span>
                  <span className="text-[10px] text-text-tertiary px-1.5 py-0.5 rounded-full" style={{ background: 'hsl(var(--surface-3))' }}>
                    {ext.category}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                {ext.installed ? (
                  <>
                    <button
                      onClick={() => toggleExtension(ext.id)}
                      className="text-text-tertiary hover:text-foreground transition-colors"
                      title={ext.enabled ? 'Disable' : 'Enable'}
                    >
                      {ext.enabled ? <ToggleRight size={18} className="text-accent-green" /> : <ToggleLeft size={18} />}
                    </button>
                    <button
                      onClick={() => installExtension(ext.id)}
                      className="text-text-tertiary hover:text-accent-red transition-colors"
                      title="Uninstall"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => installExtension(ext.id)}
                    className="px-2 py-1 rounded text-[10px] font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Install
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExtensionManager;
