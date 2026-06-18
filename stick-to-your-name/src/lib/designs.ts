export type Design = {
  id: string;
  name: string;
  popular: boolean;
};

export const SEED_DESIGNS: Design[] = [
  { id: 'at-the-zoo', name: '@ the Zoo', popular: false },
  { id: 'african-animals', name: 'African Animals', popular: false },
  { id: 'alien-invasion', name: 'Alien Invasion', popular: true },
  { id: 'astronaut', name: 'Astronaut', popular: true },
  { id: 'beautiful', name: 'Beautiful', popular: false },
  { id: 'bicycle', name: 'Bicycle', popular: false },
  { id: 'bokke', name: 'Bokke', popular: false },
  { id: 'botanical', name: 'Botanical', popular: true },
  { id: 'boy-ish', name: 'BOY-ISH', popular: true },
  { id: 'butterfly', name: 'Butterfly', popular: true },
  { id: 'camo', name: 'CAMO', popular: false },
  { id: 'cute-cactus', name: 'Cute Cactus', popular: false },
  { id: 'cute-cats', name: 'Cute Cats', popular: false },
  { id: 'dino', name: 'DINO', popular: false },
  { id: 'doggie', name: 'DOGGIE', popular: false },
  { id: 'fishing', name: 'Fishing', popular: true },
  { id: 'flamingo', name: 'Flamingo', popular: false },
  { id: 'fro-jo', name: 'Fro-Jo', popular: false },
  { id: 'gamer', name: 'GAMER', popular: false },
  { id: 'girl-ish', name: 'GIRL-ISH', popular: true },
  { id: 'hunting', name: 'HUNTING', popular: true },
  { id: 'monster-truck', name: 'MONSTER TRUCK', popular: false },
  { id: 'panda-vibes', name: 'Panda Vibes', popular: true },
  { id: 'pattern', name: 'Pattern', popular: false },
  { id: 'penguin', name: 'Penguin', popular: false },
  { id: 'pink-pigs', name: 'Pink Pigs', popular: true },
  { id: 'plain', name: 'PLAIN (Black & White)', popular: false },
  { id: 'polka-dot', name: 'Polka Dot', popular: false },
  { id: 'princess', name: 'Princess', popular: false },
  { id: 'rainbows', name: 'Rainbows', popular: false },
  { id: 'rugby-cricket', name: 'Rugby & Cricket', popular: true },
  { id: 'shark', name: 'Shark', popular: false },
  { id: 'sheep', name: 'SHEEP', popular: false },
  { id: 'skateboarding', name: 'Skateboarding', popular: true },
  { id: 'super-hero', name: 'Super Hero', popular: false },
  { id: 'the-hound', name: 'The Hound', popular: false },
  { id: 'tractor', name: 'Tractor', popular: false },
  { id: 'train', name: 'Train', popular: false },
  { id: 'unicorn-dream', name: 'Unicorn Dream', popular: false },
  { id: 'watermelon', name: 'Watermelon', popular: false },
];

export type DeliveryOption = 'collect' | 'pudo' | 'courierguy';

export const DELIVERY_META: Record<DeliveryOption, { label: string; description: string }> = {
  collect: {
    label: 'Collection',
    description:
      'Aloe Signs — 42 Homestead Avenue, Randfontein (Mon–Thu 7:30–17:00, Fri 7:30–16:00)',
  },
  pudo: {
    label: 'Pudo locker',
    description: 'Pick up from a Pudo locker near you',
  },
  courierguy: {
    label: 'The Courier Guy',
    description: 'Door-to-door courier service',
  },
};

export function rand(n: number): string {
  return `R ${(n / 100).toFixed(2)}`;
}

export const DESIGN_IDS = new Set(SEED_DESIGNS.map((d) => d.id));