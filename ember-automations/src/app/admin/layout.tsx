import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminGate } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();
  const gate = adminGate(user, session?.access_token, process.env.ADMIN_EMAIL);

  // Defence in depth: middleware already gates this, but a layout that trusts
  // it blindly would expose everything if the matcher ever changed.
  if (!gate.ok && gate.reason === "unauthenticated") redirect("/login");
  if (!gate.ok && gate.reason === "mfa_required") redirect("/login/mfa");

  return (
    <div className="min-h-screen max-w-4xl mx-auto p-6">
      <header className="flex items-center justify-between mb-8">
        <a href="/admin" className="uppercase tracking-widest text-xs text-ember-500 font-semibold">
          Ember Automations · Admin
        </a>
        <nav className="flex items-center gap-3 text-sm">
          <a href="/admin/security" className="text-[#6b6b8a] hover:text-ember-500">Security</a>
          <a href="/admin/new" className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg">
            + New questionnaire
          </a>
        </nav>
      </header>
      {children}
    </div>
  );
}
