'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    event_date: '',
    event_time: '',
    category: 'Culture',
    is_featured: false,
    status: 'published',
  });

  useEffect(() => {
    if (params.id) {
      fetchEvent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function fetchEvent() {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setFormData({
        title: data.title,
        description: data.description || '',
        venue: data.venue || '',
        event_date: data.event_date,
        event_time: data.event_time || '',
        category: data.category,
        is_featured: data.is_featured,
        status: data.status,
      });
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from('events')
      .update(formData)
      .eq('id', params.id);

    if (error) {
      setError(error.message);
      setSaving(false);
    } else {
      router.push('/admin/events');
    }
  }

  if (loading) return <div className="admin-page text-center py-20 opacity-50">Loading event data...</div>;

  return (
    <div className="admin-page">
      <style>{`
        .form-container {
          max-width: 800px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 40px;
        }

        .form-section {
          margin-bottom: 32px;
          padding-bottom: 32px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .form-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .section-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #c4a459;
          margin-bottom: 24px;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.4);
          margin-bottom: 8px;
        }

        input, select, textarea {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }

        input:focus, select:focus, textarea:focus {
          border-color: rgba(196,164,89,0.5);
          background: rgba(196,164,89,0.04);
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .checkbox-group input {
          width: auto;
        }

        .actions {
          display: flex;
          gap: 16px;
          margin-top: 40px;
        }

        .btn {
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          text-align: center;
        }

        .btn-update {
          background: #c4a459;
          color: #0c1a0f;
          border: none;
          flex: 1;
        }

        .btn-cancel {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .btn-update:hover { background: #d4b469; transform: translateY(-1px); }
        .btn-cancel:hover { background: rgba(255,255,255,0.1); color: #fff; }

        .error-message {
          padding: 16px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px;
          color: #fca5a5;
          margin-bottom: 24px;
          font-size: 13px;
        }
      `}</style>

      <div className="mb-8">
        <Link href="/admin/events" className="text-xs font-bold text-white/40 hover:text-[#c4a459] transition-colors mb-4 inline-block">
          ← Back to Events
        </Link>
        <h2 className="dash-greeting">Edit Event</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-container shadow-2xl">
        {error && <div className="error-message">⚠️ {error}</div>}

        <div className="form-section">
          <h3 className="section-title">Essential Details</h3>
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Schedule & Venue</h3>
          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="event_date">Date</label>
              <input
                id="event_date"
                type="date"
                required
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="event_time">Time</label>
              <input
                id="event_time"
                type="text"
                value={formData.event_time}
                onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="venue">Venue</label>
            <input
              id="venue"
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Settings</h3>
          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Sports">Sports</option>
                <option value="Academic">Academic</option>
                <option value="Culture">Culture</option>
                <option value="Community">Community</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="form-group mt-4">
            <label className="checkbox-group">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              />
              <span>Feature this event on the homepage?</span>
            </label>
          </div>
        </div>

        <div className="actions">
          <Link href="/admin/events" className="btn btn-cancel">Cancel</Link>
          <button type="submit" className="btn btn-update" disabled={saving}>
            {saving ? 'Updating...' : 'Update Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
