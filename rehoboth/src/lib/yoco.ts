import crypto from "crypto";

/**
 * Yoco integration.
 *
 * Two halves, and only the second one is trusted:
 *
 *  1. createCheckout is a server-to-server call that hands back a URL to send
 *     the customer to. It proves nothing about payment.
 *  2. verifyWebhookSignature guards the webhook that actually settles an
 *     order. Yoco signs those Svix-style, and that signature is the only
 *     reason we believe a payment happened — the browser coming back to the
 *     success page is not evidence of anything, since anyone can open it.
 *
 * The credentials are read from site_settings rather than the environment so
 * the shop can enter its own keys in the admin. See 0010_yoco.sql.
 */

const CHECKOUT_URL = "https://payments.yoco.com/api/checkouts";

/** How far out of date a webhook's timestamp may be. Yoco's own guidance. */
const TIMESTAMP_TOLERANCE_SECONDS = 180;

export type YocoSettings = {
  /** sk_test_… or sk_live_… — the prefix is what decides test versus live. */
  secret_key: string;
  /** whsec_… returned once when the webhook was registered. */
  webhook_secret: string;
};

export const EMPTY_YOCO: YocoSettings = { secret_key: "", webhook_secret: "" };

/** Read the stored credentials. Service role only — this must never be called
 *  from anything that renders in the browser. */
export async function getYocoSettings(): Promise<YocoSettings> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return EMPTY_YOCO;

  const { getServerClient } = await import("./supabase/server");
  const { data, error } = await getServerClient()
    .from("site_settings")
    .select("value")
    .eq("key", "yoco")
    .maybeSingle();

  if (error || !data) return EMPTY_YOCO;
  const value = data.value as Partial<YocoSettings>;
  return {
    secret_key: (value.secret_key ?? "").trim(),
    webhook_secret: (value.webhook_secret ?? "").trim(),
  };
}

/** Which Yoco environment a secret key belongs to, read off the key itself. */
export function modeOf(secretKey: string): "live" | "test" | "unknown" {
  if (secretKey.startsWith("sk_live_")) return "live";
  if (secretKey.startsWith("sk_test_")) return "test";
  return "unknown";
}

export class YocoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "YocoError";
  }
}

export type CreatedCheckout = { id: string; redirectUrl: string };

/**
 * Open a hosted checkout and get back the URL to send the customer to.
 *
 * The amount crosses the wire in CENTS as an integer, which is also why it is
 * rounded here rather than trusted as a float: a total of 249.90 that arrives
 * as 24989.999999 would silently undercharge.
 *
 * orderId travels in metadata and comes back on the webhook, and doubles as
 * the idempotency key — a customer who double-clicks their way through
 * checkout gets the same Yoco checkout back, not two of them.
 */
export async function createCheckout(params: {
  secretKey: string;
  orderId: string;
  reference: string;
  /** Order total in rands. */
  total: number;
  siteUrl: string;
}): Promise<CreatedCheckout> {
  const res = await fetch(CHECKOUT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.secretKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": params.orderId,
    },
    body: JSON.stringify({
      amount: Math.round(params.total * 100),
      currency: "ZAR",
      successUrl: `${params.siteUrl}/checkout/success?order=${params.orderId}`,
      cancelUrl: `${params.siteUrl}/checkout?cancelled=1`,
      failureUrl: `${params.siteUrl}/checkout?failed=1`,
      metadata: {
        orderId: params.orderId,
        reference: params.reference,
      },
    }),
  });

  if (!res.ok) {
    // Yoco's error body names the offending field; it goes to the log, never
    // to the customer, because it can quote the request back at us.
    const detail = await res.text().catch(() => "");
    throw new YocoError(`create checkout failed: ${res.status} ${detail.slice(0, 500)}`);
  }

  const body = (await res.json()) as { id?: string; redirectUrl?: string };
  if (!body.id || !body.redirectUrl) {
    throw new YocoError("create checkout returned no redirectUrl");
  }
  return { id: body.id, redirectUrl: body.redirectUrl };
}

/**
 * Verify a webhook came from Yoco.
 *
 * The signed content is `{webhook-id}.{webhook-timestamp}.{raw body}`, HMAC
 * SHA-256, key = the webhook secret with its `whsec_` prefix stripped and the
 * remainder base64-DECODED to bytes. The raw body must be the bytes as
 * received: re-serialising parsed JSON changes the signature.
 *
 * The header may carry several space-separated signatures during a secret
 * rotation, each tagged with a version — every `v1` one is checked.
 *
 * `now` is a parameter so the replay window is testable.
 */
export function verifyWebhookSignature(params: {
  secret: string;
  webhookId: string | null;
  webhookTimestamp: string | null;
  signatureHeader: string | null;
  rawBody: string;
  now?: Date;
}): boolean {
  const { secret, webhookId, webhookTimestamp, signatureHeader, rawBody } = params;
  if (!secret || !webhookId || !webhookTimestamp || !signatureHeader) return false;

  // Replay guard. An attacker who captures a genuine notification can resend
  // it verbatim, signature and all; only the timestamp makes that stale.
  const sent = Number(webhookTimestamp);
  if (!Number.isFinite(sent)) return false;
  const nowSeconds = Math.floor((params.now ?? new Date()).getTime() / 1000);
  if (Math.abs(nowSeconds - sent) > TIMESTAMP_TOLERANCE_SECONDS) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = crypto
    .createHmac("sha256", key)
    .update(`${webhookId}.${webhookTimestamp}.${rawBody}`)
    .digest("base64");

  return signatureHeader
    .split(" ")
    .filter((part) => part.startsWith("v1,"))
    .some((part) => timingSafeEqual(part.slice(3), expected));
}

/** Constant-time string compare. timingSafeEqual throws on a length mismatch,
 *  and a length mismatch is already a non-match. */
function timingSafeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

/**
 * What the admin screen is allowed to know about the stored credentials.
 *
 * Never the keys themselves. getSettings hands its result to a client
 * component, so anything returned there is in the browser and in the page
 * payload — a secret key put in that object would be readable by anyone who
 * opens developer tools on the settings page. The operator only needs to see
 * whether a key is saved and which one, and the last four characters are
 * enough to tell two keys apart.
 */
export type YocoStatus = {
  has_secret_key: boolean;
  secret_key_tail: string;
  mode: "live" | "test" | "unknown";
  has_webhook_secret: boolean;
};

export function maskYoco(value: unknown): YocoStatus {
  const v = (value ?? {}) as Partial<YocoSettings>;
  const secret = (v.secret_key ?? "").trim();
  const webhook = (v.webhook_secret ?? "").trim();
  return {
    has_secret_key: secret !== "",
    secret_key_tail: secret ? secret.slice(-4) : "",
    mode: modeOf(secret),
    has_webhook_secret: webhook !== "",
  };
}
