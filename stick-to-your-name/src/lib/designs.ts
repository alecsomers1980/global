export type Design = {
  id: string;
  name: string;
  popular?: boolean;
};

export const DESIGNS: Design[] = [
  { id: "at-the-zoo", name: "@ the Zoo" },
  { id: "african-animals", name: "African Animals" },
  { id: "alien-invasion", name: "Alien Invasion", popular: true },
  { id: "astronaut", name: "Astronaut", popular: true },
  { id: "beautiful", name: "Beautiful" },
  { id: "bicycle", name: "Bicycle" },
  { id: "bokke", name: "Bokke" },
  { id: "botanical", name: "Botanical", popular: true },
  { id: "boy-ish", name: "BOY-ISH", popular: true },
  { id: "butterfly", name: "Butterfly", popular: true },
  { id: "camo", name: "CAMO" },
  { id: "cute-cactus", name: "Cute Cactus" },
  { id: "cute-cats", name: "Cute Cats" },
  { id: "dino", name: "DINO" },
  { id: "doggie", name: "DOGGIE" },
  { id: "fishing", name: "Fishing", popular: true },
  { id: "flamingo", name: "Flamingo" },
  { id: "fro-jo", name: "Fro-Jo" },
  { id: "gamer", name: "GAMER" },
  { id: "girl-ish", name: "GIRL-ISH", popular: true },
  { id: "hunting", name: "HUNTING", popular: true },
  { id: "monster-truck", name: "MONSTER TRUCK" },
  { id: "panda-vibes", name: "Panda Vibes", popular: true },
  { id: "pattern", name: "Pattern" },
  { id: "penguin", name: "Penguin" },
  { id: "pink-pigs", name: "Pink Pigs", popular: true },
  { id: "plain", name: "PLAIN (Black & White)" },
  { id: "polka-dot", name: "Polka Dot" },
  { id: "princess", name: "Princess" },
  { id: "rainbows", name: "Rainbows" },
  { id: "rugby-cricket", name: "Rugby & Cricket", popular: true },
  { id: "shark", name: "Shark" },
  { id: "sheep", name: "SHEEP" },
  { id: "skateboarding", name: "Skateboarding", popular: true },
  { id: "super-hero", name: "Super Hero" },
  { id: "the-hound", name: "The Hound" },
  { id: "tractor", name: "Tractor" },
  { id: "train", name: "Train" },
  { id: "unicorn-dream", name: "Unicorn Dream" },
  { id: "watermelon", name: "Watermelon" },
];

export const DESIGN_IDS = new Set(DESIGNS.map((d) => d.id));

export const PRICE_SET_CENTS = 15000; // R150.00
export const PRICE_BAGTAG_CENTS = 1500; // R15.00

export type DeliveryOption = "collect" | "pudo" | "courierguy";

export const DELIVERY: Record<DeliveryOption, { label: string; priceCents: number; description: string }> = {
  collect: {
    label: "Collection",
    priceCents: 0,
    description: "Aloe Signs — 42 Homestead Avenue, Randfontein (Mon–Thu 7:30–17:00, Fri 7:30–16:00)",
  },
  pudo: {
    label: "Pudo locker",
    priceCents: 7000,
    description: "Pick up from a Pudo locker near you",
  },
  courierguy: {
    label: "The Courier Guy",
    priceCents: 10000,
    description: "Door-to-door courier service",
  },
};

export function rand(n: number) {
  return `R${(n / 100).toFixed(2)}`;
}
