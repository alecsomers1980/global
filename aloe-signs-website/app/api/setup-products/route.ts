import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { productsList } from '@/lib/data';

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT,
        category TEXT,
        description TEXT,
        size TEXT,
        price NUMERIC,
        original_price NUMERIC,
        discount INTEGER,
        image TEXT,
        features JSONB DEFAULT '[]'::jsonb,
        in_stock BOOLEAN DEFAULT true,
        pricing_tiers JSONB,
        variants JSONB,
        artwork_fee NUMERIC,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    const { rows } = await sql`SELECT COUNT(*)::int AS count FROM products`;
    let count = rows[0].count;
    let seeded = false;

    if (count === 0) {
      for (let i = 0; i < productsList.length; i++) {
        const p = productsList[i];
        await sql.query(
          `INSERT INTO products (id, name, category, description, size, price, original_price, discount, image, features, in_stock, pricing_tiers, variants, artwork_fee, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12::jsonb, $13::jsonb, $14, $15)
           ON CONFLICT (id) DO NOTHING`,
          [
            p.id,
            p.name,
            p.category,
            p.description,
            p.size,
            p.price,
            p.originalPrice ?? null,
            p.discount ?? null,
            p.image,
            JSON.stringify(p.features ?? []),
            p.inStock ?? true,
            JSON.stringify(p.pricingTiers ?? null),
            JSON.stringify(p.variants ?? null),
            p.artworkFee ?? null,
            i,
          ]
        );
      }
      seeded = true;
      count = productsList.length;
    }

    return NextResponse.json({ success: true, seeded, count });
  } catch (error) {
    console.error('Setup products error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}