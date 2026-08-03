import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin';
import { ensureSchema, listContactMessages } from '@/lib/db';
import AdminNav from '../AdminNav';
import MarkReadButton from './MarkReadButton';

export const dynamic = 'force-dynamic';

function formatDate(date: Date | string | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function AdminMessagesPage() {
  const adminId = await requireAdmin();
  if (!adminId) redirect('/admin/login');

  await ensureSchema();
  const messages = await listContactMessages();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
        {messages.length === 0 ? (
          <p className="text-gray-500 italic">No messages yet.</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`bg-white rounded-2xl shadow-sm p-4 ${
                !m.read ? 'border-l-4 border-brand-pink' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{m.name}</span>
                    {!m.read && (
                      <span className="text-xs font-medium text-brand-pink bg-pink-50 px-2 py-0.5 rounded-full">
                        NEW
                      </span>
                    )}
                  </div>
                  <a
                    href={`mailto:${m.email}`}
                    className="text-sm text-brand-teal hover:underline mt-1 block"
                  >
                    {m.email}
                  </a>
                  {m.phone && (
                    <p className="text-sm text-gray-500 mt-1">{m.phone}</p>
                  )}
                  <p className="mt-2 text-gray-800 whitespace-pre-wrap">
                    {m.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-3">
                    {formatDate(m.created_at)}
                  </p>
                </div>
                {!m.read && <MarkReadButton id={m.id} />}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}