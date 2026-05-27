import crypto from 'crypto'

const YOCO_API_BASE = 'https://payments.yoco.com'

export interface YocoCheckoutParams {
  amountCents: number
  currency?: string
  successUrl: string
  cancelUrl: string
  failureUrl?: string
  externalId?: string
  metadata?: Record<string, string>
  lineItems?: Array<{
    description?: string
    quantity?: number
    pricingDetails?: { price: number }
  }>
}

export interface YocoCheckoutResponse {
  id: string
  redirectUrl: string
  status?: string
  amount?: number
  currency?: string
  externalId?: string
  metadata?: Record<string, string>
  [key: string]: unknown
}

export async function createYocoCheckout(
  secretKey: string,
  params: YocoCheckoutParams
): Promise<YocoCheckoutResponse> {
  const body: Record<string, unknown> = {
    amount: params.amountCents,
    currency: params.currency || 'ZAR',
  }
  if (params.successUrl) body.successUrl = params.successUrl
  if (params.cancelUrl) body.cancelUrl = params.cancelUrl
  if (params.failureUrl) body.failureUrl = params.failureUrl
  if (params.externalId) body.externalId = params.externalId
  if (params.metadata) body.metadata = params.metadata
  if (params.lineItems) body.lineItems = params.lineItems

  const res = await fetch(`${YOCO_API_BASE}/api/checkouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Yoco checkout failed (${res.status}): ${text}`)
  }
  return JSON.parse(text) as YocoCheckoutResponse
}

export interface YocoWebhookRegistration {
  id: string
  name: string
  url: string
  secret: string
  [key: string]: unknown
}

export async function registerYocoWebhook(
  secretKey: string,
  name: string,
  url: string
): Promise<YocoWebhookRegistration> {
  const res = await fetch(`${YOCO_API_BASE}/api/webhooks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, url }),
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Yoco webhook registration failed (${res.status}): ${text}`)
  }
  return JSON.parse(text) as YocoWebhookRegistration
}

// Standard Webhooks signature verification (svix-compatible).
// Why: Yoco signs webhooks per the open Standard Webhooks spec — the secret
// is `whsec_<base64>`, and the signed string is `{id}.{timestamp}.{rawBody}`.
// Skipping any step (e.g. timestamp tolerance) makes replay attacks possible.
export function verifyYocoWebhook(params: {
  secret: string
  webhookId: string
  webhookTimestamp: string
  webhookSignature: string
  rawBody: string
  toleranceSeconds?: number
}): boolean {
  const {
    secret,
    webhookId,
    webhookTimestamp,
    webhookSignature,
    rawBody,
    toleranceSeconds = 300,
  } = params

  if (!secret || !webhookId || !webhookTimestamp || !webhookSignature) {
    return false
  }

  const ts = parseInt(webhookTimestamp, 10)
  if (!Number.isFinite(ts)) return false
  const nowSec = Math.floor(Date.now() / 1000)
  if (Math.abs(nowSec - ts) > toleranceSeconds) return false

  const rawSecret = secret.startsWith('whsec_') ? secret.slice(6) : secret
  let secretBytes: Buffer
  try {
    secretBytes = Buffer.from(rawSecret, 'base64')
  } catch {
    return false
  }

  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`
  const expected = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64')

  // Header may carry multiple space-separated "v1,<sig>" pairs; any match wins.
  const candidates = webhookSignature
    .split(' ')
    .map((part) => {
      const idx = part.indexOf(',')
      return idx >= 0 ? part.slice(idx + 1) : part
    })
    .filter(Boolean)

  const expectedBuf = Buffer.from(expected)
  return candidates.some((sig) => {
    const sigBuf = Buffer.from(sig)
    if (sigBuf.length !== expectedBuf.length) return false
    try {
      return crypto.timingSafeEqual(sigBuf, expectedBuf)
    } catch {
      return false
    }
  })
}
