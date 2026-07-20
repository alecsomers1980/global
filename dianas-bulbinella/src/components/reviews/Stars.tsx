import type { FC } from 'react';

interface StarsProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses: Record<NonNullable<StarsProps['size']>, string> = {
  sm: 'h-3.5',
  md: 'h-4',
  lg: 'h-5',
};

const Stars: FC<StarsProps> = ({ rating, size = 'md', className }) => {
  const filledStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const gradientId = `half-star-${Math.round(rating * 10)}`;

  const starPath =
    'M10,0 L12.5,7.5 L20,7.5 L14,12.5 L16,20 L10,16 L4,20 L6,12.5 L0,7.5 L7.5,7.5 Z';

  return (
    <span
      role="img"
      aria-label={`${rating} out of 5 stars`}
      className={className}
    >
      <svg
        viewBox="0 0 100 20"
        className={sizeClasses[size]}
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="50%"
              stopColor="var(--color-amber, #C89A4B)"
            />
            <stop
              offset="50%"
              stopColor="var(--color-line, rgba(0,0,0,0.15))"
            />
          </linearGradient>
        </defs>
        {Array.from({ length: 5 }, (_, i) => {
          // 20-wide slot, 18-wide star — the 0.9 scale is what puts a gap
          // between them; without it the five stars touch.
          const transform = `translate(${i * 20 + 1},1) scale(0.9)`;
          if (i < filledStars) {
            return (
              <g
                key={i}
                transform={transform}
                className="text-amber"
              >
                <path d={starPath} fill="currentColor" />
              </g>
            );
          }
          if (i === filledStars && hasHalf) {
            return (
              <g key={i} transform={transform}>
                <path d={starPath} fill={`url(#${gradientId})`} />
              </g>
            );
          }
          return (
            <g
              key={i}
              transform={transform}
              className="text-black/15"
            >
              <path d={starPath} fill="currentColor" />
            </g>
          );
        })}
      </svg>
    </span>
  );
};

export default Stars;
