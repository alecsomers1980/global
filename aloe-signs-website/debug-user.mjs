import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lsvqqnfpikamtovursxy.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdnFxbmZwaWthbXRvdnVyc3h5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjEwNTAwMSwiZXhwIjoyMDg3NjgxMDAxfQ.YUtcg2Jyli5GG5Nq8xBg1CQiCdJk3arQQuxNK0v_pv8";

const supa = createClient(supabaseUrl, serviceRoleKey);

async function checkUser() {
    const email = "alecs@precisionmedia.co.za";
    console.log(`Checking user: ${email}...`);

    const { data: { users }, error } = await supa.auth.admin.listUsers();
    if (error) {
        console.error("Error listing users:", error);
        return;
    }

    const user = users.find(u => u.email === email);
    if (user) {
        console.log("User found:", JSON.stringify(user, null, 2));
    } else {
        console.log("User NOT found.");
    }
}

checkUser();
