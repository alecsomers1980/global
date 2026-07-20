"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Dealer } from "@/lib/dealer-types";
import { PROVINCES, COUNTRIES, SOUTH_AFRICA } from "@/lib/dealer-types";

type Props = {
  dealer?: Dealer;
};

export default function DealerForm({ dealer }: Props) {
  const router = useRouter();
  const isEdit = !!dealer;

  const [name, setName] = useState(dealer?.name ?? "");
  const [business, setBusiness] = useState(dealer?.business ?? "");
  const [country, setCountry] = useState(dealer?.country ?? SOUTH_AFRICA);
  const [province, setProvince] = useState(dealer?.province ?? "");
  const isSA = country === SOUTH_AFRICA;
  const [region, setRegion] = useState(dealer?.region ?? "");
  const [areas, setAreas] = useState(dealer?.areas?.join(", ") ?? "");
  const [phone, setPhone] = useState(dealer?.phone ?? "");
  const [phoneAlt, setPhoneAlt] = useState(dealer?.phoneAlt ?? "");
  const [email, setEmail] = useState(dealer?.email ?? "");
  const [notes, setNotes] = useState(dealer?.notes ?? "");
  const [isDepot, setIsDepot] = useState(dealer?.isDepot ?? false);
  const [active, setActive] = useState(dealer?.active ?? true);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const body = {
      name,
      business,
      country,
      province: isSA ? province : "",
      region,
      areas,
      phone,
      phone_alt: phoneAlt,
      email,
      notes,
      is_depot: isDepot,
      active,
    };

    const method = isEdit ? "PATCH" : "POST";
    const url = isEdit ? `/api/admin/dealers/${dealer!.id}` : "/api/admin/dealers";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Something went wrong");
      router.push("/admin/dealers");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!dealer) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/dealers/${dealer.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Delete failed");
      router.push("/admin/dealers");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-line rounded-2xl p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs text-muted mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Business</label>
          <input
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink"
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink"
            value={country}
            onChange={(e) => {
              const next = e.target.value;
              setCountry(next);
              // Province is South-Africa-specific — clear it when leaving SA
              // so a stale province can't be saved against another country.
              if (next !== SOUTH_AFRICA) setProvince("");
            }}
            required
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {isSA && (
          <div>
            <label className="block text-xs text-muted mb-1">
              Province <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              required
            >
              <option value="">Select province</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-xs text-muted mb-1">Region</label>
          <input
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-muted mb-1">Towns / Areas</label>
          <input
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink"
            value={areas}
            onChange={(e) => setAreas(e.target.value)}
            placeholder="e.g. Stellenbosch, Paarl"
          />
          <p className="text-xs text-muted mt-1">Separate towns with commas.</p>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Phone</label>
          <input
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Alternate Phone</label>
          <input
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink"
            value={phoneAlt}
            onChange={(e) => setPhoneAlt(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-muted mb-1">Notes</label>
          <textarea
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_depot"
            checked={isDepot}
            onChange={(e) => setIsDepot(e.target.checked)}
            className="h-4 w-4 rounded border-line text-forest focus:ring-forest"
          />
          <label htmlFor="is_depot" className="text-sm text-ink">
            Depot / sales leader
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 rounded border-line text-forest focus:ring-forest"
          />
          <label htmlFor="active" className="text-sm text-ink">
            Show on the website
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      <div className="flex items-center justify-between mt-6">
        {/* Every button in here is type="button" — they live inside the form,
            and the default type is "submit". */}
        <div>
          {isEdit &&
            (confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink">Delete this dealer?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-full bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Yes, delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-surface-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete dealer
              </button>
            ))}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-forest text-paper px-6 py-2.5 text-sm font-semibold hover:bg-moss transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : isEdit ? "Update dealer" : "Create dealer"}
        </button>
      </div>
    </form>
  );
}
