create extension if not exists pg_trgm;

alter table plays add column search_text text
  generated always as (
    coalesce(title, '') || ' ' || coalesce(logline, '') || ' ' || coalesce(synopsis_short, '')
  ) stored;

create index plays_search_trgm on plays using gin (search_text gin_trgm_ops);
create index playwrights_name_trgm on playwrights using gin (name gin_trgm_ops);
create index plays_genres_idx on plays using gin (genres);
