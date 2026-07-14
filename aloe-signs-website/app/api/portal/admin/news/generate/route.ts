import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { logAudit } from '@/lib/audit';
import { NEWS_CATEGORIES, pickNextCategory, type NewsCategory } from '@/lib/news-categories';
import { generateNewsArticle } from '@/lib/news-generator';

export const runtime = 'nodejs';
export const maxDuration = 300;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function ensureUniqueSlug(slug: string): Promise<string> {
  let candidate = slug || 'article';
  for (let i = 0; i < 10; i++) {
    const { rowCount } = await sql`SELECT 1 FROM news_posts WHERE slug = ${candidate}`;
    if (rowCount === 0) return candidate;
    candidate = `${slug}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }
  throw new Error('Unable to generate a unique slug after multiple attempts');
}

export async function POST(req: Request) {
  try {
    // Auth guard
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Body
    const body = await req.json().catch(() => ({} as any));

    // Recent context
    const { rows: recent } = await sql`SELECT title, category FROM news_posts ORDER BY created_at DESC LIMIT 12`;
    const recentTitles = recent.map(r => r.title).filter(Boolean);
    const recentCategories = recent.map(r => r.category).filter(Boolean);

    // Determine category
    let category: NewsCategory;
    if (
      typeof body.category === 'string' &&
      (NEWS_CATEGORIES as readonly string[]).includes(body.category)
    ) {
      category = body.category as NewsCategory;
    } else {
      category = pickNextCategory(recentCategories as NewsCategory[]);
    }

    // Generate article
    const article = await generateNewsArticle({ category, recentTitles });

    // Slug handling
    const baseSlug = article.slug || slugify(article.title) || 'article';
    const slug = await ensureUniqueSlug(baseSlug);

    // Insert as draft
    const { rows } = await sql.query(
      `INSERT INTO news_posts (title, slug, excerpt, meta_title, meta_description, content, image_url, category, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'DRAFT') RETURNING *`,
      [
        article.title,
        slug,
        article.excerpt,
        article.meta_title,
        article.meta_description,
        article.body_md,
        article.image_url,
        category,
      ]
    );

    // Audit log
    await logAudit({
      actorEmail: user.email,
      action: 'news.generate',
      entityType: 'news_post',
      entityId: rows[0].id,
      summary: article.title,
    });

    return NextResponse.json({ post: rows[0] }, { status: 201 });
  } catch (error: any) {
    const message = error?.message || 'Failed to generate article';
    if (message.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        { error: 'AI is not configured yet. Add ANTHROPIC_API_KEY in Vercel to enable article generation.' },
        { status: 400 }
      );
    }
    console.error('[news.generate]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}