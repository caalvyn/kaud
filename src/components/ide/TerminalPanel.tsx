import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebContainer } from '@webcontainer/api';
import { useIDEStore } from '@/stores/ideStore';
import { Loader2, AlertTriangle, RotateCcw } from 'lucide-react';
import '@xterm/xterm/css/xterm.css';

// Singleton WebContainer instance
let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;
let bootFailed = false;

const getOrBootWebContainer = async (): Promise<WebContainer> => {
  if (webcontainerInstance) return webcontainerInstance;
  if (bootFailed) throw new Error('WebContainer boot previously failed');
  if (bootPromise) return bootPromise;

  bootPromise = WebContainer.boot().then((instance) => {
    webcontainerInstance = instance;
    return instance;
  }).catch((err) => {
    bootFailed = true;
    bootPromise = null;
    throw err;
  });

  return bootPromise;
};

// ─── Smart fallback terminal (interacts with file tree) ───
const SmartFallbackTerminal: React.FC<{ termRef: React.RefObject<HTMLDivElement | null> }> = ({ termRef }) => {
  const { files, createFile, createFolder, deleteNode } = useIDEStore();
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const inputBuffer = useRef('');
  const cwdRef = useRef('/');
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);

  const findNodeByPath = useCallback((path: string) => {
    const parts = path.split('/').filter(Boolean);
    let current = files;
    let node = null;
    for (const part of parts) {
      const found = current.find((n) => n.name === part);
      if (!found) return null;
      node = found;
      current = found.children || [];
    }
    return node;
  }, [files]);

  const listDir = useCallback((path: string) => {
    if (path === '/') return files;
    const node = findNodeByPath(path);
    if (!node || node.type !== 'folder') return null;
    return node.children || [];
  }, [files, findNodeByPath]);

  const resolvePath = useCallback((input: string) => {
    if (input.startsWith('/')) return input;
    const cwd = cwdRef.current;
    const parts = cwd.split('/').filter(Boolean);
    for (const seg of input.split('/')) {
      if (seg === '..') parts.pop();
      else if (seg !== '.' && seg !== '') parts.push(seg);
    }
    return '/' + parts.join('/');
  }, []);

  const writePrompt = useCallback(() => {
    const term = terminalRef.current;
    if (!term) return;
    const cwd = cwdRef.current === '/' ? '~' : cwdRef.current;
    term.write(`\r\n\x1b[38;2;80;200;120m➜\x1b[0m \x1b[38;2;100;149;237m${cwd}\x1b[0m $ `);
  }, []);

  const executeCommand = useCallback((input: string) => {
    const term = terminalRef.current;
    if (!term) return;

    const trimmed = input.trim();
    if (!trimmed) { writePrompt(); return; }

    historyRef.current.push(trimmed);
    historyIndexRef.current = historyRef.current.length;

    const [cmd, ...args] = trimmed.split(/\s+/);

    switch (cmd) {
      case 'clear':
        term.clear();
        writePrompt();
        return;

      case 'pwd':
        term.write(`\r\n${cwdRef.current}`);
        break;

      case 'ls': {
        const target = args[0] ? resolvePath(args[0]) : cwdRef.current;
        const entries = listDir(target);
        if (!entries) {
          term.write(`\r\n\x1b[31mls: cannot access '${args[0] || target}': No such directory\x1b[0m`);
        } else if (entries.length === 0) {
          term.write('\r\n(empty)');
        } else {
          const names = entries.map((e) =>
            e.type === 'folder'
              ? `\x1b[38;2;100;149;237m${e.name}/\x1b[0m`
              : `\x1b[38;2;200;200;200m${e.name}\x1b[0m`
          );
          term.write('\r\n' + names.join('  '));
        }
        break;
      }

      case 'cd': {
        if (!args[0] || args[0] === '~') {
          cwdRef.current = '/';
        } else {
          const target = resolvePath(args[0]);
          if (target === '/') {
            cwdRef.current = '/';
          } else {
            const node = findNodeByPath(target);
            if (!node || node.type !== 'folder') {
              term.write(`\r\n\x1b[31mcd: no such directory: ${args[0]}\x1b[0m`);
              break;
            }
            cwdRef.current = target;
          }
        }
        break;
      }

      case 'cat': {
        if (!args[0]) { term.write('\r\n\x1b[31mcat: missing operand\x1b[0m'); break; }
        const target = resolvePath(args[0]);
        const node = findNodeByPath(target);
        if (!node || node.type !== 'file') {
          term.write(`\r\n\x1b[31mcat: ${args[0]}: No such file\x1b[0m`);
        } else {
          term.write('\r\n' + (node.content || ''));
        }
        break;
      }

      case 'touch': {
        if (!args[0]) { term.write('\r\n\x1b[31mtouch: missing operand\x1b[0m'); break; }
        const parentPath = cwdRef.current;
        const parentNode = parentPath === '/' ? null : findNodeByPath(parentPath);
        const parentId = parentNode?.id || 'root';
        createFile(parentId, args[0]);
        term.write(`\r\n\x1b[32m✓\x1b[0m Created ${args[0]}`);
        break;
      }

      case 'mkdir': {
        if (!args[0]) { term.write('\r\n\x1b[31mmkdir: missing operand\x1b[0m'); break; }
        const parentPath = cwdRef.current;
        const parentNode = parentPath === '/' ? null : findNodeByPath(parentPath);
        const parentId = parentNode?.id || 'root';
        createFolder(parentId, args[0]);
        term.write(`\r\n\x1b[32m✓\x1b[0m Created directory ${args[0]}`);
        break;
      }

      case 'rm': {
        if (!args[0]) { term.write('\r\n\x1b[31mrm: missing operand\x1b[0m'); break; }
        const target = resolvePath(args[0]);
        const node = findNodeByPath(target);
        if (!node) {
          term.write(`\r\n\x1b[31mrm: ${args[0]}: No such file or directory\x1b[0m`);
        } else {
          deleteNode(node.id);
          term.write(`\r\n\x1b[32m✓\x1b[0m Removed ${args[0]}`);
        }
        break;
      }

      case 'echo':
        term.write('\r\n' + args.join(' '));
        break;

      case 'whoami':
        term.write('\r\nkaud-user');
        break;

      case 'date':
        term.write('\r\n' + new Date().toString());
        break;

      case 'node':
        if (args[0] === '-v' || args[0] === '--version') {
          term.write('\r\nv20.11.0 (simulated)');
        } else {
          term.write('\r\n\x1b[33m⚠ Node.js REPL not available in fallback mode\x1b[0m');
        }
        break;

      case 'npm':
        if (args[0] === '-v' || args[0] === '--version') {
          term.write('\r\n10.2.4 (simulated)');
        } else {
          term.write('\r\n\x1b[33m⚠ npm not available in fallback mode\x1b[0m');
        }
        break;

      case 'help':
        term.write('\r\n\x1b[1mKAUD Terminal Commands:\x1b[0m');
        term.write('\r\n  \x1b[36mls\x1b[0m [path]       List directory contents');
        term.write('\r\n  \x1b[36mcd\x1b[0m <path>       Change directory');
        term.write('\r\n  \x1b[36mpwd\x1b[0m             Print working directory');
        term.write('\r\n  \x1b[36mcat\x1b[0m <file>       Display file contents');
        term.write('\r\n  \x1b[36mtouch\x1b[0m <file>     Create a new file');
        term.write('\r\n  \x1b[36mmkdir\x1b[0m <dir>      Create a new directory');
        term.write('\r\n  \x1b[36mrm\x1b[0m <file|dir>    Remove a file or directory');
        term.write('\r\n  \x1b[36mecho\x1b[0m <text>      Print text');
        term.write('\r\n  \x1b[36mclear\x1b[0m            Clear terminal');
        term.write('\r\n  \x1b[36mwhoami\x1b[0m           Current user');
        term.write('\r\n  \x1b[36mdate\x1b[0m             Current date/time');
        term.write('\r\n  \x1b[36mhelp\x1b[0m             Show this help');
        break;

      default:
        term.write(`\r\n\x1b[31mcommand not found: ${cmd}\x1b[0m`);
        term.write('\r\n\x1b[2mType "help" for available commands\x1b[0m');
    }

    writePrompt();
  }, [listDir, findNodeByPath, resolvePath, createFile, createFolder, deleteNode, writePrompt]);

  useEffect(() => {
    if (!termRef.current || terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize: 13,
      fontFamily: 'var(--font-mono), "Fira Code", "Cascadia Code", monospace',
      lineHeight: 1.4,
      theme: {
        background: '#0a0a12',
        foreground: '#e2e8f0',
        cursor: '#64b5f6',
        selectionBackground: '#334155',
        black: '#0a0a12',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#e2e8f0',
      },
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(termRef.current);
    fitAddon.fit();
    terminalRef.current = term;
    fitAddonRef.current = fitAddon;

    term.write('\x1b[1;36m  KAUD Terminal\x1b[0m \x1b[2m(smart fallback mode)\x1b[0m');
    term.write('\r\n\x1b[2m  Type "help" for available commands\x1b[0m');
    writePrompt();

    term.onData((data) => {
      const code = data.charCodeAt(0);

      if (code === 13) { // Enter
        const cmd = inputBuffer.current;
        inputBuffer.current = '';
        executeCommand(cmd);
      } else if (code === 127) { // Backspace
        if (inputBuffer.current.length > 0) {
          inputBuffer.current = inputBuffer.current.slice(0, -1);
          term.write('\b \b');
        }
      } else if (code === 27) { // Escape sequences (arrows)
        if (data === '\x1b[A') { // Up arrow
          if (historyRef.current.length > 0 && historyIndexRef.current > 0) {
            historyIndexRef.current--;
            const histCmd = historyRef.current[historyIndexRef.current];
            // Clear current input
            term.write('\r\x1b[K');
            const cwd = cwdRef.current === '/' ? '~' : cwdRef.current;
            term.write(`\x1b[38;2;80;200;120m➜\x1b[0m \x1b[38;2;100;149;237m${cwd}\x1b[0m $ ${histCmd}`);
            inputBuffer.current = histCmd;
          }
        } else if (data === '\x1b[B') { // Down arrow
          if (historyIndexRef.current < historyRef.current.length - 1) {
            historyIndexRef.current++;
            const histCmd = historyRef.current[historyIndexRef.current];
            term.write('\r\x1b[K');
            const cwd = cwdRef.current === '/' ? '~' : cwdRef.current;
            term.write(`\x1b[38;2;80;200;120m➜\x1b[0m \x1b[38;2;100;149;237m${cwd}\x1b[0m $ ${histCmd}`);
            inputBuffer.current = histCmd;
          } else {
            historyIndexRef.current = historyRef.current.length;
            term.write('\r\x1b[K');
            const cwd = cwdRef.current === '/' ? '~' : cwdRef.current;
            term.write(`\x1b[38;2;80;200;120m➜\x1b[0m \x1b[38;2;100;149;237m${cwd}\x1b[0m $ `);
            inputBuffer.current = '';
          }
        }
      } else if (code >= 32) { // Printable chars
        inputBuffer.current += data;
        term.write(data);
      }
    });

    const ro = new ResizeObserver(() => {
      try { fitAddon.fit(); } catch {}
    });
    ro.observe(termRef.current);

    return () => {
      ro.disconnect();
      term.dispose();
      terminalRef.current = null;
    };
  }, [executeCommand, writePrompt]);

  return null;
};

// ─── WebContainer Terminal ───
const WebContainerTerminal: React.FC<{
  termRef: React.RefObject<HTMLDivElement | null>;
  onFallback: () => void;
}> = ({ termRef, onFallback }) => {
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!termRef.current || terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize: 13,
      fontFamily: 'var(--font-mono), "Fira Code", "Cascadia Code", monospace',
      lineHeight: 1.4,
      theme: {
        background: '#0a0a12',
        foreground: '#e2e8f0',
        cursor: '#64b5f6',
        selectionBackground: '#334155',
        black: '#0a0a12',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#e2e8f0',
      },
      allowProposedApi: true,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(termRef.current);
    fitAddon.fit();
    terminalRef.current = term;
    fitAddonRef.current = fitAddon;

    term.write('\x1b[1;36m  KAUD Terminal\x1b[0m \x1b[2m(booting WebContainer...)\x1b[0m\r\n');

    const init = async () => {
      try {
        const wc = await getOrBootWebContainer();
        term.write('\x1b[32m  ✓ WebContainer ready\x1b[0m\r\n\r\n');

        const shellProcess = await wc.spawn('jsh', {
          terminal: { cols: term.cols, rows: term.rows },
        });

        shellProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              term.write(data);
            },
          })
        );

        const shellInput = shellProcess.input.getWriter();
        term.onData((data) => {
          shellInput.write(data);
        });

        term.onResize(({ cols, rows }) => {
          shellProcess.resize({ cols, rows });
        });
      } catch (err) {
        console.warn('WebContainer boot failed:', err);
        term.dispose();
        terminalRef.current = null;
        onFallback();
      }
    };

    init();

    const ro = new ResizeObserver(() => {
      try { fitAddon.fit(); } catch {}
    });
    ro.observe(termRef.current);

    return () => {
      ro.disconnect();
      term.dispose();
      terminalRef.current = null;
    };
  }, [onFallback]);

  return null;
};

// ─── Main TerminalPanel ───
const TerminalPanel: React.FC = () => {
  const termRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'loading' | 'webcontainer' | 'fallback'>('loading');

  useEffect(() => {
    // Try WebContainer first, fall back if needed
    setMode('webcontainer');
  }, []);

  const handleFallback = useCallback(() => {
    setMode('fallback');
  }, []);

  const handleRetry = useCallback(() => {
    bootFailed = false;
    bootPromise = null;
    webcontainerInstance = null;
    setMode('loading');
    setTimeout(() => setMode('webcontainer'), 50);
  }, []);

  return (
    <div className="flex flex-col h-full relative" style={{ background: '#0a0a12' }}>
      {mode === 'fallback' && (
        <div className="absolute top-1 right-2 z-10 flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-[9px] text-accent-orange px-1.5 py-0.5 rounded" style={{ background: 'hsl(var(--surface-2))' }}>
            <AlertTriangle size={9} />
            Fallback mode
          </span>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1 text-[9px] text-text-tertiary hover:text-foreground px-1.5 py-0.5 rounded transition-colors"
            style={{ background: 'hsl(var(--surface-2))' }}
            title="Retry WebContainer"
          >
            <RotateCcw size={9} />
            Retry
          </button>
        </div>
      )}
      <div ref={termRef} className="flex-1 overflow-hidden" />
      {mode === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-text-tertiary" />
        </div>
      )}
      {mode === 'webcontainer' && (
        <WebContainerTerminal termRef={termRef} onFallback={handleFallback} />
      )}
      {mode === 'fallback' && (
        <SmartFallbackTerminal termRef={termRef} />
      )}
    </div>
  );
};

export default TerminalPanel;
