import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supa.from("print_jobs").select("id, status, print_job_files(*)");
    console.log("Jobs count:", data?.length);
    console.log("Jobs with files:", data?.filter(j => j.print_job_files?.length > 0)?.length);
    if (error) console.error("Error:", error);
}

check();
