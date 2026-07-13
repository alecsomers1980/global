import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create the base table if it doesn't exist yet
    await sql.query(`
      CREATE TABLE IF NOT EXISTS news_posts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Columns to add (idempotent)
    const columns = [
      { name: 'title', type: 'TEXT' },
      { name: 'slug', type: 'TEXT' },
      { name: 'excerpt', type: 'TEXT' },
      { name: 'meta_title', type: 'TEXT' },
      { name: 'meta_description', type: 'TEXT' },
      { name: 'content', type: 'TEXT' },
      { name: 'image_url', type: 'TEXT' },
      { name: 'category', type: 'TEXT' },
      { name: 'status', type: "VARCHAR(20) DEFAULT 'DRAFT'" },
      { name: 'scheduled_for', type: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'published_at', type: 'TIMESTAMP WITH TIME ZONE' },
    ];

    for (const col of columns) {
      await sql.query(
        `ALTER TABLE news_posts ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`
      );
    }

    // Unique index on slug for URL friendliness and lookup
    await sql.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS news_posts_slug_key ON news_posts (slug)`
    );

    return NextResponse.json({
      success: true,
      message: 'news_posts table is up to date',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}