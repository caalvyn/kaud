import React from 'react';
import {
  Undo2, Redo2, Scissors, Copy, ClipboardPaste, TextSelect,
  Search, Replace, WrapText, IndentIncrease, IndentDecrease,
  Code, Braces,
} from 'lucide-react';

interface EditorToolbarProps {
  onAction: (action: string) => void;
}

const divider = 'divider' as const;

type ToolbarItem = {
  id: string;
  icon: React.FC<{ size?: number; strokeWidth?: number }>;
  label: string;
  shortcut?: string;
} | typeof divider;

const items: ToolbarItem[] = [
  { id: 'undo', icon: Undo2, label: 'Undo', shortcut: 'Ctrl+Z' },
  { id: 'redo', icon: Redo2, label: 'Redo', shortcut: 'Ctrl+Y' },
  divider,
  { id: 'cut', icon: Scissors, label: 'Cut', shortcut: 'Ctrl+X' },
  { id: 'copy', icon: Copy, label: 'Copy', shortcut: 'Ctrl+C' },
  { id: 'paste', icon: ClipboardPaste, label: 'Paste', shortcut: 'Ctrl+V' },
  { id: 'selectAll', icon: TextSelect, label: 'Select All', shortcut: 'Ctrl+A' },
  divider,
  { id: 'find', icon: Search, label: 'Find', shortcut: 'Ctrl+F' },
  { id: 'replace', icon: Replace, label: 'Find & Replace', shortcut: 'Ctrl+H' },
  divider,
  { id: 'indent', icon: IndentIncrease, label: 'Indent', shortcut: 'Tab' },
  { id: 'outdent', icon: IndentDecrease, label: 'Outdent', shortcut: 'Shift+Tab' },
  { id: 'toggleWordWrap', icon: WrapText, label: 'Toggle Word Wrap', shortcut: 'Alt+Z' },
  divider,
  { id: 'format', icon: Braces, label: 'Format Document', shortcut: 'Shift+Alt+F' },
  { id: 'commentLine', icon: Code, label: 'Toggle Comment', shortcut: 'Ctrl+/' },
];

const EditorToolbar: React.FC<EditorToolbarProps> = ({ onAction }) => {
  return (
    <div
      className="flex items-center gap-0.5 px-2 py-1 overflow-x-auto flex-shrink-0"
      style={{
        background: 'hsl(var(--surface-1))',
        borderBottom: '1px solid hsl(var(--glass-border) / 0.4)',
      }}
    >
      {items.map((item, i) => {
        if (item === divider) {
          return (
            <div
              key={`div-${i}`}
              className="w-px h-4 mx-0.5 flex-shrink-0"
              style={{ background: 'hsl(var(--glass-border) / 0.5)' }}
            />
          );
        }
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onAction(item.id)}
            className="p-1 rounded text-text-tertiary hover:text-foreground hover:bg-surface-2 transition-colors flex-shrink-0"
            title={`${item.label}${item.shortcut ? ` (${item.shortcut})` : ''}`}
          >
            <Icon size={13} strokeWidth={1.5} />
          </button>
        );
      })}
    </div>
  );
};

export default EditorToolbar;
