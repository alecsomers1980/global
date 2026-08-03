"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { NavGroup } from "@/lib/nav";

export default function NavGroupMenu({
  groups,
  activeTitle,
}: {
  groups: NavGroup[];
  activeTitle: string;
}) {
  return (
    <>
      {groups.map((group) => (
        <GroupDropdown key={group.title} group={group} activeTitle={activeTitle} />
      ))}
    </>
  );
}

function GroupDropdown({
  group,
  activeTitle,
}: {
  group: NavGroup;
  activeTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const groupActive = group.items.some((i) => i.title === activeTitle);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap rounded-t border-b-2 transition-colors ${
          groupActive
            ? "border-mv-mint text-mv-cream font-semibold"
            : "border-transparent text-mv-cream/70 hover:text-mv-cream"
        }`}
      >
        {group.title}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 min-w-[15rem] rounded-b border border-mv-cream/15 bg-mv-navy py-1 shadow-lg">
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2 text-sm transition-colors ${
                item.title === activeTitle
                  ? "bg-mv-cream/10 text-mv-cream font-semibold"
                  : "text-mv-cream/75 hover:bg-mv-cream/10 hover:text-mv-cream"
              }`}
            >
              {item.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
