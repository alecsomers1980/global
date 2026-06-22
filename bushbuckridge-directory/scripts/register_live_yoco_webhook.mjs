// One-off helper: registers a Yoco webhook against the LIVE API and prints
// the resulting webhook secret to paste into Vercel as YOCO_WEBHOOK_SECRET.
// Run locally with your own live secret key — it is never sent anywhere
// except Yoco's API, and is not read from any committed file.

const secretKey = process.argv[2]
if (!secretKey) {
    console.error('Usage: node scripts/register_live_yoco_webhook.mjs <YOUR_LIVE_SECRET_KEY>')
    console.error('Get the live secret key from your Yoco dashboard (starts with sk_live_).')
    process.exit(1)
}
if (!secretKey.startsWith('sk_live_')) {
    console.error(`This key starts with "${secretKey.slice(0, 8)}..." — expected a LIVE key (sk_live_...). Refusing to continue.`)
    process.exit(1)
}

const res = await fetch('https://payments.yoco.com/api/webhooks', {
    method: 'POST',
    headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        name: 'Bushbuckridge Directory - Production',
        url: 'https://www.dbib.co.za/api/payments/yoco-webhook',
    }),
})

const text = await res.text()
if (!res.ok) {
    console.error(`Webhook registration failed (${res.status}):`, text)
    process.exit(1)
}

const webhook = JSON.parse(text)
console.log('\nWebhook registered successfully!')
console.log('Webhook ID:', webhook.id)
console.log('\nCopy this value into Vercel as YOCO_WEBHOOK_SECRET (Production):')
console.log(webhook.secret)
console.log('\nTo set it via CLI:')
console.log('  npx vercel env rm YOCO_WEBHOOK_SECRET production --yes')
console.log(`  printf '%s\\n' "${webhook.secret}" | npx vercel env add YOCO_WEBHOOK_SECRET production`)
