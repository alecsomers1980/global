-- 015: business_archetype + psychology_note
-- Archetype drives the content pillar pool in the campaign generator.
-- psychology_note explains the psychological driver behind each generated post.

do $$
begin
    if not exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'workspaces' and column_name = 'business_archetype'
    ) then
        alter table public.workspaces
        add column business_archetype text
        check (business_archetype in ('product', 'service', 'hospitality', 'education', 'creator'));
    end if;
end
$$;

do $$
begin
    if not exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'posts' and column_name = 'psychology_note'
    ) then
        alter table public.posts
        add column psychology_note text;
    end if;
end
$$;
