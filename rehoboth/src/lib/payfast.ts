import crypto from "crypto";
import dns from "dns/promises";

/**
 * PayFast integration.
 *
 * The signature logic below is ported verbatim from the aloe-signs
 * implementation — the field ORDER (insertion order, not alphabetical) and the
 * PHP-style urlencode are both load-bearing and were corrected there after
 * live failures. Do not "tidy" them.
 *
 * Unlike aloe's, this module also provides the ITN hardening helpers
 * (valid-host check + server-to-server postback validation) that a real money
 * flow needs — see src/app/api/payfast/notify/route.ts.
 */

export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  mode: "sandbox" | "production";
  siteUrl: string;
}

/** PayFast's documented ITN source hosts. */
const PAYFAST_HOSTS = [
  "www.payfast.co.za",
  "sandbox.payfast.co.za",
  "w1w.payfast.co.za",
  "w2w.payfast.co.za",
];

export class PayFastService {
  private config: PayFastConfig;

  constructor() {
    this.config = {
      // Defaults are PayFast's public sandbox credentials.
      merchantId: process.env.PAYFAST_MERCHANT_ID || "10000100",
      merchantKey: process.env.PAYFAST_MERCHANT_KEY || "46f0cd694581a",
      passphrase: process.env.PAYFAST_PASSPHRASE || "",
      mode: (process.env.PAYFAST_MODE as "sandbox" | "production") || "sandbox",
      siteUrl:
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3010"),
    };
  }

  get mode() {
    return this.config.mode;
  }

  /** Where the checkout form POSTs to. */
  getPaymentUrl(): string {
    return this.config.mode === "sandbox"
      ? "https://sandbox.payfast.co.za/eng/process"
      : "https://www.payfast.co.za/eng/process";
  }

  private getValidateUrl(): string {
    return this.config.mode === "sandbox"
      ? "https://sandbox.payfast.co.za/eng/query/validate"
      : "https://www.payfast.co.za/eng/query/validate";
  }

  /**
   * URL-encode to match PHP's urlencode() exactly — PayFast's reference
   * signature implementation is PHP. encodeURIComponent leaves ! ~ * ' ( )
   * unescaped and uses %20 for spaces; PHP uses + and escapes those.
   */
  private pfUrlEncode(value: string): string {
    return encodeURIComponent(value)
      .replace(/[!'()*~]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
      .replace(/%20/g, "+");
  }

  /**
   * MD5 signature over the fields in INSERTION order (PayFast's documented
   * process-page order), excluding blanks, with the passphrase appended last.
   */
  generateSignature(data: Record<string, string>, passphrase?: string): string {
    const pfParamString = Object.keys(data)
      .filter(
        (key) => data[key] !== "" && data[key] !== undefined && data[key] !== null
      )
      .map((key) => `${key}=${this.pfUrlEncode(String(data[key]).trim())}`)
      .join("&");

    const stringToHash = passphrase
      ? `${pfParamString}&passphrase=${this.pfUrlEncode(passphrase.trim())}`
      : pfParamString;

    return crypto.createHash("md5").update(stringToHash).digest("hex");
  }

  /** Verify the signature on an inbound ITN payload (signature already removed). */
  verifySignature(data: Record<string, string>, signature: string): boolean {
    const calculated = this.generateSignature(data, this.config.passphrase);
    return calculated === signature;
  }

  /** Build the signed field set the browser POSTs to PayFast. */
  createPaymentData(params: {
    orderId: string;
    amount: number;
    customerFirstName: string;
    customerLastName: string;
    customerEmail: string;
    customerPhone?: string;
    itemName: string;
    itemDescription?: string;
  }): Record<string, string> {
    const data: Record<string, string> = {
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      return_url: `${this.config.siteUrl}/api/payfast/return?orderId=${params.orderId}`,
      cancel_url: `${this.config.siteUrl}/checkout?cancelled=1`,
      notify_url: `${this.config.siteUrl}/api/payfast/notify`,
      name_first: params.customerFirstName,
      name_last: params.customerLastName,
      email_address: params.customerEmail,
    };

    // cell_number belongs here (buyer details) per PayFast's documented order.
    if (params.customerPhone) data.cell_number = params.customerPhone;

    data.m_payment_id = params.orderId;
    data.amount = params.amount.toFixed(2);
    data.item_name = params.itemName;
    if (params.itemDescription) data.item_description = params.itemDescription;

    const signature = this.generateSignature(data, this.config.passphrase);
    return { ...data, signature };
  }

  /**
   * Confirm the ITN really came from a PayFast host. Resolves PayFast's
   * published hostnames and checks the request IP is among them.
   */
  async isValidRequestIp(ip: string | null): Promise<boolean> {
    if (!ip) return false;
    const resolved = await Promise.all(
      PAYFAST_HOSTS.map(async (host) => {
        try {
          return await dns.resolve4(host);
        } catch {
          return [] as string[];
        }
      })
    );
    return resolved.flat().includes(ip);
  }

  /**
   * Server-to-server postback: echo the ITN payload back to PayFast and require
   * "VALID". This is the strongest guarantee the notification is genuine.
   */
  async validateWithPayFast(rawBody: string): Promise<boolean> {
    try {
      const res = await fetch(this.getValidateUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: rawBody,
      });
      const text = (await res.text()).trim();
      return text.toUpperCase().startsWith("VALID");
    } catch (e) {
      console.error("[payfast] postback validation failed", e);
      return false;
    }
  }
}

export const payfast = new PayFastService();
