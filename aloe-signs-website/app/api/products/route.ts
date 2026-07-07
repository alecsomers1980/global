import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { rowToProduct, normalizeProductInput } from '@/lib/product-mapper';
import { createServerSupabase } from '@/lib/supabase-server';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM products ORDER BY sort_order ASC, name ASC`;
    return NextResponse.json({ products: rows.map(rowToProduct) });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const r = normalizeProductInput(body);

    // Generate id if empty
    if (!r.id) {
      const slug = (r.name || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      r.id = slug || crypto.randomUUID();
    }

    const { rows } = await sql.query(
      `INSERT INTO products (id, name, category, description, size, price, original_price, discount, image, features, in_stock, pricing_tiers, variants, artwork_fee, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12::jsonb, $13::jsonb, $14, $15)
       RETURNING *`,
      [
        r.id,
        r.name,
        r.category,
        r.description,
        r.size,
        r.price,
        r.original_price,
        r.discount,
        r.image,
        r.features,
        r.in_stock,
        r.pricing_tiers,
        r.variants,
        r.artwork_fee,
        r.sort_order,
      ]
    );

    await logAudit({
      actorEmail: user.email,
      actorCode: (user.app_metadata as any)?.short_code ?? null,
      action: 'product.create',
      entityType: 'product',
      entityId: r.id,
      summary: `Created product ${r.name}`,
    });

    return NextResponse.json({ product: rowToProduct(rows[0]) });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}