import React from 'react';
import { Monitor, Palette, Type, Keyboard, Code2, Blocks, Globe, Save } from 'lucide-react';

const settingsSections = [
  {
    title: 'Editor',
    icon: Code2,
    settings: [
      { label: 'Font Size', type: 'number', value: 13 },
      { label: 'Font Family', type: 'text', value: 'JetBrains Mono' },
      { label: 'Tab Size', type: 'number', value: 2 },
      { label: 'Word Wrap', type: 'toggle', value: true },
      { label: 'Minimap Enabled', type: 'toggle', value: true },
      { label: 'Bracket Pair Colorization', type: 'toggle', value: true },
      { label: 'Smooth Scrolling', type: 'toggle', value: true },
      { label: 'Line Numbers', type: 'toggle', value: true },
    ],
  },
  {
    title: 'Appearance',
    icon: Palette,
    settings: [
      { label: 'Color Theme', type: 'select', value: 'KAUD Dark', options: ['KAUD Dark', 'KAUD Light', 'Monokai', 'Solarized'] },
      { label: 'Icon Theme', type: 'select', value: 'Material Icons', options: ['Material Icons', 'Seti', 'Default'] },
      { label: 'Sidebar Position', type: 'select', value: 'Left', options: ['Left', 'Right'] },
    ],
  },
  {
    title: 'Keybindings',
    icon: Keyboard,
    settings: [
      { label: 'Keybinding Preset', type: 'select', value: 'Default', options: ['Default', 'Vim', 'Emacs'] },
    ],
  },
  {
    title: 'AI Assistant',
    icon: Globe,
    settings: [
      { label: 'AI Provider', type: 'select', value: 'Lumina AI', options: ['Lumina AI', 'OpenAI', 'Anthropic', 'Local Model'] },
      { label: 'Auto-suggest', type: 'toggle', value: true },
      { label: 'Inline Completions', type: 'toggle', value: false },
    ],
  },
];

const SettingsPanel: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-semibold text-text-tertiary">
        Settings
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-4">
        {settingsSections.map((section) => (
          <div key={section.title}>
            <div className="flex items-center gap-2 py-2 text-xs font-semibold text-foreground">
              <section.icon size={13} />
              {section.title}
            </div>
            <div className="space-y-2">
              {section.settings.map((setting) => (
                <div key={setting.label} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-surface-2 transition-colors">
                  <span className="text-[11px] text-text-secondary">{setting.label}</span>
                  {setting.type === 'toggle' && (
                    <button className={`w-8 h-4.5 rounded-full transition-colors relative ${setting.value ? 'bg-accent-blue' : 'bg-surface-3'}`}>
                      <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-foreground transition-transform ${setting.value ? 'left-4' : 'left-0.5'}`} />
                    </button>
                  )}
                  {setting.type === 'number' && (
                    <input
                      type="number"
                      defaultValue={setting.value as number}
                      className="w-16 px-2 py-0.5 rounded text-[11px] bg-surface-2 text-foreground border-none outline-none text-right font-mono"
                    />
                  )}
                  {setting.type === 'text' && (
                    <input
                      type="text"
                      defaultValue={setting.value as string}
                      className="w-36 px-2 py-0.5 rounded text-[11px] bg-surface-2 text-foreground border-none outline-none text-right font-mono"
                    />
                  )}
                  {setting.type === 'select' && (
                    <select className="px-2 py-0.5 rounded text-[11px] bg-surface-2 text-foreground border-none outline-none font-sans cursor-pointer">
                      {(setting as any).options.map((opt: string) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPanel;
