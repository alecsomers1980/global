// Single source of truth for real contact details and social links —
// recovered from the live site (woodpeckersguesthouse.co.za footer/contact
// page + embedded Facebook/Instagram widgets), not fabricated. Reused by
// Header, Footer, the Contact page, and LocalBusinessSchema so there's one
// place to correct if the client ever changes a number or handle.
//
// Two Facebook pages and two Instagram accounts are genuinely live on the
// old site (never consolidated) — the ones below are the primary/most-active
// pair (most-referenced in the live site's embedded content); the secondary
// accounts are noted here in case the client wants them added back.
//   Secondary Facebook: https://web.facebook.com/profile.php?id=100090071862895
//   Secondary Instagram: https://www.instagram.com/woodpeckersguesthouse1/

export const SITE = {
  name: "Woodpecker Guesthouse",
  phone: {
    display: "073 490 1886",
    href: "tel:+27734901886",
    whatsapp: "27734901886",
  },
  phoneSecondary: {
    display: "064 537 9906",
    href: "tel:+27645379906",
  },
  email: "vonixiluvahospitality@gmail.com",
  address: {
    line1: "174 Woodpeckers Limb St",
    line2: "Vakansiedrop, Hazyview, 1242",
    full: "174 Woodpeckers Limb St, Vakansiedrop, Hazyview, 1242",
    mapsHref:
      "https://maps.google.com/maps?q=174%20Woodpeckers%20Limb%20st%2C%20Vakansiedrop%2C%20Hazyview%2C%201242",
    mapsEmbedSrc:
      "https://maps.google.com/maps?q=174%20Woodpeckers%20Limb%20st%2C%20%20Vakansiedrop%2C%20Hazyview%2C%201242&t=m&z=13&output=embed&iwloc=near",
  },
  social: {
    facebook: "https://www.facebook.com/people/Woodpecker-Guesthouse-Hazyview/100084054978005/",
    instagram: "https://www.instagram.com/woodpeckers_hazyview/",
  },
  nightsbridge: {
    // Booking Business ID — recovered from the live site's own nb_DateWidget.js
    // (nb.config.nb_bbid), not the WP database export. This is the real ID.
    bbid: "37935",
  },
} as const;
