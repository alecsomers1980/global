/**
 * Wendy Lane — business facts.
 * Verified from wozawendylane.co.za (2026-07-16). Single source of truth for NAP data,
 * which must stay consistent across the site and the LocalBusiness schema for local SEO.
 */

export const BUSINESS = {
  name: "Wendy Lane",
  legalName: "Wendy Lane cc",
  established: 1993,
  owner: "Roy Wakefield",
  tagline: "Where there is a need for extra space, our products are of service",

  address: {
    street: "Plot 52, Cairn Road",
    city: "Nelspruit",
    region: "Mpumalanga",
    postalCode: "1200",
    country: "ZA",
  },

  geo: { lat: -25.449798, lng: 30.896869 },

  phone: { display: "013 755 2408", href: "tel:+27137552408" },
  sales: { name: "Linda Wagner", display: "083 647 0473", href: "tel:+27836470473" },
  whatsapp: { display: "071 469 6131", number: "27714696131", href: "https://wa.me/27714696131" },
  email: "sales@wozawendylane.co.za",

  hours: [
    { days: "Monday – Thursday", time: "07:30 – 17:00" },
    { days: "Friday", time: "07:30 – 16:30" },
    { days: "Saturday", time: "Closed" },
    { days: "Sunday", time: "Closed" },
  ],

  social: {
    facebook: "https://www.facebook.com/WozaWendyLane/",
    instagram: "https://www.instagram.com/wendylane_nelspruit/",
  },

  serviceAreas: [
    "Nelspruit / Mbombela",
    "White River",
    "Hazyview",
    "Sabie",
    "Barberton",
    "Malelane",
    "Komatipoort",
    "Lydenburg",
    "Graskop",
  ],
} as const;

export const SITE_URL = "https://wozawendylane.co.za";
