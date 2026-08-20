import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/artwork/staff-auth';
import { markViewed } from '@/lib/artwork/repository';

export const runtime = 'nodejs';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  await markViewed(id);

  return NextResponse.json({ ok: true });
}

