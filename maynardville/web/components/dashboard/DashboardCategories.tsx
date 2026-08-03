"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ClipboardCheck,
  Ticket,
  LayoutDashboard,
  Megaphone,
  Handshake,
  ClipboardList,
  BarChart3,
  ChevronDown,
} from "lucide-react";
import type { NavGroup } from "@/lib/nav";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "/approvals": ClipboardCheck,
  "/box-office": Ticket,
  "/leadership": LayoutDashboard,
  "/pr-media": Megaphone,
  "/sponsorship": Handshake,
  "/operations": ClipboardList,
  "/reports": BarChart3,
};

const descriptionMap: Record<string, string> = {
  "/approvals": "Review and approve pending requests across all departments.",
  "/box-office": "Sell tickets, manage sessions, and handle cash-ups.",
  "/leadership": "Festival-wide leadership tools and overview.",
  "/pr-media": "Coordinate press, media outreach, and publicity.",
  "/sponsorship": "Track sponsorship packages, deliverables, and contacts.",
  "/operations": "Oversee venue operations, logistics, and crew.",
  "/reports": "Sales versus comp performance reports and insights.",
};

export default function DashboardCategories({ groups }: { groups: NavGroup[] }) {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <CategoryAccordion key={group.title} group={group} />
      ))}
    </div>
  );
}

function CategoryAccordion({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="bg-white border border-mv-line rounded shadow-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-mv-canvas/60 transition-colors"
      >
        <div className="w-10 h-10 rounded bg-mv-mint/15 flex items-center justify-center shrink-0">
          <Ticket className="w-5 h-5 text-mv-mint" />
        </div>
        <div className="flex-1">
          <h2 className="font-heading text-mv-navy text-lg font-semibold">
            {group.title}
          </h2>
          <p className="text-sm text-mv-navy/60">
            {group.items.length} {group.items.length === 1 ? "area" : "areas"}
          </p>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-mv-navy/50 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-mv-line p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {group.items.map((item) => {
            const Icon = iconMap[item.href] ?? null;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white border border-mv-line rounded shadow-card p-6 hover:shadow-lift hover:-translate-y-0.5 transition-all"
              >
                {Icon && (
                  <div className="w-10 h-10 rounded bg-mv-mint/15 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-mv-mint" />
                  </div>
                )}
                <h3 className="font-heading text-mv-navy text-lg font-semibold mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-mv-navy/70">
                  {descriptionMap[item.href] ?? ""}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
