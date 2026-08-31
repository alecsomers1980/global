-- Product photography, uploaded rather than deployed.
--
-- Until now a product's photo was a path stem baked into the repo
-- (/products/<slug>, with -400/-800/-1600 webp variants optimised beside it).
-- That is right for the shots we processed by hand, but it means Frieda cannot
-- add or change a photograph without a developer and a deploy. hero_image now
-- also accepts a full https URL into the bucket below; lib/product-image.ts
-- resolves either form, so the existing rows keep working untouched.
--
-- image_url is per variant because most of this range is one product in
-- several scents: the cappuccino, cinnamon and moringa boerseep bars look
-- nothing alike, and showing one bar for all three misrepresents what is in
-- the basket.
alter table product_variants add column image_url text;

-- Public bucket: objects are served straight from /object/public/... with no
-- policy needed, and every write goes through the service role in
-- lib/storage.ts, which bypasses RLS. No anon key can put anything here.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
