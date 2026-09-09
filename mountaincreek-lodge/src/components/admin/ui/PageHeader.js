export default function PageHeader({ title, action, showViewSite = true }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <h1 className="text-white text-2xl font-serif">{title}</h1>
      <div className="flex items-center gap-4">
        {showViewSite && (
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 hover:text-white/60 text-sm transition-colors"
          >
            View Site →
          </a>
        )}
        {action}
      </div>
    </div>
  );
}
