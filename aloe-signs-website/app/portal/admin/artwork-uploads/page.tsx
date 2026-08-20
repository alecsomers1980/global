'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Palette, ArrowLeft, Download, Clock, Trash2 } from 'lucide-react';

type SubmissionFile = {
  id: string;
  storage_path: string;
  original_name: string;
  size_bytes: number;
  mime_type: string;
};

type SubmissionRow = {
  id: string;
  reference: string;
  company_name: string | null;
  contact_person: string | null;
  contact_number: string | null;
  email: string | null;
  description: string | null;
  status: string;
  created_at: string;
  viewed_at: string | null;
  downloaded_at: string | null;
  delete_after: string;
  files: SubmissionFile[];
};

type ArtworkUploadsResponse = {
  submissions: SubmissionRow[];
  unread: number;
};

export default function ArtworkUploadsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/portal/admin/artwork-uploads', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      const data: ArtworkUploadsResponse = await res.json();
      const sorted = [...data.submissions].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setSubmissions(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load artwork uploads.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markViewed = async (id: string) => {
    try {
      await fetch(`/api/portal/admin/artwork-uploads/${id}`, { method: 'POST' });
    } catch {
      // keep refresh happening even if the mark-read call fails
    } finally {
      load();
    }
  };

  return (
    <div className="min-h-[100dvh] bg-transparent font-inter">
      <header className="bg-black/40 backdrop-blur-md border-b border-white/5 py-5">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Image
            src="/aloe-logo.png"
            alt="Aloe Signs"
            width={140}
            height={46}
            className="object-contain filter brightness-0 invert"
          />
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#84cc16]/10 text-[#84cc16] text-sm font-medium">
            <Palette className="h-4 w-4" />
            Artwork Uploads
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <button
          onClick={() => router.push('/portal/admin')}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#84cc16] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {error ? (
          <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-red-400">
            <p className="font-medium">Unable to load artwork uploads.</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : loading ? (
          <div className="p-8 bg-white/3 backdrop-blur-md border border-white/10 rounded-[2rem] shadow-2xl text-gray-400">
            Loading artwork uploads…
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-8 bg-white/3 backdrop-blur-md border border-white/10 rounded-[2rem] shadow-2xl text-center text-gray-400">
            No artwork has been submitted yet.
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-white">
              {submissions.length} submission{submissions.length === 1 ? '' : 's'}
            </h2>

            <div className="space-y-6">
              {submissions.map((s) => {
                const daysLeft = Math.max(
                  0,
                  Math.ceil((new Date(s.delete_after).getTime() - Date.now()) / 86400000)
                );
                const isUnread = s.viewed_at === null;

                return (
                  <div
                    key={s.id}
                    onClick={isUnread ? () => markViewed(s.id) : undefined}
                    role={isUnread ? 'button' : undefined}
                    tabIndex={isUnread ? 0 : undefined}
                    onKeyDown={
                      isUnread
                        ? (e) => {
                            if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                              e.preventDefault();
                              markViewed(s.id);
                            }
                          }
                        : undefined
                    }
                    className={`p-8 bg-white/3 backdrop-blur-md border border-white/10 rounded-[2rem] shadow-2xl ${
                      isUnread ? 'cursor-pointer' : ''
                    }`}
                    style={isUnread ? { borderLeft: '3px solid #84cc16' } : undefined}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-mono font-bold text-[#84cc16] tracking-tight">
                            {s.reference}
                          </h3>
                          {isUnread && (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#84cc16]/15 text-[#84cc16] text-xs font-semibold tracking-wide">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {new Date(s.created_at).toLocaleDateString('en-ZA', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>

                      <div className="text-right text-sm text-gray-400">
                        <p
                          className={`flex items-center gap-2 ${
                            daysLeft <= 3 ? 'text-[#f59e0b]' : 'text-gray-400'
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                          Deletes {daysLeft === 0 ? 'today' : `in ${daysLeft} days`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Downloading starts a 7-day countdown.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {s.contact_person && (
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-500">
                            Contact person
                          </p>
                          <p className="text-gray-300">{s.contact_person}</p>
                        </div>
                      )}

                      {s.contact_number && (
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-500">
                            Contact number
                          </p>
                          <p className="text-gray-300">{s.contact_number}</p>
                        </div>
                      )}

                      {s.company_name && (
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-500">
                            Company name
                          </p>
                          <p className="text-gray-300">{s.company_name}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">Email</p>
                        {s.email ? (
                          <a href={`mailto:${s.email}`} className="text-[#84cc16] hover:underline">
                            {s.email}
                          </a>
                        ) : (
                          <p className="text-gray-500">no email — reply by phone</p>
                        )}
                      </div>
                    </div>

                    {s.description && (
                      <div className="mt-5">
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          Description
                        </p>
                        <p className="mt-1 text-gray-400 whitespace-pre-wrap">{s.description}</p>
                      </div>
                    )}

                    <div className="mt-6">
                      <p className="text-xs uppercase tracking-wider text-gray-500">Files</p>
                      <div className="mt-2 space-y-2">
                        {s.files.map((f) => (
                          <div
                            key={f.id}
                            className="flex items-center justify-between gap-4 bg-black/30 border border-white/5 rounded-2xl px-4 py-3"
                          >
                            <div className="min-w-0">
                              <p className="text-sm text-gray-200 truncate">{f.original_name}</p>
                              <p className="text-xs text-gray-500">
                                {(Number(f.size_bytes) / 1024 / 1024).toFixed(1)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                window.location.href = `/api/portal/admin/artwork-uploads/${s.id}/download?file=${f.id}`;
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#84cc16]/10 text-[#84cc16] text-sm font-medium hover:bg-[#84cc16]/20 transition-colors shrink-0"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

