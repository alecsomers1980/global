import { NextResponse } from 'next/server';
import { signRenderToken } from '@/lib/artwork/antibot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ token: signRenderToken() });
}
