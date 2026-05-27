import crypto from 'crypto'

function getSecret(): string {
  const secret = process.env.RENEWAL_TOKEN_SECRET
  if (!secret) {
    throw new Error('RENEWAL_TOKEN_SECRET is not set')
  }
  return secret
}

function base64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export interface RenewalToken {
  s: string  // subscription id
  e: number  // expiry unix seconds
  t: string  // signature
}

export function signRenewalToken(subscriptionId: string, ttlSeconds = 60 * 60 * 24 * 60): RenewalToken {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds
  const payload = `${subscriptionId}.${exp}`
  const sig = crypto.createHmac('sha256', getSecret()).update(payload).digest()
  return { s: subscriptionId, e: exp, t: base64url(sig) }
}

export function verifyRenewalToken(s: string, e: string, t: string): boolean {
  if (!s || !e || !t) return false
  const exp = parseInt(e, 10)
  if (!Number.isFinite(exp)) return false
  if (Math.floor(Date.now() / 1000) > exp) return false

  const payload = `${s}.${exp}`
  const expected = base64url(
    crypto.createHmac('sha256', getSecret()).update(payload).digest()
  )

  const expectedBuf = Buffer.from(expected)
  const tBuf = Buffer.from(t)
  if (expectedBuf.length !== tBuf.length) return false
  try {
    return crypto.timingSafeEqual(expectedBuf, tBuf)
  } catch {
    return false
  }
}
