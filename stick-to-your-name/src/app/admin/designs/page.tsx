import { requireAdmin } from '@/lib/admin';
import { redirect } from 'next/navigation';
import AdminNav from '../AdminNav';
import DesignsManager from './DesignsManager';

export const dynamic = 'force-dynamic';

export default async function AdminDesignsPage() {
  const adminId = await requireAdmin();
  if (!adminId) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Designs</h1>
        <DesignsManager />
      </main>
    </div>
  );
}