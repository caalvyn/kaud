import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FileNode, EditorTab, SidebarView, BottomPanelView, Extension, ChatMessage, GitChange, Problem, ExtensionCommand } from '@/types/ide';

// Start with empty file tree — each user builds their own
const sampleFiles: FileNode[] = [];

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
    id: 'ext-copilot', name: 'AI Copilot', publisher: 'KAUD', description: 'AI-powered code completion and suggestions', version: '1.0.0',
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

export const useIDEStore = create<IDEState>()(persist((set, get) => ({
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
  expandedFolders: new Set<string>(),
  selectedFileId: null,
  
  contextMenu: null,
  renamingNodeId: null,
  
  tabs: [],
  activeTabId: null,
  rightTabs: [],
  activeRightTabId: null,
  
  extensions: sampleExtensions,
  registeredCommands: new Map(),
  marketplaceCategory: 'All',
  marketplaceSearch: '',
  
  chatMessages: [],
  chatLoading: false,
  gitChanges: [],
  gitBranch: 'main',
  problems: [],
  searchQuery: '',
  searchResults: [],
  terminalHistory: [
    '$ Welcome to KAUD IDE',
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
    if (parentId === 'root') {
      const newFile: FileNode = { id, name, type: 'file', path: `/${name}`, language: lang, content: '' };
      return { files: [...s.files, newFile] };
    }
    const addToParent = (nodes: FileNode[]): FileNode[] =>
      nodes.map((n) => {
        if (n.id === parentId && n.type === 'folder') {
          const newFile: FileNode = { id, name, type: 'file', path: `${n.path}/${name}`, language: lang, content: '' };
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
    if (parentId === 'root') {
      const newFolder: FileNode = { id, name, type: 'folder', path: `/${name}`, children: [] };
      return { files: [...s.files, newFolder] };
    }
    const addToParent = (nodes: FileNode[]): FileNode[] =>
      nodes.map((n) => {
        if (n.id === parentId && n.type === 'folder') {
          const newFolder: FileNode = { id, name, type: 'folder', path: `${n.path}/${name}`, children: [] };
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
}), {
  name: 'lumina-ide-storage-v2',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    files: state.files,
    expandedFolders: Array.from(state.expandedFolders),
    tabs: state.tabs,
    activeTabId: state.activeTabId,
    rightTabs: state.rightTabs,
    activeRightTabId: state.activeRightTabId,
    splitEditorOpen: state.splitEditorOpen,
    extensions: state.extensions,
    chatMessages: state.chatMessages,
    gitChanges: state.gitChanges,
    gitBranch: state.gitBranch,
    terminalHistory: state.terminalHistory,
    sidebarOpen: state.sidebarOpen,
    bottomPanelOpen: state.bottomPanelOpen,
    aiPanelOpen: state.aiPanelOpen,
  }),
  merge: (persisted: any, current) => {
    if (!persisted) return current;
    return {
      ...current,
      ...persisted,
      expandedFolders: new Set(persisted.expandedFolders || []),
      registeredCommands: current.registeredCommands,
      chatMessages: (persisted.chatMessages || []).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
    };
  },
}));
