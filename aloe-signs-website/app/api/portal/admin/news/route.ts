import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase-server';
import { logAudit } from '@/lib/audit';

function slugify(text: string): string {
  return (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function ensureUniqueSlug(slug: string): Promise<string> {
  let candidate = slug;
  for (let attempt = 0; attempt < 10; attempt++) {
    const { rowCount } = await sql`SELECT 1 FROM news_posts WHERE slug = ${candidate}`;
    if (rowCount === 0) return candidate;
    candidate = `${slug}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }
  throw new Error('Could not generate unique slug after multiple attempts');
}

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

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const title = (body.title || '').trim();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const status = body.status || 'DRAFT';
    const allowedStatuses = ['DRAFT', 'APPROVED', 'PUBLISHED', 'DISCARDED'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const baseSlug = body.slug ? slugify(body.slug) : slugify(title);
    const slug = await ensureUniqueSlug(baseSlug || 'article');

    const publishedAt = status === 'PUBLISHED' ? new Date().toISOString() : null;

    const { rows } = await sql.query(
      `INSERT INTO news_posts (title, slug, excerpt, meta_title, meta_description, content, image_url, category, status, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        title,
        slug,
        body.excerpt ?? null,
        body.meta_title ?? null,
        body.meta_description ?? null,
        body.content ?? null,
        body.image_url ?? null,
        body.category ?? null,
        status,
        publishedAt,
      ]
    );

    await logAudit({
      actorEmail: user.email,
      action: 'news.create',
      entityType: 'news_post',
      entityId: rows[0].id,
      summary: title,
    });

    // Refresh the public list immediately when created as published.
    if (status === 'PUBLISHED') {
      revalidatePath('/news');
      revalidatePath(`/news/${slug}`);
    }

    return NextResponse.json({ post: rows[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}