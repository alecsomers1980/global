import crypto from "crypto";

export type PayFastMode = "sandbox" | "production";

class PayFastService {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  mode: PayFastMode;
  siteUrl: string;

  constructor() {
    this.merchantId = process.env.PAYFAST_MERCHANT_ID || "10000100";
    this.merchantKey = process.env.PAYFAST_MERCHANT_KEY || "46f0cd694581a";
    this.passphrase = process.env.PAYFAST_PASSPHRASE || "";
    this.mode = (process.env.PAYFAST_MODE as PayFastMode) || "sandbox";
    this.siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  }

  getPaymentUrl() {
    return this.mode === "sandbox"
      ? "https://sandbox.payfast.co.za/eng/process"
      : "https://www.payfast.co.za/eng/process";
  }

  generateSignature(data: Record<string, string>, passphrase?: string): string {
    const pfParamString = Object.keys(data)
      .filter((k) => data[k] !== "" && data[k] !== undefined && data[k] !== null)
      .sort()
      .map((k) => `${k}=${encodeURIComponent(data[k]).replace(/%20/g, "+")}`)
      .join("&");

    const toHash = passphrase
      ? `${pfParamString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`
      : pfParamString;

    return crypto.createHash("md5").update(toHash).digest("hex");
  }

  verifySignature(data: Record<string, string>, signature: string) {
    const incoming = { ...data };
    delete incoming.signature;
    return this.generateSignature(incoming, this.passphrase) === signature;
  }

  createPaymentData(params: {
    orderId: string;
    amountCents: number;
    customerFirstName: string;
    customerLastName: string;
    customerEmail: string;
    customerPhone?: string;
    itemName: string;
    itemDescription?: string;
  }) {
    const data: Record<string, string> = {
      merchant_id: this.merchantId,
      merchant_key: this.merchantKey,
      return_url: `${this.siteUrl}/success?orderId=${params.orderId}`,
      cancel_url: `${this.siteUrl}/cancelled?orderId=${params.orderId}`,
      notify_url: `${this.siteUrl}/api/payfast/notify`,
      name_first: params.customerFirstName,
      name_last: params.customerLastName || "-",
      email_address: params.customerEmail,
      m_payment_id: params.orderId,
      amount: (params.amountCents / 100).toFixed(2),
      item_name: params.itemName,
    };
    if (params.customerPhone) data.cell_number = params.customerPhone;
    if (params.itemDescription) data.item_description = params.itemDescription;

    const signature = this.generateSignature(data, this.passphrase);
    return { ...data, signature };
  }

  isValidPayFastIP(ip: string) {
    if (this.mode === "sandbox") return true;
    const validIPs = [
      "197.97.145.144",
      "197.97.145.145",
      "197.97.145.146",
      "197.97.145.147",
      "197.97.145.148",
    ];
    return validIPs.includes(ip);
  }
}

export const payfast = new PayFastService();
