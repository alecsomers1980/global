import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase-server';
import { logAudit } from '@/lib/audit';

function slugify(text: string): string {
  return (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function ensureUniqueSlug(slug: string): Promise<string> {
  let candidate = slug || 'project';
  for (let attempt = 0; attempt < 10; attempt++) {
    const { rowCount } = await sql`SELECT 1 FROM projects WHERE slug = ${candidate}`;
    if (rowCount === 0) return candidate;
    candidate = `${slug}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }
  throw new Error('Could not generate unique slug after multiple attempts');
}

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { rows } = await sql`
      SELECT id, title, slug, client, location, category, summary, status,
             cover_image_url, reel_url, gallery, clips, published_at, created_at, updated_at
      FROM projects
      ORDER BY sort_order ASC, created_at DESC
    `;
    return NextResponse.json({ projects: rows });
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
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const title = (body.title || '').trim();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const status = body.status || 'DRAFT';
    const allowedStatuses = ['DRAFT', 'PUBLISHED', 'DISCARDED'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const baseSlug = body.slug ? slugify(body.slug) : slugify(title);
    const slug = await ensureUniqueSlug(baseSlug || 'project');

    const gallery = Array.isArray(body.gallery) ? body.gallery : [];
    const clips = Array.isArray(body.clips) ? body.clips : [];
    const publishedAt = status === 'PUBLISHED' ? new Date().toISOString() : null;

    const { rows } = await sql.query(
      `INSERT INTO projects
        (title, slug, client, location, category, summary, meta_title, meta_description,
         content, cover_image_url, reel_url, gallery, clips, status, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [
        title,
        slug,
        body.client ?? null,
        body.location ?? null,
        body.category ?? null,
        body.summary ?? null,
        body.meta_title ?? null,
        body.meta_description ?? null,
        body.content ?? null,
        body.cover_image_url ?? null,
        body.reel_url ?? null,
        JSON.stringify(gallery),
        JSON.stringify(clips),
        status,
        publishedAt,
      ]
    );

    await logAudit({
      actorEmail: user.email,
      action: 'project.create',
      entityType: 'project',
      entityId: rows[0].id,
      summary: title,
    });

    if (status === 'PUBLISHED') {
      revalidatePath('/projects');
      revalidatePath(`/projects/${slug}`);
    }

    return NextResponse.json({ project: rows[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
