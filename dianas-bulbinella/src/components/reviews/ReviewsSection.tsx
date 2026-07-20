import type { FC } from 'react';
import Stars from './Stars';
import ReviewGate from './ReviewGate';
import type { Review } from '@/lib/reviews';

interface ReviewsSectionProps {
  slug: string;
  reviews: Review[];
  ratingAvg: number;
  ratingCount: number;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const ReviewsSection: FC<ReviewsSectionProps> = ({
  slug,
  reviews,
  ratingAvg,
  ratingCount,
}) => {
  const hasReviews = ratingCount > 0;

  return (
    <section id="reviews" className="scroll-mt-24">
      <h2 className="text-3xl font-serif mb-6">
        Customer <span className="text-glow-gradient">Reviews</span>
      </h2>

      {/* Summary row */}
      {hasReviews ? (
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="text-4xl font-serif">{ratingAvg.toFixed(1)}</span>
          <Stars rating={ratingAvg} size="lg" />
          <span className="text-sm text-muted">
            Based on {ratingCount} review{ratingCount === 1 ? '' : 's'}
          </span>
        </div>
      ) : (
        <p className="text-muted mb-8">
          No reviews yet — be the first to review this product.
        </p>
      )}

      {/* Review list */}
      {reviews.map((review) => (
        <div
          key={review.id}
          className="border border-line rounded-2xl bg-white p-5 mb-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Stars rating={review.rating} size="sm" />
            {review.title && (
              <span className="font-medium text-sm">{review.title}</span>
            )}
          </div>
          <p className="text-sm">{review.body}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>{review.authorName}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={review.createdAt}>
              {formatDate(review.createdAt)}
            </time>
            {review.verified && (
              <span className="bg-forest/10 text-forest text-[11px] rounded-full px-2 py-0.5">
                Verified buyer
              </span>
            )}
          </div>

          {review.staffReply && (
            <div className="bg-paper rounded-xl p-4 mt-3">
              <p className="text-sm font-semibold">
                Diana&apos;s Bulbinella replied
              </p>
              <p className="text-sm mt-1">{review.staffReply}</p>
            </div>
          )}
        </div>
      ))}

      {/* Write a review area — eligibility resolves client-side (see ReviewGate). */}
      <div className="mt-8">
        <ReviewGate slug={slug} />
      </div>

      {/* Compliance line */}
      <p className="text-xs text-muted mt-8">
        Reviews reflect individual customer experience and are not medical
        advice.
      </p>
    </section>
  );
};

export default ReviewsSection;
