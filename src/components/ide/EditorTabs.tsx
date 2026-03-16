import React from 'react';
import { X, Circle } from 'lucide-react';
import { useIDEStore } from '@/stores/ideStore';

const EditorTabs: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, closeTab } = useIDEStore();

  if (tabs.length === 0) return null;

  return (
    <div className="flex items-center overflow-x-auto" style={{ background: 'hsl(var(--tab-inactive))' }}>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`editor-tab group ${tab.id === activeTabId ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.isModified && (
            <Circle size={8} fill="currentColor" className="text-accent-blue flex-shrink-0" />
          )}
          <span className="truncate max-w-32">{tab.name}</span>
          <button
            onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
            className="opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity ml-1 flex-shrink-0"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default EditorTabs;
