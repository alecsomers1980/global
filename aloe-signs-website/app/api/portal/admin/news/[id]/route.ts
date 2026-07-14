import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase-server';
import { logAudit } from '@/lib/audit';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    const { rows } = await sql.query('SELECT * FROM news_posts WHERE id = $1', [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ post: rows[0] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const allowedFields = [
      'title',
      'slug',
      'excerpt',
      'meta_title',
      'meta_description',
      'content',
      'image_url',
      'category',
      'status',
    ];
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    for (const field of allowedFields) {
      if (field in body) {
        const value = body[field];
        if (field === 'status') {
          const validStatuses = ['DRAFT', 'APPROVED', 'PUBLISHED', 'DISCARDED'];
          if (!validStatuses.includes(value)) {
            return NextResponse.json(
              { error: `Invalid status: ${value}` },
              { status: 400 }
            );
          }
        }
        setClauses.push(`${field} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Always update updated_at
    setClauses.push(`updated_at = NOW()`);

    // If status is being set to PUBLISHED, ensure published_at is set (once)
    if (body.status === 'PUBLISHED') {
      setClauses.push(`published_at = COALESCE(published_at, NOW())`);
    }

    // Approving a draft with no schedule (manual / AI-generated posts) must get a
    // scheduled_for, otherwise the daily publish cron (scheduled_for <= NOW()) skips it forever.
    if (body.status === 'APPROVED') {
      setClauses.push(`scheduled_for = COALESCE(scheduled_for, NOW())`);
    }

    values.push(id);
    const query = `UPDATE news_posts SET ${setClauses.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const { rows } = await sql.query(query, values);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    let action: string;
    if (body.status === 'APPROVED') {
      action = 'news.approve';
    } else if (body.status === 'DISCARDED') {
      action = 'news.discard';
    } else {
      action = 'news.update';
    }

    await logAudit({
      actorEmail: user.email,
      action,
      entityType: 'news_post',
      entityId: id,
      summary: rows[0].title,
    });

    // Refresh the public pages immediately when a live post changes.
    if (rows[0].status === 'PUBLISHED') {
      revalidatePath('/news');
      revalidatePath(`/news/${rows[0].slug}`);
    }

    return NextResponse.json({ post: rows[0] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    await sql.query('DELETE FROM news_posts WHERE id = $1', [id]);

    await logAudit({
      actorEmail: user.email,
      action: 'news.delete',
      entityType: 'news_post',
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}