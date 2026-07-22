# Lublaw Supabase setup

1. Create a Supabase project. Copy its URL + anon key + service-role key into `.env.local` (see `.env.local.example`).
2. Run `supabase/migrations/0001_blog.sql` in the SQL editor (or `supabase db push` if the CLI is linked).
3. Create a **public** Storage bucket named `blog-images`.
   - Storage > New bucket > name `blog-images` > Public bucket: ON.
4. Create the single admin user: Authentication > Users > Add user (email + password). No sign-up flow exists in the app — this is the only account.
