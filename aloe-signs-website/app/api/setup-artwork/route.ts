import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS artwork_submissions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const submissionColumns = [
      'reference TEXT',
      'company_name TEXT',
      'contact_person TEXT',
      'contact_number TEXT',
      'email TEXT',
      'description TEXT',
      "status TEXT DEFAULT 'pending_upload'",
      'ip_hash TEXT',
      'viewed_at TIMESTAMP WITH TIME ZONE',
      'downloaded_at TIMESTAMP WITH TIME ZONE',
      'delete_after TIMESTAMP WITH TIME ZONE',
      'notified_at TIMESTAMP WITH TIME ZONE'
    ];

    for (const column of submissionColumns) {
      await sql.query(`ALTER TABLE artwork_submissions ADD COLUMN IF NOT EXISTS ${column}`);
    }

    await sql.query(`
      CREATE TABLE IF NOT EXISTS artwork_submission_files (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        submission_id UUID REFERENCES artwork_submissions(id) ON DELETE CASCADE,
        storage_path TEXT,
        original_name TEXT,
        size_bytes BIGINT,
        mime_type TEXT
      )
    `);

    await sql.query(`
      CREATE INDEX IF NOT EXISTS idx_artwork_delete_after
      ON artwork_submissions(delete_after)
    `);

    await sql.query(`
      CREATE INDEX IF NOT EXISTS idx_artwork_ip_hash
      ON artwork_submissions(ip_hash, created_at)
    `);

    const supabase = createAdminSupabase();
    const bucketName = 'artwork-uploads';
    let bucket: 'created' | 'already existed' = 'already existed';

    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) throw listError;

    const bucketExists = buckets?.some((b) => b.name === bucketName);

    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 52428800
      });
      if (createError) throw createError;
      bucket = 'created';
    }

    return NextResponse.json({ ok: true, tables: 'ready', bucket });
  } catch (error) {
    console.error('SETUP ARTWORK ERROR:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

