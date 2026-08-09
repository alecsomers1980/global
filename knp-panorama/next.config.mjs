/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { formats: ['image/webp'] },
  // This project sits inside a larger workspace that has its own lockfile, so
  // pin the root explicitly rather than let Next infer the parent directory.
  turbopack: { root: import.meta.dirname },

  async redirects() {
    return [
      // The old WordPress pages carried their post IDs in the slug.
      { source: '/safari-2367', destination: '/safari', permanent: true },
      { source: '/tours-2370', destination: '/tours', permanent: true },
      { source: '/transfers-2372', destination: '/transfers', permanent: true },
      { source: '/accommodation-2386', destination: '/accommodation', permanent: true },
      { source: '/about-us-2383', destination: '/#our-story', permanent: true },
      { source: '/contact-us-2394', destination: '/contact', permanent: true },
      { source: '/home', destination: '/', permanent: true },

      // Tour detail pages moved from /travel/:slug to /experiences/:slug.
      {
        source: '/travel/full-day-safari-kruger-national-park',
        destination: '/experiences/full-day-safari-kruger-national-park',
        permanent: true,
      },
      {
        source: '/travel/half-day-safari-kruger-national-park',
        destination: '/experiences/half-day-safari-kruger-national-park',
        permanent: true,
      },
      { source: '/travel/full-day-panorama', destination: '/experiences/full-day-panorama', permanent: true },
      { source: '/travel/half-day-panorama', destination: '/experiences/half-day-panorama', permanent: true },
      { source: '/travel/or-tambo', destination: '/experiences/or-tambo-transfer', permanent: true },

      // Retired commerce. The old site ran WooCommerce and a WP-Travel checkout;
      // none of it has an equivalent here, so these land on the quote flow or home.
      { source: '/shop', destination: '/', permanent: true },
      { source: '/cart', destination: '/', permanent: true },
      { source: '/checkout', destination: '/', permanent: true },
      { source: '/my-account', destination: '/', permanent: true },
      { source: '/wp-travel-checkout', destination: '/request-a-quote', permanent: true },
      { source: '/wp-travel-dashboard', destination: '/', permanent: true },
      { source: '/find', destination: '/request-a-quote', permanent: true },
      { source: '/hotel-search', destination: '/accommodation', permanent: true },
      { source: '/hotel-search-result', destination: '/accommodation', permanent: true },

      // Leftover theme demo content that is still live on the old site.
      { source: '/product/:slug', destination: '/', permanent: true },
      { source: '/ttbm_places/:slug', destination: '/', permanent: true },
      { source: '/ttbm_guide/:slug', destination: '/', permanent: true },
      { source: '/ttbm-tour-list', destination: '/safari', permanent: true },
      { source: '/travel-category/safari', destination: '/safari', permanent: true },
      { source: '/travel-category/tours', destination: '/tours', permanent: true },
      { source: '/travel-category/transfers', destination: '/transfers', permanent: true },
      { source: '/lotus-grid', destination: '/', permanent: true },
      { source: '/orchid-grid', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
