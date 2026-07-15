import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Base table
    await sql.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Columns (idempotent)
    const columns = [
      { name: 'title', type: 'TEXT' },
      { name: 'slug', type: 'TEXT' },
      { name: 'client', type: 'TEXT' },
      { name: 'location', type: 'TEXT' },
      { name: 'category', type: 'TEXT' },
      { name: 'summary', type: 'TEXT' },
      { name: 'meta_title', type: 'TEXT' },
      { name: 'meta_description', type: 'TEXT' },
      { name: 'content', type: 'TEXT' },
      { name: 'cover_image_url', type: 'TEXT' },
      { name: 'reel_url', type: 'TEXT' },
      { name: 'gallery', type: "JSONB DEFAULT '[]'::jsonb" },
      { name: 'clips', type: "JSONB DEFAULT '[]'::jsonb" },
      { name: 'status', type: "VARCHAR(20) DEFAULT 'DRAFT'" },
      { name: 'sort_order', type: 'INTEGER DEFAULT 0' },
      { name: 'published_at', type: 'TIMESTAMP WITH TIME ZONE' },
    ];

    for (const col of columns) {
      await sql.query(
        `ALTER TABLE projects ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`
      );
    }

    await sql.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_key ON projects (slug)`
    );

    return NextResponse.json({
      success: true,
      message: 'projects table is up to date',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
