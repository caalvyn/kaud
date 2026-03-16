import React, { useEffect, useCallback } from 'react';
import { useIDEStore } from '@/stores/ideStore';
import { AnimatePresence, motion } from 'framer-motion';

const commands = [
  { id: 'open-file', label: 'Open File', category: 'File' },
  { id: 'save-file', label: 'Save File', category: 'File', shortcut: '⌘S' },
  { id: 'new-file', label: 'New File', category: 'File' },
  { id: 'toggle-terminal', label: 'Toggle Terminal', category: 'View', shortcut: '⌘`' },
  { id: 'toggle-sidebar', label: 'Toggle Sidebar', category: 'View', shortcut: '⌘B' },
  { id: 'toggle-ai', label: 'Toggle AI Panel', category: 'View', shortcut: '⌘I' },
  { id: 'search-files', label: 'Search in Files', category: 'Search', shortcut: '⌘⇧F' },
  { id: 'go-to-line', label: 'Go to Line', category: 'Editor', shortcut: '⌘G' },
  { id: 'format-document', label: 'Format Document', category: 'Editor', shortcut: '⌘⇧P' },
  { id: 'toggle-minimap', label: 'Toggle Minimap', category: 'View' },
  { id: 'zoom-in', label: 'Zoom In', category: 'View', shortcut: '⌘+' },
  { id: 'zoom-out', label: 'Zoom Out', category: 'View', shortcut: '⌘-' },
  { id: 'git-commit', label: 'Git: Commit', category: 'Source Control' },
  { id: 'git-push', label: 'Git: Push', category: 'Source Control' },
  { id: 'install-extension', label: 'Install Extension', category: 'Extensions' },
  { id: 'open-settings', label: 'Open Settings', category: 'Preferences', shortcut: '⌘,' },
  { id: 'change-theme', label: 'Change Color Theme', category: 'Preferences' },
];

const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, toggleCommandPalette, setSidebarView, toggleBottomPanel, toggleAIPanel, toggleSidebar } = useIDEStore();
  const [query, setQuery] = React.useState('');

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const executeCommand = useCallback((id: string) => {
    toggleCommandPalette();
    setQuery('');
    switch (id) {
      case 'toggle-terminal': toggleBottomPanel(); break;
      case 'toggle-sidebar': toggleSidebar(); break;
      case 'toggle-ai': toggleAIPanel(); break;
      case 'search-files': setSidebarView('search'); break;
      case 'open-settings': setSidebarView('settings'); break;
      case 'install-extension': setSidebarView('extensions'); break;
    }
  }, [toggleCommandPalette, toggleBottomPanel, toggleSidebar, toggleAIPanel, setSidebarView]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        toggleCommandPalette();
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        toggleCommandPalette();
        setQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, toggleCommandPalette]);

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="command-palette" onClick={() => { toggleCommandPalette(); setQuery(''); }}>
          <div className="command-palette-overlay" />
          <motion.div
            className="command-palette-content"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center px-4 border-b border-border">
              <span className="text-text-tertiary text-sm mr-2">›</span>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command..."
                className="w-full py-3 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-text-tertiary font-sans"
              />
            </div>
            <div className="max-h-72 overflow-y-auto py-1">
              {filtered.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => executeCommand(cmd.id)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs hover:bg-surface-2 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-text-tertiary text-[10px] w-20 text-right">{cmd.category}</span>
                    <span className="text-foreground">{cmd.label}</span>
                  </div>
                  {cmd.shortcut && (
                    <span className="text-[10px] text-text-tertiary font-mono">{cmd.shortcut}</span>
                  )}
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-4 py-6 text-xs text-text-tertiary text-center">No commands found</div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
