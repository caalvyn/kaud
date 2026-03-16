/**
 * KAUD Extension API
 * 
 * This module provides the extension system architecture for KAUD.
 * Extensions can register commands, languages, themes, and more.
 * 
 * Architecture:
 * - ExtensionHost: Manages extension lifecycle (activation, deactivation)
 * - ExtensionContext: Provided to each extension on activation
 * - Contribution Points: commands, languages, themes, iconThemes
 * 
 * VS Code Compatibility Notes:
 * ✅ Supported now: commands, languages, themes (manifest-based)
 * 🔧 Scaffolded: activation events, command keybindings
 * 📋 Planned: webview, debugger, task providers, tree views
 */

import type { ExtensionManifest, ExtensionCommand, ExtensionLanguage, ExtensionTheme, ExtensionAPI, FileNode } from '@/types/ide';

// Command Registry
class CommandRegistry {
  private commands = new Map<string, { title: string; handler: () => void }>();

  register(id: string, title: string, handler: () => void) {
    this.commands.set(id, { title, handler });
  }

  execute(id: string) {
    const cmd = this.commands.get(id);
    if (cmd) cmd.handler();
    else console.warn(`[KAUD] Command not found: ${id}`);
  }

  getAll(): { id: string; title: string }[] {
    return Array.from(this.commands.entries()).map(([id, { title }]) => ({ id, title }));
  }

  has(id: string): boolean {
    return this.commands.has(id);
  }
}

// Language Registry
class LanguageRegistry {
  private languages = new Map<string, ExtensionLanguage>();

  register(language: ExtensionLanguage) {
    this.languages.set(language.id, language);
  }

  getByExtension(ext: string): ExtensionLanguage | undefined {
    for (const lang of this.languages.values()) {
      if (lang.extensions.some((e) => e === ext || e === `.${ext}`)) return lang;
    }
    return undefined;
  }

  getAll(): ExtensionLanguage[] {
    return Array.from(this.languages.values());
  }
}

// Theme Registry
class ThemeRegistry {
  private themes = new Map<string, ExtensionTheme>();

  register(theme: ExtensionTheme) {
    this.themes.set(theme.id, theme);
  }

  getAll(): ExtensionTheme[] {
    return Array.from(this.themes.values());
  }
}

// Extension Host - manages the lifecycle of extensions
export class ExtensionHost {
  readonly commands = new CommandRegistry();
  readonly languages = new LanguageRegistry();
  readonly themes = new ThemeRegistry();

  private activeExtensions = new Set<string>();
  private notifications: { message: string; type: string }[] = [];

  /**
   * Create an API context for a specific extension
   */
  createAPI(extensionId: string): ExtensionAPI {
    return {
      registerCommand: (id, handler) => {
        this.commands.register(`${extensionId}.${id}`, id, handler);
      },
      registerLanguage: (language) => {
        this.languages.register(language);
      },
      registerTheme: (theme) => {
        this.themes.register(theme);
      },
      getActiveFile: () => null, // To be connected to editor state
      openFile: (_path) => {
        console.log(`[Lumina Extension API] openFile called with: ${_path}`);
      },
      showNotification: (message, type = 'info') => {
        this.notifications.push({ message, type });
        console.log(`[Lumina Notification] [${type}] ${message}`);
      },
    };
  }

  /**
   * Activate an extension from its manifest
   */
  activate(manifest: ExtensionManifest) {
    if (this.activeExtensions.has(manifest.id)) return;

    // Register contributions
    if (manifest.contributes.commands) {
      for (const cmd of manifest.contributes.commands) {
        this.commands.register(cmd.id, cmd.title, () => {
          console.log(`[Lumina] Executing command: ${cmd.title}`);
        });
      }
    }

    if (manifest.contributes.languages) {
      for (const lang of manifest.contributes.languages) {
        this.languages.register(lang);
      }
    }

    if (manifest.contributes.themes) {
      for (const theme of manifest.contributes.themes) {
        this.themes.register(theme);
      }
    }

    this.activeExtensions.add(manifest.id);
    console.log(`[Lumina] Extension activated: ${manifest.name}`);
  }

  /**
   * Deactivate an extension
   */
  deactivate(extensionId: string) {
    this.activeExtensions.delete(extensionId);
    console.log(`[Lumina] Extension deactivated: ${extensionId}`);
  }

  /**
   * Check if an activation event matches
   */
  shouldActivate(manifest: ExtensionManifest, event: string): boolean {
    return manifest.activationEvents.some((ae) => {
      if (ae === '*' || ae === 'onStartup') return true;
      if (ae === event) return true;
      if (ae.startsWith('onLanguage:') && event.startsWith('onLanguage:')) {
        return ae === event;
      }
      if (ae.startsWith('workspaceContains:')) {
        // Would check workspace files
        return false;
      }
      return false;
    });
  }

  isActive(extensionId: string): boolean {
    return this.activeExtensions.has(extensionId);
  }

  getNotifications() {
    return [...this.notifications];
  }
}

// Singleton instance
export const extensionHost = new ExtensionHost();

/**
 * Supported Extension Capabilities:
 * 
 * ✅ WORKING NOW:
 * - Command registration and execution
 * - Language contribution (file extension mapping)
 * - Theme contribution (theme metadata)
 * - Activation events (onStartup, onLanguage:*)
 * - Extension install/uninstall/enable/disable
 * - Marketplace browsing with categories
 * 
 * 🔧 SCAFFOLDED (architecture ready):
 * - Extension API (registerCommand, registerLanguage, etc.)
 * - Extension Host lifecycle management
 * - Keybinding contributions
 * - Icon theme contributions
 * 
 * 📋 PLANNED FOR NEXT VERSION:
 * - Webview API (custom editor panels)
 * - Tree View API (custom sidebar views)  
 * - Debug Adapter Protocol
 * - Task Provider API
 * - Source Control API
 * - Language Server Protocol integration
 * - Extension storage/state persistence
 * - Extension settings contribution
 * - Open VSX registry integration
 * - Sandboxed extension execution (Web Workers)
 */
