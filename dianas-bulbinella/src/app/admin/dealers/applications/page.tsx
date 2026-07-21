import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ApplicationControls from "@/components/admin/ApplicationControls";

export const dynamic = "force-dynamic";

type SearchParams = { status?: string };

export default async function DealerApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { status = "pending" } = await searchParams;
  const supabase = await createClient();

  const { data: applications, error } = await supabase
    .from("dealer_applications")
    .select(
      "id, name, email, phone, country, province, town, business, message, status, admin_notes, created_at, dealer_id"
    )
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">Failed to load applications: {error.message}</p>
      </div>
    );
  }

  const tabs: { label: string; value: string }[] = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Declined", value: "declined" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-6">Dealer Applications</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => {
          const isActive = status === tab.value;
          return (
            <Link
              key={tab.value}
              href={`/admin/dealers/applications?status=${tab.value}`}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                isActive
                  ? "bg-forest text-paper"
                  : "text-ink hover:bg-surface-2"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {applications?.length === 0 ? (
        <p className="text-muted py-8 text-center">No applications here.</p>
      ) : (
        applications?.map((app) => (
          <div
            key={app.id}
            className="bg-white border border-line rounded-2xl p-4 mb-4"
          >
            <div className="flex justify-between items-start">
              <h2 className="font-medium text-ink">{app.name}</h2>
              <span className="text-xs text-muted">
                {new Date(app.created_at).toLocaleDateString("en-ZA", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="text-sm text-muted mt-1">
              <div>{app.email}</div>
              <div>{app.phone}</div>
              <div>
                {[app.town, app.province, app.country || "South Africa"]
                  .filter(Boolean)
                  .join(", ")}
              </div>
              {app.business && <div>{app.business}</div>}
            </div>
            {app.message && (
              <div className="text-sm text-ink whitespace-pre-wrap mt-2">
                {app.message}
              </div>
            )}
            <div className="mt-4">
              <ApplicationControls
                id={app.id}
                status={app.status}
                dealerId={app.dealer_id}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
