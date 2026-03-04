import { google } from 'googleapis';

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
  attendees?: string[];
  description?: string;
}

/**
 * Get Google Calendar client using service account credentials
 */
function getCalendarClient() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!serviceAccountEmail || !privateKey) {
    throw new Error('Google Calendar credentials not configured');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: serviceAccountEmail,
      private_key: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
    },
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  });

  return google.calendar({ version: 'v3', auth });
}

/**
 * Get calendar events for a specified timeframe
 */
export async function getCalendarEvents(
  timeframe: 'today' | 'week' = 'today'
): Promise<CalendarEvent[]> {
  try {
    const calendar = getCalendarClient();

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const timeMax = timeframe === 'today'
      ? endOfDay
      : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 20,
    });

    const events = response.data.items || [];

    return events.map(event => ({
      id: event.id || '',
      summary: event.summary || 'Untitled Event',
      start: event.start?.dateTime || event.start?.date || '',
      end: event.end?.dateTime || event.end?.date || '',
      location: event.location || undefined,
      attendees: event.attendees?.map(a => a.email || '').filter(Boolean),
      description: event.description || undefined,
    }));
  } catch (error) {
    console.error('Error fetching calendar events:', error);

    // Return empty array if calendar is not configured or fails
    // This allows the app to work without calendar integration
    return [];
  }
}

/**
 * Format calendar event for display
 */
export function formatEventTime(startStr: string, endStr: string): string {
  const start = new Date(startStr);
  const end = new Date(endStr);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // All-day event
  if (startStr.length === 10) {
    return 'All day';
  }

  // Same day event
  return `${formatTime(start)} - ${formatTime(end)}`;
}

/**
 * Get time until event starts (for countdown display)
 */
export function getTimeUntilEvent(startStr: string): string {
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
  if (diffHours < 24) {
    return `In ${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `In ${diffDays}d`;
}
