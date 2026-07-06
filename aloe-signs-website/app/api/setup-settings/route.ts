import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

const pricing = {
  artwork_hourly_rate: 250,
  hp_latex_materials: [
    { name: "Oracal 1370", price: 127.67 },
    { name: "Oracal 1620", price: 145.60 },
    { name: "Drytack 1370", price: 184.95 },
    { name: "Drytack 1520", price: 20.20 },
    { name: "Contravision 1370", price: 137.00 },
    { name: "Contravision 1520", price: 329.84 },
    { name: "Air Release 1370", price: 675.95 },
    { name: "Air Release 1520", price: 750.00 },
    { name: "PVC 1600", price: 112.00 },
    { name: "Drytac Retac", price: 184.95 },
    { name: "Poly Lightbox 1370", price: 184.95 },
    { name: "Other", price: 0 }
  ]
};

export async function GET() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`;

    await sql.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO NOTHING',
      ['pricing', JSON.stringify(pricing)]
    );

    return NextResponse.json({ success: true, message: 'settings table ready' });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}