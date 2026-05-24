create table if not exists public.campaign_batches (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  public_token text not null unique,
  strategy_rationale text,
  pillars text[],
  duration_days int not null default 30,
  created_at timestamptz default now()
);

alter table public.campaign_batches enable row level security;
create policy "Agency manage batches" on public.campaign_batches for all
  using (auth.role() = 'authenticated');

create table if not exists public.post_feedback (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.posts(id) on delete cascade,
  author_name text,
  author_role text check (author_role in ('client','agency')) default 'client',
  comment text not null,
  status text check (status in ('open','resolved')) default 'open',
  created_at timestamptz default now()
);

alter table public.post_feedback enable row level security;
create policy "Public can insert feedback" on public.post_feedback for insert with check (true);
create policy "Agency read feedback" on public.post_feedback for select using (auth.role() = 'authenticated');

alter table public.posts
  add column if not exists campaign_batch_id uuid references public.campaign_batches(id) on delete set null,
  add column if not exists client_status text
    check (client_status in ('pending','approved','changes_requested'))
    default 'pending';

create index if not exists post_feedback_post_id_idx on public.post_feedback(post_id);
create index if not exists campaign_batches_public_token_idx on public.campaign_batches(public_token);
create index if not exists posts_campaign_batch_id_idx on public.posts(campaign_batch_id);
