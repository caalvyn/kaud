import React from 'react';
import {
  Files, Search, GitBranch, Blocks, MessageSquare, Settings,
} from 'lucide-react';
import { useIDEStore } from '@/stores/ideStore';
import type { SidebarView } from '@/types/ide';

const items: { icon: React.ElementType; view: SidebarView; label: string }[] = [
  { icon: Files, view: 'explorer', label: 'Explorer' },
  { icon: Search, view: 'search', label: 'Search' },
  { icon: GitBranch, view: 'git', label: 'Source Control' },
  { icon: Blocks, view: 'extensions', label: 'Extensions' },
  { icon: MessageSquare, view: 'ai', label: 'AI Chat' },
];

const ActivityBar: React.FC = () => {
  const { sidebarView, setSidebarView, sidebarOpen, toggleSidebar } = useIDEStore();

  const handleClick = (view: SidebarView) => {
    if (sidebarView === view && sidebarOpen) {
      toggleSidebar();
    } else {
      setSidebarView(view);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-between py-2 select-none"
      style={{ width: 48, background: 'hsl(var(--activity-bar))' }}
    >
      <div className="flex flex-col items-center gap-0.5">
        {items.map(({ icon: Icon, view, label }) => (
          <button
            key={view}
            onClick={() => handleClick(view)}
            className={`activity-item ${sidebarView === view && sidebarOpen ? 'active' : ''}`}
            title={label}
          >
            <Icon size={22} strokeWidth={1.5} />
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <button
          onClick={() => handleClick('settings')}
          className={`activity-item ${sidebarView === 'settings' && sidebarOpen ? 'active' : ''}`}
          title="Settings"
        >
          <Settings size={22} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default ActivityBar;
