import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdminSession(req);
  if (unauthorized) return unauthorized;

  try {
    const { title, term, issue_number, publish_date, pdf_url } = await req.json();
    if (!title || !pdf_url) {
      return NextResponse.json({ error: 'title and pdf_url are required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const baseSlug = slugify(title) || `newsletter-${Date.now()}`;
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const { data, error } = await supabase
      .from('newsletters')
      .insert({
        slug,
        title,
        term: term || null,
        issue_number: issue_number || null,
        publish_date: publish_date || new Date().toISOString().slice(0, 10),
        pdf_url,
        is_published: true,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ newsletter: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const unauthorized = requireAdminSession(req);
  if (unauthorized) return unauthorized;

  try {
    const { id, title, term, issue_number, publish_date, pdf_url } = await req.json();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const supabase = getServiceClient();
    const update: Record<string, unknown> = {};
    if (title !== undefined) update.title = title;
    if (term !== undefined) update.term = term;
    if (issue_number !== undefined) update.issue_number = issue_number;
    if (publish_date !== undefined) update.publish_date = publish_date;
    if (pdf_url !== undefined) update.pdf_url = pdf_url;

    const { data, error } = await supabase
      .from('newsletters')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ newsletter: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
