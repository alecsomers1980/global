import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

async function testQuery() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Testing cars table...");
    const { data: carsData, error: carsError } = await supabase.from('cars').select('*').limit(1);
    console.log("Cars error:", carsError);
    console.log("Cars data:", carsData);

    console.log("\nTesting inventory table...");
    const { data: invData, error: invError } = await supabase.from('inventory').select('*').limit(1);
    console.log("Inventory error:", JSON.stringify(invError));
    console.log("Inventory data:", invData);
}

testQuery();
