import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS jobcards (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                
                -- Client & Admin Header
                invoice VARCHAR(255),
                address TEXT,
                email VARCHAR(255),
                company VARCHAR(255),
                contact_name VARCHAR(255),
                contact_phone VARCHAR(255),
                entry_number VARCHAR(255),
                date VARCHAR(255),
                
                -- Design Grid (Center)
                design_notes TEXT,
                
                -- Production Checkboxes (Right Column)
                prod_flatbed BOOLEAN DEFAULT false,
                prod_digital BOOLEAN DEFAULT false,
                prod_vinyl_cut BOOLEAN DEFAULT false,
                prod_screen BOOLEAN DEFAULT false,
                prod_applicate BOOLEAN DEFAULT false,
                prod_engineer BOOLEAN DEFAULT false,
                prod_outsource BOOLEAN DEFAULT false,
                
                -- Tracking Checklists
                track_quote BOOLEAN DEFAULT false,
                track_enter BOOLEAN DEFAULT false,
                track_send_proof BOOLEAN DEFAULT false,
                track_on_hold BOOLEAN DEFAULT false,
                track_approved BOOLEAN DEFAULT false,
                track_deliver BOOLEAN DEFAULT false,
                track_installation BOOLEAN DEFAULT false,
                track_courier BOOLEAN DEFAULT false,
                track_deposit BOOLEAN DEFAULT false,
                track_purchase_order BOOLEAN DEFAULT false,
                track_complete BOOLEAN DEFAULT false,
                
                -- Tracking Text Details
                track_complete_by VARCHAR(255),
                
                -- Status Enum Equivalent
                status VARCHAR(50) DEFAULT 'Quoted',
                
                -- Financials
                sub_total DECIMAL(10, 2),
                vat_total DECIMAL(10, 2),
                total DECIMAL(10, 2),
                
                -- Footer Items
                order_no VARCHAR(255),
                pro_inv VARCHAR(255),
                final_invoice VARCHAR(255),
                deposit_paid BOOLEAN DEFAULT false,
                cash_paid BOOLEAN DEFAULT false,
                files_notes TEXT,
                
                -- Material Dropdown
                material VARCHAR(255)
            );
        `;
        return NextResponse.json({ success: true, message: 'Table created successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
