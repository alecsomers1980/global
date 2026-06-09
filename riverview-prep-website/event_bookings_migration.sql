-- ===========================================
-- EVENT BOOKINGS & PAYMENTS
-- Run in Supabase SQL Editor.
-- ===========================================

CREATE TABLE IF NOT EXISTS event_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  event_title TEXT,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  ticket_tier TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  amount_total DECIMAL(10,2) NOT NULL,
  payfast_payment_id TEXT,
  payfast_status TEXT,
  status TEXT DEFAULT 'pending',  -- pending, paid, cancelled, refunded
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert bookings"
ON event_bookings FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Public can read own"
ON event_bookings FOR SELECT
TO anon
USING (true);

CREATE POLICY "Admin full access"
ON event_bookings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
