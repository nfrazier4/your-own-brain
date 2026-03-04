import { getCalendarEvents } from '@/lib/google-calendar';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

// Cache calendar responses for 5 minutes
export const revalidate = 300;

/**
 * GET /api/calendar?timeframe=today|week
 * Fetch Google Calendar events
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') as 'today' | 'week' || 'today';

    if (timeframe !== 'today' && timeframe !== 'week') {
      return Response.json(
        { error: 'Invalid timeframe. Use "today" or "week".' },
        { status: 400 }
      );
    }

    const events = await getCalendarEvents(timeframe);

    return Response.json({
      events,
      count: events.length,
      timeframe,
    });
  } catch (error) {
    console.error('Calendar API error:', error);

    // Return empty events array instead of error to gracefully degrade
    // This allows the app to work even if calendar is not configured
    return Response.json({
      events: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Calendar not configured',
    });
  }
}
