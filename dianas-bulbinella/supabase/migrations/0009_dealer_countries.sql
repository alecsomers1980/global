-- Diana's Bulbinella — international agents (Namibia, Botswana, Mozambique)
-- Run in Supabase SQL editor, or `supabase db push`.
--
-- Until now every dealer was South African and `province` was the top level.
-- Adding `country` makes province a second level, which it always really was.

alter table public.dealers
  add column if not exists country text not null default 'South Africa';

-- The 150 rows seeded from Diana's SA list are all South African, which the
-- default already gives them. Explicit for anyone reading this later.
update public.dealers set country = 'South Africa' where country is null or country = '';

-- International agents are listed by town, not province — Namibia has no
-- provinces in Diana's list, so province is blank for them.
alter table public.dealers alter column province drop not null;
alter table public.dealers alter column province set default '';
update public.dealers set province = '' where province is null;

create index if not exists dealers_country_idx on public.dealers (country);

-- Applicants can be outside South Africa too.
alter table public.dealer_applications
  add column if not exists country text not null default 'South Africa';
