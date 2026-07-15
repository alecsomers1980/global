import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { optimiseProjectContent } from '@/lib/project-optimizer';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({} as any));
    const title = (body.title || '').trim();
    if (!title) {
      return NextResponse.json({ error: 'Add a project title first, then optimise.' }, { status: 400 });
    }

    const result = await optimiseProjectContent({
      title,
      client: body.client,
      location: body.location,
      category: body.category,
      rawText: body.content || '',
    });

    return NextResponse.json({ optimized: result });
  } catch (error: any) {
    const message = error?.message || 'Failed to optimise content';
    if (message.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        { error: 'AI is not configured yet. Add ANTHROPIC_API_KEY in Vercel to enable optimisation.' },
        { status: 400 }
      );
    }
    console.error('[project.optimize]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
