type Ad = { client_name: string; banner_url: string; target_link: string | null };

const SIZES = {
  leaderboard: 'h-[100px] max-w-4xl',
  rectangle: 'aspect-[300/250] w-full',
};

export default function AdSlot({
  ad,
  size,
}: {
  ad: Ad | null;
  size: 'leaderboard' | 'rectangle';
}) {
  if (!ad) return null;

  const banner = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={ad.banner_url} alt={ad.client_name} className="w-full h-full object-cover" />
  );

  return (
    <div className={`relative overflow-hidden bg-[var(--color-surface-alt)] ${SIZES[size]}`}>
      {ad.target_link ? (
        <a href={ad.target_link} target="_blank" rel="noopener sponsored">
          {banner}
        </a>
      ) : (
        banner
      )}
    </div>
  );
}