'use server'

import { createClient } from '@/utils/pocketbase/server'
import { requireAdmin } from '@/utils/pocketbase/admin'
import { revalidatePath } from 'next/cache'

export async function setReviewStatus(reviewId: string, status: 'approved' | 'rejected' | 'pending') {
  await requireAdmin()
  const pb = await createClient()
  await pb.collection('reviews').update(reviewId, { status })
  revalidatePath('/admin/reviews')
}

export async function deleteReview(reviewId: string) {
  await requireAdmin()
  const pb = await createClient()
  await pb.collection('reviews').delete(reviewId)
  revalidatePath('/admin/reviews')
}
