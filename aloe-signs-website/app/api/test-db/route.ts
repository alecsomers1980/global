import { sql } from "@vercel/postgres";
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { rows } = await sql`SELECT id, created_at, status, invoice FROM jobcards LIMIT 5`;
        return NextResponse.json({ success: true, rows });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ success: false, error: e.message });
    }
}
