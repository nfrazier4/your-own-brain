'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MinimalChat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const sendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, message]);
      setMessage('');
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Minimal Chat Test</h1>
        <Link href="/simple-test" style={{ marginLeft: 'auto' }}>Simple Test</Link>
        <Link href="/chat">Full Chat</Link>
      </div>

      <div style={{
        border: '1px solid #ccc',
        padding: 20,
        marginBottom: 20,
        minHeight: 300,
        background: '#f9f9f9',
        borderRadius: 8
      }}>
        {messages.length === 0 && (
          <p style={{ color: '#999' }}>No messages yet. Type something below!</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            padding: 10,
            background: 'white',
            marginBottom: 10,
            borderRadius: 4
          }}>
            {msg}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: 10,
            fontSize: 16,
            border: '1px solid #ccc',
            borderRadius: 4
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: '10px 20px',
            fontSize: 16,
            background: '#FFD60A',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Send
        </button>
      </div>

      <div style={{ marginTop: 20, padding: 15, background: '#FFF3B0', borderRadius: 4 }}>
        <p style={{ margin: 0, fontSize: 14 }}>
          <strong>✅ If this works:</strong> JavaScript is fine, the issue is with the full chat page imports/components.
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 14 }}>
          <strong>❌ If this doesn't work:</strong> Share console errors (F12 → Console).
        </p>
      </div>
    </div>
  );
}
