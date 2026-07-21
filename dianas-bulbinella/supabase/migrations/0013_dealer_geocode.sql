-- Diana's Bulbinella — dealer coordinates for the "find a dealer" map.
-- Nullable: a dealer is listed the moment Diana adds it; geocoding fills these
-- in afterwards (scripts/geocode-dealers.mjs → `npm run geocode-dealers:apply`).
-- The map simply skips any dealer without coordinates, so a new agent never
-- breaks the map while waiting to be geocoded.

alter table public.dealers add column if not exists latitude  double precision;
alter table public.dealers add column if not exists longitude double precision;

-- Existing "read active dealers" RLS already covers these columns; no new policy.
