import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadCv, requestRevision, bookAppointment } from "./actions";
import { FINGERPRINT_HUBS } from "@/lib/shop";
import { Upload, Download, CheckCircle2, Clock, CalendarClock } from "lucide-react";

export const metadata = { title: "Your order | H&S Labour" };
export const dynamic = "force-dynamic";

export default async function OrderPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const admin = createAdminClient();
  const { data: job } = await admin
    .from("service_jobs")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (!job) notFound();

  let deliverableUrl: string | null = null;
  if (job.deliverable_path) {
    const { data: s } = await admin
      .storage
      .from("shop")
      .createSignedUrl(job.deliverable_path, 3600);
    deliverableUrl = s?.signedUrl ?? null;
  }

  const steps = ["received", "in_progress", "awaiting_client", "delivered"] as const;
  const currentIndex = steps.indexOf(job.status);
  const labels: Record<string, string> = {
    received: "Received",
    in_progress: "In progress",
    awaiting_client: "Awaiting you",
    delivered: "Delivered",
  };

  return (
    <div className="min-h-screen bg-mint/40">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <h1 className="text-2xl font-bold text-navy">{job.product_name}</h1>
          <p className="mt-1 text-sm text-slate-500">Order for {job.buyer_email}</p>

          {job.sla_due_at && (
            <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-mint px-3 py-1 text-xs font-semibold text-green-dark">
              <CalendarClock className="h-3.5 w-3.5" /> Result due by{" "}
              {new Date(job.sla_due_at).toLocaleString("en-ZA")}
            </p>
          )}

          <div className="mt-6 space-y-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 text-sm">
                {i <= currentIndex ? (
                  <CheckCircle2 className="h-5 w-5 text-green-dark" />
                ) : (
                  <Clock className="h-5 w-5 text-slate-300" />
                )}
                <span
                  className={
                    i <= currentIndex
                      ? "font-semibold text-navy"
                      : "text-slate-400"
                  }
                >
                  {labels[s]}
                </span>
              </div>
            ))}
          </div>

          {job.brief && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Your brief
              </h2>
              <p className="mt-1 whitespace-pre-line text-slate-600">{job.brief}</p>
            </div>
          )}

          {job.requires_appointment && (
            <div className="mt-8 border-t border-slate-100 pt-6">
              <h2 className="text-lg font-bold text-navy">Fingerprint appointment</h2>
              {job.appointment_location ? (
                <p className="mt-2 text-sm text-green-dark">
                  Booked: {job.appointment_location}
                  {job.appointment_date
                    ? ` on ${new Date(job.appointment_date).toLocaleDateString("en-ZA")}`
                    : ""}
                  .
                </p>
              ) : (
                <form
                  action={async (formData) => {
                    "use server";
                    await bookAppointment(formData);
                  }}
                  className="mt-3 space-y-3"
                >
                  <input type="hidden" name="token" value={token} />
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Location
                    </label>
                    <select
                      name="location"
                      required
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
                    >
                      <option value="">Choose a hub…</option>
                      {FINGERPRINT_HUBS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Preferred date
                    </label>
                    <input
                      type="date"
                      name="date"
                      required
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
                    />
                  </div>
                  <button className="inline-flex items-center gap-1 rounded bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-dark">
                    Book appointment
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="mt-8 border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-navy">Your documents</h2>
            {job.upload_path ? (
              <p className="mt-1 text-sm text-green-dark">
                Uploaded — you can replace it below.
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-600">
                Upload any supporting documents so we can get started.
              </p>
            )}
            <form
              action={async (formData) => {
                "use server";
                await uploadCv(formData);
              }}
              className="mt-3 flex items-center gap-3"
            >
              <input type="hidden" name="token" value={token} />
              <input type="file" name="file" className="text-sm" />
              <button className="inline-flex items-center gap-1 rounded bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-dark">
                <Upload className="h-4 w-4" />
                Upload
              </button>
            </form>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-navy">Your document</h2>
            {job.status === "delivered" && deliverableUrl ? (
              <>
                <a
                  href={deliverableUrl}
                  className="mt-3 inline-flex items-center gap-2 rounded bg-green px-6 py-3 text-sm font-semibold text-navy hover:bg-green-dark"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
                {job.revisions_remaining > 0 && (
                  <form
                    action={async (formData) => {
                      "use server";
                      await requestRevision(formData);
                    }}
                    className="mt-4"
                  >
                    <input type="hidden" name="token" value={token} />
                    <button className="text-sm font-semibold text-green-dark hover:text-green">
                      Request a revision ({job.revisions_remaining} left)
                    </button>
                  </form>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-600">
                Your document will appear here once it&apos;s ready. We&apos;ll email you.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}