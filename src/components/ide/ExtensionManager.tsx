import React, { useState } from 'react';
import { Download, Trash2, Star, ToggleLeft, ToggleRight, Search, Verified, ExternalLink, Terminal, Palette, Code2, Shield, Zap } from 'lucide-react';
import { useIDEStore } from '@/stores/ideStore';
import type { MarketplaceCategory } from '@/types/ide';

const formatDownloads = (n: number) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
};

const categories: MarketplaceCategory[] = ['All', 'Language', 'Themes', 'Formatters', 'Linters', 'AI', 'DevOps', 'Visual', 'Source Control'];

const categoryIcons: Record<string, React.ElementType> = {
  All: Zap, Language: Code2, Themes: Palette, Formatters: Terminal,
  Linters: Shield, AI: Zap, DevOps: Terminal, Visual: Palette, 'Source Control': Zap,
};

const ExtensionManager: React.FC = () => {
  const {
    extensions, installExtension, toggleExtension,
    marketplaceCategory, setMarketplaceCategory,
    marketplaceSearch, setMarketplaceSearch,
  } = useIDEStore();
  const [view, setView] = useState<'installed' | 'marketplace'>('marketplace');
  const [selectedExt, setSelectedExt] = useState<string | null>(null);

  const installed = extensions.filter((e) => e.installed);
  const marketplace = extensions.filter((e) => {
    if (marketplaceCategory !== 'All' && e.category !== marketplaceCategory) return false;
    if (marketplaceSearch && !e.name.toLowerCase().includes(marketplaceSearch.toLowerCase()) &&
        !e.description.toLowerCase().includes(marketplaceSearch.toLowerCase())) return false;
    return true;
  });

  const displayList = view === 'installed' ? installed : marketplace;
  const selected = selectedExt ? extensions.find((e) => e.id === selectedExt) : null;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-semibold text-text-tertiary">
        Extensions
      </div>
      
      {/* Search */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md" style={{ background: 'hsl(var(--surface-2))' }}>
          <Search size={13} className="text-text-tertiary flex-shrink-0" />
          <input
            value={marketplaceSearch}
            onChange={(e) => setMarketplaceSearch(e.target.value)}
            placeholder="Search extensions..."
            className="bg-transparent border-none outline-none text-xs w-full text-foreground placeholder:text-text-tertiary font-sans"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-3 pb-2">
        <button
          onClick={() => setView('marketplace')}
          className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
            view === 'marketplace' ? 'bg-primary text-primary-foreground' : 'text-text-tertiary hover:text-foreground'
          }`}
        >
          Marketplace
        </button>
        <button
          onClick={() => setView('installed')}
          className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
            view === 'installed' ? 'bg-primary text-primary-foreground' : 'text-text-tertiary hover:text-foreground'
          }`}
        >
          Installed ({installed.length})
        </button>
      </div>

      {/* Category pills (marketplace only) */}
      {view === 'marketplace' && (
        <div className="px-3 pb-2 flex flex-wrap gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setMarketplaceCategory(cat)}
              className={`px-2 py-0.5 rounded-full text-[10px] transition-colors ${
                marketplaceCategory === cat
                  ? 'bg-accent-blue/20 text-accent-blue'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
              style={marketplaceCategory !== cat ? { background: 'hsl(var(--surface-2) / 0.5)' } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Extension detail view */}
      {selected ? (
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <button onClick={() => setSelectedExt(null)} className="text-[10px] text-accent-blue mb-2 hover:underline">← Back</button>
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">{selected.name}</h3>
                <span className="text-[10px] text-text-tertiary">v{selected.version}</span>
              </div>
              <div className="text-[11px] text-text-tertiary">{selected.publisher}</div>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">{selected.description}</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-0.5 text-[10px] text-text-tertiary">
                <Download size={10} /> {formatDownloads(selected.downloads)}
              </span>
              <span className="flex items-center gap-0.5 text-[10px] text-accent-yellow">
                <Star size={10} fill="currentColor" /> {selected.rating}
              </span>
            </div>
            
            {/* Install/Toggle */}
            <div className="flex gap-2">
              {selected.installed ? (
                <>
                  <button onClick={() => toggleExtension(selected.id)}
                    className={`px-3 py-1.5 rounded text-[11px] font-medium transition-colors ${
                      selected.enabled ? 'bg-accent-green/20 text-accent-green' : 'bg-surface-2 text-text-secondary'
                    }`}>
                    {selected.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                  <button onClick={() => installExtension(selected.id)}
                    className="px-3 py-1.5 rounded text-[11px] font-medium text-accent-red bg-accent-red/10 hover:bg-accent-red/20 transition-colors">
                    Uninstall
                  </button>
                </>
              ) : (
                <button onClick={() => installExtension(selected.id)}
                  className="px-3 py-1.5 rounded text-[11px] font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                  Install
                </button>
              )}
            </div>

            {/* Contributions */}
            {selected.contributes && (
              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="text-[10px] uppercase tracking-widest font-semibold text-text-tertiary">Contributions</h4>
                {selected.contributes.commands && selected.contributes.commands.length > 0 && (
                  <div>
                    <span className="text-[10px] text-text-tertiary font-medium">Commands:</span>
                    <div className="mt-1 space-y-0.5">
                      {selected.contributes.commands.map((cmd) => (
                        <div key={cmd.id} className="flex items-center justify-between text-[11px] text-text-secondary px-2 py-1 rounded" style={{ background: 'hsl(var(--surface-2) / 0.3)' }}>
                          <span>{cmd.title}</span>
                          {cmd.keybinding && <span className="text-[9px] text-text-tertiary font-mono">{cmd.keybinding}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selected.contributes.languages && selected.contributes.languages.length > 0 && (
                  <div>
                    <span className="text-[10px] text-text-tertiary font-medium">Languages:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selected.contributes.languages.map((lang) => (
                        <span key={lang.id} className="text-[10px] px-1.5 py-0.5 rounded-full text-text-secondary" style={{ background: 'hsl(var(--surface-3))' }}>
                          {lang.aliases[0] || lang.id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selected.contributes.themes && selected.contributes.themes.length > 0 && (
                  <div>
                    <span className="text-[10px] text-text-tertiary font-medium">Themes:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selected.contributes.themes.map((theme) => (
                        <span key={theme.id} className="text-[10px] px-1.5 py-0.5 rounded-full text-text-secondary" style={{ background: 'hsl(var(--surface-3))' }}>
                          {theme.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selected.activationEvents && selected.activationEvents.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-border">
                <h4 className="text-[10px] uppercase tracking-widest font-semibold text-text-tertiary">Activation Events</h4>
                <div className="flex flex-wrap gap-1">
                  {selected.activationEvents.map((ev) => (
                    <span key={ev} className="text-[10px] px-1.5 py-0.5 rounded font-mono text-text-tertiary" style={{ background: 'hsl(var(--surface-2) / 0.5)' }}>
                      {ev}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Extension list */
        <div className="flex-1 overflow-y-auto px-2 space-y-1.5 pb-2">
          {displayList.length === 0 ? (
            <div className="text-xs text-text-tertiary text-center py-8">
              {view === 'installed' ? 'No extensions installed' : 'No extensions found'}
            </div>
          ) : (
            displayList.map((ext) => (
              <div key={ext.id} className="extension-card" onClick={() => setSelectedExt(ext.id)}>
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
                  <div className="flex flex-col items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ExtensionManager;
