"use client";

import { useState, FormEvent } from "react";
import { Requester, Performance, Category } from "@/lib/types";

interface RequestFormProps {
  requester: Requester;
  performances: Performance[];
  categories: Category[];
}

interface FormData {
  guestName: string;
  guestSurname: string;
  performanceId: string;
  categoryId: string;
  guestEmail: string;
  totalSeats: number;
  houseSeats: boolean;
  notes: string;
}

interface FieldErrors {
  [key: string]: string;
}

export default function RequestForm({ requester, performances, categories }: RequestFormProps) {
  const [form, setForm] = useState<FormData>({
    guestName: "",
    guestSurname: "",
    performanceId: performances.length === 1 ? performances[0].id : "",
    categoryId: categories.length === 1 ? categories[0].id : "",
    guestEmail: requester.email ?? "",
    totalSeats: 1,
    houseSeats: false,
    notes: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setForm((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    // Clear error for the field
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};
    if (!form.guestName.trim()) newErrors.guestName = "Guest name is required.";
    if (!form.guestSurname.trim()) newErrors.guestSurname = "Guest surname is required.";
    if (!form.performanceId) newErrors.performanceId = "Please select a performance.";
    if (!form.categoryId) newErrors.categoryId = "Please select a category.";
    if (!form.guestEmail.trim()) {
      newErrors.guestEmail = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail)) {
      newErrors.guestEmail = "Please enter a valid email.";
    }
    if (form.totalSeats < 1) newErrors.totalSeats = "Must request at least 1 seat.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        requesterId: requester.id,
        guestName: form.guestName.trim(),
        guestSurname: form.guestSurname.trim(),
        performanceId: form.performanceId,
        categoryId: form.categoryId,
        guestEmail: form.guestEmail.trim(),
        totalSeats: form.totalSeats,
        houseSeats: form.houseSeats,
        notes: form.notes.trim(),
      };

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const body = await res.json().catch(() => ({}));
        alert(body.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      alert("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-[3px] border border-mv-navy-muted bg-white p-8 text-center shadow-sm">
        <div className="text-3xl text-mv-mint mb-4">✓</div>
        <h2 className="font-heading text-xl font-bold text-mv-navy">
          Request submitted — status: REQUEST
        </h2>
        <p className="mt-2 text-mv-navy-muted">
          A member of our team will review your request soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[3px] border border-mv-navy-muted bg-white p-6 shadow-sm">
      {/* Guest Name */}
      <div>
        <label htmlFor="guestName" className="block text-sm font-medium text-mv-navy">
          Guest Name *
        </label>
        <input
          type="text"
          id="guestName"
          name="guestName"
          value={form.guestName}
          onChange={handleChange}
          className="mt-1 block w-full rounded-[3px] border border-mv-navy-muted p-2 text-mv-navy focus:border-mv-blue focus:ring-2 focus:ring-mv-blue focus:outline-none"
          placeholder="First name of the guest"
        />
        {errors.guestName && <p className="mt-1 text-sm text-red-600">{errors.guestName}</p>}
      </div>

      {/* Guest Surname */}
      <div>
        <label htmlFor="guestSurname" className="block text-sm font-medium text-mv-navy">
          Guest Surname *
        </label>
        <input
          type="text"
          id="guestSurname"
          name="guestSurname"
          value={form.guestSurname}
          onChange={handleChange}
          className="mt-1 block w-full rounded-[3px] border border-mv-navy-muted p-2 text-mv-navy focus:border-mv-blue focus:ring-2 focus:ring-mv-blue focus:outline-none"
          placeholder="Last name of the guest"
        />
        {errors.guestSurname && <p className="mt-1 text-sm text-red-600">{errors.guestSurname}</p>}
      </div>

      {/* Performance Select */}
      <div>
        <label htmlFor="performanceId" className="block text-sm font-medium text-mv-navy">
          Performance *
        </label>
        <select
          id="performanceId"
          name="performanceId"
          value={form.performanceId}
          onChange={handleChange}
          className="mt-1 block w-full rounded-[3px] border border-mv-navy-muted bg-white p-2 text-mv-navy focus:border-mv-blue focus:ring-2 focus:ring-mv-blue focus:outline-none"
        >
          <option value="" disabled>
            Select a performance
          </option>
          {performances.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        {errors.performanceId && <p className="mt-1 text-sm text-red-600">{errors.performanceId}</p>}
      </div>

      {/* Category Select */}
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-mv-navy">
          Category *
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          className="mt-1 block w-full rounded-[3px] border border-mv-navy-muted bg-white p-2 text-mv-navy focus:border-mv-blue focus:ring-2 focus:ring-mv-blue focus:outline-none"
        >
          <option value="" disabled>
            Select a ticket category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
      </div>

      {/* Guest Email */}
      <div>
        <label htmlFor="guestEmail" className="block text-sm font-medium text-mv-navy">
          Guest Email *
        </label>
        <input
          type="email"
          id="guestEmail"
          name="guestEmail"
          value={form.guestEmail}
          onChange={handleChange}
          className="mt-1 block w-full rounded-[3px] border border-mv-navy-muted p-2 text-mv-navy focus:border-mv-blue focus:ring-2 focus:ring-mv-blue focus:outline-none"
          placeholder="guest@example.com"
        />
        {errors.guestEmail && <p className="mt-1 text-sm text-red-600">{errors.guestEmail}</p>}
      </div>

      {/* Total Seats */}
      <div>
        <label htmlFor="totalSeats" className="block text-sm font-medium text-mv-navy">
          Total Seats Requested *
        </label>
        <input
          type="number"
          id="totalSeats"
          name="totalSeats"
          min={1}
          value={form.totalSeats}
          onChange={handleChange}
          className="mt-1 block w-32 rounded-[3px] border border-mv-navy-muted p-2 text-mv-navy focus:border-mv-blue focus:ring-2 focus:ring-mv-blue focus:outline-none"
        />
        {errors.totalSeats && <p className="mt-1 text-sm text-red-600">{errors.totalSeats}</p>}
      </div>

      {/* House Seats */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="houseSeats"
          name="houseSeats"
          checked={form.houseSeats}
          onChange={handleChange}
          className="h-4 w-4 rounded-[3px] border-mv-navy-muted text-mv-blue focus:ring-mv-blue"
        />
        <label htmlFor="houseSeats" className="text-sm font-medium text-mv-navy">
          House Seats
        </label>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-mv-navy">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={form.notes}
          onChange={handleChange}
          className="mt-1 block w-full rounded-[3px] border border-mv-navy-muted p-2 text-mv-navy focus:border-mv-blue focus:ring-2 focus:ring-mv-blue focus:outline-none"
          placeholder="Any special requests or information..."
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-[3px] bg-mv-blue px-4 py-2 font-semibold text-white transition-colors hover:bg-mv-navy focus:outline-none focus:ring-2 focus:ring-mv-blue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}