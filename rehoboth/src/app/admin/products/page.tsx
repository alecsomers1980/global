"use client";

import { useEffect, useState } from "react";
import { useAdminToken } from "../AdminGate";
import { rands } from "@/lib/money";
import {
  listProducts,
  saveProduct,
  saveVariant,
  type AdminProduct,
  type ProductCopy,
} from "../actions";

const TH = "border-b border-hairline px-3 py-3 text-left text-[12px] uppercase tracking-[0.08em] text-ink-mute";
const TD = "border-b border-hairline px-3 py-3 align-top text-ink";
const FIELD =
  "min-h-[44px] w-full border border-hairline bg-white px-3 py-2 text-[14px] text-ink focus:border-brand focus:outline-none";
const SMALL_BTN =
  "min-h-[40px] border border-hairline px-3 text-[13px] text-ink-soft hover:border-brand hover:text-brand disabled:opacity-50";

export default function AdminProductsPage() {
  const token = useAdminToken();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  async function onSaveProduct(id: string, form: HTMLFormElement) {
    setBusy(true);
    setError(null);
    setSaved(null);
    const fd = new FormData(form);
    const fields: ProductCopy = {
      name: String(fd.get("name") ?? ""),
      botanical_name: String(fd.get("botanical_name") ?? ""),
      summary: String(fd.get("summary") ?? ""),
      traditional_use: String(fd.get("traditional_use") ?? ""),
      ingredients: String(fd.get("ingredients") ?? ""),
      directions: String(fd.get("directions") ?? ""),
      storage: String(fd.get("storage") ?? ""),
      active: fd.get("active") === "on",
    };
    const result = await saveProduct(token, id, fields);
    if (result.ok) {
      setSaved(`Saved ${fields.name}.`);
      await load();
    } else {
      setError(result.error);
    }
    setBusy(false);
  }

  async function onSaveVariant(id: string, form: HTMLFormElement) {
    setBusy(true);
    setError(null);
    setSaved(null);
    const fd = new FormData(form);
    const trade = String(fd.get("price_trade") ?? "").trim();
    const stock = String(fd.get("stock") ?? "").trim();
    const result = await saveVariant(token, id, {
      price_retail: Number(fd.get("price_retail")),
      price_trade: trade === "" ? null : Number(trade),
      stock: stock === "" ? null : Number(stock),
      active: fd.get("variant_active") === "on",
    });
    if (result.ok) {
      setSaved("Saved.");
      await load();
    } else {
      setError(result.error);
    }
    setBusy(false);
  }

  if (loading) return <p className="mt-10 text-ink-mute">Loading…</p>;

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Products</h1>
      <p className="mt-3 max-w-[640px] text-[15px] leading-relaxed text-ink-soft">
        Copy is checked before it saves. We may describe the plant and how it is
        traditionally used, but not what it treats — a save naming a condition
        will be refused and will tell you which words to change.
      </p>

      {error && (
        <div role="alert" className="mt-6 border-l-2 border-red-700 bg-red-50 p-3 text-[14px] text-red-800">
          {error}
        </div>
      )}
      {saved && (
        <p role="status" className="mt-6 border-l-2 border-brand bg-surface p-3 text-[14px] text-ink-soft">
          {saved}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-4">
        {products.map((p) => (
          <div key={p.id} className="border border-hairline bg-white">
            <button
              type="button"
              onClick={() => setOpenId(openId === p.id ? null : p.id)}
              aria-expanded={openId === p.id}
              className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <span className="font-display text-xl text-ink">{p.name}</span>
              <span className="text-[13px] text-ink-mute">
                {p.product_variants.length} size{p.product_variants.length === 1 ? "" : "s"}
                {" · "}
                {p.active ? "on the site" : "hidden"}
              </span>
            </button>

            {openId === p.id && (
              <div className="border-t border-hairline px-5 py-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSaveProduct(p.id, e.currentTarget);
                  }}
                  className="flex flex-col gap-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field name="name" label="Name" defaultValue={p.name} />
                    <Field name="botanical_name" label="Botanical name" defaultValue={p.botanical_name ?? ""} />
                  </div>
                  <Area name="summary" label="Summary" defaultValue={p.summary ?? ""} />
                  <Area name="traditional_use" label="Traditional use" defaultValue={p.traditional_use ?? ""} />
                  <Area name="ingredients" label="Ingredients" defaultValue={p.ingredients ?? ""} rows={2} />
                  <Area name="directions" label="Directions" defaultValue={p.directions ?? ""} rows={2} />
                  <Area name="storage" label="Storage" defaultValue={p.storage ?? ""} rows={2} />

                  <label className="flex items-center gap-2 text-[14px] text-ink-soft">
                    <input type="checkbox" name="active" defaultChecked={p.active} className="h-4 w-4" />
                    Show this product on the site
                  </label>

                  <button type="submit" disabled={busy} className={`${SMALL_BTN} w-fit`}>
                    {busy ? "Saving…" : "Save product"}
                  </button>
                </form>

                <div className="mt-8 overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse text-[14px]">
                    <thead>
                      <tr>
                        <th className={TH}>Size</th>
                        <th className={TH}>Retail</th>
                        <th className={TH}>Trade</th>
                        <th className={TH}>Stock</th>
                        <th className={TH}>On sale</th>
                        <th className={TH} />
                      </tr>
                    </thead>
                    <tbody>
                      {p.product_variants.map((v) => (
                        <tr key={v.id}>
                          <td className={TD}>
                            {v.size_label}
                            <div className="text-[13px] text-ink-mute">{rands(Number(v.price_retail))}</div>
                          </td>
                          <td className={TD} colSpan={5}>
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                onSaveVariant(v.id, e.currentTarget);
                              }}
                              className="flex flex-wrap items-center gap-3"
                            >
                              <input
                                name="price_retail"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={Number(v.price_retail)}
                                aria-label={`Retail price for ${v.size_label}`}
                                className={`${FIELD} w-28`}
                              />
                              <input
                                name="price_trade"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={v.price_trade == null ? "" : Number(v.price_trade)}
                                placeholder="Trade"
                                aria-label={`Trade price for ${v.size_label}`}
                                className={`${FIELD} w-28`}
                              />
                              <input
                                name="stock"
                                type="number"
                                step="1"
                                defaultValue={v.stock == null ? "" : v.stock}
                                placeholder="Stock"
                                aria-label={`Stock for ${v.size_label}`}
                                className={`${FIELD} w-24`}
                              />
                              <label className="flex items-center gap-2 text-[13px] text-ink-soft">
                                <input
                                  type="checkbox"
                                  name="variant_active"
                                  defaultChecked={v.active}
                                  className="h-4 w-4"
                                />
                                On sale
                              </label>
                              <button type="submit" disabled={busy} className={SMALL_BTN}>
                                Save
                              </button>
                            </form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-[13px] uppercase tracking-[0.08em] text-ink-mute">
        {label}
      </label>
      <input id={name} name={name} defaultValue={defaultValue} className={FIELD} />
    </div>
  );
}

function Area({
  name, label, defaultValue, rows = 3,
}: { name: string; label: string; defaultValue: string; rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-[13px] uppercase tracking-[0.08em] text-ink-mute">
        {label}
      </label>
      <textarea id={name} name={name} rows={rows} defaultValue={defaultValue} className={FIELD} />
    </div>
  );
}
