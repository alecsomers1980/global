"use client";

import { useEffect, useState } from "react";
import { useAdminToken } from "../AdminGate";
import { getSettings, saveShipping, saveSocial } from "../actions";
import { SHIPPING_FALLBACK, type ShippingSettings } from "@/lib/shipping";
import { PLATFORMS, EMPTY_SOCIAL, cleanSocial, type SocialLinks } from "@/lib/social";

const FIELD =
  "min-h-[44px] w-full border border-hairline bg-white px-3 py-2 text-[14px] text-ink focus:border-brand focus:outline-none";
const SMALL_BTN =
  "min-h-[40px] border border-hairline px-3 text-[13px] text-ink-soft hover:border-brand hover:text-brand disabled:opacity-50";

export default function AdminSettingsPage() {
  const token = useAdminToken();
  const [shipping, setShipping] = useState<ShippingSettings | null>(null);
  const [social, setSocial] = useState<SocialLinks>(EMPTY_SOCIAL);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [socialSaved, setSocialSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [socialBusy, setSocialBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const result = await getSettings(token);
      if (result.ok) {
        setShipping({ ...SHIPPING_FALLBACK, ...((result.data.shipping as Partial<ShippingSettings>) ?? {}) });
        setSocial(cleanSocial((result.data.social as Record<string, unknown>) ?? {}));
      } else {
        setError(result.error);
      }
    })();
  }, [token]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    const value = {
      flat: Number(fd.get("flat")),
      free_over: Number(fd.get("free_over")),
      collect_from_farm: fd.get("collect_from_farm") === "on",
    };
    const result = await saveShipping(token, value);
    if (result.ok) {
      setShipping(value);
      setSaved(true);
    } else {
      setError(result.error);
    }
    setBusy(false);
  }

  async function onSaveSocial(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSocialBusy(true);
    setSocialError(null);
    setSocialSaved(false);
    const fd = new FormData(e.currentTarget);
    const links = Object.fromEntries(PLATFORMS.map((p) => [p.key, String(fd.get(p.key) ?? "")]));
    const result = await saveSocial(token, links);
    if (result.ok) {
      setSocial(result.data);
      setSocialSaved(true);
    } else {
      setSocialError(result.error);
    }
    setSocialBusy(false);
  }

  if (!shipping) return <p className="mt-10 text-ink-mute">Loading…</p>;

  return (
    <div className="max-w-[560px]">
      <h1 className="font-display text-3xl text-ink">Settings</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        Delivery charges take effect straight away — the checkout reads them on
        every order, so there is nothing to redeploy.
      </p>

      {error && (
        <div role="alert" className="mt-6 border-l-2 border-red-700 bg-red-50 p-3 text-[14px] text-red-800">
          {error}
        </div>
      )}
      {saved && (
        <p role="status" className="mt-6 border-l-2 border-brand bg-surface p-3 text-[14px] text-ink-soft">
          Saved.
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="flat" className="text-[13px] uppercase tracking-[0.08em] text-ink-mute">
            Delivery charge (rand)
          </label>
          <input id="flat" name="flat" type="number" step="1" min="0" defaultValue={shipping.flat} className={FIELD} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="free_over" className="text-[13px] uppercase tracking-[0.08em] text-ink-mute">
            Free delivery over (rand)
          </label>
          <input
            id="free_over"
            name="free_over"
            type="number"
            step="1"
            min="0"
            defaultValue={shipping.free_over}
            className={FIELD}
          />
        </div>

        <label className="flex items-center gap-2 text-[14px] text-ink-soft">
          <input
            type="checkbox"
            name="collect_from_farm"
            defaultChecked={shipping.collect_from_farm}
            className="h-4 w-4"
          />
          Offer collection from the farm
        </label>

        <button type="submit" disabled={busy} className={`${SMALL_BTN} w-fit`}>
          {busy ? "Saving…" : "Save delivery settings"}
        </button>
      </form>

      <hr className="my-14 border-hairline" />

      <h2 className="font-display text-2xl text-ink">Social media</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        Paste the full web address of each page you are on — starting with
        https://. Leave a box empty and that icon simply does not appear.
        These show in the footer of every page and on the contact page.
      </p>

      {socialError && (
        <div role="alert" className="mt-6 border-l-2 border-red-700 bg-red-50 p-3 text-[14px] text-red-800">
          {socialError}
        </div>
      )}
      {socialSaved && (
        <p role="status" className="mt-6 border-l-2 border-brand bg-surface p-3 text-[14px] text-ink-soft">
          Saved.
        </p>
      )}

      <form onSubmit={onSaveSocial} className="mt-8 flex flex-col gap-5">
        {PLATFORMS.map((p) => (
          <div key={p.key} className="flex flex-col gap-2">
            <label htmlFor={p.key} className="text-[13px] uppercase tracking-[0.08em] text-ink-mute">
              {p.label}
              <span className="normal-case tracking-normal"> (optional)</span>
            </label>
            <input
              id={p.key}
              name={p.key}
              type="url"
              inputMode="url"
              placeholder={p.placeholder}
              defaultValue={social[p.key]}
              className={FIELD}
            />
          </div>
        ))}

        <button type="submit" disabled={socialBusy} className={`${SMALL_BTN} w-fit`}>
          {socialBusy ? "Saving…" : "Save social links"}
        </button>
      </form>
    </div>
  );
}
