import PocketBase from 'pocketbase'

/**
 * Server-only PocketBase client authenticated as the `is_admin` service account
 * (POCKETBASE_SERVICE_EMAIL / POCKETBASE_SERVICE_PASSWORD).
 *
 * Used by the payment/webhook server routes to write payments, subscriptions and
 * businesses now that those collections' write rules are locked to admins.
 * Never expose this client to the browser.
 */
export async function createServiceClient() {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
  pb.autoCancellation(false)
  await pb.collection('users').authWithPassword(
    process.env.POCKETBASE_SERVICE_EMAIL as string,
    process.env.POCKETBASE_SERVICE_PASSWORD as string
  )
  return pb
}
