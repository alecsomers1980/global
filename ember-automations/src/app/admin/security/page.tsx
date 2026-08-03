"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabaseBrowser";

type Factor = { id: string; status: string; friendly_name?: string };

export default function Security() {
  const router = useRouter();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await browserClient().auth.mfa.listFactors();
    setFactors((data?.totp ?? []) as Factor[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const startEnrol = async () => {
    setErr(null);
    setBusy(true);
    const { data, error } = await browserClient().auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}`,
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setFactorId(data.id);
    setQr(data.totp.qr_code);
    setSecret(data.totp.secret);
  };

  const confirmEnrol = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const supabase = browserClient();
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) { setErr(challenge.error.message); setBusy(false); return; }
    const verify = await supabase.auth.mfa.verify({
      factorId, challengeId: challenge.data.id, code: code.trim(),
    });
    setBusy(false);
    if (verify.error) { setErr(verify.error.message); return; }
    setQr(""); setSecret(""); setCode("");
    await load();
    router.refresh();
  };

  const verified = factors.filter(f => f.status === "verified");

  return (
    <div className="glass p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold">Security — Two-factor authentication</h1>
        <p className="text-[#6b6b8a] text-sm mt-1">
          Two-factor is required for admin access. Use Google Authenticator, Authy, 1Password,
          or any TOTP app.
        </p>
      </div>

      {loading ? (
        <p className="text-[#6b6b8a]">Loading…</p>
      ) : verified.length > 0 && !qr ? (
        <div className="space-y-3">
          <p className="text-[#10b981] font-semibold">✓ Two-factor is active on this account.</p>
          {verified.map(f => (
            <p key={f.id} className="text-sm text-[#6b6b8a]">
              {f.friendly_name || "Authenticator"} — verified
            </p>
          ))}
          <p className="text-xs text-[#6b6b8a]">
            Lost your phone? Remove the factor from the Supabase dashboard
            (Authentication → Users → your user), then enrol again here.
          </p>
        </div>
      ) : qr ? (
        <form onSubmit={confirmEnrol} className="space-y-4">
          <p className="text-sm">1. Scan this QR code in your authenticator app:</p>
          {/* Supabase returns an SVG data URL */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="Two-factor QR code" className="bg-white p-3 rounded-lg w-48 h-48" />

          <div>
            <p className="text-sm mb-1">
              Can&apos;t scan? Enter this key manually — <strong>save it in your password
              manager</strong>, it&apos;s how you recover on a new phone:
            </p>
            <code className="block bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-xs break-all">
              {secret}
            </code>
          </div>

          <div>
            <p className="text-sm mb-1">2. Enter the 6-digit code it shows:</p>
            <input
              className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-center text-2xl tracking-[0.4em]"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <button
            type="submit"
            disabled={busy || code.length !== 6}
            className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {busy ? "Verifying…" : "Enable two-factor"}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <p className="text-[#6b6b8a] text-sm">
            You haven&apos;t set up two-factor yet. You&apos;ll need it before you can use the admin area.
          </p>
          <button
            onClick={startEnrol}
            disabled={busy}
            className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {busy ? "Preparing…" : "Set up two-factor"}
          </button>
        </div>
      )}

      {err && <p className="text-ember-500 text-sm">{err}</p>}
    </div>
  );
}
