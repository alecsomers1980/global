// Centralised package data helper
// Used by home page, packages page, detail page, and admin portal

const DEFAULT_PACKAGES = [
  {
    id: "1",
    slug: "sunrise-safari-escape",
    title: "Sunrise Safari Escape",
    shortDescription: "Start your day with adventure and end it with comfort.",
    fullDescription:
      "Wake before dawn to the sounds of the bush and set out on an unforgettable Kruger Park safari. Return to the lodge for a hearty farm-style breakfast at Red Litchi Farm Café, then spend the afternoon relaxing by the pool or exploring the Sabie River Valley at your own pace. This package is ideal for couples or small groups who want the perfect blend of wildlife adventure and lodge comfort.",
    category: "Safari",
    price: 2500,
    duration: "2 Nights / 3 Days",
    maxGuests: 4,
    includes: [
      "2-Night accommodation",
      "Takeaway breakfast pack for safari morning",
      "Safari pickup coordination",
      "Optional guided Kruger safari (additional cost)",
      "Swimming pool & garden access",
    ],
    image: "/images/packages/sunrise.png",
    tag: "MOST POPULAR",
    active: true,
  },
  {
    id: "2",
    slug: "adventure-weekend",
    title: "The Adventure Weekend",
    shortDescription: "For thrill seekers and outdoor lovers.",
    fullDescription:
      "Get your adrenaline pumping with a weekend packed full of outdoor activities. From zip-lining through the treetops to quad biking along forest trails, the Lowveld offers some of South Africa's most exciting adventure experiences. Return each evening to the tranquillity of Mountain Creek Lodge, where a warm fire and starlit skies await.",
    category: "Adventure",
    price: 3200,
    duration: "2 Nights / 3 Days",
    maxGuests: 6,
    includes: [
      "2-Night accommodation",
      "Daily breakfast at Red Litchi Café",
      "Choice of 1 adventure activity",
      "Local recommendations & maps",
      "Secure parking",
    ],
    image: "/images/packages/adventure.png",
    tag: null,
    active: true,
  },
  {
    id: "3",
    slug: "romantic-creekside-retreat",
    title: "Romantic Creekside Retreat",
    shortDescription: "A romantic escape to relax and reconnect.",
    fullDescription:
      "Escape the everyday and reconnect with the one you love. This intimate retreat includes a beautifully prepared room with romantic touches, daily breakfast for two at the café, and a curated picnic basket to enjoy beside the river or in the lush gardens. Perfect for anniversaries, honeymoons, or simply a weekend away together.",
    category: "Romantic",
    price: 3800,
    duration: "2 Nights / 3 Days",
    maxGuests: 2,
    includes: [
      "2-Night accommodation for two",
      "Breakfast for two daily",
      "Romantic room setup",
      "Picnic basket experience",
      "Late checkout (subject to availability)",
    ],
    image: "/images/packages/romantic.png",
    tag: null,
    active: true,
  },
  {
    id: "4",
    slug: "full-lowveld-experience",
    title: "Full Lowveld Experience",
    shortDescription: "The ultimate all-inclusive escape.",
    fullDescription:
      "This is the complete Mountain Creek Lodge experience. Enjoy premium accommodation, three meals a day, and our concierge service to help you plan every moment of your stay. Whether it's a Kruger safari, a drive along the Panorama Route, or a lazy afternoon by the pool — we'll take care of everything so you can simply enjoy.",
    category: "Family",
    price: 4500,
    duration: "3 Nights / 4 Days",
    maxGuests: 8,
    includes: [
      "3-Night accommodation",
      "Breakfast, Lunch & Dinner daily",
      "Activity booking assistance",
      "Restaurant partnership discounts",
      "Welcome drinks on arrival",
      "Secure parking & Wi-Fi at café",
    ],
    image: "/images/packages/lowveld.png",
    tag: null,
    active: true,
  },
];

const STORAGE_KEY = "mcl_packages_v2";

export function getPackages() {
  if (typeof window === "undefined") return DEFAULT_PACKAGES;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PACKAGES));
    return DEFAULT_PACKAGES;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_PACKAGES;
  }
}

export function getActivePackages() {
  return getPackages().filter((p) => p.active);
}

export function getPackageBySlug(slug) {
  return getPackages().find((p) => p.slug === slug) || null;
}

export function savePackages(packages) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(packages));
}

export function addPackage(pkg) {
  const packages = getPackages();
  const newPkg = {
    ...pkg,
    id: String(Date.now()),
  };
  packages.push(newPkg);
  savePackages(packages);
  return newPkg;
}

export function updatePackage(id, updates) {
  const packages = getPackages();
  const index = packages.findIndex((p) => p.id === id);
  if (index === -1) return null;
  packages[index] = { ...packages[index], ...updates };
  savePackages(packages);
  return packages[index];
}

export function deletePackage(id) {
  const packages = getPackages().filter((p) => p.id !== id);
  savePackages(packages);
  return packages;
}

export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export { DEFAULT_PACKAGES };
