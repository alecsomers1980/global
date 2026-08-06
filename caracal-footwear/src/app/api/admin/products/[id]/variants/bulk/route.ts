import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';
import { ALL_SIZES } from '@/lib/supabase/types';

export const runtime = 'nodejs';

interface BulkGenerateBody {
  colours: { name: string; hex: string }[];
  sizes: number[];
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id: productId } = await params;
  const body = (await req.json()) as Partial<BulkGenerateBody>;

  if (!Array.isArray(body.colours) || body.colours.length === 0) {
    return NextResponse.json({ error: 'At least one colour is required.' }, { status: 400 });
  }
  if (!Array.isArray(body.sizes) || body.sizes.length === 0) {
    return NextResponse.json({ error: 'At least one size is required.' }, { status: 400 });
  }
  const invalidSize = body.sizes.find((s) => !ALL_SIZES.includes(s));
  if (invalidSize !== undefined) {
    return NextResponse.json({ error: `Size ${invalidSize} is out of range (4-15).` }, { status: 400 });
  }
  for (const c of body.colours) {
    if (!c.name?.trim() || !/^#[0-9a-fA-F]{6}$/.test(c.hex ?? '')) {
      return NextResponse.json({ error: `Colour "${c.name ?? ''}" needs a name and a #RRGGBB hex value.` }, { status: 400 });
    }
  }

  const rows = body.colours.flatMap((c) =>
    body.sizes!.map((size) => ({
      product_id: productId,
      colour_name: c.name.trim(),
      colour_hex: c.hex,
      size,
      stock_qty: 0,
      price_override: null,
      active: true,
    })),
  );

  const admin = createAdminClient();
  // ignoreDuplicates: true -- an existing (product_id, colour_name, size) row
  // is left completely untouched, so re-running this never zeroes out stock
  // someone already entered.
  const { error, count } = await admin
    .from('product_variants')
    .upsert(rows, { onConflict: 'product_id,colour_name,size', ignoreDuplicates: true, count: 'exact' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, attempted: rows.length, created: count ?? null });
}
