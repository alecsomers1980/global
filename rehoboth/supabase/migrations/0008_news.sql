-- Latest news.
--
-- Body is HTML from the admin's editor rather than markdown: the client asked
-- for the same writing experience as the newsroom platform, where what you see
-- in the editor is what the page renders. Only staff can write it (every news
-- action verifies an admin token), and the editor parses pasted content into
-- its own schema, so the stored HTML cannot carry script.
--
-- Everything a post says is screened against the same prohibited-claims list
-- as product copy before it saves. A blog post claiming the moringa treats a
-- condition is exactly the exposure the rest of this build exists to avoid.

create table news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  -- Shown on the cards; separate from the body so a card is never a truncated
  -- first paragraph ending mid-word.
  excerpt text,
  body text not null default '',
  hero_image text,
  published boolean not null default false,
  -- Set the first time a post is published and kept thereafter, so unpublishing
  -- to fix a typo does not reorder the news.
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index news_posts_published_idx on news_posts (published, published_at desc);

alter table news_posts enable row level security;

create policy "public read published news"
  on news_posts for select using (published);

-- Article images, kept apart from product photography so a tidy-up of one
-- cannot reach into the other.
insert into storage.buckets (id, name, public)
values ('news-images', 'news-images', true)
on conflict (id) do nothing;
