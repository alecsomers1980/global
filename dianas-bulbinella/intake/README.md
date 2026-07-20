# Intake — drop client data here

This is the drop zone for the existing WordPress/WooCommerce site export.
**Everything under this folder is git-ignored** (see `../.gitignore`) because it is
large and contains customer PII (orders, customers) — POPIA-sensitive. Do not commit it.

## Where to put things

```
intake/
├── wp-content/     ← drop the whole wp-content folder here (uploads/, plugins/, themes/)
└── database/       ← drop the DB dump here
```

### wp-content
Copy the entire `wp-content` directory into `intake/wp-content/`.
The part I actually need is `wp-content/uploads/` (all product images/media).
Plugins/themes are useful only for reference — fine to include or skip.

### database
Drop the WooCommerce database export into `intake/database/`. Any of these is fine:
- A full `.sql` dump (e.g. `dianas.sql` or `dianas.sql.gz`) — **preferred**
- A phpMyAdmin export
- Or, if easier, a WooCommerce **product CSV export** (Products → Export) as `products.csv`

If the dump is big, gzip it — I can read `.sql.gz` directly.

## Once it's here
Tell me it's dropped and I'll:
1. Size the real catalogue (product + variant + image count)
2. Build the category/concern map and the old→new URL redirect list
3. Draft the SAHPRA/ARB-compliant copy rules before any migration
