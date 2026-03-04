'use client';

import { useState } from 'react';
import { T } from '@/lib/design-tokens';
import { AREAS, SMART_LISTS } from '@/lib/constants';
import type { Message } from '@/lib/anthropic';
import { ChatContainer } from './components/ChatContainer';
import { ChatInput } from './components/ChatInput';
import { CalendarPanel } from './components/CalendarPanel';
import Link from 'next/link';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  async function sendMessage() {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);

    // Add empty assistant message that will be filled by streaming
    const assistantMessage: Message = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'content_block_delta') {
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1].content += data.delta.text;
                  return updated;
                });
              } else if (data.type === 'message_stop') {
                // Streaming complete
                break;
              } else if (data.type === 'error') {
                console.error('Stream error:', data.error);
                break;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Show error to user
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].content = 'Sorry, I encountered an error. Please try again.';
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div style={{
      fontFamily: "'Nunito', sans-serif",
      background: T.mainBg,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D0CDC7; border-radius: 10px; }

        .sidebar-item { transition: background 0.12s ease; cursor: pointer; border-radius: 8px; }
        .sidebar-item:hover { background: rgba(0,0,0,0.05); }
        .sidebar-item.active { background: rgba(0,0,0,0.08); }

        @media (min-width: 769px) {
          .mobile-header { display: none !important; }
        }
        @media (max-width: 768px) {
          .mobile-header { display: flex !important; }
        }

        .sidebar { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @media (max-width: 768px) {
          .sidebar {
            position: fixed !important;
            left: 0; top: 0; z-index: 50;
            transform: translateX(-100%);
            box-shadow: none;
          }
          .sidebar.show {
            transform: translateX(0);
            box-shadow: 2px 0 16px rgba(0,0,0,0.15);
          }
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 40;
        }
        .sidebar-overlay.show { display: block; }
      `}</style>

      {/* Mobile Header */}
      <div className="mobile-header" style={{
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: T.cardBg,
        borderBottom: `1px solid ${T.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
          }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ width: 18, height: 2, background: T.text, borderRadius: 2 }} />
            <div style={{ width: 18, height: 2, background: T.text, borderRadius: 2 }} />
            <div style={{ width: 18, height: 2, background: T.text, borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>Chat</span>
        </button>
        <div style={{ width: 24, height: 24, background: T.yellow, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🧠</div>
      </div>

      {/* Sidebar overlay for mobile */}
      {showSidebar && (
        <div
          className="sidebar-overlay show"
          onClick={() => setShowSidebar(false)}
        />
      )}

      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        {/* Sidebar */}
        <div className={`sidebar ${showSidebar ? 'show' : ''}`} style={{
          width: 220,
          background: T.sidebarBg,
          padding: "20px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          flexShrink: 0,
          overflowY: "auto",
          height: "100vh",
          position: "sticky",
          top: 0,
        }}>
          {/* App wordmark */}
          <div style={{ padding: "4px 8px", display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 30, height: 30, background: T.yellow, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 2px 8px rgba(255,214,10,0.35)" }}>🧠</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: "-0.01em" }}>Chief of Staff</div>
              <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 400 }}>Nate · Swell Studio</div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 8px", marginBottom: 4 }}>Views</div>
            <Link href="/chat" style={{ textDecoration: 'none' }}>
              <div className="sidebar-item active" style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", marginBottom: 1 }}>
                <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>💬</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Chat</span>
              </div>
            </Link>
            <Link href="/memories" style={{ textDecoration: 'none' }}>
              <div className="sidebar-item" style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", marginBottom: 1 }}>
                <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>🕐</span>
                <span style={{ fontSize: 13, fontWeight: 400, color: T.textSub }}>Memories</span>
              </div>
            </Link>
          </div>

          <div style={{ height: 1, background: T.border, margin: "0 8px" }} />

          {/* Areas */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 8px", marginBottom: 4 }}>Areas</div>
            {AREAS.map(area => (
              <div key={area.id} className="sidebar-item" style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", marginBottom: 1 }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: area.dot, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 400, color: T.textSub }}>{area.label}</span>
              </div>
            ))}
          </div>

          {/* Bottom status */}
          <div style={{ marginTop: "auto", padding: "10px", background: "rgba(0,0,0,0.04)", borderRadius: T.radiusSm, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#34C759", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: T.textSub }}>Connected</div>
              <div style={{ fontSize: 9, color: T.textMuted, marginTop: 1 }}>Brain · Calendar · Slack</div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <ChatContainer
            messages={messages}
            isStreaming={isStreaming}
            onTaskApproved={() => {
              // Optionally reload memories or show success notification
              console.log('Task approved and saved to brain');
            }}
          />
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={sendMessage}
            isStreaming={isStreaming}
          />
        </div>

        {/* Right Panel - Calendar & Context */}
        <div style={{
          width: 230,
          background: T.sidebarBg,
          padding: "20px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          flexShrink: 0,
          overflowY: "auto",
          height: "100vh",
          position: "sticky",
          top: 0,
        }}>
          {/* Calendar Events */}
          <CalendarPanel />

          <div style={{ height: 1, background: T.border, margin: "0 8px" }} />

          {/* Context Sources */}
          <div style={{ padding: "4px 8px 0" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Context Sources</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { icon: "🧠", label: "Brain",    status: "live", statusC: "#34C759" },
                { icon: "📅", label: "Calendar", status: "live", statusC: "#34C759" },
                { icon: "💬", label: "Slack",    status: "soon", statusC: T.textMuted },
              ].map(source => (
                <div key={source.label} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 8px", borderRadius: 8 }}>
                  <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>{source.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: T.text }}>{source.label}</div>
                  </div>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: source.statusC, flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
