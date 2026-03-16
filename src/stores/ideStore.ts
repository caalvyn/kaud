import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FileNode, EditorTab, SidebarView, BottomPanelView, Extension, ChatMessage, GitChange, Problem, ExtensionCommand } from '@/types/ide';

// Sample project files
const sampleFiles: FileNode[] = [
  {
    id: 'root',
    name: 'lumina-project',
    type: 'folder',
    path: '/lumina-project',
    children: [
      {
        id: 'src',
        name: 'src',
        type: 'folder',
        path: '/lumina-project/src',
        children: [
          {
            id: 'app-tsx',
            name: 'App.tsx',
            type: 'file',
            path: '/lumina-project/src/App.tsx',
            language: 'typescript',
            content: `import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;`,
          },
          {
            id: 'main-tsx',
            name: 'main.tsx',
            type: 'file',
            path: '/lumina-project/src/main.tsx',
            language: 'typescript',
            content: `import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);`,
          },
          {
            id: 'index-css',
            name: 'index.css',
            type: 'file',
            path: '/lumina-project/src/index.css',
            language: 'css',
            content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #3b82f6;
  --background: #0a0a0f;
  --foreground: #e2e8f0;
}

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background: var(--background);
  color: var(--foreground);
}`,
          },
          {
            id: 'pages',
            name: 'pages',
            type: 'folder',
            path: '/lumina-project/src/pages',
            children: [
              {
                id: 'homepage',
                name: 'HomePage.tsx',
                type: 'file',
                path: '/lumina-project/src/pages/HomePage.tsx',
                language: 'typescript',
                content: `import React from 'react';

interface HeroProps {
  title: string;
  subtitle: string;
}

const Hero: React.FC<HeroProps> = ({ title, subtitle }) => (
  <section className="hero">
    <h1>{title}</h1>
    <p>{subtitle}</p>
    <button className="cta-button">Get Started</button>
  </section>
);

const HomePage: React.FC = () => {
  return (
    <main>
      <Hero 
        title="Welcome to Lumina" 
        subtitle="The next-generation code editor"
      />
    </main>
  );
};

export default HomePage;`,
              },
              {
                id: 'dashboard',
                name: 'Dashboard.tsx',
                type: 'file',
                path: '/lumina-project/src/pages/Dashboard.tsx',
                language: 'typescript',
                content: `import React, { useState, useEffect } from 'react';

interface Metric {
  label: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    setMetrics([
      { label: 'Active Users', value: 1247, trend: 'up' },
      { label: 'Revenue', value: 52400, trend: 'up' },
      { label: 'Churn Rate', value: 2.3, trend: 'down' },
    ]);
  }, []);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="metrics-grid">
        {metrics.map((metric) => (
          <div key={metric.label} className="metric-card">
            <span className="label">{metric.label}</span>
            <span className="value">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;`,
              },
            ],
          },
          {
            id: 'components',
            name: 'components',
            type: 'folder',
            path: '/lumina-project/src/components',
            children: [
              {
                id: 'button-tsx',
                name: 'Button.tsx',
                type: 'file',
                path: '/lumina-project/src/components/Button.tsx',
                language: 'typescript',
                content: `import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
}) => {
  return (
    <button
      className={\`btn btn-\${variant} btn-\${size}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;`,
              },
            ],
          },
        ],
      },
      {
        id: 'package-json',
        name: 'package.json',
        type: 'file',
        path: '/lumina-project/package.json',
        language: 'json',
        content: `{
  "name": "lumina-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.0"
  }
}`,
      },
      {
        id: 'readme',
        name: 'README.md',
        type: 'file',
        path: '/lumina-project/README.md',
        language: 'markdown',
        content: `# Lumina Project\n\nA modern web application built with React and TypeScript.\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\``,
      },
      {
        id: 'tsconfig',
        name: 'tsconfig.json',
        type: 'file',
        path: '/lumina-project/tsconfig.json',
        language: 'json',
        content: `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}`,
      },
    ],
  },
];

const sampleExtensions: Extension[] = [
  {
    id: 'ext-prettier', name: 'Prettier', publisher: 'Prettier', description: 'Code formatter using Prettier', version: '10.4.0',
    installed: true, enabled: true, category: 'Formatters', downloads: 42500000, rating: 4.7,
    activationEvents: ['onLanguage:javascript', 'onLanguage:typescript', 'onLanguage:css'],
    contributes: {
      commands: [{ id: 'prettier.format', title: 'Format Document', keybinding: '⌘⇧F' }],
    },
  },
  {
    id: 'ext-eslint', name: 'ESLint', publisher: 'Microsoft', description: 'Integrates ESLint into the editor', version: '3.0.10',
    installed: true, enabled: true, category: 'Linters', downloads: 35200000, rating: 4.6,
    activationEvents: ['onLanguage:javascript', 'onLanguage:typescript'],
    contributes: {
      commands: [{ id: 'eslint.fix', title: 'Fix All Auto-fixable Problems' }],
    },
  },
  {
    id: 'ext-gitlens', name: 'GitLens', publisher: 'GitKraken', description: 'Supercharge Git within the editor', version: '15.6.0',
    installed: false, enabled: false, category: 'Source Control', downloads: 28900000, rating: 4.5,
    activationEvents: ['onStartup'],
    contributes: {
      commands: [{ id: 'gitlens.blame', title: 'Toggle File Blame' }],
    },
  },
  {
    id: 'ext-tailwind', name: 'Tailwind CSS IntelliSense', publisher: 'Tailwind Labs', description: 'Intelligent Tailwind CSS tooling', version: '0.12.8',
    installed: true, enabled: true, category: 'Language', downloads: 15600000, rating: 4.8,
    activationEvents: ['onLanguage:html', 'onLanguage:css', 'onLanguage:typescript'],
    contributes: {
      languages: [{ id: 'tailwindcss', extensions: ['.css'], aliases: ['Tailwind CSS'] }],
    },
  },
  {
    id: 'ext-copilot', name: 'AI Copilot', publisher: 'Lumina', description: 'AI-powered code completion and suggestions', version: '1.0.0',
    installed: true, enabled: true, category: 'AI', downloads: 8200000, rating: 4.4,
    activationEvents: ['onStartup'],
    contributes: {
      commands: [
        { id: 'copilot.suggest', title: 'Trigger Inline Suggestion', keybinding: '⌘⇧Space' },
        { id: 'copilot.explain', title: 'Explain Selection' },
      ],
    },
  },
  {
    id: 'ext-icons', name: 'Material Icons', publisher: 'PKief', description: 'Material Design icons for your file tree', version: '5.5.0',
    installed: false, enabled: false, category: 'Themes', downloads: 18700000, rating: 4.9,
    activationEvents: ['onStartup'],
    contributes: { iconThemes: ['material-icon-theme'] },
  },
  {
    id: 'ext-bracket', name: 'Rainbow Brackets', publisher: 'Bracket Pair', description: 'Colorize matching brackets', version: '2.1.0',
    installed: false, enabled: false, category: 'Visual', downloads: 9100000, rating: 4.3,
    activationEvents: ['onStartup'],
  },
  {
    id: 'ext-docker', name: 'Docker', publisher: 'Microsoft', description: 'Docker support for building and deploying', version: '1.29.0',
    installed: false, enabled: false, category: 'DevOps', downloads: 22400000, rating: 4.5,
    activationEvents: ['onLanguage:dockerfile', 'workspaceContains:Dockerfile'],
    contributes: {
      languages: [{ id: 'dockerfile', extensions: ['Dockerfile', '.dockerfile'], aliases: ['Dockerfile'] }],
      commands: [{ id: 'docker.build', title: 'Docker: Build Image' }],
    },
  },
  {
    id: 'ext-python', name: 'Python', publisher: 'Microsoft', description: 'Rich support for the Python language', version: '2024.8.0',
    installed: false, enabled: false, category: 'Language', downloads: 45000000, rating: 4.7,
    activationEvents: ['onLanguage:python'],
    contributes: {
      languages: [{ id: 'python', extensions: ['.py', '.pyw'], aliases: ['Python'] }],
      commands: [{ id: 'python.run', title: 'Run Python File' }],
    },
  },
  {
    id: 'ext-rust', name: 'rust-analyzer', publisher: 'rust-lang', description: 'Rust language support with analyzer', version: '0.4.2035',
    installed: false, enabled: false, category: 'Language', downloads: 5800000, rating: 4.8,
    activationEvents: ['onLanguage:rust'],
    contributes: {
      languages: [{ id: 'rust', extensions: ['.rs'], aliases: ['Rust'] }],
    },
  },
  // Marketplace-only extensions
  {
    id: 'ext-go', name: 'Go', publisher: 'Go Team at Google', description: 'Rich Go language support', version: '0.42.0',
    installed: false, enabled: false, category: 'Language', downloads: 12300000, rating: 4.6,
    activationEvents: ['onLanguage:go'],
    contributes: {
      languages: [{ id: 'go', extensions: ['.go'], aliases: ['Go', 'Golang'] }],
    },
  },
  {
    id: 'ext-svelte', name: 'Svelte for VS Code', publisher: 'Svelte', description: 'Svelte language support', version: '108.4.0',
    installed: false, enabled: false, category: 'Language', downloads: 3400000, rating: 4.5,
    activationEvents: ['onLanguage:svelte'],
    contributes: {
      languages: [{ id: 'svelte', extensions: ['.svelte'], aliases: ['Svelte'] }],
    },
  },
  {
    id: 'ext-one-dark', name: 'One Dark Pro', publisher: 'binaryify', description: 'Atom\'s iconic One Dark theme', version: '3.17.0',
    installed: false, enabled: false, category: 'Themes', downloads: 25600000, rating: 4.8,
    activationEvents: ['onStartup'],
    contributes: {
      themes: [{ id: 'one-dark-pro', label: 'One Dark Pro', uiTheme: 'vs-dark' }],
    },
  },
  {
    id: 'ext-github-theme', name: 'GitHub Theme', publisher: 'GitHub', description: 'GitHub\'s official VS Code themes', version: '6.3.5',
    installed: false, enabled: false, category: 'Themes', downloads: 14200000, rating: 4.4,
    activationEvents: ['onStartup'],
    contributes: {
      themes: [
        { id: 'github-dark', label: 'GitHub Dark', uiTheme: 'vs-dark' },
        { id: 'github-light', label: 'GitHub Light', uiTheme: 'vs' },
      ],
    },
  },
  {
    id: 'ext-jest', name: 'Jest Runner', publisher: 'firsttris', description: 'Run and debug Jest tests', version: '0.4.72',
    installed: false, enabled: false, category: 'DevOps', downloads: 7800000, rating: 4.3,
    activationEvents: ['workspaceContains:jest.config.*'],
    contributes: {
      commands: [{ id: 'jest.run', title: 'Run Test' }, { id: 'jest.debug', title: 'Debug Test' }],
    },
  },
];

const sampleGitChanges: GitChange[] = [
  { file: 'src/App.tsx', status: 'modified', staged: false },
  { file: 'src/pages/Dashboard.tsx', status: 'modified', staged: true },
  { file: 'src/components/Modal.tsx', status: 'added', staged: false },
  { file: 'src/utils/deprecated.ts', status: 'deleted', staged: false },
];

const sampleProblems: Problem[] = [
  { file: 'src/App.tsx', line: 12, col: 5, severity: 'warning', message: "'Dashboard' is defined but never used", source: 'typescript' },
  { file: 'src/pages/HomePage.tsx', line: 8, col: 3, severity: 'info', message: "Consider extracting Hero into a separate file", source: 'eslint' },
  { file: 'src/components/Button.tsx', line: 15, col: 22, severity: 'warning', message: "Template literal can be simplified", source: 'eslint' },
];

const getLanguageFromName = (name: string): string => {
  const ext = name.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    css: 'css', json: 'json', md: 'markdown', html: 'html', py: 'python',
    rs: 'rust', go: 'go', yaml: 'yaml', yml: 'yaml', toml: 'toml',
    dockerfile: 'dockerfile', svelte: 'svelte',
  };
  return map[ext || ''] || 'plaintext';
};

interface IDEState {
  // Layout
  sidebarView: SidebarView;
  sidebarOpen: boolean;
  bottomPanelOpen: boolean;
  bottomPanelView: BottomPanelView;
  bottomPanelHeight: number;
  sidebarWidth: number;
  aiPanelOpen: boolean;
  aiPanelWidth: number;
  commandPaletteOpen: boolean;
  splitEditorOpen: boolean;
  
  // Files
  files: FileNode[];
  expandedFolders: Set<string>;
  selectedFileId: string | null;
  
  // Context menu
  contextMenu: { x: number; y: number; nodeId: string; nodeType: 'file' | 'folder' } | null;
  renamingNodeId: string | null;
  
  // Editor
  tabs: EditorTab[];
  activeTabId: string | null;
  rightTabs: EditorTab[];
  activeRightTabId: string | null;
  
  // Extensions
  extensions: Extension[];
  registeredCommands: Map<string, { title: string; handler?: () => void }>;
  marketplaceCategory: string;
  marketplaceSearch: string;
  
  // Chat
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  
  // Git
  gitChanges: GitChange[];
  gitBranch: string;
  
  // Problems
  problems: Problem[];
  
  // Search
  searchQuery: string;
  searchResults: { file: string; line: number; text: string; }[];
  
  // Terminal
  terminalHistory: string[];
  
  // Actions - Layout
  setSidebarView: (view: SidebarView) => void;
  toggleSidebar: () => void;
  toggleBottomPanel: () => void;
  setBottomPanelView: (view: BottomPanelView) => void;
  toggleAIPanel: () => void;
  toggleCommandPalette: () => void;
  toggleSplitEditor: () => void;
  
  // Actions - Files
  toggleFolder: (folderId: string) => void;
  openFile: (file: FileNode) => void;
  openFileInSplit: (file: FileNode) => void;
  closeTab: (tabId: string) => void;
  closeRightTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  setActiveRightTab: (tabId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  createFile: (parentId: string, name: string) => void;
  createFolder: (parentId: string, name: string) => void;
  deleteNode: (nodeId: string) => void;
  renameNode: (nodeId: string, newName: string) => void;
  setContextMenu: (menu: IDEState['contextMenu']) => void;
  setRenamingNodeId: (id: string | null) => void;
  
  // Actions - Extensions
  toggleExtension: (extId: string) => void;
  installExtension: (extId: string) => void;
  registerCommand: (id: string, title: string, handler?: () => void) => void;
  setMarketplaceCategory: (cat: string) => void;
  setMarketplaceSearch: (q: string) => void;
  
  // Actions - Chat
  addChatMessage: (message: ChatMessage) => void;
  setChatLoading: (loading: boolean) => void;
  updateLastAssistantMessage: (content: string) => void;
  
  // Actions - Other
  setSearchQuery: (query: string) => void;
  addTerminalLine: (line: string) => void;
  stageFile: (file: string) => void;
  unstageFile: (file: string) => void;
}

export const useIDEStore = create<IDEState>((set, get) => ({
  sidebarView: 'explorer',
  sidebarOpen: true,
  bottomPanelOpen: true,
  bottomPanelView: 'terminal',
  bottomPanelHeight: 200,
  sidebarWidth: 260,
  aiPanelOpen: false,
  aiPanelWidth: 360,
  commandPaletteOpen: false,
  splitEditorOpen: false,
  
  files: sampleFiles,
  expandedFolders: new Set(['root', 'src', 'pages', 'components']),
  selectedFileId: 'app-tsx',
  
  contextMenu: null,
  renamingNodeId: null,
  
  tabs: [
    { id: 'tab-app', fileId: 'app-tsx', name: 'App.tsx', path: '/src/App.tsx', language: 'typescript', isModified: false },
  ],
  activeTabId: 'tab-app',
  rightTabs: [],
  activeRightTabId: null,
  
  extensions: sampleExtensions,
  registeredCommands: new Map(),
  marketplaceCategory: 'All',
  marketplaceSearch: '',
  
  chatMessages: [],
  chatLoading: false,
  gitChanges: sampleGitChanges,
  gitBranch: 'main',
  problems: sampleProblems,
  searchQuery: '',
  searchResults: [],
  terminalHistory: [
    '$ cd lumina-project',
    '$ npm install',
    'added 347 packages in 4.2s',
    '$ npm run dev',
    '',
    '  VITE v5.4.19  ready in 312 ms',
    '',
    '  ➜  Local:   http://localhost:5173/',
    '  ➜  Network: http://192.168.1.42:5173/',
    '  ➜  press h + enter to show help',
    '',
  ],
  
  setSidebarView: (view) => set({ sidebarView: view, sidebarOpen: true }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleBottomPanel: () => set((s) => ({ bottomPanelOpen: !s.bottomPanelOpen })),
  setBottomPanelView: (view) => set({ bottomPanelView: view, bottomPanelOpen: true }),
  toggleAIPanel: () => set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  toggleSplitEditor: () => set((s) => ({ splitEditorOpen: !s.splitEditorOpen })),
  
  toggleFolder: (folderId) => set((s) => {
    const next = new Set(s.expandedFolders);
    next.has(folderId) ? next.delete(folderId) : next.add(folderId);
    return { expandedFolders: next };
  }),
  
  openFile: (file) => {
    if (file.type !== 'file') return;
    const state = get();
    const existing = state.tabs.find((t) => t.fileId === file.id);
    if (existing) {
      set({ activeTabId: existing.id, selectedFileId: file.id });
    } else {
      const newTab: EditorTab = {
        id: `tab-${file.id}-${Date.now()}`,
        fileId: file.id,
        name: file.name,
        path: file.path,
        language: file.language || getLanguageFromName(file.name),
        isModified: false,
      };
      set({
        tabs: [...state.tabs, newTab],
        activeTabId: newTab.id,
        selectedFileId: file.id,
      });
    }
  },
  
  openFileInSplit: (file) => {
    if (file.type !== 'file') return;
    const state = get();
    const existing = state.rightTabs.find((t) => t.fileId === file.id);
    if (existing) {
      set({ activeRightTabId: existing.id, splitEditorOpen: true });
    } else {
      const newTab: EditorTab = {
        id: `rtab-${file.id}-${Date.now()}`,
        fileId: file.id,
        name: file.name,
        path: file.path,
        language: file.language || getLanguageFromName(file.name),
        isModified: false,
        splitGroup: 'right',
      };
      set({
        rightTabs: [...state.rightTabs, newTab],
        activeRightTabId: newTab.id,
        splitEditorOpen: true,
      });
    }
  },
  
  closeTab: (tabId) => set((s) => {
    const tabs = s.tabs.filter((t) => t.id !== tabId);
    let activeTabId = s.activeTabId;
    if (activeTabId === tabId) {
      activeTabId = tabs.length > 0 ? tabs[tabs.length - 1].id : null;
    }
    return { tabs, activeTabId };
  }),
  
  closeRightTab: (tabId) => set((s) => {
    const rightTabs = s.rightTabs.filter((t) => t.id !== tabId);
    let activeRightTabId = s.activeRightTabId;
    if (activeRightTabId === tabId) {
      activeRightTabId = rightTabs.length > 0 ? rightTabs[rightTabs.length - 1].id : null;
    }
    const splitEditorOpen = rightTabs.length > 0;
    return { rightTabs, activeRightTabId, splitEditorOpen };
  }),
  
  setActiveTab: (tabId) => {
    const tab = get().tabs.find((t) => t.id === tabId);
    set({ activeTabId: tabId, selectedFileId: tab?.fileId || null });
  },
  
  setActiveRightTab: (tabId) => {
    set({ activeRightTabId: tabId });
  },
  
  updateFileContent: (fileId, content) => set((s) => {
    const updateNode = (nodes: FileNode[]): FileNode[] =>
      nodes.map((n) => {
        if (n.id === fileId) return { ...n, content };
        if (n.children) return { ...n, children: updateNode(n.children) };
        return n;
      });
    const tabs = s.tabs.map((t) => t.fileId === fileId ? { ...t, isModified: true } : t);
    const rightTabs = s.rightTabs.map((t) => t.fileId === fileId ? { ...t, isModified: true } : t);
    return { files: updateNode(s.files), tabs, rightTabs };
  }),
  
  createFile: (parentId, name) => set((s) => {
    const id = `file-${Date.now()}`;
    const lang = getLanguageFromName(name);
    const addToParent = (nodes: FileNode[]): FileNode[] =>
      nodes.map((n) => {
        if (n.id === parentId && n.type === 'folder') {
          const newFile: FileNode = {
            id, name, type: 'file', path: `${n.path}/${name}`, language: lang, content: '',
          };
          return { ...n, children: [...(n.children || []), newFile] };
        }
        if (n.children) return { ...n, children: addToParent(n.children) };
        return n;
      });
    const expanded = new Set(s.expandedFolders);
    expanded.add(parentId);
    return { files: addToParent(s.files), expandedFolders: expanded };
  }),
  
  createFolder: (parentId, name) => set((s) => {
    const id = `folder-${Date.now()}`;
    const addToParent = (nodes: FileNode[]): FileNode[] =>
      nodes.map((n) => {
        if (n.id === parentId && n.type === 'folder') {
          const newFolder: FileNode = {
            id, name, type: 'folder', path: `${n.path}/${name}`, children: [],
          };
          return { ...n, children: [...(n.children || []), newFolder] };
        }
        if (n.children) return { ...n, children: addToParent(n.children) };
        return n;
      });
    const expanded = new Set(s.expandedFolders);
    expanded.add(parentId);
    return { files: addToParent(s.files), expandedFolders: expanded };
  }),
  
  deleteNode: (nodeId) => set((s) => {
    const removeNode = (nodes: FileNode[]): FileNode[] =>
      nodes.filter((n) => n.id !== nodeId).map((n) => {
        if (n.children) return { ...n, children: removeNode(n.children) };
        return n;
      });
    // Close any tabs for the deleted file
    const tabs = s.tabs.filter((t) => t.fileId !== nodeId);
    const rightTabs = s.rightTabs.filter((t) => t.fileId !== nodeId);
    let activeTabId = s.activeTabId;
    if (s.tabs.find((t) => t.id === activeTabId)?.fileId === nodeId) {
      activeTabId = tabs.length > 0 ? tabs[tabs.length - 1].id : null;
    }
    return { files: removeNode(s.files), tabs, rightTabs, activeTabId };
  }),
  
  renameNode: (nodeId, newName) => set((s) => {
    const rename = (nodes: FileNode[]): FileNode[] =>
      nodes.map((n) => {
        if (n.id === nodeId) {
          const pathParts = n.path.split('/');
          pathParts[pathParts.length - 1] = newName;
          return { ...n, name: newName, path: pathParts.join('/'), language: n.type === 'file' ? getLanguageFromName(newName) : n.language };
        }
        if (n.children) return { ...n, children: rename(n.children) };
        return n;
      });
    const tabs = s.tabs.map((t) => t.fileId === nodeId ? { ...t, name: newName } : t);
    const rightTabs = s.rightTabs.map((t) => t.fileId === nodeId ? { ...t, name: newName } : t);
    return { files: rename(s.files), tabs, rightTabs, renamingNodeId: null };
  }),
  
  setContextMenu: (menu) => set({ contextMenu: menu }),
  setRenamingNodeId: (id) => set({ renamingNodeId: id }),
  
  toggleExtension: (extId) => set((s) => ({
    extensions: s.extensions.map((e) => e.id === extId ? { ...e, enabled: !e.enabled } : e),
  })),
  
  installExtension: (extId) => set((s) => ({
    extensions: s.extensions.map((e) => e.id === extId ? { ...e, installed: !e.installed, enabled: !e.installed } : e),
  })),
  
  registerCommand: (id, title, handler) => set((s) => {
    const cmds = new Map(s.registeredCommands);
    cmds.set(id, { title, handler });
    return { registeredCommands: cmds };
  }),
  
  setMarketplaceCategory: (cat) => set({ marketplaceCategory: cat }),
  setMarketplaceSearch: (q) => set({ marketplaceSearch: q }),
  
  addChatMessage: (message) => set((s) => ({ chatMessages: [...s.chatMessages, message] })),
  setChatLoading: (loading) => set({ chatLoading: loading }),
  updateLastAssistantMessage: (content) => set((s) => {
    const msgs = [...s.chatMessages];
    const last = msgs[msgs.length - 1];
    if (last?.role === 'assistant') {
      msgs[msgs.length - 1] = { ...last, content };
    } else {
      msgs.push({ id: `msg-${Date.now()}`, role: 'assistant', content, timestamp: new Date() });
    }
    return { chatMessages: msgs };
  }),
  
  setSearchQuery: (query) => {
    if (!query.trim()) { set({ searchQuery: query, searchResults: [] }); return; }
    const results: { file: string; line: number; text: string; }[] = [];
    const searchIn = (nodes: FileNode[]) => {
      for (const n of nodes) {
        if (n.type === 'file' && n.content) {
          n.content.split('\n').forEach((line, idx) => {
            if (line.toLowerCase().includes(query.toLowerCase())) {
              results.push({ file: n.path, line: idx + 1, text: line.trim() });
            }
          });
        }
        if (n.children) searchIn(n.children);
      }
    };
    searchIn(get().files);
    set({ searchQuery: query, searchResults: results });
  },
  
  addTerminalLine: (line) => set((s) => ({ terminalHistory: [...s.terminalHistory, line] })),
  
  stageFile: (file) => set((s) => ({
    gitChanges: s.gitChanges.map((c) => c.file === file ? { ...c, staged: true } : c),
  })),
  unstageFile: (file) => set((s) => ({
    gitChanges: s.gitChanges.map((c) => c.file === file ? { ...c, staged: false } : c),
  })),
}));
