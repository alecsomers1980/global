import { listDesigns, getSettings, ensureSchema } from '@/lib/db';
import { DELIVERY_META } from '@/lib/designs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureSchema();
    const designs = await listDesigns({ activeOnly: true });
    const settings = await getSettings();
    return Response.json({ designs, settings, delivery: DELIVERY_META });
  } catch (error) {
    console.error('GET /api/catalog error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}