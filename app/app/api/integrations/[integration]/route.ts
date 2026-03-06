import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

/**
 * DELETE /api/integrations/[integration]
 * Disconnect an integration by deleting OAuth token
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ integration: string }> }
) {
  try {
    const { integration } = await params;
    const userId = 'nate'; // Single-user for now
    const supabase = getSupabaseAdmin();

    if (!['google', 'slack'].includes(integration)) {
      return Response.json({ error: 'Invalid integration' }, { status: 400 });
    }

    // Delete the token
    const { error } = await supabase
      .from('oauth_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('integration', integration);

    if (error) {
      console.error(`Failed to disconnect ${integration}:`, error);
      return Response.json({ error: 'Failed to disconnect' }, { status: 500 });
    }

    return Response.json({ success: true, message: `${integration} disconnected` });
  } catch (error) {
    console.error('Disconnect error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
