/**
 * While the catalogue is still being built, the public site is gated: every public route serves
 * the coming-soon page (see middleware.ts) and the sitemap advertises only the homepage, so
 * crawlers don't index a dozen URLs that all currently render the same holding page.
 *
 * Flipping this to false is the launch switch — it ungates the site and restores the full sitemap.
 */
export const SITE_GATED = true
