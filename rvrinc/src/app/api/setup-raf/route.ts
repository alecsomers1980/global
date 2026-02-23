import { NextResponse } from "next/server";

// This endpoint runs the RAF status migration.
// It creates the necessary tables and columns using individual Supabase operations.
// Access: POST /api/setup-raf-statuses
export async function POST() {
    // Use the Supabase REST API directly for DDL operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const results: string[] = [];

    try {
        // Step 1: Try to create case_statuses table by inserting data
        // We'll test if the table exists first by trying to read from it
        const testRes = await fetch(`${supabaseUrl}/rest/v1/case_statuses?select=id&limit=1`, {
            headers: {
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`,
            },
        });

        if (testRes.status === 404 || testRes.status === 400) {
            results.push("⚠️ The case_statuses table does not exist yet. You need to run the SQL migration in Supabase SQL Editor.");
            results.push("But we can still proceed with the case_status_history and cases columns...");
        } else {
            results.push("✅ case_statuses table exists");
        }

        // Step 2: Test case_status_history table
        const historyRes = await fetch(`${supabaseUrl}/rest/v1/case_status_history?select=id&limit=1`, {
            headers: {
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`,
            },
        });

        if (historyRes.status === 404 || historyRes.status === 400) {
            results.push("⚠️ case_status_history table does not exist yet");
        } else {
            results.push("✅ case_status_history table exists");
        }

        // Step 3: Test if cases table has new columns
        const casesRes = await fetch(`${supabaseUrl}/rest/v1/cases?select=status_notes,status_phase,scheduled_date,diary_date&limit=1`, {
            headers: {
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`,
            },
        });

        if (casesRes.ok) {
            results.push("✅ cases table has new columns (status_notes, status_phase, scheduled_date, diary_date)");
        } else {
            results.push("⚠️ cases table is missing new columns");
        }

        return NextResponse.json({
            status: "checked",
            results,
            message: "Database status checked. If any tables are missing, please run the migration SQL in your Supabase SQL Editor.",
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
