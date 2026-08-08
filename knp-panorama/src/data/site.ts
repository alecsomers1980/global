export const SITE = {
  tradingName: 'Kruger Panorama Experience',
  shortName: 'KPE',
  legalName: 'Vonixiluva Hospitality (Pty) Ltd',
  phone: '+27 (0) 73 490 1886',
  phoneHref: 'tel:+27734901886',
  whatsappHref: 'https://wa.me/27734901886',
  email: 'info@knp-panorama.com',
  region: 'Mpumalanga Lowveld, South Africa',
  partner: {
    name: 'Grow Through Learning',
    blurb:
      'A nonprofit driving nature conservation, climate action and youth empowerment in Mpumalanga.',
    funds: [
      {
        title: 'Environmental Education',
        body: 'Teaching communities to protect South Africa’s biodiversity.',
      },
      {
        title: 'Youth Programmes',
        body: 'Keeping children engaged, educated and off the streets.',
      },
      {
        title: 'Community Upliftment',
        body: 'Creating jobs and fostering pride in local heritage.',
      },
    ],
  },
  guesthouses: [
    {
      name: 'Woodpecker Guesthouse',
      location: 'Hazyview, Mpumalanga',
      website: 'https://woodpeckersguesthouse.co.za/',
      blurb:
        'On the outskirts of Nelspruit in the quiet town of Hazyview, Woodpecker Guesthouse has a homely feel away from home, with affordable accommodation, events and conferencing facilities, and outdoor activities.',
    },
    {
      name: 'Fourways Guest House',
      location: 'Hazyview, Mpumalanga',
      website: 'https://fourwayshazyview.co.za/',
      blurb:
        'A serene sanctuary in the lush heart of Hazyview, positioned as a gateway to the Kruger National Park, the Panorama Route and local activities like zip-lining and cultural tours.',
    },
  ],
} as const;
