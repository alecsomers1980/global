import crypto from 'crypto';

export interface PayFastData {
    merchant_id: string;
    merchant_key: string;
    return_url: string;
    cancel_url: string;
    notify_url: string;
    name_first: string;
    name_last: string;
    email_address: string;
    cell_number?: string;
    m_payment_id: string;
    amount: string;
    item_name: string;
    item_description?: string;
    custom_str1?: string;
    custom_str2?: string;
    custom_str3?: string;
    custom_int1?: string;
    email_confirmation?: string;
    confirmation_address?: string;
}

export interface PayFastConfig {
    merchantId: string;
    merchantKey: string;
    passphrase: string;
    mode: 'sandbox' | 'production';
    siteUrl: string;
}

export class PayFastService {
    private config: PayFastConfig;

    constructor() {
        this.config = {
            merchantId: process.env.PAYFAST_MERCHANT_ID || '10000100',
            merchantKey: process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a',
            passphrase: process.env.PAYFAST_PASSPHRASE || '',
            mode: (process.env.PAYFAST_MODE as 'sandbox' | 'production') || 'sandbox',
            siteUrl: process.env.NEXT_PUBLIC_SITE_URL ||
                (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
        };
    }

    /**
     * Get PayFast payment URL (sandbox or production)
     */
    getPaymentUrl(): string {
        return this.config.mode === 'sandbox'
            ? 'https://sandbox.payfast.co.za/eng/process'
            : 'https://www.payfast.co.za/eng/process';
    }

    /**
     * Generate MD5 signature for PayFast
     */
    generateSignature(data: Record<string, string>, passphrase?: string): string {
        // Create parameter string — PayFast requires the field order as documented
        // (insertion order here), NOT alphabetical. Alphabetical ordering is only
        // for the separate API signature format (e.g. subscriptions API).
        // Blank values are excluded, matching PayFast's own reference implementation.
        const pfParamString = Object.keys(data)
            .filter(key => data[key] !== '' && data[key] !== undefined && data[key] !== null)
            .map(key => `${key}=${this.pfUrlEncode(String(data[key]).trim())}`)
            .join('&');

        // Append passphrase if provided
        const stringToHash = passphrase
            ? `${pfParamString}&passphrase=${this.pfUrlEncode(passphrase.trim())}`
            : pfParamString;

        // Generate MD5 hash
        return crypto.createHash('md5').update(stringToHash).digest('hex');
    }

    /**
     * URL-encode a value to match PHP's urlencode() exactly, since PayFast's
     * reference signature implementation is PHP-based. encodeURIComponent leaves
     * ! ~ * ' ( ) unescaped, which PHP's urlencode does not.
     */
    private pfUrlEncode(value: string): string {
        return encodeURIComponent(value)
            .replace(/[!'()*~]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
            .replace(/%20/g, '+');
    }

    /**
     * Verify PayFast signature from IPN
     */
    verifySignature(data: Record<string, string>, signature: string): boolean {
        const calculatedSignature = this.generateSignature(data, this.config.passphrase);
        return calculatedSignature === signature;
    }

    /**
     * Create PayFast payment data
     */
    createPaymentData(params: {
        orderId: string;
        amount: number;
        customerFirstName: string;
        customerLastName: string;
        customerEmail: string;
        customerPhone?: string;
        itemName: string;
        itemDescription?: string;
    }): PayFastData & { signature: string } {
        const data: Record<string, string> = {
            merchant_id: this.config.merchantId,
            merchant_key: this.config.merchantKey,
            return_url: `${this.config.siteUrl}/api/payfast/return?orderId=${params.orderId}`,
            cancel_url: `${this.config.siteUrl}/shop/checkout?cancelled=true&orderId=${params.orderId}`,
            notify_url: `${this.config.siteUrl}/api/payfast/notify`,
            name_first: params.customerFirstName,
            name_last: params.customerLastName,
            email_address: params.customerEmail,
        };

        // cell_number must appear here (buyer details) per PayFast's documented field order
        if (params.customerPhone) {
            data.cell_number = params.customerPhone;
        }

        data.m_payment_id = params.orderId;
        data.amount = params.amount.toFixed(2);
        data.item_name = params.itemName;

        if (params.itemDescription) {
            data.item_description = params.itemDescription;
        }

        // Generate signature
        const signature = this.generateSignature(data, this.config.passphrase);

        return {
            ...data,
            signature
        } as PayFastData & { signature: string };
    }

    /**
     * Validate PayFast server IPs (for production)
     */
    isValidPayFastIP(ip: string): boolean {
        const validIPs = [
            '197.97.145.144',
            '197.97.145.145',
            '197.97.145.146',
            '197.97.145.147',
            '197.97.145.148'
        ];

        // In sandbox mode, allow localhost
        if (this.config.mode === 'sandbox') {
            return true;
        }

        return validIPs.includes(ip);
    }

    /**
     * Verify payment status with PayFast (optional server-to-server check)
     */
    async verifyPayment(paymentId: string): Promise<boolean> {
        // This would make a server-to-server call to PayFast to verify payment
        // For now, we'll rely on IPN verification
        return true;
    }
}

// Export singleton instance
export const payfast = new PayFastService();
