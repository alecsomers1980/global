import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { createServerSupabase } from '@/lib/supabase-server';
import { logAudit } from '@/lib/audit';

const DEPT_LABELS: Record<string, string> = {
    artwork: 'Artwork', flatbed: 'UV Flatbed', digital: 'Digital', vinyl_cut: 'Vinyl Cut',
    screen: 'Screen', applicate: 'Application', engineer: 'Engineering', outsource: 'Outsource',
};

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createServerSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user /* || (!user.email?.endsWith('@aloesigns.co.za') && user.email !== 'view@aloesigns.co.za') */) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await context.params;
        const { rows } = await sql`SELECT * FROM jobcards WHERE id = ${id}`;
        if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({ jobcard: rows[0] });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createServerSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user /* || (!user.email?.endsWith('@aloesigns.co.za') && user.email !== 'view@aloesigns.co.za') */) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await context.params;
        const body = await req.json();

        const { rows: oldRows } = await sql`SELECT status, department_completion_json FROM jobcards WHERE id = ${id}`;
        const oldRow = oldRows[0];

        const { rows } = await sql`
            UPDATE jobcards SET
                updated_at = CURRENT_TIMESTAMP,
                invoice = ${body.invoice ?? null},
                address = ${body.address ?? null},
                email = ${body.email ?? null},
                company = ${body.company ?? null},
                contact_name = ${body.contact_name ?? null},
                contact_phone = ${body.contact_phone ?? null},
                contact_phone_2 = ${body.contact_phone_2 ?? null},
                entry_number = ${body.entry_number ?? null},
                date = ${body.date ?? null},
                design_notes = ${body.design_notes ?? null},
                prod_flatbed = ${body.prod_flatbed ?? false},
                prod_digital = ${body.prod_digital ?? false},
                prod_vinyl_cut = ${body.prod_vinyl_cut ?? false},
                prod_screen = ${body.prod_screen ?? false},
                prod_applicate = ${body.prod_applicate ?? false},
                prod_engineer = ${body.prod_engineer ?? false},
                prod_outsource = ${body.prod_outsource ?? false},
                track_quote = ${body.track_quote ?? false},
                track_enter = ${body.track_enter ?? false},
                track_send_proof = ${body.track_send_proof ?? false},
                track_on_hold = ${body.track_on_hold ?? false},
                track_approved = ${body.track_approved ?? false},
                track_deliver = ${body.track_deliver ?? false},
                track_installation = ${body.track_installation ?? false},
                track_courier = ${body.track_courier ?? false},
                courier_address = ${body.courier_address ?? null},
                track_deposit = ${body.track_deposit ?? false},
                track_purchase_order = ${body.track_purchase_order ?? false},
                track_complete = ${body.track_complete ?? false},
                track_complete_by = ${body.track_complete_by ?? null},
                status = ${body.status ?? 'Quoted'},
                sub_total = ${body.sub_total || null},
                vat_total = ${body.vat_total || null},
                total = ${body.total || null},
                order_no = ${body.order_no ?? null},
                pro_inv = ${body.pro_inv ?? null},
                final_invoice = ${body.final_invoice ?? null},
                deposit_paid = ${body.deposit_paid ?? false},
                cash_paid = ${body.cash_paid ?? false},
                files_notes = ${body.files_notes ?? null},
                material = ${body.material ?? null},
                deliver_car = ${body.deliver_car ?? false},
                delivery_address = ${body.delivery_address ?? null},
                installation_address = ${body.installation_address ?? null},
                deliver_bakkie = ${body.deliver_bakkie ?? false},
                deliver_truck = ${body.deliver_truck ?? false},
                deliver_trailer = ${body.deliver_trailer ?? false},
                install_bakkie = ${body.install_bakkie ?? false},
                install_truck = ${body.install_truck ?? false},
                install_trailer = ${body.install_trailer ?? false},
                install_riggers = ${body.install_riggers ?? null},
                install_applicators = ${body.install_applicators ?? null},
                install_builders = ${body.install_builders ?? null},
                install_minions = ${body.install_minions ?? null},
                install_electrical = ${body.install_electrical ?? null},
                install_safety_file = ${body.install_safety_file ?? false},
                install_generator = ${body.install_generator ?? false},
                install_welder = ${body.install_welder ?? false},
                install_shovels = ${body.install_shovels ?? false},
                install_additional = ${body.install_additional ?? null},
                track_collect = ${body.track_collect ?? false},
                compiled_by = ${body.compiled_by ?? null},
                mat_eng_tubing = ${body.mat_eng_tubing ?? null},
                mat_eng_sheets = ${body.mat_eng_sheets ?? null},
                mat_civil_concrete = ${body.mat_civil_concrete ?? null},
                mat_civil_toolhire = ${body.mat_civil_toolhire ?? null},
                mat_section_digital = ${body.mat_section_digital ?? false},
                mat_section_engineering = ${body.mat_section_engineering ?? false},
                mat_section_civil = ${body.mat_section_civil ?? false},
                items_json = ${body.items_json ? JSON.stringify(body.items_json) : null},
                materials_json = ${body.materials_json ? JSON.stringify(body.materials_json) : null},
                files_json = ${body.files_json ? JSON.stringify(body.files_json) : null},
                status_workflow_json = ${body.status_workflow_json ? JSON.stringify(body.status_workflow_json) : null},
                engineer_details_json = ${body.engineer_details_json ? JSON.stringify(body.engineer_details_json) : null},
                prod_artwork = ${body.prod_artwork ?? false},
                vinyl_cut_printcut = ${body.vinyl_cut_printcut ?? false},
                scanned_jobcard_path = ${body.scanned_jobcard_path ?? null},
                file_rotations_json = ${body.file_rotations_json ? JSON.stringify(body.file_rotations_json) : '{}'},
                artwork_details_json = ${body.artwork_details_json ? JSON.stringify(body.artwork_details_json) : null},
                flatbed_details_json = ${body.flatbed_details_json ? JSON.stringify(body.flatbed_details_json) : null},
                vinyl_cut_details_json = ${body.vinyl_cut_details_json ? JSON.stringify(body.vinyl_cut_details_json) : null},
                screen_details_json = ${body.screen_details_json ? JSON.stringify(body.screen_details_json) : null},
                applicate_details_json = ${body.applicate_details_json ? JSON.stringify(body.applicate_details_json) : null},
                digital_details_json = ${body.digital_details_json ? JSON.stringify(body.digital_details_json) : null},
                department_completion_json = ${body.department_completion_json ? JSON.stringify(body.department_completion_json) : null},
                materials_other_text = ${body.materials_other_text ?? null}
            WHERE id = ${id}
            RETURNING *
        `;

        // Audit: record department completions and the save event
        const actorCode = (user.app_metadata as any)?.short_code ?? null;
        const oldDept = oldRow?.department_completion_json || {};
        const newDept = body.department_completion_json || {};
        const parts: string[] = [];
        if (oldRow && oldRow.status !== body.status) {
            parts.push(`Status: ${oldRow.status || '—'} → ${body.status || '—'}`);
        }
        for (const key of Object.keys(newDept)) {
            const wasDone = oldDept[key]?.completed;
            const nowDone = newDept[key]?.completed;
            if (nowDone && !wasDone) {
                const by = newDept[key]?.completed_by || actorCode;
                const label = `${DEPT_LABELS[key] || key} completed${by ? ` by ${by}` : ''}`;
                parts.push(label);
                await logAudit({
                    actorEmail: user.email, actorCode,
                    action: 'jobcard.department_completed',
                    entityType: 'jobcard', entityId: id,
                    summary: label,
                    meta: { dept: key, code: by },
                });
            }
        }
        await logAudit({
            actorEmail: user.email, actorCode,
            action: 'jobcard.update',
            entityType: 'jobcard', entityId: id,
            summary: parts.length ? parts.join('; ') : 'Updated jobcard',
            meta: { company: body.company ?? null, invoice: body.invoice ?? null },
        });

        return NextResponse.json({ jobcard: rows[0] });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createServerSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user /* || (!user.email?.endsWith('@aloesigns.co.za') && user.email !== 'view@aloesigns.co.za') */) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await context.params;
        await sql`DELETE FROM jobcards WHERE id = ${id}`;

        await logAudit({
            actorEmail: user.email,
            actorCode: (user.app_metadata as any)?.short_code ?? null,
            action: 'jobcard.delete',
            entityType: 'jobcard',
            entityId: id,
            summary: 'Deleted jobcard',
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE [id] jobcard ERROR:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
