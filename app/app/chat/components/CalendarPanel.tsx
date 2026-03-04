'use client';

import { useState, useEffect } from 'react';
import { T } from '@/lib/design-tokens';

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
  attendees?: string[];
}

export function CalendarPanel() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalendarEvents();

    // Refresh every 5 minutes
    const interval = setInterval(fetchCalendarEvents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchCalendarEvents() {
    try {
      const response = await fetch('/api/calendar?timeframe=today');
      const data = await response.json();

      if (data.events) {
        setEvents(data.events);
        setError(null);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      console.error('Failed to fetch calendar:', err);
      setError('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }

  function formatEventTime(startStr: string, endStr: string): string {
    const start = new Date(startStr);
    const end = new Date(endStr);

    const formatTime = (date: Date) =>
      date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

    // All-day event
    if (startStr.length === 10) {
      return 'All day';
    }

    return `${formatTime(start)} - ${formatTime(end)}`;
  }

  function getTimeUntilEvent(startStr: string): string {
    const now = new Date();
    const start = new Date(startStr);
    const diffMs = start.getTime() - now.getTime();

    if (diffMs < 0) {
      return 'Now';
    }

    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `In ${diffMins}m`;
    }

    const diffHours = Math.floor(diffMins / 60);
    return `In ${diffHours}h`;
  }

  if (loading) {
    return (
      <div style={{ padding: '4px 8px 0' }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: T.textMuted,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          Today's Calendar
        </div>
        <div style={{ fontSize: 11, color: T.textMuted, padding: '10px 8px' }}>
          Loading events...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '4px 8px 0' }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: T.textMuted,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          Today's Calendar
        </div>
        <div
          style={{
            padding: '10px',
            background: 'rgba(0,0,0,0.03)',
            borderRadius: T.radiusSm,
            fontSize: 11,
            color: T.textMuted,
            fontStyle: 'italic',
          }}
        >
          Not configured yet
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div style={{ padding: '4px 8px 0' }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: T.textMuted,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          Today's Calendar
        </div>
        <div
          style={{
            padding: '10px',
            background: 'rgba(0,0,0,0.03)',
            borderRadius: T.radiusSm,
            fontSize: 11,
            color: T.textMuted,
            textAlign: 'center',
          }}
        >
          No events today
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '4px 8px 0' }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: T.textMuted,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        Today's Calendar
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {events.slice(0, 5).map(event => {
          const timeUntil = getTimeUntilEvent(event.start);
          const isNow = timeUntil === 'Now';

          return (
            <div
              key={event.id}
              style={{
                padding: '10px',
                background: isNow ? '#FFF3B0' : T.cardBg,
                border: `1px solid ${isNow ? '#FFE066' : T.borderLight}`,
                borderRadius: T.radiusSm,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              {/* Time badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 6px',
                  background: isNow ? '#FFD60A' : 'rgba(0,0,0,0.05)',
                  borderRadius: T.radiusPill,
                  fontSize: 9,
                  fontWeight: 700,
                  color: isNow ? '#7A5E00' : T.textMuted,
                  marginBottom: 6,
                }}
              >
                {timeUntil}
              </div>

              {/* Event title */}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.text,
                  lineHeight: 1.4,
                  marginBottom: 4,
                }}
              >
                {event.summary}
              </div>

              {/* Time range */}
              <div style={{ fontSize: 10, color: T.textSub, marginBottom: 4 }}>
                {formatEventTime(event.start, event.end)}
              </div>

              {/* Location */}
              {event.location && (
                <div
                  style={{
                    fontSize: 10,
                    color: T.textMuted,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span>📍</span>
                  <span>{event.location}</span>
                </div>
              )}

              {/* Attendees count */}
              {event.attendees && event.attendees.length > 0 && (
                <div
                  style={{
                    fontSize: 10,
                    color: T.textMuted,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 4,
                  }}
                >
                  <span>👥</span>
                  <span>{event.attendees.length} attendee{event.attendees.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
