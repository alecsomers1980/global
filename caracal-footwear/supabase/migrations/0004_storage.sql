-- Product image storage. Public read (product photos are public by nature);
-- writes go through the admin API's service-role client only, which
-- bypasses RLS entirely -- so no insert/update/delete policy is needed or
-- added, matching the orders table's default-deny-except-service-role
-- pattern from Phase 2.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "public read product images" on storage.objects
  for select using (bucket_id = 'product-images');
