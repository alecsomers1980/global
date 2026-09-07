import { describe, test, expect } from "vitest";
import { createHmac } from "node:crypto";
import { modeOf, verifyWebhookSignature } from "./yoco";

/**
 * The webhook signature is the only thing standing between a forged POST and
 * an order marked paid, so these cover the ways that check can be got wrong:
 * the wrong bytes signed, a stale replay, a rotated secret, and a header that
 * merely looks right.
 */

const SECRET = "whsec_9v1YHo0m2gVHqk0hyz3RUcbUuSLwGF3Q0DPvbGKZKgU=";
const ID = "evt_test_123";
const BODY = JSON.stringify({ type: "payment.succeeded", payload: { amount: 24990 } });

/** Sign exactly the way Yoco documents it. */
function sign(body: string, timestamp: string, secret = SECRET, id = ID): string {
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  return createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest("base64");
}

/** A fixed "now", with the timestamp the webhook would carry at that moment. */
const NOW = new Date("2026-09-07T12:00:00Z");
const TS = String(Math.floor(NOW.getTime() / 1000));

const valid = {
  secret: SECRET,
  webhookId: ID,
  webhookTimestamp: TS,
  signatureHeader: `v1,${sign(BODY, TS)}`,
  rawBody: BODY,
  now: NOW,
};

describe("Yoco webhook signature", () => {
  test("accepts a correctly signed event", () => {
    expect(verifyWebhookSignature(valid)).toBe(true);
  });

  test("rejects a tampered body", () => {
    const tampered = JSON.stringify({ type: "payment.succeeded", payload: { amount: 1 } });
    expect(verifyWebhookSignature({ ...valid, rawBody: tampered })).toBe(false);
  });

  test("rejects a signature made with a different secret", () => {
    const other = "whsec_" + Buffer.from("not-the-real-secret").toString("base64");
    expect(
      verifyWebhookSignature({ ...valid, signatureHeader: `v1,${sign(BODY, TS, other)}` })
    ).toBe(false);
  });

  test("rejects a replay from outside the tolerance window", () => {
    const old = String(Math.floor(NOW.getTime() / 1000) - 600);
    expect(
      verifyWebhookSignature({
        ...valid,
        webhookTimestamp: old,
        signatureHeader: `v1,${sign(BODY, old)}`,
      })
    ).toBe(false);
  });

  test("accepts an event a few seconds old", () => {
    const recent = String(Math.floor(NOW.getTime() / 1000) - 30);
    expect(
      verifyWebhookSignature({
        ...valid,
        webhookTimestamp: recent,
        signatureHeader: `v1,${sign(BODY, recent)}`,
      })
    ).toBe(true);
  });

  test("the webhook id is part of what is signed", () => {
    expect(verifyWebhookSignature({ ...valid, webhookId: "evt_someone_elses" })).toBe(false);
  });

  test("accepts when one of several rotated signatures matches", () => {
    const header = `v1,${sign(BODY, TS, "whsec_" + Buffer.from("old").toString("base64"))} v1,${sign(BODY, TS)}`;
    expect(verifyWebhookSignature({ ...valid, signatureHeader: header })).toBe(true);
  });

  test("ignores signature versions it does not understand", () => {
    expect(
      verifyWebhookSignature({ ...valid, signatureHeader: `v2,${sign(BODY, TS)}` })
    ).toBe(false);
  });

  test("rejects missing headers rather than throwing", () => {
    expect(verifyWebhookSignature({ ...valid, signatureHeader: null })).toBe(false);
    expect(verifyWebhookSignature({ ...valid, webhookId: null })).toBe(false);
    expect(verifyWebhookSignature({ ...valid, webhookTimestamp: null })).toBe(false);
    expect(verifyWebhookSignature({ ...valid, secret: "" })).toBe(false);
  });

  test("rejects a non-numeric timestamp", () => {
    expect(verifyWebhookSignature({ ...valid, webhookTimestamp: "yesterday" })).toBe(false);
  });
});

describe("modeOf", () => {
  test("reads the environment off the key prefix", () => {
    expect(modeOf("sk_live_abc123")).toBe("live");
    expect(modeOf("sk_test_abc123")).toBe("test");
    expect(modeOf("")).toBe("unknown");
  });
});
