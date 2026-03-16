import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useIDEStore } from '@/stores/ideStore';

const TerminalPanel: React.FC = () => {
  const { terminalHistory, addTerminalLine } = useIDEStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    addTerminalLine(`$ ${input}`);
    // Simulate some commands
    const cmd = input.trim().toLowerCase();
    if (cmd === 'clear') {
      // Can't really clear with current store design, but acknowledge
      addTerminalLine('');
    } else if (cmd === 'ls') {
      addTerminalLine('src/  node_modules/  package.json  tsconfig.json  README.md');
    } else if (cmd === 'pwd') {
      addTerminalLine('/home/user/lumina-project');
    } else if (cmd.startsWith('echo ')) {
      addTerminalLine(input.slice(5));
    } else if (cmd === 'node -v') {
      addTerminalLine('v20.11.0');
    } else if (cmd === 'npm -v') {
      addTerminalLine('10.2.4');
    } else {
      addTerminalLine(`zsh: command not found: ${input.split(' ')[0]}`);
    }
    setInput('');
  };

  return (
    <div
      className="flex flex-col h-full font-mono text-xs"
      style={{ background: 'hsl(var(--surface-0))' }}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-y-auto p-3 space-y-0">
        {terminalHistory.map((line, i) => (
          <div key={i} className="terminal-line">
            {line.startsWith('$') ? (
              <>
                <span className="terminal-prompt">❯ </span>
                <span className="text-foreground">{line.slice(2)}</span>
              </>
            ) : line.startsWith('  ➜') ? (
              <span>
                <span className="terminal-prompt">  ➜</span>
                <span className="text-text-secondary">{line.slice(3)}</span>
              </span>
            ) : (
              <span className="text-text-secondary">{line}</span>
            )}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="flex items-center terminal-line">
          <span className="terminal-prompt">❯ </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-foreground font-mono text-xs"
            spellCheck={false}
            autoFocus
          />
        </form>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default TerminalPanel;
