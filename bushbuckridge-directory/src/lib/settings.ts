import PocketBase from 'pocketbase'
const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || ''
export interface YocoConfig { secretKey: string; publicKey: string; webhookSecret: string; testMode: boolean }
function pbValue(records: any[], key: string): string { const r = records.find((s: any) => s.key === key); return r?.value || '' }
export async function getYocoConfig(): Promise<YocoConfig> {
    const secretKey = process.env.YOCO_SECRET_KEY || ''
    const publicKey = process.env.YOCO_PUBLIC_KEY || ''
    const webhookSecret = process.env.YOCO_WEBHOOK_SECRET || ''
    if (secretKey) { return { secretKey, publicKey, webhookSecret, testMode: secretKey.startsWith('sk_test_') } }
    if (!pbUrl) { return { secretKey: '', publicKey: '', webhookSecret: '', testMode: true } }
    const pb = new PocketBase(pbUrl)
    try {
        const records = await pb.collection('settings').getList(1, 100)
        const sk = secretKey || pbValue(records.items, 'yoco_secret_key')
        return { secretKey: sk, publicKey: publicKey || pbValue(records.items, 'yoco_public_key'), webhookSecret: webhookSecret || pbValue(records.items, 'yoco_webhook_secret'), testMode: sk.startsWith('sk_test_') }
    } catch { return { secretKey: '', publicKey: '', webhookSecret: '', testMode: true } }
}

export const PRICE_KEYS: Record<string, string> = {
    basic: 'price_basic',
    'pro-lead': 'price_pro_lead',
    'pro-business': 'price_pro_business',
}

export async function getPricing(): Promise<Record<string, number>> {
    const defaults: Record<string, number> = {
        basic: 19900,
        'pro-lead': 79900,
        'pro-business': 1050000,
    }
    if (!pbUrl) return defaults
    const pb = new PocketBase(pbUrl)
    try {
        const records = await pb.collection('settings').getList(1, 100)
        const result: Record<string, number> = {}
        for (const tier of Object.keys(PRICE_KEYS)) {
            const key = PRICE_KEYS[tier]
            const record = records.items.find((s: any) => s.key === key)
            const valueStr = record?.value
            const valueInt = parseInt(valueStr, 10)
            if (isNaN(valueInt) || valueInt < 0) {
                result[tier] = defaults[tier]
            } else {
                result[tier] = valueInt * 100
            }
        }
        return result
    } catch {
        return defaults
    }
}