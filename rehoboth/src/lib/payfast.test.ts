import { describe, test, expect } from "vitest";
import { createHash } from "node:crypto";
import { PayFastService } from "./payfast";

/**
 * These lock the two properties that broke live payments in the earlier
 * builds this module was ported from: fields hash in INSERTION order, not
 * alphabetical, and blank fields are omitted rather than sent empty.
 */
describe("PayFast signature", () => {
  test("produces a 32-character md5 hex digest", () => {
    const pf = new PayFastService();
    const sig = pf.generateSignature(
      {
        merchant_id: "10000100",
        merchant_key: "46f0cd694581a",
        amount: "100.00",
        item_name: "Test",
      },
      ""
    );
    expect(sig).toMatch(/^[a-f0-9]{32}$/);
  });

  test("blank fields are excluded from the signature", () => {
    const pf = new PayFastService();
    const a = pf.generateSignature({ merchant_id: "1", item_name: "X", item_description: "" }, "");
    const b = pf.generateSignature({ merchant_id: "1", item_name: "X" }, "");
    expect(a).toBe(b);
  });

  test("field order changes the signature", () => {
    const pf = new PayFastService();
    const a = pf.generateSignature({ merchant_id: "1", item_name: "X" }, "");
    const b = pf.generateSignature({ item_name: "X", merchant_id: "1" }, "");
    expect(a).not.toBe(b);
  });

  test("a passphrase changes the signature", () => {
    const pf = new PayFastService();
    const bare = pf.generateSignature({ merchant_id: "1" }, "");
    const withPass = pf.generateSignature({ merchant_id: "1" }, "secret");
    expect(bare).not.toBe(withPass);
  });

  test("spaces encode as + and not %20", () => {
    const pf = new PayFastService();
    // PHP urlencode() is what PayFast hashes against; encodeURIComponent's
    // %20 would produce a valid-looking but wrong digest. Hash the documented
    // param string independently rather than comparing two calls to the code
    // under test, so this fails if pfUrlEncode ever reverts.
    const md5 = (s: string) => createHash("md5").update(s).digest("hex");
    expect(pf.generateSignature({ item_name: "Rehoboth Order" }, "")).toBe(
      md5("item_name=Rehoboth+Order")
    );
    expect(pf.generateSignature({ item_name: "Rehoboth Order" }, "")).not.toBe(
      md5("item_name=Rehoboth%20Order")
    );
  });

  test("a literal + is escaped, so it cannot collide with an encoded space", () => {
    const pf = new PayFastService();
    const plus = pf.generateSignature({ item_name: "Rehoboth+Order" }, "");
    const space = pf.generateSignature({ item_name: "Rehoboth Order" }, "");
    expect(plus).not.toBe(space);
  });
});

describe("PayFast payment data", () => {
  test("carries a signature and a 2dp amount", () => {
    const pf = new PayFastService();
    const data = pf.createPaymentData({
      orderId: "0f8fad5b-d9cb-469f-a165-70867728950e",
      amount: 1234.5,
      customerFirstName: "Frieda",
      customerLastName: "Grobler",
      customerEmail: "friedsgrobler@gmail.com",
      itemName: "Rehoboth order REH-000001",
    });
    expect(data.amount).toBe("1234.50");
    expect(data.signature).toMatch(/^[a-f0-9]{32}$/);
    expect(data.m_payment_id).toBe("0f8fad5b-d9cb-469f-a165-70867728950e");
  });

  test("the signature verifies against the data it was built from", () => {
    const pf = new PayFastService();
    const { signature, ...fields } = pf.createPaymentData({
      orderId: "abc",
      amount: 99,
      customerFirstName: "A",
      customerLastName: "B",
      customerEmail: "a@b.co.za",
      itemName: "Order",
    });
    expect(pf.verifySignature(fields, signature)).toBe(true);
  });

  test("an altered amount fails verification", () => {
    const pf = new PayFastService();
    const { signature, ...fields } = pf.createPaymentData({
      orderId: "abc",
      amount: 99,
      customerFirstName: "A",
      customerLastName: "B",
      customerEmail: "a@b.co.za",
      itemName: "Order",
    });
    expect(pf.verifySignature({ ...fields, amount: "1.00" }, signature)).toBe(false);
  });
});
