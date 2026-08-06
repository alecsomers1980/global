import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';

export const runtime = 'nodejs';

interface VariantUpdate {
  id: string;
  stock_qty: number;
  active: boolean;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id: productId } = await params;
  const body = (await req.json()) as { variants?: VariantUpdate[] };

  if (!Array.isArray(body.variants) || body.variants.length === 0) {
    return NextResponse.json({ error: 'No variants provided.' }, { status: 400 });
  }
  for (const v of body.variants) {
    if (!v.id || typeof v.stock_qty !== 'number' || !Number.isInteger(v.stock_qty) || v.stock_qty < 0) {
      return NextResponse.json({ error: `Invalid stock_qty for variant ${v.id ?? '?'}.` }, { status: 400 });
    }
  }

  const admin = createAdminClient();

  // Verify every variant actually belongs to this product before writing --
  // the client sends variant ids, and a stray/tampered id must not let one
  // product's stock grid write another product's row.
  const { data: owned } = await admin
    .from('product_variants')
    .select('id')
    .eq('product_id', productId)
    .in('id', body.variants.map((v) => v.id));
  const ownedIds = new Set((owned ?? []).map((r) => r.id));
  if (body.variants.some((v) => !ownedIds.has(v.id))) {
    return NextResponse.json({ error: 'One or more variants do not belong to this product.' }, { status: 403 });
  }

  for (const v of body.variants) {
    const { error } = await admin
      .from('product_variants')
      .update({ stock_qty: v.stock_qty, active: v.active })
      .eq('id', v.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, updated: body.variants.length });
}
