"use server";

import { createClient } from "@/lib/supabase/adminServer";

export async function resolveEmail(username: string) {
    const supabase = createClient();

    // If it looks like an email, return as-is
    if (username.includes("@")) return { email: username };

    // Look up by full name (case-insensitive)
    const { data: profiles } = await supabase
        .from("profiles")
        .select("email")
        .ilike("full_name", `%${username}%`);

    if (!profiles || profiles.length === 0) {
        return { error: "No account found with that name. Try your email address." };
    }

    if (profiles.length > 1) {
        return { error: "Multiple accounts matched. Please use your email address to sign in." };
    }

    return { email: profiles[0].email };
}
