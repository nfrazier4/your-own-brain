'use client';

import { useState } from 'react';

export default function SimpleTest() {
  const [clicks, setClicks] = useState(0);

  return (
    <div style={{ padding: 50, fontFamily: 'sans-serif' }}>
      <h1>Simple Interactivity Test</h1>
      <p>Clicks: {clicks}</p>
      <button
        onClick={() => setClicks(clicks + 1)}
        style={{
          padding: '10px 20px',
          fontSize: 16,
          background: '#FFD60A',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        Click Me
      </button>
      <p style={{ marginTop: 20, color: clicks > 0 ? 'green' : 'red' }}>
        {clicks > 0 ? '✅ JavaScript is working!' : '❌ JavaScript not working'}
      </p>
    </div>
  );
}
