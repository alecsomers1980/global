"use client";

import { useEffect, useState } from "react";
import { useAdminToken } from "../AdminGate";
import { rands } from "@/lib/money";
import { heroFor, imageSrc } from "@/lib/product-image";
import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  BTN_PRIMARY,
  BTN_QUIET,
  Card,
  FIELD,
  FIELD_LABEL,
  Notice,
  PageHeader,
  StatusPill,
} from "@/components/admin/ui";
import {
  createProduct,
  createVariant,
  deleteProducts,
  deleteVariant,
  listProducts,
  saveProduct,
  saveVariant,
  type AdminProduct,
  type ProductCopy,
} from "../actions";
import { VARIANT_FORMATS } from "@/lib/variant-formats";

const DELETE_BTN =
  "inline-flex min-h-[38px] items-center justify-center border border-red-700/30 bg-white px-4 text-[12px] uppercase tracking-[0.1em] text-red-800 transition-colors hover:bg-red-50 disabled:opacity-40";

export default function AdminProductsPage() {
  const token = useAdminToken();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  async function load() {
    const result = await listProducts(token);
    if (result.ok) setProducts(result.data);
    else setError(result.error);
    setLoading(false);
  }

  useEffect(() => {
    if (!token) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /** Every mutation ends the same way: report, reload, drop the busy flag. */
  async function run(
    work: () => Promise<{ ok: true; data: unknown } | { ok: false; error: string }>,
    message: string
  ) {
    setBusy(true);
    setError(null);
    setSaved(null);
    const result = await work();
    if (result.ok) {
      setSaved(message);
      await load();
    } else {
      setError(result.error);
    }
    setBusy(false);
    return result.ok;
  }

  async function onSaveProduct(id: string, form: HTMLFormElement) {
    const fd = new FormData(form);
    const fields: ProductCopy = {
      name: String(fd.get("name") ?? ""),
      // An empty box means "no upload", which falls back to the photo that
      // ships with the site — not "no picture".
      hero_image: String(fd.get("hero_image") ?? "").trim() || null,
      botanical_name: String(fd.get("botanical_name") ?? ""),
      summary: String(fd.get("summary") ?? ""),
      traditional_use: String(fd.get("traditional_use") ?? ""),
      ingredients: String(fd.get("ingredients") ?? ""),
      directions: String(fd.get("directions") ?? ""),
      storage: String(fd.get("storage") ?? ""),
      active: fd.get("active") === "on",
    };
    await run(() => saveProduct(token, id, fields), `Saved ${fields.name}.`);
  }

  async function onSaveVariant(id: string, label: string, form: HTMLFormElement) {
    const fd = new FormData(form);
    const trade = String(fd.get("price_trade") ?? "").trim();
    const stock = String(fd.get("stock") ?? "").trim();
    await run(
      () =>
        saveVariant(token, id, {
          price_retail: Number(fd.get("price_retail")),
          price_trade: trade === "" ? null : Number(trade),
          stock: stock === "" ? null : Number(stock),
          image_url: String(fd.get("image_url") ?? "").trim() || null,
          active: fd.get("variant_active") === "on",
        }),
      `Saved ${label}.`
    );
  }

  async function onAddProduct(form: HTMLFormElement) {
    const fd = new FormData(form);
    const name = String(fd.get("new_name") ?? "");
    setBusy(true);
    setError(null);
    setSaved(null);
    const result = await createProduct(token, name);
    if (result.ok) {
      setSaved(`Added ${name.trim()}. It is hidden until you switch it on.`);
      setAdding(false);
      await load();
      // Straight into the new one — it has nothing in it yet, and the next
      // thing anybody wants is to fill it in.
      setOpenId(result.data);
    } else {
      setError(result.error);
    }
    setBusy(false);
  }

  async function onAddVariant(productId: string, form: HTMLFormElement) {
    const fd = new FormData(form);
    const label = String(fd.get("size_label") ?? "");
    const ok = await run(
      () =>
        createVariant(token, productId, {
          format: String(fd.get("format") ?? ""),
          size_label: label,
          price_retail: Number(fd.get("new_price") ?? 0),
        }),
      `Added ${label.trim()}.`
    );
    if (ok) form.reset();
  }

  async function onDeleteVariant(id: string, label: string) {
    if (!window.confirm(`Remove the ${label} size? Orders already placed keep their record.`)) return;
    await run(() => deleteVariant(token, id), `Removed ${label}.`);
  }

  async function onDeleteProducts(ids: string[]) {
    const names = products.filter((p) => ids.includes(p.id)).map((p) => p.name);
    const sizes = products
      .filter((p) => ids.includes(p.id))
      .reduce((n, p) => n + p.product_variants.length, 0);
    const what = names.length === 1 ? names[0] : `${names.length} products`;
    if (
      !window.confirm(
        `Delete ${what} and ${sizes} size${sizes === 1 ? "" : "s"}?\n\n${names.join("\n")}\n\n` +
          `This cannot be undone. Orders already placed keep their record.`
      )
    ) {
      return;
    }
    const ok = await run(
      () => deleteProducts(token, ids),
      `Deleted ${names.length} product${names.length === 1 ? "" : "s"}.`
    );
    if (ok) {
      setPicked(new Set());
      if (openId && ids.includes(openId)) setOpenId(null);
    }
  }

  function togglePick(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (loading) return <p className="text-ink-mute">Loading…</p>;

  const allPicked = products.length > 0 && picked.size === products.length;

  return (
    <>
      <PageHeader
        eyebrow="Selling"
        title="Products"
        description="Photographs, wording and prices. Copy is checked before it saves: we may describe the plant and how it has traditionally been used, but not what it treats — a save naming a condition is refused and tells you which words to change."
        action={
          <button type="button" onClick={() => setAdding((v) => !v)} className={BTN_PRIMARY}>
            {adding ? "Cancel" : "Add a product"}
          </button>
        }
      />

      <div className="mt-8 flex flex-col gap-3">
        {error && <Notice tone="error">{error}</Notice>}
        {saved && <Notice tone="ok">{saved}</Notice>}
      </div>

      {adding && (
        <Card title="New product" className="mt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onAddProduct(e.currentTarget);
            }}
            className="flex flex-wrap items-end gap-4 px-7 py-6"
          >
            <div className="flex min-w-[260px] flex-1 flex-col gap-2">
              <label htmlFor="new_name" className={FIELD_LABEL}>
                Product name
              </label>
              <input id="new_name" name="new_name" autoFocus className={FIELD} placeholder="Ginger" />
            </div>
            <button type="submit" disabled={busy} className={BTN_PRIMARY}>
              {busy ? "Adding…" : "Add"}
            </button>
            <p className="w-full text-[13px] leading-relaxed text-ink-mute">
              It starts hidden, so nothing half-finished reaches the shop. Add a
              photograph, the wording and at least one size, then switch it on.
            </p>
          </form>
        </Card>
      )}

      {products.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-[13px] text-ink-soft">
            <input
              type="checkbox"
              checked={allPicked}
              onChange={() => setPicked(allPicked ? new Set() : new Set(products.map((p) => p.id)))}
              className="h-4 w-4"
            />
            Select all
          </label>
          {picked.size > 0 && (
            <button
              type="button"
              onClick={() => onDeleteProducts([...picked])}
              disabled={busy}
              className={DELETE_BTN}
            >
              Delete {picked.size} selected
            </button>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-4">
        {products.map((p) => {
          const hero = heroFor(p.slug, p.hero_image);
          const open = openId === p.id;

          return (
            <Card key={p.id}>
              {/* The checkbox sits outside the accordion button — a control
                  nested inside another control is neither valid nor clickable. */}
              <div className="flex items-center gap-4 px-5 py-4">
                <input
                  type="checkbox"
                  checked={picked.has(p.id)}
                  onChange={() => togglePick(p.id)}
                  aria-label={`Select ${p.name}`}
                  className="h-4 w-4 shrink-0"
                />
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : p.id)}
                  aria-expanded={open}
                  className="flex min-w-0 flex-1 items-center gap-5 text-left"
                >
                  <span className="relative h-14 w-12 shrink-0 overflow-hidden border border-hairline bg-surface">
                    {hero && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageSrc(hero, 400)} alt="" className="h-full w-full object-cover" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-xl text-ink">{p.name}</span>
                    <span className="mt-0.5 block text-[13px] text-ink-mute">
                      {`${p.product_variants.length} size${p.product_variants.length === 1 ? "" : "s"}`}
                    </span>
                  </span>
                  <StatusPill status={p.active ? "on the site" : "hidden"} />
                  <span aria-hidden className="text-[13px] text-ink-mute">
                    {open ? "Close" : "Edit"}
                  </span>
                </button>
              </div>

              {open && (
                <div className="border-t border-hairline px-5 py-7">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      onSaveProduct(p.id, e.currentTarget);
                    }}
                    className="flex flex-col gap-6"
                  >
                    <ImageUpload
                      name="hero_image"
                      label="Product photo"
                      value={p.hero_image}
                      fallback={hero}
                      fallbackNote={
                        hero
                          ? "This is the photo that came with the site. Choosing a new one replaces it."
                          : "No photograph of this one yet."
                      }
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field name="name" label="Name" defaultValue={p.name} />
                      <Field
                        name="botanical_name"
                        label="Botanical name"
                        defaultValue={p.botanical_name ?? ""}
                      />
                    </div>
                    <Area name="summary" label="Summary" defaultValue={p.summary ?? ""} />
                    <Area
                      name="traditional_use"
                      label="Traditional use"
                      defaultValue={p.traditional_use ?? ""}
                    />
                    <Area name="ingredients" label="Ingredients" defaultValue={p.ingredients ?? ""} rows={2} />
                    <Area name="directions" label="Directions" defaultValue={p.directions ?? ""} rows={2} />
                    <Area name="storage" label="Storage" defaultValue={p.storage ?? ""} rows={2} />

                    <label className="flex items-center gap-2 text-[14px] text-ink-soft">
                      <input type="checkbox" name="active" defaultChecked={p.active} className="h-4 w-4" />
                      Show this product on the site
                    </label>

                    <div className="flex flex-wrap items-center gap-3">
                      <button type="submit" disabled={busy} className={BTN_PRIMARY}>
                        {busy ? "Saving…" : "Save product"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProducts([p.id])}
                        disabled={busy}
                        className={DELETE_BTN}
                      >
                        Delete this product
                      </button>
                    </div>
                  </form>

                  <div className="mt-12 border-t border-hairline pt-8">
                    <h3 className="font-display text-xl text-ink">Sizes</h3>
                    <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-soft">
                      Each size can carry its own photograph — the scents of a soap or a balm
                      genuinely look different, and the shop swaps the picture when a shopper
                      picks that size. Leave it empty and the product photo above is used.
                    </p>

                    <div className="mt-6 flex flex-col gap-4">
                      {p.product_variants.map((v) => (
                        <form
                          key={v.id}
                          onSubmit={(e) => {
                            e.preventDefault();
                            onSaveVariant(v.id, v.size_label, e.currentTarget);
                          }}
                          className="border border-hairline bg-ground p-5"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-3">
                            <p className="text-[15px] text-ink">
                              {v.size_label}
                              <span className="ml-3 text-[13px] text-ink-mute">{v.format}</span>
                            </p>
                            <p className="text-[13px] text-ink-mute">
                              {rands(Number(v.price_retail))} today
                            </p>
                          </div>

                          <div className="mt-5 flex flex-wrap items-start gap-x-8 gap-y-6">
                            <ImageUpload
                              name="image_url"
                              label={`Photo for ${v.size_label}`}
                              value={v.image_url}
                              fallback={v.image_url ?? hero}
                              fallbackNote="Using the product photo."
                              className="h-28 w-24"
                            />

                            <div className="flex flex-wrap items-end gap-3">
                              <SmallField
                                name="price_retail"
                                label="Retail"
                                defaultValue={String(Number(v.price_retail))}
                                ariaLabel={`Retail price for ${v.size_label}`}
                              />
                              <SmallField
                                name="price_trade"
                                label="Trade"
                                defaultValue={v.price_trade == null ? "" : String(Number(v.price_trade))}
                                ariaLabel={`Trade price for ${v.size_label}`}
                              />
                              <SmallField
                                name="stock"
                                label="Stock"
                                step="1"
                                defaultValue={v.stock == null ? "" : String(v.stock)}
                                ariaLabel={`Stock for ${v.size_label}`}
                              />
                              <label className="flex min-h-[44px] items-center gap-2 text-[13px] text-ink-soft">
                                <input
                                  type="checkbox"
                                  name="variant_active"
                                  defaultChecked={v.active}
                                  className="h-4 w-4"
                                />
                                On sale
                              </label>
                              <button type="submit" disabled={busy} className={BTN_QUIET}>
                                Save size
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteVariant(v.id, v.size_label)}
                                disabled={busy}
                                className={DELETE_BTN}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </form>
                      ))}

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          onAddVariant(p.id, e.currentTarget);
                        }}
                        className="flex flex-wrap items-end gap-3 border border-dashed border-hairline bg-ground p-5"
                      >
                        <div className="flex flex-col gap-2">
                          <label htmlFor={`size_label_${p.id}`} className={FIELD_LABEL}>
                            New size
                          </label>
                          <input
                            id={`size_label_${p.id}`}
                            name="size_label"
                            placeholder="100 g"
                            className={`${FIELD} w-36`}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label htmlFor={`format_${p.id}`} className={FIELD_LABEL}>
                            Sold as
                          </label>
                          <select id={`format_${p.id}`} name="format" className={`${FIELD} w-36`}>
                            {VARIANT_FORMATS.map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>
                        </div>
                        <SmallField
                          name="new_price"
                          label="Retail"
                          defaultValue=""
                          ariaLabel="Retail price for the new size"
                        />
                        <button type="submit" disabled={busy} className={BTN_QUIET}>
                          Add size
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className={FIELD_LABEL}>
        {label}
      </label>
      <input id={name} name={name} defaultValue={defaultValue} className={FIELD} />
    </div>
  );
}

function Area({
  name,
  label,
  defaultValue,
  rows = 3,
}: {
  name: string;
  label: string;
  defaultValue: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className={FIELD_LABEL}>
        {label}
      </label>
      <textarea id={name} name={name} rows={rows} defaultValue={defaultValue} className={FIELD} />
    </div>
  );
}

function SmallField({
  name,
  label,
  defaultValue,
  ariaLabel,
  step = "0.01",
}: {
  name: string;
  label: string;
  defaultValue: string;
  ariaLabel: string;
  step?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className={FIELD_LABEL}>{label}</span>
      <input
        name={name}
        type="number"
        step={step}
        min="0"
        defaultValue={defaultValue}
        aria-label={ariaLabel}
        className={`${FIELD} w-28`}
      />
    </div>
  );
}
