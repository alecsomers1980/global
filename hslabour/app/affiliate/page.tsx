import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatRands } from "@/lib/ebook";
import { signOut } from "@/app/auth/actions";
import BankDetailsForm from "./BankDetailsForm";
import LinkGeneratorClient from "./LinkGeneratorClient";
import { LogOut, Clock, Wallet } from "lucide-react";

export const metadata = {
  title: "Affiliate Dashboard | H&S Labour",
};

export default async function AffiliatePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, affiliate_code, is_approved, bank_name, account_number, branch_code")
    .eq("id", user.id)
    .single();

  // Earnings (commissions are accessed via service-role, scoped to this user).
  const admin = createAdminClient();
  const { data: commissions } = await admin
    .from("commissions")
    .select("amount_cents, status")
    .eq("affiliate_id", user.id);
  const rows = (commissions ?? []) as Array<{ amount_cents: number; status: string }>;
  const paidCents = rows.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount_cents, 0);
  const approvedCents = rows.filter((r) => r.status === "approved").reduce((s, r) => s + r.amount_cents, 0);
  const pendingCents = rows.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount_cents, 0);
  const salesCount = rows.length;

  return (
    <div className="min-h-screen bg-mint/40">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Top bar */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-navy">Affiliate dashboard</h1>
            <p className="mt-1 text-slate-600">
              Welcome back{profile?.first_name ? `, ${profile.first_name}` : ""}.
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded border border-slate-300 px-4 py-2 text-sm font-medium text-navy hover:bg-white"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>

        {!profile?.is_approved ? (
          /* Pending application */
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mint text-green-dark">
              <Clock className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-navy">
              Application under review
            </h2>
            <p className="mt-2 text-slate-600">
              Thanks for applying. We&apos;ll email you as soon as your affiliate
              account is approved — then your referral links and payout details
              will appear here.
            </p>
          </div>
        ) : (
          /* Approved content */
          <div className="mt-8 space-y-6">
            {/* Code + earnings */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Your tracking code
                </p>
                <p className="mt-2 text-2xl font-bold text-green-dark">
                  {profile.affiliate_code}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-navy p-6 text-white">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                    Commission paid
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold">{formatRands(paidCents)}</p>
                <p className="mt-1 text-sm text-white/70">
                  Approved (awaiting payout): {formatRands(approvedCents)} · Pending:{" "}
                  {formatRands(pendingCents)}
                </p>
                <p className="mt-1 text-sm text-white/70">
                  {salesCount} sale{salesCount === 1 ? "" : "s"} referred
                </p>
              </div>
            </div>

            <LinkGeneratorClient
              affiliateCode={profile.affiliate_code || "PENDING"}
              siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? ""}
            />

            <BankDetailsForm
              initialBankName={profile.bank_name}
              initialAccountNumber={profile.account_number}
              initialBranchCode={profile.branch_code}
            />
          </div>
        )}
      </div>
    </div>
  );
}