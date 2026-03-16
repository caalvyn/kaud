import React, { useEffect } from 'react';
import { useIDEStore } from '@/stores/ideStore';
import TitleBar from '@/components/ide/TitleBar';
import ActivityBar from '@/components/ide/ActivityBar';
import FileExplorer from '@/components/ide/FileExplorer';
import SearchPanel from '@/components/ide/SearchPanel';
import SourceControl from '@/components/ide/SourceControl';
import ExtensionManager from '@/components/ide/ExtensionManager';
import AIChatPanel from '@/components/ide/AIChatPanel';
import SettingsPanel from '@/components/ide/SettingsPanel';
import MonacoEditor from '@/components/ide/MonacoEditor';
import BottomPanel from '@/components/ide/BottomPanel';
import StatusBar from '@/components/ide/StatusBar';
import CommandPalette from '@/components/ide/CommandPalette';
import RecoveryPrompt from '@/components/ide/RecoveryPrompt';
import { useAutoSave } from '@/hooks/useAutoSave';
import { motion, AnimatePresence } from 'framer-motion';

const sidebarComponents: Record<string, React.FC> = {
  explorer: FileExplorer,
  search: SearchPanel,
  git: SourceControl,
  extensions: ExtensionManager,
  ai: AIChatPanel,
  settings: SettingsPanel,
};

const IDELayout: React.FC = () => {
  const {
    sidebarView, sidebarOpen, bottomPanelOpen,
    aiPanelOpen, toggleSidebar, toggleBottomPanel, toggleAIPanel,
  } = useIDEStore();

  const SidebarContent = sidebarComponents[sidebarView] || FileExplorer;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'b') { e.preventDefault(); toggleSidebar(); }
      if (mod && e.key === '`') { e.preventDefault(); toggleBottomPanel(); }
      if (mod && e.key === 'i') { e.preventDefault(); toggleAIPanel(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleSidebar, toggleBottomPanel, toggleAIPanel]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: 'hsl(var(--surface-0))' }}>
      <TitleBar />
      
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar />
        
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="overflow-hidden border-r border-border flex-shrink-0"
              style={{ background: 'hsl(var(--sidebar-bg))' }}
            >
              <div className="h-full w-[260px]">
                <SidebarContent />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <MonacoEditor />
            </div>
            
            <AnimatePresence initial={false}>
              {bottomPanelOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 200 }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="overflow-hidden border-t border-border flex-shrink-0"
                >
                  <div className="h-[200px]">
                    <BottomPanel />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <AnimatePresence initial={false}>
            {aiPanelOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="overflow-hidden border-l border-border flex-shrink-0"
              >
                <div className="h-full w-[360px]">
                  <AIChatPanel />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <StatusBar />
      <CommandPalette />
    </div>
  );
};

export default IDELayout;
