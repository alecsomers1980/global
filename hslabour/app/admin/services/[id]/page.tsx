import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { setJobStatus, uploadDeliverable } from "../actions";
import Link from "next/link";

export const metadata = { title: "Service job | Admin" };

export default async function ServiceJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");

  const { id } = await params;
  const admin = createAdminClient();
  const { data: job } = await admin
    .from("service_jobs")
    .select("*")
    .eq("id", id)
    .single();
  if (!job) notFound();

  let uploadUrl: string | null = null;
  if (job.upload_path) {
    const { data: s } = await admin.storage
      .from("shop")
      .createSignedUrl(job.upload_path, 3600);
    uploadUrl = s?.signedUrl ?? null;
  }

  let deliverableUrl: string | null = null;
  if (job.deliverable_path) {
    const { data: s } = await admin.storage
      .from("shop")
      .createSignedUrl(job.deliverable_path, 3600);
    deliverableUrl = s?.signedUrl ?? null;
  }

  return (
    <div className="min-h-screen bg-mint/40">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href="/admin/services"
          className="text-sm text-green-dark hover:text-green"
        >
          ← Service jobs
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-navy">
          {job.product_name}
        </h1>
        <p className="mt-1 text-slate-600">
          {job.buyer_name ? `${job.buyer_name} · ` : ""}
          {job.buyer_email}
        </p>

        {/* Brief card */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-navy">Brief</h2>
          <p className="mt-2 whitespace-pre-line text-slate-600">
            {job.brief || "—"}
          </p>
          {uploadUrl ? (
            <a
              href={uploadUrl}
              className="mt-4 inline-block font-semibold text-green-dark hover:text-green"
            >
              Download buyer&apos;s document
            </a>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No document uploaded by the buyer yet.
            </p>
          )}
        </div>

        {/* Verification card */}
        {(job.consent_at || job.requires_appointment || job.sla_due_at) && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-navy">Verification</h2>
            <dl className="mt-2 space-y-1 text-sm text-slate-600">
              {job.sla_due_at && (
                <div>
                  SLA: result due by{" "}
                  {new Date(job.sla_due_at).toLocaleString("en-ZA")}
                </div>
              )}
              <div>
                POPIA consent:{" "}
                {job.consent_at
                  ? `given ${new Date(job.consent_at).toLocaleDateString("en-ZA")}`
                  : "not recorded"}
              </div>
              {job.requires_appointment && (
                <div>
                  Appointment:{" "}
                  {job.appointment_location
                    ? `${job.appointment_location}${job.appointment_date ? ` on ${new Date(job.appointment_date).toLocaleDateString("en-ZA")}` : ""}`
                    : "not yet booked by buyer"}
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Status card */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-navy">Status</h2>
          <form
            action={async (formData) => {
              "use server";
              await setJobStatus(formData);
            }}
            className="mt-3 flex items-end gap-3"
          >
            <input type="hidden" name="id" value={job.id} />
            <select
              name="status"
              defaultValue={job.status}
              className="rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
            >
              <option value="received">Received</option>
              <option value="in_progress">In progress</option>
              <option value="awaiting_client">Awaiting client</option>
              <option value="delivered">Delivered</option>
            </select>
            <button className="rounded bg-green px-5 py-2 text-sm font-semibold text-navy hover:bg-green-dark">
              Update
            </button>
          </form>
          <p className="mt-2 text-sm text-slate-500">
            Revisions remaining: {job.revisions_remaining}
          </p>
        </div>

        {/* Deliverable card */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-navy">Deliverable</h2>
          {deliverableUrl ? (
            <a
              href={deliverableUrl}
              className="mt-2 inline-block font-semibold text-green-dark hover:text-green"
            >
              Download current deliverable
            </a>
          ) : null}
          <form
            action={async (formData) => {
              "use server";
              await uploadDeliverable(formData);
            }}
            className="mt-4 flex items-center gap-3"
          >
            <input type="hidden" name="id" value={job.id} />
            <input type="file" name="file" className="text-sm" />
            <button className="rounded bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-dark">
              Upload deliverable
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}