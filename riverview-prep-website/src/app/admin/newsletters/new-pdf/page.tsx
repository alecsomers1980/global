'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2 } from 'lucide-react';

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

export default function NewPdfNewsletterPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [term, setTerm] = useState('');
  const [issueNumber, setIssueNumber] = useState('');
  const [publishDate, setPublishDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [pdfUrl, setPdfUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');
    setSubmitError('');
    setPdfUrl('');
    setFileName(file.name);

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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          term: term.trim() || null,
          issue_number: issueNumber.trim() || null,
          publish_date: publishDate,
          pdf_url: pdfUrl,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: 'Failed to create newsletter' }));
        throw new Error(json.error || 'Failed to create newsletter');
      }

      router.push('/admin/newsletters');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create newsletter');
    } finally {
      setSaving(false);
    }
  };

  const canSubmit =
    title.trim().length > 0 && pdfUrl.length > 0 && !uploading && !saving;

  return (
    <div className="page-container">
      <style jsx>{pageStyles}</style>

      <div className="page-header">
        <div>
          <h1>New Newsletter (PDF)</h1>
          <p>Upload a PDF edition of your school newsletter.</p>
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
              {fileName} uploaded successfully
            </div>
          )}
        </div>

        <div className="form-actions">
          <Link href="/admin/newsletters" className="btn-cancel">
            Cancel
          </Link>
          <button type="submit" className="btn-save" disabled={!canSubmit}>
            {saving ? 'Saving...' : 'Create Newsletter'}
          </button>
        </div>
      </form>
    </div>
  );
}
