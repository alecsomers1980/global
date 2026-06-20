import crypto from "crypto";
import dns from "dns/promises";

type Mode = "sandbox" | "live";

export interface PayfastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  mode: Mode;
  processUrl: string;
  validateUrl: string;
}

export function getPayfastConfig(): PayfastConfig {
  const mode: Mode = process.env.PAYFAST_MODE === "live" ? "live" : "sandbox";
  const base = mode === "live" ? "https://www.payfast.co.za" : "https://sandbox.payfast.co.za";

  // In live mode, never silently fall back to sandbox/empty creds — that would
  // make ITN signatures forgeable and transact against the wrong account.
  if (mode === "live") {
    const missing = [
      ["PAYFAST_MERCHANT_ID", process.env.PAYFAST_MERCHANT_ID],
      ["PAYFAST_MERCHANT_KEY", process.env.PAYFAST_MERCHANT_KEY],
      ["PAYFAST_PASSPHRASE", process.env.PAYFAST_PASSPHRASE],
    ].filter(([, v]) => !v).map(([k]) => k);
    if (missing.length > 0) {
      throw new Error(`PayFast live mode missing env vars: ${missing.join(", ")}`);
    }
  }

  return {
    merchantId: process.env.PAYFAST_MERCHANT_ID ?? "10000100",
    merchantKey: process.env.PAYFAST_MERCHANT_KEY ?? "46f0cd694581a",
    passphrase: process.env.PAYFAST_PASSPHRASE ?? "",
    mode,
    processUrl: `${base}/eng/process`,
    validateUrl: `${base}/eng/query/validate`,
  };
}

// PayFast URL encoding: encodeURIComponent, spaces as '+', uppercase hex for reserved chars.
function pfEncode(value: string): string {
  return encodeURIComponent(value.trim())
    .replace(/%20/g, "+")
    .replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

// MD5 signature over ORDERED [key,value] pairs (exclude 'signature'), skipping empty values,
// appending the passphrase last when present.
export function buildSignature(pairs: [string, string][], passphrase: string): string {
  const parts: string[] = [];
  for (const [k, v] of pairs) {
    if (v !== "" && v !== undefined && v !== null) {
      parts.push(`${k}=${pfEncode(String(v))}`);
    }
  }
  let str = parts.join("&");
  if (passphrase) str += `&passphrase=${pfEncode(passphrase)}`;
  return crypto.createHash("md5").update(str).digest("hex");
}

export interface CheckoutInput {
  amountCents: number;
  itemName: string;
  mPaymentId: string;
  buyerEmail: string;
  buyerName?: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  refCode?: string;
}

// Build the fields (incl. signature) to POST to PayFast via an auto-submitting form.
export function buildCheckout(input: CheckoutInput): { processUrl: string; fields: [string, string][] } {
  const cfg = getPayfastConfig();
  const amount = (input.amountCents / 100).toFixed(2);
  const nameParts = (input.buyerName ?? "").trim().split(/\s+/).filter(Boolean);
  const first = nameParts[0] ?? "";
  const last = nameParts.slice(1).join(" ");

  const pairs: [string, string][] = [
    ["merchant_id", cfg.merchantId],
    ["merchant_key", cfg.merchantKey],
    ["return_url", input.returnUrl],
    ["cancel_url", input.cancelUrl],
    ["notify_url", input.notifyUrl],
    ["name_first", first],
    ["name_last", last],
    ["email_address", input.buyerEmail],
    ["m_payment_id", input.mPaymentId],
    ["amount", amount],
    ["item_name", input.itemName],
    ["custom_str1", input.refCode ?? ""],
  ];
  const signature = buildSignature(pairs, cfg.passphrase);
  const fields = pairs.filter(([, v]) => v !== "");
  fields.push(["signature", signature]);
  return { processUrl: cfg.processUrl, fields };
}

// Verify an ITN payload. `pairs` MUST be in the order received from PayFast, excluding 'signature'.
export function verifyItnSignature(
  pairs: [string, string][],
  receivedSignature: string,
  passphrase: string,
): boolean {
  return buildSignature(pairs, passphrase) === receivedSignature;
}

// Defense-in-depth: confirm the ITN came from a PayFast server IP.
// Resolves PayFast's published hosts and checks the source IP against them.
// FAILS OPEN on any uncertainty (no IP, DNS failure) — signature + server postback
// remain the primary guarantees, so this must never reject a legitimate ITN.
const PAYFAST_HOSTS = [
  "www.payfast.co.za",
  "w1w.payfast.co.za",
  "w2w.payfast.co.za",
  "sandbox.payfast.co.za",
];

export async function isValidPayfastSource(ip: string | null): Promise<boolean> {
  if (!ip) return true;
  try {
    const lists = await Promise.all(
      PAYFAST_HOSTS.map((h) => dns.resolve4(h).catch(() => [] as string[])),
    );
    const valid = new Set(lists.flat());
    if (valid.size === 0) return true; // DNS unavailable — don't block
    return valid.has(ip);
  } catch {
    return true;
  }
}

// Server-side confirmation: POST the raw ITN body back to PayFast; expect a "VALID" response.
export async function payfastServerConfirm(rawBody: string): Promise<boolean> {
  const cfg = getPayfastConfig();
  const res = await fetch(cfg.validateUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: rawBody,
  });
  const text = await res.text();
  return text.trim().startsWith("VALID");
}