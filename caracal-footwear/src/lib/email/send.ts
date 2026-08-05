/** Stub -- replaced in Task 8 with real Resend sends. Keeping the signature
 *  identical means Task 7 doesn't change when Task 8 lands. */
export async function sendPaidOrderEmails(orderId: string): Promise<void> {
  console.log('[email stub] would send paid-order emails for', orderId);
}

export async function sendStockConflictEmails(orderId: string): Promise<void> {
  console.log('[email stub] would send stock-conflict emails for', orderId);
}
