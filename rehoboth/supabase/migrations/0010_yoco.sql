-- Yoco replaces PayFast as the payment gateway.
--
-- The credentials live in site_settings rather than in environment variables
-- so the shop's own keys can be entered in the admin, the same way delivery
-- rates and social links already are. site_settings has RLS enabled and NO
-- policies (0003), so only the service role can read this row — the anon key
-- the browser holds cannot see it. The admin never receives the secret either;
-- getSettings masks it, and only a non-empty box overwrites what is stored.
--
-- Two keys, not three: the hosted-checkout flow is a server-to-server call
-- signed with the secret key, then a signed webhook. Yoco's publishable key is
-- only needed for the in-page card SDK, which this shop does not use.
--
-- mode is not stored. Yoco's own key prefix (sk_test_ / sk_live_) already says
-- which environment a key belongs to, and a separate toggle would only create
-- the state where the two disagree.
insert into site_settings (key, value) values (
  'yoco',
  '{"secret_key":"","webhook_secret":""}'
) on conflict (key) do nothing;

-- Yoco's two identifiers. The checkout id is known when the customer is sent
-- off to pay; the payment id only arrives with the webhook that settles the
-- order, and is what reconciles a row here against the Yoco dashboard.
--
-- payfast_payment_id (0003) is deliberately left in place. Orders already paid
-- through PayFast carry their reference in it, and dropping the column to tidy
-- up would destroy the only link between those rows and that account.
alter table orders add column yoco_checkout_id text;
alter table orders add column yoco_payment_id text;
