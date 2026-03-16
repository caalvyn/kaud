import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Code2, Eraser, Loader2, Wand2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useIDEStore } from '@/stores/ideStore';
import type { ChatMessage } from '@/types/ide';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lumina-chat`;

const AIChatPanel: React.FC = () => {
  const { chatMessages, addChatMessage, chatLoading, setChatLoading, updateLastAssistantMessage } = useIDEStore();
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const streamChat = async (messages: { role: string; content: string }[]) => {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (!resp.ok || !resp.body) {
      if (resp.status === 429) throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      if (resp.status === 402) throw new Error('AI credits exhausted. Add credits in your workspace settings.');
      throw new Error('Failed to connect to AI');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            fullContent += content;
            updateLastAssistantMessage(fullContent);
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }
  };

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

    try {
      const apiMessages = [...chatMessages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      await streamChat(apiMessages);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'An error occurred';
      updateLastAssistantMessage(`⚠️ ${errMsg}`);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickActions = [
    { icon: Code2, label: 'Explain code', prompt: 'Explain the selected code in detail' },
    { icon: Sparkles, label: 'Refactor', prompt: 'Refactor this code for better readability and performance' },
    { icon: Eraser, label: 'Fix errors', prompt: 'Find and fix any bugs or errors in the current code' },
    { icon: Wand2, label: 'Generate', prompt: 'Generate a new React component with TypeScript for ' },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: 'hsl(var(--panel-bg))' }}>
      <div className="px-4 py-2.5 flex items-center gap-2 border-b border-border">
        <Sparkles size={14} className="text-accent-blue" />
        <span className="text-xs font-semibold text-foreground">KAUD AI</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent-blue/20 text-accent-blue ml-auto">Streaming</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--accent-blue) / 0.12)' }}>
              <Sparkles size={20} className="text-accent-blue" />
            </div>
            <div className="text-center">
               <p className="text-sm font-medium text-foreground">KAUD AI Assistant</p>
              <p className="text-[11px] text-text-tertiary mt-1">Powered by Gemini · Ask me anything about code</p>
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
              className={`rounded-lg px-3 py-2.5 text-xs leading-relaxed relative group ${
                msg.role === 'user' ? 'chat-message-user' : 'chat-message-assistant'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider">
                  {msg.role === 'user' ? 'You' : 'KAUD AI'}
                </span>
                <button
                  onClick={() => copyToClipboard(msg.content, msg.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary hover:text-foreground"
                  title="Copy"
                >
                  {copiedId === msg.id ? <Check size={11} /> : <Copy size={11} />}
                </button>
              </div>
              {msg.role === 'assistant' ? (
                <div className="prose prose-invert prose-xs max-w-none text-text-secondary [&_pre]:bg-surface-0 [&_pre]:rounded-md [&_pre]:p-2 [&_pre]:text-[11px] [&_code]:text-accent-blue [&_code]:text-[11px] [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-text-secondary whitespace-pre-wrap font-sans">{msg.content}</div>
              )}
            </div>
          ))
        )}
        {chatLoading && chatMessages[chatMessages.length - 1]?.role !== 'assistant' && (
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
            placeholder="Ask KAUD AI..."
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
