"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerControls({
  customerId,
  fullName,
  phone,
  email,
}: {
  customerId: string;
  fullName: string;
  phone: string;
  email: string;
}) {
  const router = useRouter();

  const [editName, setEditName] = useState(fullName);
  const [editPhone, setEditPhone] = useState(phone);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setEditError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: editName, phone: editPhone }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not save");
      setSaved(true);
      router.refresh();
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setResetLoading(true);
    setResetError(null);
    setResetSent(false);
    try {
      const res = await fetch(
        `/api/admin/customers/${customerId}/reset-password`,
        { method: "POST" }
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not send reset email");
      setResetSent(true);
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: "DELETE",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not delete");
      router.push("/admin/customers");
      router.refresh();
    } catch (err: any) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div className="bg-white border border-line rounded-2xl p-4 space-y-6">
      <form onSubmit={handleSave} className="space-y-3">
        <h2 className="text-sm font-medium text-ink">Edit customer</h2>
        <div>
          <label htmlFor="cust-name" className="block text-xs text-muted mb-1">
            Full name
          </label>
          <input
            id="cust-name"
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink"
          />
        </div>
        <div>
          <label htmlFor="cust-phone" className="block text-xs text-muted mb-1">
            Phone
          </label>
          <input
            id="cust-phone"
            type="tel"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink"
          />
        </div>
        {editError && <p className="text-sm text-red-600">{editError}</p>}
        {saved && <p className="text-sm text-forest">Saved</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-forest text-paper px-4 py-2 text-sm font-semibold hover:bg-moss transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>

      <div className="border-t border-line pt-4 space-y-2">
        <h2 className="text-sm font-medium text-ink">Password</h2>
        <p className="text-xs text-muted">
          Emails the customer a link to choose a new password. You never see it.
        </p>
        <button
          onClick={handleReset}
          disabled={resetLoading}
          className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-surface-2 transition-colors disabled:opacity-50"
        >
          {resetLoading ? "Sending…" : "Send password reset"}
        </button>
        {resetSent && (
          <p className="text-sm text-forest">Reset email sent to {email}</p>
        )}
        {resetError && <p className="text-sm text-red-600">{resetError}</p>}
      </div>

      <div className="border-t border-line pt-4 space-y-2">
        <h2 className="text-sm font-medium text-ink">Delete customer</h2>
        {confirmingDelete ? (
          <>
            <p className="text-sm text-ink">
              Delete this customer? Their past orders are kept for your records.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-full bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                onClick={() => {
                  setConfirmingDelete(false);
                  setDeleteError(null);
                }}
                className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete customer
          </button>
        )}
        {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
      </div>
    </div>
  );
}
