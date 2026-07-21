"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type Address = {
  id: string;
  user_id: string;
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  province: string;
  postal_code: string;
  collection_point: string | null;
  is_default: boolean;
  created_at: string;
};

const emptyForm = {
  label: "",
  recipient: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  province: "",
  postal_code: "",
};

export default function AddressesPage() {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("customer_addresses")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (!error && data) setAddresses(data as Address[]);
  }, [supabase, user]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchAddresses().finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    };
    getUser();
  }, [supabase, fetchAddresses]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.line1.trim()) {
      setMessage({
        type: "error",
        text: "Street address (Line 1) is required.",
      });
      return;
    }
    setSaving(true);
    const payload = {
      user_id: user.id,
      label: form.label.trim() || null,
      recipient: form.recipient.trim() || null,
      phone: form.phone.trim() || null,
      line1: form.line1.trim(),
      line2: form.line2.trim() || null,
      city: form.city.trim() || null,
      province: form.province.trim() || null,
      postal_code: form.postal_code.trim() || null,
    };

    let error = null;
    if (editingId) {
      const { error: e } = await supabase
        .from("customer_addresses")
        .update(payload)
        .eq("id", editingId);
      error = e;
    } else {
      const { error: e } = await supabase
        .from("customer_addresses")
        .insert(payload);
      error = e;
    }

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Address saved." });
      await fetchAddresses();
      resetForm();
    }
    setSaving(false);
  };

  const handleEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({
      label: addr.label || "",
      recipient: addr.recipient || "",
      phone: addr.phone || "",
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      city: addr.city || "",
      province: addr.province || "",
      postal_code: addr.postal_code || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("customer_addresses")
      .delete()
      .eq("id", id);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Address deleted." });
      await fetchAddresses();
    }
    setDeleteConfirm(null);
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    // clear defaults
    await supabase
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
    const { error } = await supabase
      .from("customer_addresses")
      .update({ is_default: true })
      .eq("id", id);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Default address updated." });
      await fetchAddresses();
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-line rounded" />
        <div className="space-y-4">
          <div className="h-40 bg-line rounded-2xl" />
          <div className="h-40 bg-line rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-serif text-ink">My addresses</h1>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-surface-2 transition-colors"
          >
            Add address
          </button>
        )}
      </div>

      {message && (
        <div
          className={`text-sm ${
            message.type === "success" ? "text-forest" : "text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-paper border border-line rounded-2xl p-6 shadow-sm space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink mb-1">Label</label>
              <input
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. Home"
              />
            </div>
            <div>
              <label className="block text-sm text-ink mb-1">Recipient</label>
              <input
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
                value={form.recipient}
                onChange={(e) =>
                  setForm({ ...form, recipient: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-ink mb-1">Phone</label>
              <input
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-ink mb-1">Address line 1*</label>
              <input
                required
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-ink mb-1">Address line 2</label>
              <input
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
                value={form.line2}
                onChange={(e) => setForm({ ...form, line2: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-ink mb-1">City</label>
              <input
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-ink mb-1">Province</label>
              <input
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
                value={form.province}
                onChange={(e) =>
                  setForm({ ...form, province: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-ink mb-1">Postal code</label>
              <input
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
                value={form.postal_code}
                onChange={(e) =>
                  setForm({ ...form, postal_code: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-forest text-white px-5 py-2.5 text-sm font-semibold hover:bg-moss transition-colors disabled:opacity-50"
            >
              {editingId ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="bg-paper border border-line rounded-2xl p-6 shadow-sm text-center text-muted">
          No saved addresses yet.
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-paper border border-line rounded-2xl p-6 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-ink">
                      {addr.label || "Address"}
                    </span>
                    {addr.is_default && (
                      <span className="bg-forest text-paper rounded-full px-2 py-0.5 text-xs">
                        Default
                      </span>
                    )}
                  </div>
                  {addr.recipient && (
                    <p className="text-sm text-ink">
                      {addr.recipient}
                      {addr.phone ? ` · ${addr.phone}` : ""}
                    </p>
                  )}
                  <div className="text-sm text-muted mt-1">
                    {[addr.line1, addr.line2, addr.city, addr.province]
                      .filter(Boolean)
                      .map((line, i) => (
                        <span key={i}>
                          {line}
                          {i <
                          [addr.line1, addr.line2, addr.city, addr.province]
                            .filter(Boolean)
                            .length -
                            1
                            ? ", "
                            : ""}
                        </span>
                      ))}
                    {addr.postal_code && ` ${addr.postal_code}`}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => handleEdit(addr)}
                    className="text-sm text-muted hover:text-ink"
                  >
                    Edit
                  </button>
                  {deleteConfirm === addr.id ? (
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-red-600">Delete?</span>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        className="text-red-600 font-medium"
                      >
                        Yes, delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-muted ml-1"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(addr.id)}
                      className="text-sm text-muted hover:text-red-600"
                    >
                      Delete
                    </button>
                  )}
                  {!addr.is_default && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-sm text-muted hover:text-ink"
                    >
                      Set as default
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
