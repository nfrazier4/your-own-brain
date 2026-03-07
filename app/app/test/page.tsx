'use client';

import { useState } from 'react';

/**
 * Diagnostic test page to verify JavaScript is working
 */
export default function TestPage() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('JavaScript is NOT running');

  // This will only run if JavaScript is working
  if (typeof window !== 'undefined' && message === 'JavaScript is NOT running') {
    setMessage('✅ JavaScript IS running!');
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
      padding: 32,
      background: '#F5F4F0',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>
        Diagnostic Test Page
      </h1>

      <div style={{
        padding: 24,
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        maxWidth: 600,
        width: '100%',
      }}>
        <h2 style={{ fontSize: 20, marginTop: 0 }}>JavaScript Status:</h2>
        <p style={{ fontSize: 18, fontWeight: 600, color: message.includes('✅') ? '#34C759' : '#FF3B30' }}>
          {message}
        </p>

        <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #E0E0E0' }} />

        <h2 style={{ fontSize: 20 }}>Interactivity Test:</h2>
        <p style={{ fontSize: 16, marginBottom: 16 }}>
          Click count: <strong>{count}</strong>
        </p>

        <button
          onClick={() => setCount(count + 1)}
          style={{
            padding: '12px 24px',
            fontSize: 16,
            fontWeight: 600,
            background: '#FFD60A',
            color: '#7A5E00',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.98)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Click me to test
        </button>

        <p style={{ fontSize: 14, color: '#666', marginTop: 16 }}>
          If the count increases when you click, JavaScript is working properly.
        </p>
      </div>

      <div style={{
        padding: 20,
        background: '#FFF3B0',
        borderRadius: 8,
        maxWidth: 600,
        width: '100%',
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>🔍 Troubleshooting:</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6 }}>
          <li>If JavaScript status is red, check browser console (F12) for errors</li>
          <li>Try hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)</li>
          <li>Try opening in incognito/private window</li>
          <li>Make sure you're on the production URL, not a preview URL</li>
        </ul>
      </div>

      <a
        href="/chat"
        style={{
          padding: '12px 24px',
          fontSize: 16,
          fontWeight: 600,
          background: '#007AFF',
          color: 'white',
          textDecoration: 'none',
          borderRadius: 8,
          transition: 'opacity 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.8';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
      >
        ← Back to Chat
      </a>
    </div>
  );
}
