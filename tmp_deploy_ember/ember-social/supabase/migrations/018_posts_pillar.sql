-- 018: ensure pillar column exists on posts (for deterministic pillar-rotation plan)

do $$
begin
    if not exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'posts' and column_name = 'pillar'
    ) then
        alter table public.posts add column pillar text;
    end if;
end
$$;
