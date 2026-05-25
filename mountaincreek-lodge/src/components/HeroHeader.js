export default function HeroHeader({ eyebrow, title, description, children }) {
  return (
    <header className="relative bg-primary overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="hero-pattern"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 20 L20 0 L40 20 L20 40 Z"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-pattern)" />
        </svg>
      </div>

      {/* Decorative botanical SVG left */}
      <div className="absolute left-0 top-0 h-full w-32 opacity-[0.06] hidden lg:block pointer-events-none">
        <svg
          viewBox="0 0 120 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full"
        >
          <path
            d="M60 0 C60 0 30 80 60 120 C90 160 30 200 60 260 C90 320 30 360 60 400"
            stroke="white"
            strokeWidth="1"
            fill="none"
          />
          <ellipse cx="35" cy="100" rx="18" ry="8" stroke="white" strokeWidth="0.8" fill="none" transform="rotate(-30 35 100)" />
          <ellipse cx="85" cy="180" rx="18" ry="8" stroke="white" strokeWidth="0.8" fill="none" transform="rotate(30 85 180)" />
          <ellipse cx="35" cy="280" rx="18" ry="8" stroke="white" strokeWidth="0.8" fill="none" transform="rotate(-30 35 280)" />
        </svg>
      </div>

      {/* Decorative botanical SVG right */}
      <div className="absolute right-0 top-0 h-full w-32 opacity-[0.06] hidden lg:block pointer-events-none">
        <svg
          viewBox="0 0 120 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full"
        >
          <path
            d="M60 0 C60 0 90 80 60 120 C30 160 90 200 60 260 C30 320 90 360 60 400"
            stroke="white"
            strokeWidth="1"
            fill="none"
          />
          <ellipse cx="85" cy="100" rx="18" ry="8" stroke="white" strokeWidth="0.8" fill="none" transform="rotate(30 85 100)" />
          <ellipse cx="35" cy="180" rx="18" ry="8" stroke="white" strokeWidth="0.8" fill="none" transform="rotate(-30 35 180)" />
          <ellipse cx="85" cy="280" rx="18" ry="8" stroke="white" strokeWidth="0.8" fill="none" transform="rotate(30 85 280)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-20 lg:py-24 text-center z-10">
        {/* Eyebrow */}
        {eyebrow && (
          <p className="font-sans text-linen/50 text-xs uppercase tracking-[0.3em] mb-4">
            {eyebrow}
          </p>
        )}

        {/* Title */}
        {title && (
          <h1 className="font-serif text-linen text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-6 max-w-4xl mx-auto">
            {title}
          </h1>
        )}

        {/* Description */}
        {description && (
          <p className="font-sans text-linen/70 text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-8">
            {description}
          </p>
        )}

        {/* Dynamic Children (e.g., stats pills or logos) */}
        {children}
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 40V20C240 0 480 0 720 20C960 40 1200 40 1440 20V40H0Z"
            fill="#F5F0E8"
          />
        </svg>
      </div>
    </header>
  );
}
