import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // Verify Vercel Cron auth
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    const now = new Date().toISOString();

    // Find all APPROVED posts where scheduled_for <= now
    const { data: postsToPublish, error: fetchError } = await supabase
      .from('insights_posts')
      .select('id')
      .eq('status', 'APPROVED')
      .lte('scheduled_for', now);

    if (fetchError) {
      throw fetchError;
    }

    if (!postsToPublish || postsToPublish.length === 0) {
      return NextResponse.json({ published: 0, message: 'No posts due for publishing' });
    }

    const postIds = postsToPublish.map((post: { id: string }) => post.id);

    // Update all matched posts to PUBLISHED and set published_at
    const { error: updateError } = await supabase
      .from('insights_posts')
      .update({
        status: 'PUBLISHED',
        published_at: now,
      })
      .in('id', postIds);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      published: postIds.length,
      postIds,
    });
  } catch (error: any) {
    console.error('[publish-insights] Error:', error);
    return NextResponse.json(
      { error: 'Failed to publish insights', message: error?.message },
      { status: 500 }
    );
  }
}
