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
