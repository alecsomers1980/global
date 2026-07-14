import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    process.env.NODE_ENV === 'production'
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rows } = await sql`
      UPDATE news_posts
      SET status = 'PUBLISHED', published_at = NOW(), updated_at = NOW()
      WHERE status = 'APPROVED' AND scheduled_for <= NOW()
      RETURNING id, slug
    `;

    // Refresh the public pages for anything newly published.
    if (rows.length > 0) {
      revalidatePath('/news');
      for (const r of rows) revalidatePath(`/news/${r.slug}`);
    }

    return NextResponse.json({
      published: rows.length,
      postIds: rows.map((r) => r.id),
    });
  } catch (error: any) {
    console.error('[publish-news] Error:', error);
    return NextResponse.json(
      { error: 'Failed to publish news', message: error?.message },
      { status: 500 },
    );
  }
}