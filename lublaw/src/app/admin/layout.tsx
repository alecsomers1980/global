import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-surface flex">
      {user && <AdminSidebar email={user.email} />}
      <div className="flex-1 min-w-0">
        <div className="max-w-4xl mx-auto px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
