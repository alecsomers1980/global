'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  event_date: string;
  venue: string;
  category: string;
  is_featured: boolean;
  status: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      setError(error.message);
    } else {
      setEvents(data || []);
      setError(null);
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  async function toggleFeatured(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('events')
      .update({ is_featured: !currentStatus })
      .eq('id', id);

    if (!error) {
      fetchEvents();
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      // 1. Fetch event to get image URLs for cleanup
      const { data: event } = await supabase
        .from('events')
        .select('images')
        .eq('id', id)
        .single();
      
      if (event?.images && Array.isArray(event.images)) {
        // 2. Delete all associated images from storage
        await Promise.all(event.images.map(async (img: any) => {
          if (img.url && img.url.includes('/images/')) {
            await fetch('/api/delete-image', { 
              method: 'POST', 
              body: JSON.stringify({ imageUrl: img.url }) 
            });
          }
        }));
      }

      // 3. Delete the event record
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (!error) {
        fetchEvents();
      } else {
        throw error;
      }
    } catch (err: any) {
      alert('Error deleting event: ' + err.message);
    }
  }

  return (
    <div className="admin-page">
      <style>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .btn-primary {
          background: #c4a459;
          color: #0c1a0f;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 700;
          text-decoration: none;
          font-size: 14px;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #d4b469;
          transform: translateY(-1px);
        }

        .events-table-container {
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        th {
          padding: 16px 24px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: rgba(0,0,0,0.35);
          border-bottom: 1px solid rgba(0,0,0,0.04);
        }

        td {
          padding: 16px 24px;
          font-size: 14px;
          color: rgba(0,0,0,0.65);
          border-bottom: 1px solid rgba(0,0,0,0.04);
        }

        tr:last-child td { border-bottom: none; }

        .event-title {
          font-weight: 600;
          color: #1a2e1d;
        }

        .category-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 50px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          background: rgba(0,0,0,0.04);
          color: rgba(0,0,0,0.4);
        }

        .category-Sports { background: rgba(196,164,89,0.12); color: #c4a459; }
        .category-Academic { background: rgba(22,78,36,0.08); color: #164e24; }
        .category-Culture { background: rgba(225,29,72,0.12); color: #e11d48; }
        .category-Community { background: rgba(124,58,237,0.12); color: #7c3aed; }

        .featured-star {
          cursor: pointer;
          font-size: 18px;
          filter: grayscale(1);
          opacity: 0.2;
          transition: all 0.2s;
        }

        .featured-star.active {
          filter: grayscale(0);
          opacity: 1;
        }

        .actions-cell {
          display: flex;
          gap: 12px;
        }

        .btn-icon {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: rgba(0,0,0,0.25);
          transition: all 0.2s;
          text-decoration: none;
        }

        .btn-icon:hover { color: #164e24; }
        .btn-icon.delete:hover { color: #ef4444; }

        .empty-state {
          padding: 60px;
          text-align: center;
          color: rgba(0,0,0,0.3);
        }

        .error-state {
          padding: 40px;
          background: rgba(239,68,68,0.05);
          border: 1px solid rgba(239,68,68,0.1);
          border-radius: 12px;
          color: #ef4444;
        }
      `}</style>

      <div className="page-header">
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e1d' }}>Manage Events</h2>
        <Link href="/admin/events/new" className="btn-primary">
          + Create New Event
        </Link>
      </div>

      {error ? (
        <div className="error-state">
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Database Connection Error</h3>
          <p style={{ fontSize: 14, marginBottom: 16 }}>{error}</p>
          <p style={{ fontSize: 12, opacity: 0.7 }}>
            Hint: Have you run the SQL script in your Supabase dashboard yet? This error usually means the &apos;events&apos; table doesn&apos;t exist.
          </p>
          <button
            onClick={fetchEvents}
            style={{ marginTop: 16, fontSize: 12, fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }}
          >
            Retry Connection
          </button>
        </div>
      ) : loading ? (
        <div className="empty-state">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="events-table-container">
          <div className="empty-state">
            <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>No events found</p>
            <p style={{ fontSize: 14 }}>Click the button above to create your first event.</p>
          </div>
        </div>
      ) : (
        <div className="events-table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>⭐</th>
                <th>Event</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Category</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>
                    <span
                      className={`featured-star ${event.is_featured ? 'active' : ''}`}
                      onClick={() => toggleFeatured(event.id, event.is_featured)}
                      title="Toggle Featured"
                    >
                      ⭐
                    </span>
                  </td>
                  <td>
                    <div className="event-title">{event.title}</div>
                  </td>
                  <td>{event.event_date}</td>
                  <td>{event.venue || 'TBA'}</td>
                  <td>
                    <span className={`category-badge category-${event.category}`}>
                      {event.category}
                    </span>
                  </td>
                  <td>
                    <span style={{ opacity: 0.5, fontSize: 10, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }}>
                      {event.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <Link href={`/admin/events/edit/${event.id}`} className="btn-icon" title="Edit Event">
                        ✏️
                      </Link>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="btn-icon delete"
                        title="Delete Event"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
