"use client";

import { useEffect, useState } from "react";
import { useAdminToken } from "../AdminGate";
import { getSettings, saveShipping, saveSocial, saveYoco } from "../actions";
import { SHIPPING_FALLBACK, type ShippingSettings } from "@/lib/shipping";
import { PLATFORMS, EMPTY_SOCIAL, cleanSocial, type SocialLinks } from "@/lib/social";
import type { YocoStatus } from "@/lib/yoco";
import {
  BTN_PRIMARY,
  Card,
  FIELD,
  FIELD_LABEL,
  Notice,
  PageHeader,
} from "@/components/admin/ui";

export default function AdminSettingsPage() {
  const token = useAdminToken();
  const [shipping, setShipping] = useState<ShippingSettings | null>(null);
  const [social, setSocial] = useState<SocialLinks>(EMPTY_SOCIAL);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [socialSaved, setSocialSaved] = useState(false);
  const [yoco, setYoco] = useState<YocoStatus | null>(null);
  const [yocoError, setYocoError] = useState<string | null>(null);
  const [yocoSaved, setYocoSaved] = useState<string | null>(null);
  const [yocoBusy, setYocoBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [socialBusy, setSocialBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const result = await getSettings(token);
      if (result.ok) {
        setShipping({ ...SHIPPING_FALLBACK, ...((result.data.shipping as Partial<ShippingSettings>) ?? {}) });
        setSocial(cleanSocial((result.data.social as Record<string, unknown>) ?? {}));
        setYoco((result.data.yoco as YocoStatus) ?? null);
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

  async function onSaveYoco(form: HTMLFormElement, clear = false) {
    if (clear && !window.confirm("Remove the Yoco keys? The shop cannot take payments until new ones are entered.")) {
      return;
    }
    setYocoBusy(true);
    setYocoError(null);
    setYocoSaved(null);
    const fd = new FormData(form);
    const result = await saveYoco(token, {
      secret_key: String(fd.get("secret_key") ?? ""),
      webhook_secret: String(fd.get("webhook_secret") ?? ""),
      clear,
    });
    if (result.ok) {
      setYoco(result.data);
      setYocoSaved(clear ? "Keys removed." : "Saved.");
      // The boxes are write-only; leaving a secret key sitting in the DOM
      // after it has been stored serves no purpose.
      form.reset();
    } else {
      setYocoError(result.error);
    }
    setYocoBusy(false);
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

  if (!shipping) return <p className="text-ink-mute">Loading…</p>;

  return (
    <>
      <PageHeader
        eyebrow="Setup"
        title="Settings"
        description="Delivery charges take effect straight away — the checkout reads them on every order, so there is nothing to redeploy."
      />

      <Card title="Delivery" className="mt-8 max-w-[620px]">
        <div className="px-7 py-6">
        <div className="flex flex-col gap-4">
          {error && <Notice tone="error">{error}</Notice>}
          {saved && <Notice tone="ok">Saved.</Notice>}
        </div>

      <form onSubmit={onSubmit} className="mt-2 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="flat" className={FIELD_LABEL}>
            Delivery charge (rand)
          </label>
          <input id="flat" name="flat" type="number" step="1" min="0" defaultValue={shipping.flat} className={FIELD} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="free_over" className={FIELD_LABEL}>
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

        <button type="submit" disabled={busy} className={`${BTN_PRIMARY} w-fit`}>
          {busy ? "Saving…" : "Save delivery settings"}
        </button>
      </form>
        </div>
      </Card>

      <Card
        title="Card payments (Yoco)"
        description="Where the money goes. These come from your Yoco account and are stored on the server only — once saved, a key can never be read back out of this screen, so it is shown as a description rather than as text you can copy."
        className="mt-5 max-w-[620px]"
      >
        <div className="px-7 py-6">
          <div className="flex flex-col gap-4">
            {yocoError && <Notice tone="error">{yocoError}</Notice>}
            {yocoSaved && <Notice tone="ok">{yocoSaved}</Notice>}
            {yoco && !yoco.has_secret_key && (
              <Notice tone="error">
                No Yoco key saved, so the shop cannot take payment. A customer reaching
                the checkout is asked to phone instead.
              </Notice>
            )}
            {yoco?.mode === "test" && (
              <Notice tone="error">
                This is a test key. Orders will go through the motions without money
                moving. Paste the sk_live_ key when you are ready to trade.
              </Notice>
            )}
            {yoco?.has_secret_key && yoco.mode === "live" && !yoco.has_webhook_secret && (
              <Notice tone="error">
                The live key is in, but there is no webhook secret — nothing will tell
                the site a payment succeeded, so paid orders will sit as pending.
              </Notice>
            )}
          </div>

          {yoco && (
            <dl className="mt-2 flex flex-col gap-3 border border-hairline bg-ground px-5 py-4 text-[14px]">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-ink-mute">Secret key</dt>
                <dd className="text-ink">
                  {yoco.has_secret_key
                    ? `${yoco.mode === "live" ? "Live" : yoco.mode === "test" ? "Test" : "Unrecognised"} key ending ${yoco.secret_key_tail}`
                    : "Not set"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-ink-mute">Webhook secret</dt>
                <dd className="text-ink">{yoco.has_webhook_secret ? "Saved" : "Not set"}</dd>
              </div>
            </dl>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSaveYoco(e.currentTarget);
            }}
            className="mt-5 flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="secret_key" className={FIELD_LABEL}>
                Secret key
                <span className="normal-case tracking-normal"> (leave empty to keep the current one)</span>
              </label>
              <input
                id="secret_key"
                name="secret_key"
                type="password"
                autoComplete="off"
                spellCheck={false}
                placeholder="sk_live_…"
                className={FIELD}
              />
              <p className="text-[13px] leading-relaxed text-ink-mute">
                Yoco dashboard → Sell Online → Payment Gateway → API keys. Copy the
                secret key, not the one starting pk_.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="webhook_secret" className={FIELD_LABEL}>
                Webhook secret
                <span className="normal-case tracking-normal"> (leave empty to keep the current one)</span>
              </label>
              <input
                id="webhook_secret"
                name="webhook_secret"
                type="password"
                autoComplete="off"
                spellCheck={false}
                placeholder="whsec_…"
                className={FIELD}
              />
              <p className="text-[13px] leading-relaxed text-ink-mute">
                Given once when the webhook is created, pointing at{" "}
                <code className="text-ink">/api/yoco/webhook</code>. This is what proves a
                payment notice really came from Yoco — without it no order is ever marked
                paid. If it was not written down, create the webhook again for a new one.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={yocoBusy} className={`${BTN_PRIMARY} w-fit`}>
                {yocoBusy ? "Saving…" : "Save Yoco keys"}
              </button>
              {yoco?.has_secret_key && (
                <button
                  type="button"
                  onClick={(e) => onSaveYoco(e.currentTarget.form!, true)}
                  disabled={yocoBusy}
                  className="inline-flex min-h-[38px] items-center justify-center border border-red-700/30 bg-white px-4 text-[12px] uppercase tracking-[0.1em] text-red-800 transition-colors hover:bg-red-50 disabled:opacity-40"
                >
                  Remove keys
                </button>
              )}
            </div>
          </form>
        </div>
      </Card>

      <Card
        title="Social media"
        description="Paste the full web address of each page you are on — starting with https://. Leave a box empty and that icon simply does not appear. These show in the footer of every page and on the contact page."
        className="mt-5 max-w-[620px]"
      >
        <div className="px-7 py-6">
        <div className="flex flex-col gap-4">
          {socialError && <Notice tone="error">{socialError}</Notice>}
          {socialSaved && <Notice tone="ok">Saved.</Notice>}
        </div>

      <form onSubmit={onSaveSocial} className="mt-2 flex flex-col gap-5">
        {PLATFORMS.map((p) => (
          <div key={p.key} className="flex flex-col gap-2">
            <label htmlFor={p.key} className={FIELD_LABEL}>
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

        <button type="submit" disabled={socialBusy} className={`${BTN_PRIMARY} w-fit`}>
          {socialBusy ? "Saving…" : "Save social links"}
        </button>
      </form>
        </div>
      </Card>
    </>
  );
}
