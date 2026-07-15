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
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await context.params;
    const { rows } = await sql.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ project: rows[0] });
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
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await context.params;
    const body = await req.json();

    const allowedFields = [
      'title',
      'slug',
      'client',
      'location',
      'category',
      'summary',
      'meta_title',
      'meta_description',
      'content',
      'cover_image_url',
      'reel_url',
      'gallery',
      'clips',
      'status',
      'sort_order',
    ];
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    for (const field of allowedFields) {
      if (field in body) {
        let value = body[field];
        if (field === 'status') {
          const validStatuses = ['DRAFT', 'PUBLISHED', 'DISCARDED'];
          if (!validStatuses.includes(value)) {
            return NextResponse.json({ error: `Invalid status: ${value}` }, { status: 400 });
          }
        }
        if (field === 'gallery' || field === 'clips') {
          value = JSON.stringify(Array.isArray(value) ? value : []);
        }
        setClauses.push(`${field} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    setClauses.push(`updated_at = NOW()`);
    if (body.status === 'PUBLISHED') {
      setClauses.push(`published_at = COALESCE(published_at, NOW())`);
    }

    values.push(id);
    const query = `UPDATE projects SET ${setClauses.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const { rows } = await sql.query(query, values);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await logAudit({
      actorEmail: user.email,
      action: 'project.update',
      entityType: 'project',
      entityId: id,
      summary: rows[0].title,
    });

    // Refresh public pages when a live project changes (or was just unpublished).
    revalidatePath('/projects');
    revalidatePath(`/projects/${rows[0].slug}`);

    return NextResponse.json({ project: rows[0] });
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
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await context.params;
    const { rows } = await sql.query('SELECT slug FROM projects WHERE id = $1', [id]);
    await sql.query('DELETE FROM projects WHERE id = $1', [id]);

    await logAudit({
      actorEmail: user.email,
      action: 'project.delete',
      entityType: 'project',
      entityId: id,
    });

    revalidatePath('/projects');
    if (rows[0]?.slug) revalidatePath(`/projects/${rows[0].slug}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
