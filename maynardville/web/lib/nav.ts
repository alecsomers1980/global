export interface NavEntry {
  title: string;
  href: string;
  roles: string[];
}

export interface NavGroup {
  title: string;
  items: NavEntry[];
}

// Top-level categories. Add more groups here for other functions later.
export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Complimentary Tickets",
    items: [
      { title: "Approvals", href: "/approvals", roles: ["Admin"] },
      { title: "Box Office", href: "/box-office", roles: ["Admin", "Box Office"] },
      { title: "Festival Leadership", href: "/leadership", roles: ["Admin"] },
      { title: "PR & Media", href: "/pr-media", roles: ["Admin", "PR & Media"] },
      { title: "Sponsorship", href: "/sponsorship", roles: ["Admin", "Sponsorships"] },
      { title: "Operations", href: "/operations", roles: ["Admin", "Operations"] },
      { title: "Sales vs Comp Report", href: "/reports", roles: ["Admin"] },
    ],
  },
];

// Groups filtered to the entries this role can access (empty groups dropped).
export function navGroupsForRole(role: string): NavGroup[] {
  return NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => i.roles.includes(role)),
  })).filter((g) => g.items.length > 0);
}
