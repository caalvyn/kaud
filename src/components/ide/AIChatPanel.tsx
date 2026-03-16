import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Code2, Eraser, Loader2 } from 'lucide-react';
import { useIDEStore } from '@/stores/ideStore';
import type { ChatMessage } from '@/types/ide';

const AIChatPanel: React.FC = () => {
  const { chatMessages, addChatMessage, chatLoading, setChatLoading } = useIDEStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    addChatMessage(userMsg);
    setInput('');
    setChatLoading(true);

    // Simulated AI response (replace with Lovable Cloud edge function)
    setTimeout(() => {
      const responses: Record<string, string> = {
        default: `I've analyzed your request. Here's what I suggest:\n\n\`\`\`typescript\n// Generated code based on your prompt\nconst result = processData(input);\nconsole.log(result);\n\`\`\`\n\nWould you like me to apply this to your current file?`,
      };
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: responses.default,
        timestamp: new Date(),
      };
      addChatMessage(assistantMsg);
      setChatLoading(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { icon: Code2, label: 'Explain code', prompt: 'Explain the selected code in detail' },
    { icon: Sparkles, label: 'Refactor', prompt: 'Refactor this code for better readability' },
    { icon: Eraser, label: 'Fix errors', prompt: 'Fix any errors in the current file' },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: 'hsl(var(--panel-bg))' }}>
      <div className="px-4 py-2.5 flex items-center gap-2 border-b border-border">
        <Sparkles size={14} className="text-accent-blue" />
        <span className="text-xs font-semibold text-foreground">Lumina AI</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--accent-blue) / 0.12)' }}>
              <Sparkles size={20} className="text-accent-blue" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Lumina AI Assistant</p>
              <p className="text-[11px] text-text-tertiary mt-1">Ask me to explain, refactor, or generate code</p>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {quickActions.map((a) => (
                <button
                  key={a.label}
                  onClick={() => { setInput(a.prompt); inputRef.current?.focus(); }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-text-secondary hover:text-foreground transition-colors"
                  style={{ background: 'hsl(var(--surface-2) / 0.5)', border: '1px solid hsl(var(--glass-border) / 0.3)' }}
                >
                  <a.icon size={12} /> {a.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg px-3 py-2.5 text-xs leading-relaxed ${
                msg.role === 'user' ? 'chat-message-user' : 'chat-message-assistant'
              }`}
            >
              <div className="text-[10px] text-text-tertiary mb-1 font-medium uppercase tracking-wider">
                {msg.role === 'user' ? 'You' : 'Lumina AI'}
              </div>
              <div className="text-text-secondary whitespace-pre-wrap font-sans">{msg.content}</div>
            </div>
          ))
        )}
        {chatLoading && (
          <div className="chat-message-assistant rounded-lg px-3 py-2.5 flex items-center gap-2">
            <Loader2 size={13} className="animate-spin text-accent-blue" />
            <span className="text-xs text-text-tertiary">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex items-end gap-2 p-2 rounded-lg" style={{ background: 'hsl(var(--surface-2))', border: '1px solid hsl(var(--glass-border) / 0.3)' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Lumina AI..."
            rows={1}
            className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-text-tertiary resize-none font-sans leading-5"
            style={{ minHeight: 20, maxHeight: 100 }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || chatLoading}
            className="p-1.5 rounded-md text-text-tertiary hover:text-accent-blue disabled:opacity-30 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatPanel;
