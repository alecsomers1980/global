-- 017: rename lifestyle → lifestyle_hero, add vehicle_ids for multi-car posts

update public.posts set style = 'lifestyle_hero' where style = 'lifestyle';

do $$
begin
    if not exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'posts' and column_name = 'vehicle_ids'
    ) then
        alter table public.posts add column vehicle_ids uuid[];
    end if;

    if not exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'posts' and column_name = 'cta_url'
    ) then
        alter table public.posts add column cta_url text;
    end if;
end
$$;
