-- Per-size wording.
--
-- Until now the description, traditional use, ingredients, directions and
-- storage all lived on the product, and every size of that product showed the
-- same paragraphs. That is wrong wherever the sizes are not the same thing:
-- the dosage on a 100 g bag of powder is not the dosage on a bottle of 60
-- capsules, and the scented boerseep bars already differ enough to warrant
-- their own photograph (0007) — the ingredients differ too.
--
-- Every column is nullable and null means INHERIT. A blank box in the admin
-- shows the product's wording rather than an empty section, so shared copy is
-- typed once on the product and only the genuinely different lines are
-- overridden per size. That also makes this migration a no-op for the live
-- catalogue: nothing is copied down, so every existing page renders exactly
-- as it did before anyone fills a box in.
alter table product_variants add column summary text;
alter table product_variants add column traditional_use text;
alter table product_variants add column ingredients text;
alter table product_variants add column directions text;
alter table product_variants add column storage text;
