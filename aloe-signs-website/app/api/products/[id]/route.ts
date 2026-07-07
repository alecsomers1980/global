import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { rowToProduct, normalizeProductInput } from '@/lib/product-mapper';
import { createServerSupabase } from '@/lib/supabase-server';
import { logAudit } from '@/lib/audit';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { rows } = await sql.query('SELECT * FROM products WHERE id = $1', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ product: rowToProduct(rows[0]) });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
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
    const {
      name,
      category,
      description,
      size,
      price,
      original_price,
      discount,
      image,
      features,
      in_stock,
      pricing_tiers,
      variants,
      artwork_fee,
      sort_order,
    } = normalizeProductInput({ ...body, id });

    const { rows } = await sql.query(
      `UPDATE products
       SET name = $1,
           category = $2,
           description = $3,
           size = $4,
           price = $5,
           original_price = $6,
           discount = $7,
           image = $8,
           features = $9::jsonb,
           in_stock = $10,
           pricing_tiers = $11::jsonb,
           variants = $12::jsonb,
           artwork_fee = $13,
           sort_order = $14,
           updated_at = now()
       WHERE id = $15
       RETURNING *`,
      [
        name,
        category,
        description,
        size,
        price,
        original_price,
        discount,
        image,
        features,
        in_stock,
        pricing_tiers,
        variants,
        artwork_fee,
        sort_order,
        id,
      ]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await logAudit({
      actorEmail: user.email,
      actorCode: (user.app_metadata as any)?.short_code ?? null,
      action: 'product.update',
      entityType: 'product',
      entityId: id,
      summary: `Updated product ${name}`,
    });

    return NextResponse.json({ product: rowToProduct(rows[0]) });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
    await sql.query('DELETE FROM products WHERE id = $1', [id]);

    await logAudit({
      actorEmail: user.email,
      actorCode: (user.app_metadata as any)?.short_code ?? null,
      action: 'product.delete',
      entityType: 'product',
      entityId: id,
      summary: `Deleted product ${id}`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}