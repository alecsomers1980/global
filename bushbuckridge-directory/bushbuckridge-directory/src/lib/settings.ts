import PocketBase from 'pocketbase'

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || ''

export interface PayFastConfig {
    merchantId: string
    merchantKey: string
    passphrase: string
    testMode: boolean
}

function pbValue(records: any[], key: string): string {
    const r = records.find((s: any) => s.key === key)
    return r?.value || ''
}

export async function getPayFastConfig(): Promise<PayFastConfig> {
    const merchantId = process.env.PAYFAST_MERCHANT_ID || ''
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY || ''
    const passphrase = process.env.PAYFAST_PASSPHRASE || ''
    const testMode = process.env.PAYFAST_TEST_MODE || 'true'

    if (merchantId && merchantKey) {
        return { merchantId, merchantKey, passphrase, testMode: testMode === 'true' }
    }

    // Fallback to PocketBase settings
    if (!pbUrl) {
        return { merchantId: '', merchantKey: '', passphrase: '', testMode: true }
    }

    const pb = new PocketBase(pbUrl)
    try {
        const records = await pb.collection('settings').getList(1, 100)
        return {
            merchantId: merchantId || pbValue(records.items, 'payfast_merchant_id'),
            merchantKey: merchantKey || pbValue(records.items, 'payfast_merchant_key'),
            passphrase: passphrase || pbValue(records.items, 'payfast_passphrase'),
            testMode: testMode !== 'false' && pbValue(records.items, 'payfast_test_mode') !== 'false',
        }
    } catch {
        return { merchantId: '', merchantKey: '', passphrase: '', testMode: true }
    }
}
