'use server';

import { getLatestPosts } from '@/lib/queries';

export async function loadMorePosts(siteId: string, offset: number, excludeIds: string[]) {
  return getLatestPosts(siteId, { limit: 6, offset, excludeIds });
}