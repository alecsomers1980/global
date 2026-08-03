import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin';
import { ensureSchema, getSettings } from '@/lib/db';
import AdminNav from '../AdminNav';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  if (!(await requireAdmin())) {
    redirect('/admin/login');
  }
  await ensureSchema();
  const settings = await getSettings();
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h1>
        <SettingsForm settings={settings} />
      </main>
    </div>
  );
}