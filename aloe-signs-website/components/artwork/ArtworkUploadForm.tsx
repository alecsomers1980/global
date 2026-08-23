'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HONEYPOT_FIELD } from '@/lib/artwork/antibot';

type Outcome =
  | { kind: 'idle' }
  | { kind: 'sending'; progress: number }
  | { kind: 'sent'; reference: string }
  | { kind: 'sent-not-notified'; reference: string }
  | { kind: 'failed'; message: string };

const MAX_FILES = 10;

export default function ArtworkUploadForm({ token }: { token: string }) {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [outcome, setOutcome] = useState<Outcome>({ kind: 'idle' });

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();

    if (files.length === 0) {
      setOutcome({ kind: 'failed', message: 'Please attach at least one file.' });
      return;
    }

    setOutcome({ kind: 'sending', progress: 0 });

    try {
      const res = await fetch('/api/artwork/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          [HONEYPOT_FIELD]: honeypot,
          companyName,
          contactPerson,
          contactNumber,
          email,
          description,
          files: files.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        }),
      });

      const submit = await res.json();

      if (!res.ok) {
        setOutcome({ kind: 'failed', message: submit.error || 'Your artwork did not send.' });
        return;
      }

      if (!submit.id) {
        setOutcome({ kind: 'sent', reference: submit.reference });
        return;
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()
      );

      for (let i = 0; i < submit.uploads.length; i++) {
        const { path, token: uploadToken } = submit.uploads[i];
        const { error } = await supabase.storage
          .from('artwork-uploads')
          .uploadToSignedUrl(path, uploadToken, files[i]);

        if (error) throw new Error(`${files[i].name} did not upload.`);

        setOutcome({
          kind: 'sending',
          progress: Math.round(((i + 1) / submit.uploads.length) * 100),
        });
      }

      const doneRes = await fetch(`/api/artwork/submit/${submit.id}/complete`, {
        method: 'POST',
      });
      const done = await doneRes.json();

      if (!doneRes.ok) {
        setOutcome({ kind: 'failed', message: done.error || 'Your artwork did not send.' });
        return;
      }

      setOutcome(
        done.notified === false
          ? { kind: 'sent-not-notified', reference: done.reference }
          : { kind: 'sent', reference: done.reference }
      );
    } catch (err) {
      setOutcome({
        kind: 'failed',
        message: err instanceof Error ? err.message : 'Your artwork did not send.',
      });
    }
  }

  if (outcome.kind === 'sent') {
    return (
      <div className="glass-card border border-aloe-green/50 p-6 text-center">
        <div className="text-4xl">✅</div>
        <h2 className="mt-3 text-2xl font-bold">Artwork received</h2>
        <p className="mx-auto mt-3 max-w-md text-white/70">
          The team has been notified and will be in touch with you about your artwork.
        </p>
        <p className="mt-6 text-xs uppercase tracking-wider text-white/50">Reference</p>
        <p className="text-2xl font-bold text-aloe-green">{outcome.reference}</p>
      </div>
    );
  }

  if (outcome.kind === 'sent-not-notified') {
    return (
      <div className="glass-card border border-amber-400/70 p-6 text-center">
        <div className="text-4xl">⚠️</div>
        <h2 className="mt-3 text-2xl font-bold text-amber-300">
          We have your artwork — but could not alert the team
        </h2>
        <p className="mx-auto mt-3 max-w-md text-white/70">
          Your files uploaded safely, but the notification system did not respond. Please call{' '}
          <a href="tel:0116932600" className="font-medium text-amber-300 underline">
            011 693 2600
          </a>{' '}
          and quote your reference.
        </p>
        <p className="mt-6 text-xs uppercase tracking-wider text-white/50">Reference</p>
        <p className="text-2xl font-bold text-white">{outcome.reference}</p>
      </div>
    );
  }

  const inputClasses =
    'w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white placeholder-white/30 focus:border-aloe-green focus:outline-none disabled:cursor-not-allowed disabled:opacity-60';
  const labelClasses = 'mb-1 block text-xs uppercase tracking-wider text-white/70';

  return (
    <div className="glass-card p-6">
      {outcome.kind === 'failed' && (
        <div className="mb-6 rounded-md border border-red-500/40 bg-red-500/10 p-4 text-red-300">
          <p className="font-medium text-red-200">{outcome.message}</p>
          <p className="mt-2 text-sm">
            Your details are still filled in below so you can try again, or call{' '}
            <a href="tel:0116932600" className="font-medium underline">
              011 693 2600
            </a>
            .
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Honeypot. The name is deliberately meaningless: it was `website`, and
            Chrome autofilled it from the saved profile, silently discarding real
            submissions. Do not rename it to anything a browser recognises — and
            never to `company`, which is a real field on this form. */}
        <div className="absolute left-[-9999px] h-px w-px overflow-hidden" aria-hidden="true">
          <input
            name={HONEYPOT_FIELD}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            readOnly
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            disabled={outcome.kind === 'sending'}
          />
        </div>

        <div>
          <label htmlFor="companyName" className={labelClasses}>
            Company name <span className="text-white/40">(optional)</span>
          </label>
          <input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={outcome.kind === 'sending'}
            className={inputClasses}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="contactPerson" className={labelClasses}>
              Contact person *
            </label>
            <input
              id="contactPerson"
              type="text"
              required
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              disabled={outcome.kind === 'sending'}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="contactNumber" className={labelClasses}>
              Contact number *
            </label>
            <input
              id="contactNumber"
              type="tel"
              required
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              disabled={outcome.kind === 'sending'}
              className={inputClasses}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className={labelClasses}>
            Email address <span className="text-white/40">(optional)</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Helps us reply quickly"
            disabled={outcome.kind === 'sending'}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="description" className={labelClasses}>
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={outcome.kind === 'sending'}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="files" className={labelClasses}>
            Artwork files *
          </label>
          <input
            id="files"
            type="file"
            multiple
            required
            accept=".pdf,.ai,.eps,.tiff,.tif,.png,.jpg,.jpeg,.svg,.zip,.psd"
            onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, MAX_FILES))}
            disabled={outcome.kind === 'sending'}
            className="block w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white file:mr-3 file:rounded-full file:border-0 file:bg-aloe-green file:px-4 file:py-1 file:text-sm file:font-bold file:text-black disabled:cursor-not-allowed disabled:opacity-60"
          />
          <p className="mt-1 text-xs text-white/50">Up to 10 files, 50 MB each.</p>
          {files.length > 0 && (
            <ul className="mt-3 space-y-1 rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white/70">
              {files.map((file, i) => (
                <li key={`${file.name}-${i}`}>
                  {file.name} — {(file.size / (1024 * 1024)).toFixed(2)} MB
                </li>
              ))}
            </ul>
          )}
        </div>

        {outcome.kind === 'sending' && (
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-aloe-green transition-all"
                style={{ width: `${outcome.progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-white/70">Uploading… {outcome.progress}%</p>
          </div>
        )}

        <p className="text-xs leading-relaxed text-white/50">
          By sending artwork you agree Aloe Signs may store your contact details and files to quote
          and produce the job. Files are deleted automatically 7 days after the team downloads them
          or 30 days if never downloaded.{' '}
          <a href="/privacy-policy" className="text-aloe-green underline">
            Privacy policy
          </a>
          .
        </p>

        <button
          type="submit"
          disabled={outcome.kind === 'sending'}
          className="w-full rounded-full bg-aloe-green px-6 py-3 font-bold text-black transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {outcome.kind === 'sending' ? 'Sending…' : 'Send Artwork'}
        </button>
      </form>
    </div>
  );
}

