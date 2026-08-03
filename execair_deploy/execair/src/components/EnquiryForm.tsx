"use client";

import { useState } from "react";

interface EnquiryFormData {
  customer_name: string;
  company: string;
  phone: string;
  email: string;
  enquiry_details: string;
  quote_value: string;
  actual_value: string;
  status: string;
  priority: string;
  follow_up_date: string;
  notes: string;
}

interface EnquiryFormProps {
  onSubmit: (data: EnquiryFormData) => Promise<void>;
  initialData?: Partial<EnquiryFormData>;
  saving: boolean;
}

const defaultData: EnquiryFormData = {
  customer_name: "",
  company: "",
  phone: "",
  email: "",
  enquiry_details: "",
  quote_value: "",
  status: "new",
  priority: "standard",
  follow_up_date: "",
  actual_value: "",
  notes: "",
};

export default function EnquiryForm({ onSubmit, initialData, saving }: EnquiryFormProps) {
  const [form, setForm] = useState<EnquiryFormData>({
    ...defaultData,
    ...initialData,
    quote_value: initialData?.quote_value?.toString() || "",
    actual_value: (initialData as any)?.actual_value?.toString() || "",
    follow_up_date: initialData?.follow_up_date?.split("T")[0] || "",
  });

  const handleChange = (field: keyof EnquiryFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...form, quote_value: form.quote_value || "0", actual_value: form.actual_value || "0" });
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-brand-navy transition-all placeholder:text-gray-400 focus:border-brand-teal focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-teal/10";

  const labelClass = "mb-1.5 block text-sm font-medium text-brand-navy";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Customer Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.customer_name}
            onChange={(e) => handleChange("customer_name", e.target.value)}
            className={inputClass}
            placeholder="Full name"
          />
        </div>
        <div>
          <label className={labelClass}>Company</label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => handleChange("company", e.target.value)}
            className={inputClass}
            placeholder="Company name"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Phone</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className={inputClass}
            placeholder="Contact number"
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={inputClass}
            placeholder="Email address"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Enquiry Details</label>
        <textarea
          rows={3}
          value={form.enquiry_details}
          onChange={(e) => handleChange("enquiry_details", e.target.value)}
          className={inputClass + " resize-none"}
          placeholder="What is the customer looking for?"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={labelClass}>Quote Value (R)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.quote_value}
            onChange={(e) => handleChange("quote_value", e.target.value)}
            className={inputClass}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className={labelClass}>Actual Value (R) <span className="text-xs text-brand-navy/40">— when confirmed</span></label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.actual_value}
            onChange={(e) => handleChange("actual_value", e.target.value)}
            className={`${inputClass} ${form.status === "confirmed" ? "border-emerald-300 bg-emerald-50 font-semibold text-emerald-700" : ""}`}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select
            value={form.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className={inputClass}
          >
            <option value="new">New</option>
            <option value="warm_lead">Warm Lead</option>
            <option value="confirmed">Confirmed</option>
            <option value="on_hold">On Hold</option>
            <option value="no_answer">No Answer</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Priority</label>
          <select
            value={form.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
            className={inputClass}
          >
            <option value="standard">Standard</option>
            <option value="high">High Priority</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Follow-up Date</label>
          <input
            type="date"
            value={form.follow_up_date}
            onChange={(e) => handleChange("follow_up_date", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          rows={6}
          value={form.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          className={inputClass + " resize-y"}
          placeholder="Internal notes..."
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-teal px-8 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-teal/90 hover:shadow-lg hover:shadow-brand-teal/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Enquiry"}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-full border border-gray-200 px-8 py-2.5 text-sm font-medium text-brand-navy/60 transition-all hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
