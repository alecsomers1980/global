-- Contact messages, and the social links that appear in the footer.
--
-- Messages are STORED, then emailed — not emailed only. An earlier build in
-- this workspace lost every enquiry for months because its mail server quietly
-- stopped working and the code showed the sender a success screen anyway. A
-- row in a table cannot fail that way, and the admin inbox is the record.

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  handled boolean not null default false,
  emailed boolean not null default false,
  created_at timestamptz not null default now()
);

create index contact_messages_handled_idx on contact_messages (handled, created_at desc);

-- Public form, personal details: service role only, as with orders.
alter table contact_messages enable row level security;

-- Social links live in site_settings so Frieda can change them without a
-- deploy, the same way delivery rates do. Empty string means "not on that
-- platform" and the link is simply not rendered.
insert into site_settings (key, value) values (
  'social',
  '{"facebook":"","instagram":"","whatsapp":"","tiktok":"","youtube":"","linkedin":""}'
) on conflict (key) do nothing;
