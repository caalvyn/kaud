import React from 'react';
import { useIDEStore } from '@/stores/ideStore';
import { GitBranch, AlertTriangle, AlertCircle, Info, Bell, Wifi } from 'lucide-react';

const StatusBar: React.FC = () => {
  const { gitBranch, problems, tabs, activeTabId } = useIDEStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const errors = problems.filter((p) => p.severity === 'error').length;
  const warnings = problems.filter((p) => p.severity === 'warning').length;

  return (
    <div className="status-bar justify-between select-none">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <GitBranch size={12} /> {gitBranch}
        </span>
        <span className="flex items-center gap-1.5">
          {errors > 0 && <span className="flex items-center gap-0.5"><AlertCircle size={11} /> {errors}</span>}
          {warnings > 0 && <span className="flex items-center gap-0.5"><AlertTriangle size={11} /> {warnings}</span>}
          {errors === 0 && warnings === 0 && <span className="flex items-center gap-0.5"><Info size={11} /> 0</span>}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {activeTab && (
          <>
            <span>Ln 1, Col 1</span>
            <span>Spaces: 2</span>
            <span>UTF-8</span>
            <span>{activeTab.language === 'typescript' ? 'TypeScript React' : activeTab.language}</span>
          </>
        )}
        <span className="flex items-center gap-1"><Wifi size={11} /> Connected</span>
        <span className="flex items-center gap-1"><Bell size={11} /></span>
      </div>
    </div>
  );
};

export default StatusBar;
