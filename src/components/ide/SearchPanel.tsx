import React from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useIDEStore } from '@/stores/ideStore';

const SearchPanel: React.FC = () => {
  const { searchQuery, setSearchQuery, searchResults } = useIDEStore();

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-semibold text-text-tertiary">
        Search
      </div>
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md" style={{ background: 'hsl(var(--surface-2))' }}>
          <SearchIcon size={13} className="text-text-tertiary flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="bg-transparent border-none outline-none text-xs w-full text-foreground placeholder:text-text-tertiary font-sans"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-1">
        {searchResults.length > 0 ? (
          <div className="space-y-0.5">
            {searchResults.map((r, i) => (
              <div key={i} className="file-tree-item flex-col items-start gap-0 px-3">
                <span className="text-[10px] text-text-tertiary">{r.file}:{r.line}</span>
                <span className="text-xs text-text-secondary truncate w-full">{r.text}</span>
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="px-4 py-6 text-xs text-text-tertiary text-center">No results found</div>
        ) : (
          <div className="px-4 py-6 text-xs text-text-tertiary text-center">Type to search across files</div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;
