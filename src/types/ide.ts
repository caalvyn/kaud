export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  language?: string;
  path: string;
}

export interface EditorTab {
  id: string;
  fileId: string;
  name: string;
  path: string;
  language: string;
  isModified: boolean;
  splitGroup?: 'left' | 'right';
}

export type SidebarView = 'explorer' | 'search' | 'git' | 'extensions' | 'ai' | 'settings';
export type BottomPanelView = 'terminal' | 'problems' | 'output' | 'debug';

export interface Extension {
  id: string;
  name: string;
  publisher: string;
  description: string;
  version: string;
  icon?: string;
  installed: boolean;
  enabled: boolean;
  category: string;
  downloads: number;
  rating: number;
  // Extension API fields
  activationEvents?: string[];
  contributes?: ExtensionContributions;
}

export interface ExtensionContributions {
  commands?: ExtensionCommand[];
  languages?: ExtensionLanguage[];
  themes?: ExtensionTheme[];
  iconThemes?: string[];
}

export interface ExtensionCommand {
  id: string;
  title: string;
  keybinding?: string;
}

export interface ExtensionLanguage {
  id: string;
  extensions: string[];
  aliases: string[];
}

export interface ExtensionTheme {
  id: string;
  label: string;
  uiTheme: 'vs-dark' | 'vs' | 'hc-black';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface GitChange {
  file: string;
  status: 'modified' | 'added' | 'deleted' | 'untracked';
  staged: boolean;
}

export interface Problem {
  file: string;
  line: number;
  col: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  source: string;
}

// Extension API types
export interface ExtensionAPI {
  registerCommand: (id: string, handler: () => void) => void;
  registerLanguage: (language: ExtensionLanguage) => void;
  registerTheme: (theme: ExtensionTheme) => void;
  getActiveFile: () => FileNode | null;
  openFile: (path: string) => void;
  showNotification: (message: string, type?: 'info' | 'warning' | 'error') => void;
}

export interface ExtensionManifest {
  id: string;
  name: string;
  version: string;
  publisher: string;
  description: string;
  activationEvents: string[];
  contributes: ExtensionContributions;
  main?: string;
}

// Marketplace types
export interface MarketplaceExtension {
  id: string;
  name: string;
  publisher: string;
  description: string;
  version: string;
  category: string;
  downloads: number;
  rating: number;
  icon?: string;
  verified: boolean;
  lastUpdated: string;
  tags: string[];
}

export type MarketplaceCategory = 'All' | 'Language' | 'Themes' | 'Formatters' | 'Linters' | 'AI' | 'DevOps' | 'Visual' | 'Source Control';
