"use server";

import { getSocialLinks } from "@/lib/social";
import type { SocialLinks } from "@/lib/social";

/**
 * Social links for the footer.
 *
 * Fetched from the client on mount rather than in the root layout. A database
 * read in the layout would opt every page — including the product pages — out
 * of being built ahead of time, which is most of why this site is fast. The
 * icons sit below the fold, so arriving a moment after hydration costs nothing
 * and keeps them editable from the admin without a deploy.
 */
export async function fetchSocialLinks(): Promise<SocialLinks> {
  return getSocialLinks();
}
