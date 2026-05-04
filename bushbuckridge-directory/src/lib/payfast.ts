import crypto from 'crypto'

const SANDBOX_BASE = 'https://sandbox.payfast.co.za'
const LIVE_BASE = 'https://www.payfast.co.za'

function baseUrl(): string {
  return process.env.PAYFAST_TEST_MODE === 'true' ? SANDBOX_BASE : LIVE_BASE
}

export function getPayFastProcessUrl(): string {
  return `${baseUrl()}/eng/process`
}

export function getPayFastValidationUrl(): string {
  return `${baseUrl()}/eng/query/validate`
}

/**
 * Generate PayFast signature per their spec:
 * 1. Sort all param keys alphabetically (exclude 'signature')
 * 2. Concatenate as key=value pairs with & separator, URL-encoded
 * 3. Append &passphrase=... if passphrase is set
 * 4. MD5 hash the result
 */
export function generateSignature(data: Record<string, string>, passphrase?: string): string {
  const sorted = Object.keys(data)
    .filter((k) => k !== 'signature')
    .sort()

  const paramString = sorted
    .map((k) => `${k}=${encodeURIComponent(data[k].replace(/&/g, '%26'))}`)
    .join('&')

  const withPassphrase = passphrase ? `${paramString}&passphrase=${encodeURIComponent(passphrase)}` : paramString

  return crypto.createHash('md5').update(withPassphrase).digest('hex')
}

export interface PayFastFields {
  merchant_id: string
  merchant_key: string
  return_url: string
  cancel_url: string
  notify_url: string
  name_first: string
  name_last: string
  email_address: string
  m_payment_id: string
  amount: string
  item_name: string
  item_description: string
  custom_str1: string
  custom_str2: string
  custom_str3: string
  signature: string
}

/**
 * Build the full set of form fields to POST to PayFast, including the signature.
 * amount is in ZAR (e.g. "199.00"), not cents.
 */
export function buildPayFastForm(params: {
  merchantId: string
  merchantKey: string
  returnUrl: string
  cancelUrl: string
  notifyUrl: string
  firstName: string
  lastName: string
  email: string
  paymentId: string
  amount: string
  itemName: string
  itemDescription?: string
  customStr1?: string
  customStr2?: string
  customStr3?: string
  passphrase?: string
}): PayFastFields {
  const fields: Record<string, string> = {
    merchant_id: params.merchantId,
    merchant_key: params.merchantKey,
    return_url: params.returnUrl,
    cancel_url: params.cancelUrl,
    notify_url: params.notifyUrl,
    name_first: params.firstName,
    name_last: params.lastName,
    email_address: params.email,
    m_payment_id: params.paymentId,
    amount: params.amount,
    item_name: params.itemName,
  }

  if (params.itemDescription) fields.item_description = params.itemDescription
  if (params.customStr1) fields.custom_str1 = params.customStr1
  if (params.customStr2) fields.custom_str2 = params.customStr2
  if (params.customStr3) fields.custom_str3 = params.customStr3

  const signature = generateSignature(fields, params.passphrase)

  return { ...fields, signature } as unknown as PayFastFields
}

/**
 * Verify the signature on an ITN callback from PayFast.
 */
export function verifyPayFastSignature(
  receivedData: Record<string, string>,
  passphrase?: string
): boolean {
  const computed = generateSignature(receivedData, passphrase)
  return computed === receivedData.signature
}

/**
 * Validate ITN by posting back to PayFast's validation endpoint.
 * Returns true if PayFast confirms the transaction is VALID.
 */
export async function validatePayFastItn(
  receivedData: Record<string, string>
): Promise<boolean> {
  const url = getPayFastValidationUrl()

  const body = new URLSearchParams(receivedData).toString()

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  const text = await res.text()
  return text === 'VALID'
}
