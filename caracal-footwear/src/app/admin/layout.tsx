// Auth is enforced at the proxy level (middleware / proxy.ts).
// This layout assumes the user is already authenticated.

import AdminNav from '@/components/admin/AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas flex">
      <aside className="w-56 shrink-0 border-r border-text/10 p-4">
        <h1 className="display text-lg text-text">CARACAL ADMIN</h1>
        <AdminNav />
      </aside>
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}