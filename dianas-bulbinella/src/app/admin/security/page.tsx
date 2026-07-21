"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Factor = { id: string; status: string; friendly_name?: string };

/** Optional two-factor for staff. Enable it here with Google Authenticator (or
 *  any TOTP app); once enabled, proxy.ts requires the code at every sign-in. */
export default function AdminSecurityPage() {
  const router = useRouter();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await createClient().auth.mfa.listFactors();
    setFactors((data?.totp ?? []) as Factor[]);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const startEnrol = async () => {
    setError("");
    setBusy(true);
    const { data, error } = await createClient().auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}`,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setFactorId(data.id);
    setQr(data.totp.qr_code);
    setSecret(data.totp.secret);
  };

  const cancelEnrol = async () => {
    if (factorId) await createClient().auth.mfa.unenroll({ factorId });
    setQr("");
    setSecret("");
    setCode("");
    setFactorId("");
  };

  const confirmEnrol = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const supabase = createClient();
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) {
      setError(challenge.error.message);
      setBusy(false);
      return;
    }
    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code: code.trim(),
    });
    setBusy(false);
    if (verify.error) {
      setError(verify.error.message);
      return;
    }
    setQr("");
    setSecret("");
    setCode("");
    setFactorId("");
    await load();
    router.refresh();
  };

  const disable = async (id: string) => {
    setError("");
    setBusy(true);
    const { error } = await createClient().auth.mfa.unenroll({ factorId: id });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    await load();
    router.refresh();
  };

  const verified = factors.filter((f) => f.status === "verified");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-forest">Security</h1>
        <p className="mt-1 text-sm text-muted">
          Two-factor authentication (optional). Use Google Authenticator, Authy,
          1Password or any TOTP app. Once enabled, you&apos;ll enter a 6-digit
          code each time you sign in.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6 space-y-5 max-w-lg">
        {loading ? (
          <p className="text-muted">Loading…</p>
        ) : verified.length > 0 && !qr ? (
          <div className="space-y-4">
            <p className="text-forest font-medium">
              ✓ Two-factor is active on this account.
            </p>
            {verified.map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted">
                  {f.friendly_name || "Authenticator"} — verified
                </span>
                <button
                  onClick={() => disable(f.id)}
                  disabled={busy}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Disable
                </button>
              </div>
            ))}
            <p className="text-xs text-muted">
              Lost your phone? Disable here, then set it up again — or remove the
              factor from the Supabase dashboard (Authentication → Users).
            </p>
          </div>
        ) : qr ? (
          <form onSubmit={confirmEnrol} className="space-y-4">
            <p className="text-sm text-ink">
              1. Scan this QR code in your authenticator app:
            </p>
            {/* Supabase returns an SVG data URL */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qr}
              alt="Two-factor QR code"
              className="bg-white p-3 rounded-lg border border-line w-48 h-48"
            />
            <div>
              <p className="text-sm text-ink mb-1">
                Can&apos;t scan? Enter this key manually —{" "}
                <strong>save it in your password manager</strong>, it&apos;s how
                you recover on a new phone:
              </p>
              <code className="block bg-surface border border-line rounded-lg px-3 py-2 text-xs break-all">
                {secret}
              </code>
            </div>
            <div>
              <p className="text-sm text-ink mb-1">
                2. Enter the 6-digit code it shows:
              </p>
              <input
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-center text-2xl tracking-[0.4em] text-ink w-full outline-none focus:border-forest"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={busy || code.length !== 6}
                className="rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest/90 disabled:opacity-50"
              >
                {busy ? "Verifying…" : "Enable two-factor"}
              </button>
              <button
                type="button"
                onClick={cancelEnrol}
                className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-surface"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              Two-factor isn&apos;t set up yet. Add it for stronger protection of
              the admin area.
            </p>
            <button
              onClick={startEnrol}
              disabled={busy}
              className="rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest/90 disabled:opacity-50"
            >
              {busy ? "Preparing…" : "Set up two-factor"}
            </button>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
      </div>
    </div>
  );
}
