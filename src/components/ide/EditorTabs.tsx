import React from 'react';
import { X, Circle } from 'lucide-react';
import type { EditorTab } from '@/types/ide';

interface EditorTabsProps {
  tabs: EditorTab[];
  activeTabId: string | null;
  onSelect: (tabId: string) => void;
  onClose: (tabId: string) => void;
}

const EditorTabs: React.FC<EditorTabsProps> = ({ tabs, activeTabId, onSelect, onClose }) => {
  if (tabs.length === 0) return null;

  return (
    <>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`editor-tab group ${tab.id === activeTabId ? 'active' : ''}`}
          onClick={() => onSelect(tab.id)}
        >
          {tab.isModified && (
            <Circle size={8} fill="currentColor" className="text-accent-blue flex-shrink-0" />
          )}
          <span className="truncate max-w-32">{tab.name}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
            className="opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity ml-1 flex-shrink-0"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </>
  );
};

export default EditorTabs;
