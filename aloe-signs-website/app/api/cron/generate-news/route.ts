import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { pickNextCategory } from '@/lib/news-categories';
import { generateNewsArticle } from '@/lib/news-generator';
import { sendNewsReviewEmail } from '@/lib/news-email';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    process.env.NODE_ENV === 'production'
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // recent titles and categories (last 12)
    const { rows: recentPosts } = await sql`
      SELECT title, category FROM news_posts ORDER BY created_at DESC LIMIT 12
    `;
    const recentTitles = recentPosts.map((r) => r.title).filter(Boolean);
    const recentCategories = recentPosts.map((r) => r.category).filter(Boolean);

    const now = new Date();
    const seventh = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 7, 6, 0, 0));
    const twentyFirst = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 21, 6, 0, 0));

    // Generate two articles, ensuring category diversity
    const category1 = pickNextCategory(recentCategories as any);
    const article1 = await generateNewsArticle({
      category: category1,
      recentTitles,
    });

    const category2 = pickNextCategory([...recentCategories, category1] as any);
    const article2 = await generateNewsArticle({
      category: category2,
      recentTitles: [...recentTitles, article1.title],
    });

    // Helper to guarantee unique slug
    const ensureUniqueSlug = async (slug: string): Promise<string> => {
      let candidate = slug;
      let attempt = 0;
      const maxAttempts = 10;
      while (attempt < maxAttempts) {
        const { rowCount } = await sql`
          SELECT 1 FROM news_posts WHERE slug = ${candidate}
        `;
        if (rowCount === 0) return candidate;
        // append timestamp/random suffix to avoid collision
        const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        candidate = `${slug}-${suffix}`;
        attempt++;
      }
      throw new Error(`Could not generate a unique slug for "${slug}"`);
    };

    const slug1 = await ensureUniqueSlug(article1.slug);
    const slug2 = await ensureUniqueSlug(article2.slug);

    // Insert both as DRAFT with staggered scheduled_for
    await sql.query(
      `INSERT INTO news_posts (title, slug, excerpt, meta_title, meta_description, content, image_url, category, status, scheduled_for)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        article1.title,
        slug1,
        article1.excerpt,
        article1.meta_title,
        article1.meta_description,
        article1.body_md,
        article1.image_url,
        category1,
        'DRAFT',
        seventh.toISOString(),
      ],
    );

    await sql.query(
      `INSERT INTO news_posts (title, slug, excerpt, meta_title, meta_description, content, image_url, category, status, scheduled_for)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        article2.title,
        slug2,
        article2.excerpt,
        article2.meta_title,
        article2.meta_description,
        article2.body_md,
        article2.image_url,
        category2,
        'DRAFT',
        twentyFirst.toISOString(),
      ],
    );

    // Notify review team (non-blocking)
    await sendNewsReviewEmail({
      titles: [article1.title, article2.title],
    }).catch((err) => console.error('News review email failed:', err));

    return NextResponse.json({
      success: true,
      generated: 2,
      scheduled_for: [seventh.toISOString(), twentyFirst.toISOString()],
    });
  } catch (error: any) {
    console.error('[generate-news] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate news', message: error?.message },
      { status: 500 },
    );
  }
}