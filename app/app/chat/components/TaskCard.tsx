'use client';

import { useState } from 'react';
import { T } from '@/lib/design-tokens';
import { AREAS, TYPE_EMOJI } from '@/lib/constants';
import type { TaskCardData } from '@/lib/task-parser';

interface TaskCardProps {
  data: TaskCardData;
  onApproved?: () => void;
}

export function TaskCard({ data, onApproved }: TaskCardProps) {
  const [status, setStatus] = useState<'pending' | 'approving' | 'approved' | 'dismissed'>('pending');
  const [error, setError] = useState<string | null>(null);

  const area = AREAS.find(a => a.id === data.area);
  const emoji = TYPE_EMOJI[data.type] || '📝';

  async function handleApprove() {
    setStatus('approving');
    setError(null);

    try {
      // Call existing Supabase capture edge function
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/capture`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: data.title,
            context: data.area,
            type: data.type,
            source: 'chat',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save task');
      }

      setStatus('approved');
      onApproved?.();

      // Auto-dismiss after 2 seconds
      setTimeout(() => {
        setStatus('dismissed');
      }, 2000);
    } catch (err) {
      console.error('Task save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save task');
      setStatus('pending');
    }
  }

  function handleDismiss() {
    setStatus('dismissed');
  }

  if (status === 'dismissed') {
    return null;
  }

  if (status === 'approved') {
    return (
      <div
        style={{
          marginTop: 10,
          padding: '10px 16px',
          background: '#E8F8ED',
          border: '1px solid #A3E6B8',
          borderRadius: T.radiusSm,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'fadeIn 0.3s ease',
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#34C759',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            color: '#fff',
            fontWeight: 700,
          }}
        >
          ✓
        </div>
        <div>
          <span style={{ fontSize: 12, color: '#1A6B34', fontWeight: 600 }}>
            Added to brain
          </span>
          <span style={{ fontSize: 12, color: '#5BA876' }}>
            {' '}— filed to {area?.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 10,
        background: T.cardBg,
        border: `2px dashed ${area?.dot}66`,
        borderRadius: T.radius,
        padding: 14,
        animation: 'taskCardSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>{emoji}</span>
        <div
          style={{
            padding: '2px 8px',
            background: area?.light,
            borderRadius: T.radiusPill,
            fontSize: 10,
            fontWeight: 700,
            color: area?.text,
          }}
        >
          {area?.label}
        </div>
        {data.dueDate && (
          <span style={{ fontSize: 11, color: T.textMuted }}>
            Due {new Date(data.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Title */}
      <p
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: T.text,
          lineHeight: 1.55,
          marginBottom: 10,
        }}
      >
        {data.title}
      </p>

      {/* Error message */}
      {error && (
        <div
          style={{
            marginBottom: 10,
            padding: '6px 10px',
            background: '#FFE5E5',
            border: '1px solid #FCA5A5',
            borderRadius: T.radiusSm,
            fontSize: 11,
            color: '#B91C1C',
          }}
        >
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleApprove}
          disabled={status === 'approving'}
          style={{
            padding: '6px 14px',
            background: status === 'approving' ? T.borderLight : T.yellow,
            color: status === 'approving' ? T.textMuted : T.yellowText,
            border: 'none',
            borderRadius: T.radiusPill,
            fontSize: 12,
            fontWeight: 600,
            cursor: status === 'approving' ? 'not-allowed' : 'pointer',
            fontFamily: "'Nunito', sans-serif",
            transition: 'all 0.15s ease',
          }}
        >
          {status === 'approving' ? 'Adding...' : '✓ Add to Brain'}
        </button>
        <button
          onClick={handleDismiss}
          disabled={status === 'approving'}
          style={{
            padding: '6px 14px',
            background: 'transparent',
            color: T.textMuted,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusPill,
            fontSize: 12,
            cursor: status === 'approving' ? 'not-allowed' : 'pointer',
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          Dismiss
        </button>
      </div>

      <style jsx>{`
        @keyframes taskCardSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
