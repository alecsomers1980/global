import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/artwork/staff-auth';
import { listSubmissions, countUnread } from '@/lib/artwork/repository';

export const runtime = 'nodejs';

export async function GET() {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [submissions, unread] = await Promise.all([listSubmissions(), countUnread()]);

  return NextResponse.json({ submissions, unread });
}

