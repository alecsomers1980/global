===FILE: app/page.tsx===
import Link from "next/link";
import Logo from "@/components/brand/Logo";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-mv-navy flex flex-col items-center justify-center px-4 text-center">
      <div className="animate-fade-up">
        <Logo className="h-12 sm:h-16 w-auto mx-auto" href={null} />
        <h1 className="mt-8 text-3xl sm:text-4xl font-heading text-mv-cream">
          Festival Operations
        </h1>
        <p className="mt-3 text-mv-cream/70 max-w-lg mx-auto font-sans">
          Manage performances, complimentary tickets, and more — all in one
          place.
        </p>
        <div className="flex items-center justify-center gap-4 mt-10 mb-8">
          <div className="h-px flex-1 bg-mint/30" />
          <span className="text-mint text-xl">✦</span>
          <div className="h-px flex-1 bg-mint/30" />
        </div>
        <Link
          href="/staff-login"
          className="inline-block px-8 py-3 bg-mint text-mv-navy font-semibold rounded hover:brightness-110 transition"
        >
          Staff sign-in
        </Link>
      </div>
      <p className="mt-16 text-mv-cream/50 text-sm font-sans">
        Maynardville Open-Air Festival
      </p>
    </div>
  );
}
===END===
===FILE: app/staff-login/page.tsx===
import Logo from "@/components/brand/Logo";
import { ChevronRight } from "lucide-react";

export default async function StaffLoginPage({
  searchParams,
}: {
  searchParams: { sent?: string; error?: string };
}) {
  const isDev = process.env.NODE_ENV !== "production";
  const sent = searchParams.sent === "1";
  const error = searchParams.error;

  return (
    <div className="min-h-screen bg-mv-navy flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md bg-mv-navy border border-mv-cream/15 shadow-2xl rounded p-8">
        <Logo className="h-10 w-auto mx-auto mb-6" href="/" />
        <h1 className="text-2xl font-heading text-mv-cream text-center mb-6">
          Staff sign-in
        </h1>

        {sent && (
          <div className="mb-6 bg-mint/20 text-mv-cream p-4 rounded">
            Magic link sent! Check your email.
          </div>
        )}
        {error === "expired" && (
          <div className="mb-6 bg-red-400/20 text-mv-cream p-4 rounded">
            Your magic link has expired. Please request a new one.
          </div>
        )}
        {error === "denied" && (
          <div className="mb-6 bg-red-400/20 text-mv-cream p-4 rounded">
            Access denied. You are not authorised.
          </div>
        )}
        {error && error !== "expired" && error !== "denied" && (
          <div className="mb-6 bg-red-400/20 text-mv-cream p-4 rounded">
            An error occurred. Please try again.
          </div>
        )}

        <form action="/api/auth/request-link" method="post" className="space-y-4">
          <label className="block text-mv-cream text-sm font-medium">
            Email address
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="you@maynardville.co.za"
            className="w-full px-4 py-3 bg-white/5 border border-mv-cream/20 rounded text-mv-cream placeholder:text-mv-cream/40 focus:outline-none focus:ring-2 focus:ring-mint focus:border-transparent"
          />
          <button
            type="submit"
            className="w-full py-3 px-4 bg-mint text-mv-navy font-semibold rounded hover:brightness-110 transition"
          >
            Send magic link
          </button>
        </form>

        {isDev && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-mv-cream/15" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-mv-navy text-mv-cream/50 text-xs uppercase tracking-wider">
                  Dev quick-login
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <a
                href="/api/auth/dev-login?role=Admin&name=Jaco"
                className="flex items-center justify-between px-4 py-3 border border-mv-cream/20 rounded text-mv-cream hover:bg-mv-cream/10 transition"
              >
                <span>Sign in as Jaco (Admin)</span>
                <ChevronRight className="w-4 h-4 text-mv-cream/50" />
              </a>
              <a
                href="/api/auth/dev-login?role=Box%20Office&name=Jeff"
                className="flex items-center justify-between px-4 py-3 border border-mv-cream/20 rounded text-mv-cream hover:bg-mv-cream/10 transition"
              >
                <span>Sign in as Jeff (Box Office)</span>
                <ChevronRight className="w-4 h-4 text-mv-cream/50" />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
===END===
===FILE: app/dashboard/page.tsx===
import { getStaffSession } from "@/lib/session";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import AppHeader from "@/components/ui/AppHeader";
import {
  ClipboardCheck,
  Ticket,
  LayoutDashboard,
  Megaphone,
  Handshake,
  ClipboardList,
  BarChart3,
} from "lucide-react";

export const dynamic = "force-dynamic";

type NavItem = {
  title: string;
  href: string;
  description: string;
  roles: string[];
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  {
    title: "Approvals",
    href: "/approvals",
    description: "Review and approve requests",
    roles: ["Admin"],
    icon: ClipboardCheck,
  },
  {
    title: "Box Office",
    href: "/box-office",
    description: "Tickets, comps, and gate lists",
    roles: ["Admin", "Box Office"],
    icon: Ticket,
  },
  {
    title: "Festival Leadership",
    href: "/leadership",
    description: "Dashboard for leadership team",
    roles: ["Admin"],
    icon: LayoutDashboard,
  },
  {
    title: "PR & Media",
    href: "/pr-media",
    description: "Press releases, media contacts",
    roles: ["Admin", "PR & Media"],
    icon: Megaphone,
  },
  {
    title: "Sponsorship",
    href: "/sponsorship",
    description: "Manage sponsors and partnerships",
    roles: ["Admin", "Sponsorships"],
    icon: Handshake,
  },
  {
    title: "Operations",
    href: "/operations",
    description: "Run sheets, volunteers, logistics",
    roles: ["Admin", "Operations"],
    icon: ClipboardList,
  },
  {
    title: "Sales vs Comp Report",
    href: "/reports",
    description: "Reporting on sales and complimentary tickets",
    roles: ["Admin"],
    icon: BarChart3,
  },
];

export default async function DashboardPage() {
  const staff = getStaffSession();

  if (!staff) {
    return (
      <div className="min-h-screen bg-mv-navy flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Logo href={null} className="h-10 mx-auto mb-4" />
          <p className="text-mv-cream/80 mb-6 font-sans">
            Please sign in to access the staff hub.
          </p>
          <Link
            href="/staff-login"
            className="inline-block px-6 py-3 bg-mint text-mv-navy font-semibold rounded hover:brightness-110 transition"
          >
            Staff sign-in
          </Link>
        </div>
      </div>
    );
  }

  const allowedItems = navItems.filter((item) =>
    item.roles.includes(staff.role)
  );

  return (
    <div className="min-h-screen bg-mv-canvas font-sans">
      <AppHeader title="Staff Hub" staffName={staff.name} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up">
          {allowedItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white border border-mv-line rounded shadow-card p-6 hover:shadow-lift hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded bg-mint/15">
                  <item.icon className="w-5 h-5 text-mint" />
                </div>
                <div>
                  <h2 className="text-lg font-heading text-mv-navy">
                    {item.title}
                  </h2>
                  <p className="text-sm text-mv-navy-muted mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-12 text-center text-xs text-mv-navy-muted">
          Staff access via email magic link.
        </p>
      </main>
    </div>
  );
}
===END===