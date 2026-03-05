'use client';

import { useState } from 'react';
import { Brain, MessageSquare, History, Settings } from 'lucide-react';
import { T } from '@/lib/design-tokens';
import { AREAS, SMART_LISTS } from '@/lib/constants';
import type { Message } from '@/lib/anthropic';
import { ChatContainer } from './components/ChatContainer';
import { ChatInput } from './components/ChatInput';
import { CalendarPanel } from './components/CalendarPanel';
import { Icon } from '@/components/ui/Icon';
import { NavLink } from '@/components/layout/NavLink';
import { useDocumentTitle } from '@/lib/use-document-title';
import { ShortcutHelp } from '@/components/shortcuts/ShortcutHelp';
import { useKeyboardShortcuts } from '@/lib/keyboard-shortcuts';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ChatPage() {
  useDocumentTitle('Chat');
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isPullingToRefresh, setIsPullingToRefresh] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Register keyboard shortcuts
  useKeyboardShortcuts([
    {
      id: 'toggle-sidebar',
      key: '/',
      ctrlKey: true,
      description: 'Toggle sidebar',
      category: 'navigation',
      handler: () => setShowSidebar((prev) => !prev),
    },
    {
      id: 'go-to-memories',
      key: 'm',
      ctrlKey: true,
      shiftKey: true,
      description: 'Go to Memories',
      category: 'navigation',
      handler: () => router.push('/memories'),
    },
    {
      id: 'go-to-settings',
      key: ',',
      ctrlKey: true,
      description: 'Go to Settings',
      category: 'navigation',
      handler: () => router.push('/settings'),
    },
  ]);

  // Pull-to-refresh handlers
  function handleTouchStart(e: React.TouchEvent) {
    const containerDiv = e.currentTarget as HTMLDivElement;
    if (containerDiv.scrollTop === 0) {
      setTouchStartY(e.touches[0].clientY);
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    const containerDiv = e.currentTarget as HTMLDivElement;
    if (containerDiv.scrollTop === 0 && touchStartY > 0) {
      const touchY = e.touches[0].clientY;
      const distance = touchY - touchStartY;
      if (distance > 0 && distance < 100) {
        setPullDistance(distance);
      }
    }
  }

  function handleTouchEnd() {
    if (pullDistance > 60) {
      // Trigger refresh
      setIsPullingToRefresh(true);
      // Reload the page content (in this case, just reset to empty state or reload)
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
    setPullDistance(0);
    setTouchStartY(0);
  }

  // File drag-and-drop handlers
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDraggingFile(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDraggingFile(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDraggingFile(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }

  // Convert file to base64
  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data:image/png;base64, prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function sendMessage() {
    if ((!input.trim() && !selectedFile) || isStreaming) return;

    // Handle file attachment
    let fileData = null;
    if (selectedFile) {
      const base64 = await fileToBase64(selectedFile);
      fileData = {
        name: selectedFile.name,
        type: selectedFile.type,
        data: base64,
      };
    }

    const userMessage: Message = { role: 'user', content: input.trim() || `[Attached: ${selectedFile?.name}]` };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setSelectedFile(null);
    setIsStreaming(true);

    // Add empty assistant message that will be filled by streaming
    const assistantMessage: Message = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          file: fileData,
        }),
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
      position: "relative",
      flexDirection: "column",
    }}>
      {/* Skip link for keyboard navigation */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          top: '-40px',
          left: 0,
          background: T.yellow,
          color: T.yellowText,
          padding: '8px 16px',
          textDecoration: 'none',
          fontWeight: 600,
          borderRadius: '0 0 8px 0',
          zIndex: 100,
          transition: 'top 0.2s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.top = '0';
        }}
        onBlur={(e) => {
          e.currentTarget.style.top = '-40px';
        }}
      >
        Skip to main content
      </a>

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
          .right-panel {
            display: none !important;
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
        <nav aria-label="Main navigation" className={`sidebar ${showSidebar ? 'show' : ''}`} style={{
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
            <div style={{ width: 30, height: 30, background: T.yellow, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(255,214,10,0.35)" }}>
              <Icon icon={Brain} size={16} color={T.yellowText} decorative />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: "-0.01em" }}>Chief of Staff</div>
              <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 400 }}>Nate · Swell Studio</div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 8px", marginBottom: 4 }}>Views</div>
            <NavLink href="/chat" label="Chat" icon={MessageSquare} />
            <NavLink href="/memories" label="Memories" icon={History} />
            <NavLink href="/settings" label="Settings" icon={Settings} />
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
        </nav>

        {/* Main Chat Area */}
        <main
          id="main-content"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Pull-to-refresh indicator */}
          {pullDistance > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: Math.min(pullDistance, 60),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: T.mainBg,
                zIndex: 10,
                transition: 'height 0.2s ease',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: T.textMuted,
                  fontWeight: 600,
                  opacity: Math.min(pullDistance / 60, 1),
                }}
              >
                {pullDistance > 60 ? '↻ Release to refresh' : '↓ Pull to refresh'}
              </div>
            </div>
          )}

          {/* Drag-and-drop overlay */}
          {isDraggingFile && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255, 214, 10, 0.1)',
                border: `3px dashed ${T.yellow}`,
                borderRadius: T.radius,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                pointerEvents: 'none',
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>📎</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.yellowText }}>
                Drop file to upload
              </div>
              <div style={{ fontSize: 14, color: T.textSub, marginTop: 8 }}>
                Images, PDFs, and documents supported
              </div>
            </div>
          )}

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
            onFileSelect={setSelectedFile}
            selectedFile={selectedFile}
            onRemoveFile={() => setSelectedFile(null)}
          />
        </main>

        {/* Right Panel - Calendar & Context */}
        <aside aria-label="Calendar and context" className="right-panel" style={{
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
        </aside>
      </div>

      {/* Keyboard shortcuts help modal */}
      <ShortcutHelp />
    </div>
  );
}
