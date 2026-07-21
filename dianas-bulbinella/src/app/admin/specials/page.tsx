import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatZAR } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type Special = {
  id: string;
  name: string;
  starts_on: string;
  ends_on: string;
  note: string | null;
  created_at: string;
};

function getStatus(start: string, end: string): "active" | "upcoming" | "expired" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(start + "T00:00:00");
  const endDate = new Date(end + "T00:00:00");
  if (today >= startDate && today <= endDate) return "active";
  if (today > endDate) return "expired";
  return "upcoming";
}

const statusStyles: Record<string, string> = {
  active: "bg-forest text-white",
  upcoming: "bg-amber-soft text-amber-deep",
  expired: "bg-surface-2 text-muted",
};

export default async function SpecialsPage() {
  const supabase = await createClient();

  const { data: specials } = await supabase
    .from("specials")
    .select("id, name, starts_on, ends_on, note, created_at")
    .order("starts_on", { ascending: false });

  const { data: items } = await supabase
    .from("special_items")
    .select("special_id");

  const countMap = (items ?? []).reduce((acc, row) => {
    acc[row.special_id] = (acc[row.special_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!specials || specials.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-ink">Specials</h1>
        <p className="mt-1 text-sm text-muted">
          Set a special price and the dates it runs. Schedule this month and next
          — specials switch on and off automatically on their dates.
        </p>
        <div className="mt-8 rounded-2xl border border-line bg-white p-8 text-center">
          <p className="text-muted">
            No specials yet — schedule your first one.
          </p>
          <div className="mt-4">
            <Link
              href="/admin/specials/new"
              className="inline-block rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-moss transition-colors"
            >
              Schedule a special
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">Specials</h1>
        <Link
          href="/admin/specials/new"
          className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-moss transition-colors"
        >
          Schedule a special
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted">
        Set a special price and the dates it runs. Schedule this month and next —
        specials switch on and off automatically on their dates.
      </p>

      <div className="mt-6 space-y-4">
        {(specials as Special[]).map((special) => {
          const status = getStatus(special.starts_on, special.ends_on);
          const itemCount = countMap[special.id] ?? 0;
          const startDisplay = new Date(
            special.starts_on + "T00:00:00"
          ).toLocaleDateString("en-ZA", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          const endDisplay = new Date(
            special.ends_on + "T00:00:00"
          ).toLocaleDateString("en-ZA", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={special.id}
              className="flex flex-col rounded-2xl border border-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <p className="font-medium text-ink">{special.name}</p>
                <p className="text-sm text-muted">
                  {startDisplay} – {endDisplay}
                </p>
                {special.note && (
                  <p className="text-sm text-muted italic">{special.note}</p>
                )}
                <p className="text-sm text-muted">{itemCount} product{itemCount !== 1 ? "s" : ""}</p>
              </div>
              <div className="mt-3 flex items-center gap-3 sm:mt-0">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <Link
                  href={`/admin/specials/${special.id}`}
                  className="rounded-full border border-line bg-white px-4 py-1.5 text-xs font-medium text-ink hover:bg-surface transition-colors"
                >
                  Edit
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
