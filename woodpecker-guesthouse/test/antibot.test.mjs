import { test } from "node:test";
import assert from "node:assert/strict";
import { isBotSubmission } from "../src/lib/antibot.ts";

test("honeypot filled in => bot", () => {
  assert.equal(isBotSubmission({ honeypot: "anything", renderedAt: Date.now() - 5000 }), true);
});

test("submitted faster than MIN_SUBMIT_MS => bot", () => {
  assert.equal(isBotSubmission({ honeypot: "", renderedAt: Date.now() - 100 }), true);
});

test("empty honeypot + slow enough submission => human", () => {
  assert.equal(isBotSubmission({ honeypot: "", renderedAt: Date.now() - 5000 }), false);
});

test("missing renderedAt => human (fails open, not closed)", () => {
  assert.equal(isBotSubmission({ honeypot: "" }), false);
});
