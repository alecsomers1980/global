-- Phase 4 — verification services. Extends the existing service pipeline with
-- POPIA consent, an SLA window, and (criminal checks) appointment booking.
-- A "verification service" is just a service product with these flags set.
-- Re-runnable.

alter table public.shop_products add column if not exists requires_consent boolean not null default false;
alter table public.shop_products add column if not exists requires_appointment boolean not null default false;
alter table public.shop_products add column if not exists sla_hours int not null default 0;

alter table public.shop_orders add column if not exists consent_at timestamptz;

alter table public.service_jobs add column if not exists consent_at timestamptz;
alter table public.service_jobs add column if not exists requires_appointment boolean not null default false;
alter table public.service_jobs add column if not exists appointment_location text;
alter table public.service_jobs add column if not exists appointment_date date;
alter table public.service_jobs add column if not exists sla_due_at timestamptz;
