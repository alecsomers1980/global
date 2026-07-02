import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

/**
 * Authoritative schema for the `jobcards` table.
 *
 * This is the single source of truth. Every column the app reads or writes must
 * be listed here. Hitting this route is idempotent: it creates the table if it
 * does not exist and back-fills any missing columns via ADD COLUMN IF NOT EXISTS,
 * so a partially-migrated table is brought fully up to date.
 *
 * When adding a field to the jobcard form/API, add its column here too.
 */
const COLUMNS: { name: string; type: string }[] = [
    // Client & admin header
    { name: 'invoice', type: 'VARCHAR(255)' },
    { name: 'address', type: 'TEXT' },
    { name: 'email', type: 'VARCHAR(255)' },
    { name: 'company', type: 'VARCHAR(255)' },
    { name: 'contact_name', type: 'VARCHAR(255)' },
    { name: 'contact_phone', type: 'VARCHAR(255)' },
    { name: 'contact_phone_2', type: 'TEXT' },
    { name: 'entry_number', type: 'VARCHAR(255)' },
    { name: 'date', type: 'VARCHAR(255)' },
    { name: 'compiled_by', type: 'TEXT' },

    // Design grid
    { name: 'design_notes', type: 'TEXT' },

    // Production checkboxes
    { name: 'prod_flatbed', type: 'BOOLEAN DEFAULT false' },
    { name: 'prod_digital', type: 'BOOLEAN DEFAULT false' },
    { name: 'prod_vinyl_cut', type: 'BOOLEAN DEFAULT false' },
    { name: 'prod_screen', type: 'BOOLEAN DEFAULT false' },
    { name: 'prod_applicate', type: 'BOOLEAN DEFAULT false' },
    { name: 'prod_engineer', type: 'BOOLEAN DEFAULT false' },
    { name: 'prod_outsource', type: 'BOOLEAN DEFAULT false' },
    { name: 'prod_artwork', type: 'BOOLEAN DEFAULT false' },

    // Tracking checklist
    { name: 'track_quote', type: 'BOOLEAN DEFAULT false' },
    { name: 'track_enter', type: 'BOOLEAN DEFAULT false' },
    { name: 'track_send_proof', type: 'BOOLEAN DEFAULT false' },
    { name: 'track_on_hold', type: 'BOOLEAN DEFAULT false' },
    { name: 'track_approved', type: 'BOOLEAN DEFAULT false' },
    { name: 'track_deliver', type: 'BOOLEAN DEFAULT false' },
    { name: 'track_installation', type: 'BOOLEAN DEFAULT false' },
    { name: 'track_courier', type: 'BOOLEAN DEFAULT false' },
    { name: 'track_deposit', type: 'BOOLEAN DEFAULT false' },
    { name: 'track_purchase_order', type: 'BOOLEAN DEFAULT false' },
    { name: 'track_complete', type: 'BOOLEAN DEFAULT false' },
    { name: 'track_collect', type: 'BOOLEAN DEFAULT false' },
    { name: 'track_complete_by', type: 'VARCHAR(255)' },

    // Status
    { name: 'status', type: "VARCHAR(50) DEFAULT 'Quoted'" },

    // Financials
    { name: 'sub_total', type: 'NUMERIC' },
    { name: 'vat_total', type: 'NUMERIC' },
    { name: 'total', type: 'NUMERIC' },

    // Footer / invoicing
    { name: 'order_no', type: 'VARCHAR(255)' },
    { name: 'pro_inv', type: 'VARCHAR(255)' },
    { name: 'final_invoice', type: 'VARCHAR(255)' },
    { name: 'deposit_paid', type: 'BOOLEAN DEFAULT false' },
    { name: 'cash_paid', type: 'BOOLEAN DEFAULT false' },
    { name: 'files_notes', type: 'TEXT' },

    // Materials
    { name: 'material', type: 'VARCHAR(255)' },
    { name: 'materials_other_text', type: 'TEXT' },

    // Delivery
    { name: 'deliver_car', type: 'BOOLEAN DEFAULT false' },
    { name: 'deliver_bakkie', type: 'BOOLEAN DEFAULT false' },
    { name: 'deliver_truck', type: 'BOOLEAN DEFAULT false' },
    { name: 'deliver_trailer', type: 'BOOLEAN DEFAULT false' },
    { name: 'delivery_address', type: 'TEXT' },
    { name: 'courier_address', type: 'TEXT' },

    // Installation
    { name: 'install_bakkie', type: 'BOOLEAN DEFAULT false' },
    { name: 'install_truck', type: 'BOOLEAN DEFAULT false' },
    { name: 'install_trailer', type: 'BOOLEAN DEFAULT false' },
    { name: 'install_riggers', type: 'TEXT' },
    { name: 'install_applicators', type: 'TEXT' },
    { name: 'install_builders', type: 'TEXT' },
    { name: 'install_minions', type: 'TEXT' },
    { name: 'install_electrical', type: 'TEXT' },
    { name: 'install_safety_file', type: 'BOOLEAN DEFAULT false' },
    { name: 'install_generator', type: 'BOOLEAN DEFAULT false' },
    { name: 'install_welder', type: 'BOOLEAN DEFAULT false' },
    { name: 'install_shovels', type: 'BOOLEAN DEFAULT false' },
    { name: 'install_additional', type: 'TEXT' },
    { name: 'installation_address', type: 'TEXT' },

    // Engineering / civil material sections
    { name: 'mat_section_digital', type: 'BOOLEAN DEFAULT false' },
    { name: 'mat_section_engineering', type: 'BOOLEAN DEFAULT false' },
    { name: 'mat_section_civil', type: 'BOOLEAN DEFAULT false' },
    { name: 'mat_eng_tubing', type: 'TEXT' },
    { name: 'mat_eng_sheets', type: 'TEXT' },
    { name: 'mat_civil_concrete', type: 'TEXT' },
    { name: 'mat_civil_toolhire', type: 'TEXT' },

    // JSON blobs
    { name: 'items_json', type: "JSONB DEFAULT '[]'::jsonb" },
    { name: 'materials_json', type: "JSONB DEFAULT '[]'::jsonb" },
    { name: 'files_json', type: "JSONB DEFAULT '[]'::jsonb" },
    { name: 'status_workflow_json', type: "JSONB DEFAULT '{}'::jsonb" },
    { name: 'engineer_details_json', type: "JSONB DEFAULT '{}'::jsonb" },
    { name: 'artwork_details_json', type: "JSONB DEFAULT '{}'::jsonb" },
    { name: 'flatbed_details_json', type: 'JSONB' },
    { name: 'vinyl_cut_details_json', type: 'JSONB' },
    { name: 'screen_details_json', type: 'JSONB' },
    { name: 'applicate_details_json', type: 'JSONB' },
    { name: 'digital_details_json', type: "JSONB DEFAULT '{}'::jsonb" },
    { name: 'department_completion_json', type: "JSONB DEFAULT '{}'::jsonb" },
];

export async function GET() {
    try {
        // Base table (fresh installs). Columns are managed by the loop below.
        await sql`
            CREATE TABLE IF NOT EXISTS jobcards (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // Idempotently ensure every column exists (back-fills existing tables).
        for (const col of COLUMNS) {
            await sql.query(`ALTER TABLE jobcards ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
        }

        return NextResponse.json({
            success: true,
            message: `jobcards table is up to date (${COLUMNS.length} managed columns).`,
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
