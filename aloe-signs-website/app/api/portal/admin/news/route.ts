import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { rows } = await sql`
      SELECT id, title, slug, excerpt, category, status, image_url, scheduled_for, published_at, created_at, updated_at
      FROM news_posts
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ posts: rows });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}