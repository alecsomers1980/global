import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { rows } = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'jobcards';
        `;
        return NextResponse.json({ columns: rows.map(r => r.column_name) });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
