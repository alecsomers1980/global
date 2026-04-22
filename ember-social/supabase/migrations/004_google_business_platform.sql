-- Allow 'google_business' as a valid platform on social_accounts
-- so Ember can store GBP OAuth tokens alongside Facebook/Instagram/etc.

alter table public.social_accounts
    drop constraint if exists social_accounts_platform_check;

alter table public.social_accounts
    add constraint social_accounts_platform_check
    check (platform in ('facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'google_business'));
