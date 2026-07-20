import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect("/login");

  return (
    <div className="min-h-screen max-w-4xl mx-auto p-6">
      <header className="flex items-center justify-between mb-8">
        <a href="/admin" className="uppercase tracking-widest text-xs text-ember-500 font-semibold">
          Ember Automations · Admin
        </a>
        <a href="/admin/new" className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg text-sm">
          + New questionnaire
        </a>
      </header>
      {children}
    </div>
  );
}
