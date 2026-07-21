'use client';

import { useRouter } from 'next/navigation';
import { type FC, useState } from 'react';

interface ReviewFormProps {
  slug: string;
}

const ReviewForm: FC<ReviewFormProps> = ({ slug }) => {
  const router = useRouter();
  const [rating, setRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const displayRating = hoverRating || rating;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || rating === 0) return;
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, rating, title, body }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
      } else {
        setSuccessMessage(data.message);
        router.refresh();
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  }

  if (successMessage) {
    return (
      <div
        className="rounded-2xl border border-line bg-green-50 p-5 text-forest"
        role="alert"
      >
        <p className="font-medium">{successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Star picker */}
      <div className="space-y-2">
        <span id="star-rating-label" className="text-sm font-medium">
          Rating
        </span>
        <div
          role="group"
          aria-labelledby="star-rating-label"
          className="flex gap-1"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= displayRating;
            return (
              <button
                key={star}
                type="button"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                className={`-m-1 p-1 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest transition-colors ${
                  filled ? 'text-amber' : 'text-black/15'
                } hover:text-amber`}
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10,0 L12.5,7.5 L20,7.5 L14,12.5 L16,20 L10,16 L4,20 L6,12.5 L0,7.5 L7.5,7.5 Z" />
                </svg>
              </button>
            );
          })}
        </div>
      </div>

      {/* Title (optional) */}
      <div>
        <label htmlFor="review-title" className="text-sm font-medium">
          Title <span className="text-muted">(optional)</span>
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-2xl border border-line bg-white px-4 py-2 text-sm"
          placeholder="Sum up your experience"
        />
      </div>

      {/* Body (required) */}
      <div>
        <label htmlFor="review-body" className="text-sm font-medium">
          Your review <span className="text-red-500">*</span>
        </label>
        <textarea
          id="review-body"
          required
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell other customers about your experience…"
          className="mt-1 block w-full rounded-2xl border border-line bg-white px-4 py-2 text-sm"
        />
      </div>

      {error && (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || rating === 0}
        className="rounded-full bg-forest px-5 py-2.5 text-sm text-paper transition-colors hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : 'Submit review'}
      </button>

      <p className="text-xs text-muted">
        Reviews are checked before publishing. Please describe your own
        experience — reviews cannot make medical claims.
      </p>
    </form>
  );
};

export default ReviewForm;
