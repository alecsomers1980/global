import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await sql`
            ALTER TABLE jobcards
            ADD COLUMN IF NOT EXISTS deliver_car BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS delivery_address TEXT,
            ADD COLUMN IF NOT EXISTS installation_address TEXT,
            ADD COLUMN IF NOT EXISTS courier_address TEXT,
            ADD COLUMN IF NOT EXISTS install_bakkie BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS install_truck BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS install_trailer BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS install_riggers VARCHAR(255),
            ADD COLUMN IF NOT EXISTS install_applicators VARCHAR(255),
            ADD COLUMN IF NOT EXISTS install_builders VARCHAR(255),
            ADD COLUMN IF NOT EXISTS install_minions VARCHAR(255),
            ADD COLUMN IF NOT EXISTS install_electrical VARCHAR(255),
            ADD COLUMN IF NOT EXISTS install_safety_file BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS mat_eng_tubing TEXT,
            ADD COLUMN IF NOT EXISTS mat_eng_sheets TEXT,
            ADD COLUMN IF NOT EXISTS mat_civil_concrete TEXT,
            ADD COLUMN IF NOT EXISTS mat_civil_toolhire TEXT,
            ADD COLUMN IF NOT EXISTS mat_section_digital BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS mat_section_engineering BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS mat_section_civil BOOLEAN DEFAULT false;
        `;
        return NextResponse.json({ success: true, message: 'Table altered successfully to include new columns' });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
