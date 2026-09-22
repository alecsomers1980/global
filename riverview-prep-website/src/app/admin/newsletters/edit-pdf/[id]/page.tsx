'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

const pageStyles = `
  .page-container {
    padding: 32px;
    max-width: 960px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .page-header h1 {
    font-size: 24px;
    font-weight: 700;
    color: #1a2e1d;
    margin: 0;
  }

  .page-header p {
    margin: 6px 0 0;
    color: rgba(0,0,0,0.45);
    font-size: 14px;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #164e24;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
  }

  .back-link:hover {
    text-decoration: underline;
  }

  .pdf-form-card {
    background: #fff;
    border: 1px solid rgba(0,0,0,0.06);
    border-radius: 16px;
    padding: 28px;
    max-width: 680px;
    margin: 0 auto;
    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
  }

  .fg {
    margin-bottom: 20px;
  }

  .fg label {
    display: block;
    margin-bottom: 6px;
    font-size: 11px;
    font-weight: 700;
    color: rgba(0,0,0,0.4);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .fg input[type="text"],
  .fg input[type="date"] {
    width: 100%;
    padding: 11px 14px;
    background: #f8fafc;
    border: 1px solid rgba(0,0,0,0.08);
    border-radius: 10px;
    font-size: 14px;
    color: #1a2e1d;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .fg input:focus {
    border-color: #c4a459;
    background: #fff;
  }

  .fg input[type="file"] {
    display: block;
    margin-top: 4px;
    font-size: 14px;
    color: #334155;
  }

  .upload-status {
    margin-top: 8px;
    font-size: 13px;
    color: rgba(0,0,0,0.45);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .upload-success {
    color: #059669;
    font-weight: 600;
  }

  .pdf-link {
    margin-left: 4px;
    color: #164e24;
    font-weight: 600;
    text-decoration: underline;
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error-state {
    background: rgba(239,68,68,0.05);
    border: 1px solid rgba(239,68,68,0.1);
    color: #ef4444;
    padding: 12px 14px;
    border-radius: 10px;
    font-size: 14px;
    margin-bottom: 20px;
  }

  .empty-state {
    background: #f8fafc;
    border: 1px dashed rgba(0,0,0,0.1);
    border-radius: 12px;
    padding: 28px;
    text-align: center;
    color: rgba(0,0,0,0.3);
    font-size: 14px;
    margin-bottom: 16px;
  }

  .notice-card {
    background: #f8fafc;
    border: 1px solid rgba(0,0,0,0.06);
    border-radius: 16px;
    padding: 28px;
    max-width: 680px;
    margin: 0 auto 16px;
    text-align: center;
    color: #1a2e1d;
    font-size: 14px;
  }

  .btn-primary {
    display: inline-block;
    background: #c4a459;
    color: #0c1a0f;
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    margin-top: 12px;
    transition: background 0.2s;
  }

  .btn-primary:hover {
    background: #d4b469;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid rgba(0,0,0,0.04);
  }

  .btn-save {
    background: #c4a459;
    color: #0c1a0f;
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-save:hover:not(:disabled) {
    background: #d4b469;
  }

  .btn-save:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-cancel {
    background: #f1f5f9;
    color: rgba(0,0,0,0.5);
    border: 1px solid rgba(0,0,0,0.05);
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    transition: background 0.2s, color 0.2s;
  }

  .btn-cancel:hover {
    background: rgba(0,0,0,0.08);
  }
`;

type NewsletterPdf = {
  id: string;
  title: string;
  term: string | null;
  issue_number: string | number | null;
  publish_date: string | null;
  pdf_url: string | null;
};

export default function EditPdfNewsletterPage() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const id = params.id;

  const [title, setTitle] = useState('');
  const [term, setTerm] = useState('');
  const [issueNumber, setIssueNumber] = useState('');
  const [publishDate, setPublishDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [pdfUrl, setPdfUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [isReplacement, setIsReplacement] = useState(false);
  const [isFullEditor, setIsFullEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchNewsletter = async () => {
      setLoading(true);
      setLoadError('');

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('newsletters')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        const newsletter = data as NewsletterPdf | null;

        if (!newsletter) {
          setLoadError('Newsletter not found.');
          return;
        }

        if (!newsletter.pdf_url) {
          setIsFullEditor(true);
          return;
        }

        setTitle(newsletter.title || '');
        setTerm(newsletter.term || '');
        setIssueNumber(
          newsletter.issue_number != null ? String(newsletter.issue_number) : ''
        );
        setPublishDate(
          newsletter.publish_date || new Date().toISOString().slice(0, 10)
        );
        setPdfUrl(newsletter.pdf_url);
        setFileName(newsletter.pdf_url.split('/').pop() || 'Current PDF');
        setIsReplacement(false);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load newsletter');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletter();
  }, [id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');
    setSubmitError('');
    setPdfUrl('');
    setFileName(file.name);
    setIsReplacement(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'newsletters');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(json.error || 'Upload failed');
      }

      const json = await res.json();
      if (json.publicUrl) {
        setPdfUrl(json.publicUrl);
      } else {
        throw new Error(json.error || 'Upload failed');
      }
    } catch (err) {
      setPdfUrl('');
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !pdfUrl) return;

    setSaving(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/newsletter/pdf', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id,
          title: title.trim(),
          term: term.trim() || null,
          issue_number: issueNumber.trim() || null,
          publish_date: publishDate,
          pdf_url: pdfUrl,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: 'Failed to update newsletter' }));
        throw new Error(json.error || 'Failed to update newsletter');
      }

      router.push('/admin/newsletters');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update newsletter');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <style jsx>{pageStyles}</style>
        <div className="page-header">
          <h1>Edit Newsletter (PDF)</h1>
        </div>
        <div className="empty-state">Loading newsletter...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="page-container">
        <style jsx>{pageStyles}</style>
        <div className="page-header">
          <h1>Edit Newsletter (PDF)</h1>
        </div>
        <div className="error-state">{loadError}</div>
        <Link href="/admin/newsletters" className="back-link">
          ← Back to Newsletters
        </Link>
      </div>
    );
  }

  if (isFullEditor) {
    return (
      <div className="page-container">
        <style jsx>{pageStyles}</style>
        <div className="page-header">
          <h1>Edit Newsletter (PDF)</h1>
        </div>
        <div className="notice-card">
          <p>This newsletter uses the full editor.</p>
          <Link href={`/admin/newsletters/edit/${id}`} className="btn-primary">
            Open in Full Editor
          </Link>
        </div>
        <Link href="/admin/newsletters" className="back-link">
          ← Back to Newsletters
        </Link>
      </div>
    );
  }

  const canSubmit =
    title.trim().length > 0 && pdfUrl.length > 0 && !uploading && !saving;

  return (
    <div className="page-container">
      <style jsx>{pageStyles}</style>

      <div className="page-header">
        <div>
          <h1>Edit Newsletter (PDF)</h1>
          <p>Update the PDF edition of this newsletter.</p>
        </div>
        <Link href="/admin/newsletters" className="back-link">
          ← Back to Newsletters
        </Link>
      </div>

      <form className="pdf-form-card" onSubmit={handleSubmit}>
        {(submitError || uploadError) && (
          <div className="error-state">{submitError || uploadError}</div>
        )}

        <div className="fg">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. School Newsletter"
            required
          />
        </div>

        <div className="fg">
          <label htmlFor="term">Term</label>
          <input
            id="term"
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="e.g. Term 3"
          />
        </div>

        <div className="fg">
          <label htmlFor="issue">Issue Number</label>
          <input
            id="issue"
            type="text"
            value={issueNumber}
            onChange={(e) => setIssueNumber(e.target.value)}
            placeholder="e.g. 12"
          />
        </div>

        <div className="fg">
          <label htmlFor="publish-date">Publish Date</label>
          <input
            id="publish-date"
            type="date"
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            required
          />
        </div>

        <div className="fg">
          <label htmlFor="pdf">PDF File *</label>
          <input
            id="pdf"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={uploading || saving}
          />
          {uploading && (
            <div className="upload-status">
              <Loader2 size={16} className="spinner" />
              Uploading...
            </div>
          )}
          {!uploading && pdfUrl && (
            <div className="upload-status upload-success">
              <CheckCircle2 size={16} />
              {isReplacement
                ? `${fileName} uploaded successfully`
                : `${fileName} already uploaded`}
              {!isReplacement && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pdf-link"
                >
                  View
                </a>
              )}
            </div>
          )}
        </div>

        <div className="form-actions">
          <Link href="/admin/newsletters" className="btn-cancel">
            Cancel
          </Link>
          <button type="submit" className="btn-save" disabled={!canSubmit}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
