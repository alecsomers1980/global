import type { PostSummary } from '@/lib/queries';
import AdSlot from './AdSlot';
import PopularPosts from './PopularPosts';

type Ad = { client_name: string; banner_url: string; target_link: string | null };

export default function Sidebar({ ad, popular }: { ad: Ad | null; popular: PostSummary[] }) {
  return (
    <aside className="flex flex-col gap-12">
      <AdSlot ad={ad} size="rectangle" />
      <PopularPosts posts={popular} />
    </aside>
  );
}