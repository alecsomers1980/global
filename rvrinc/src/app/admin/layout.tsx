import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let profile: { full_name: string | null; email: string | null; role: string; branch?: string | null } | null = null;
    if (user) {
        const { data } = await supabase
            .from("profiles")
            .select("full_name, email, role, branch")
            .eq("id", user.id)
            .single();
        profile = data as typeof profile;
    }
    if (!profile) {
        profile = { full_name: "Admin", email: null, role: "admin" };
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar user={profile} />
            <div className="flex-1 md:ml-0 flex flex-col">
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
