-- Customers table for jobcard autofill (Supabase).
-- Run this once in Supabase SQL Editor, then import customers_supabase.csv via Table Editor.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS customers (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer    text NOT NULL,
    contact     text,
    mobile_1    text,
    mobile_2    text,
    email       text,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Trigram index makes ILIKE '%foo%' on customer name fast.
CREATE INDEX IF NOT EXISTS customers_customer_trgm_idx
    ON customers USING gin (customer gin_trgm_ops);

-- RLS: allow signed-in users to read customers (autofill on the admin form).
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS customers_read_authenticated ON customers;
CREATE POLICY customers_read_authenticated
    ON customers FOR SELECT
    TO authenticated
    USING (true);

-- NOTE: jobcards lives in Vercel Postgres, not Supabase.
-- To add the second phone column, run the companion Node script:
--   node scripts/customer-import/alter_jobcards_phone2.mjs
