"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Plus, Search, Pencil } from "lucide-react";

interface Enquiry {
  id: string;
  customer_name: string;
  company: string | null;
  phone: string | null;
  status: string;
  priority: string;
  follow_up_date: string | null;
  quote_value: number;
  created_at: string;
  notes: string | null;
}

const statusLabels: Record<string, string> = {
  new: "New",
  warm_lead: "Warm Lead",
  confirmed: "Confirmed",
  on_hold: "On Hold",
  no_answer: "No Answer",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  warm_lead: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  on_hold: "bg-violet-100 text-violet-700",
  no_answer: "bg-gray-100 text-gray-600",
};

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [total, setTotal] = useState(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchEnquiries = useCallback(async (searchTerm: string, status: string) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "200" });
    if (searchTerm) params.set("search", searchTerm);
    if (status !== "all") params.set("status", status);

    try {
      const res = await fetch(`/api/enquiries?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setEnquiries(data);
        setTotal(data.length);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchEnquiries("", "all");
  }, [fetchEnquiries]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchEnquiries(value, statusFilter);
    }, 250);
  };

  // Status filter change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    fetchEnquiries(search, value);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this enquiry?")) return;
    await fetch(`/api/enquiries/${id}`, { method: "DELETE" });
    setEnquiries((prev) => prev.filter((e) => e.id !== id));
    setTotal((prev) => prev - 1);
  };

  const isOverdue = (date: string | null) => {
    if (!date) return false;
    return new Date(date) <= new Date();
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Enquiries</h1>
          <p className="text-sm text-brand-navy/50">
            {loading ? "Loading..." : `${total} enquiries found`}
          </p>
        </div>
        <Link
          href="/admin/enquiries/new"
          className="inline-flex items-center gap-2 rounded-full bg-brand-teal px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-teal/90 hover:shadow-lg hover:shadow-brand-teal/20 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          New Enquiry
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, company, area, notes..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm transition-all focus:border-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/10"
          />
          {search && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-all focus:border-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/10"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="warm_lead">Warm Lead</option>
          <option value="confirmed">Confirmed</option>
          <option value="on_hold">On Hold</option>
          <option value="no_answer">No Answer</option>
        </select>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="mb-4 flex items-center gap-2 text-sm text-brand-navy/40">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-teal border-t-transparent" />
          Searching...
        </div>
      )}

      {/* Enquiries Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-left">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-brand-navy/50">Customer</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-brand-navy/50">Company/Area</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-brand-navy/50">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-brand-navy/50">Priority</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-brand-navy/50">Follow-up</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-brand-navy/50">Quote</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-brand-navy/50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {enquiries.map((enquiry) => (
                <tr key={enquiry.id} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-brand-navy">{enquiry.customer_name}</span>
                  </td>
                  <td className="px-6 py-4 text-brand-navy/60">{enquiry.company || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[enquiry.status] || "bg-gray-100 text-gray-600"}`}>
                      {statusLabels[enquiry.status] || enquiry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium ${enquiry.priority === "high" ? "text-red-600" : "text-gray-500"}`}>
                      {enquiry.priority === "high" ? "High" : "Standard"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {enquiry.follow_up_date ? (
                      <span className={isOverdue(enquiry.follow_up_date) ? "font-semibold text-red-600" : "text-brand-navy/60"}>
                        {new Date(enquiry.follow_up_date).toLocaleDateString()}
                        {isOverdue(enquiry.follow_up_date) && " ⚠"}
                      </span>
                    ) : (
                      <span className="text-brand-navy/30">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-brand-navy">
                    {enquiry.quote_value ? `R ${enquiry.quote_value.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {enquiry.phone && (
                        <a
                          href={`https://wa.me/${enquiry.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${enquiry.customer_name}, following up on your HVAC enquiry with Exec-Air.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-2 text-brand-navy/30 transition-colors hover:bg-green-50 hover:text-green-600"
                          title={`WhatsApp ${enquiry.customer_name}`}
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                          </svg>
                        </a>
                      )}
                      <Link
                        href={`/admin/enquiries/${enquiry.id}`}
                        className="rounded-lg p-2 text-brand-navy/40 transition-colors hover:bg-brand-teal/10 hover:text-brand-teal"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(enquiry.id)}
                        className="rounded-lg p-2 text-brand-navy/40 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Delete"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && enquiries.length === 0 && (
          <p className="px-6 py-12 text-center text-sm text-brand-navy/40">
            {search ? "No enquiries match your search" : "No enquiries yet"}
          </p>
        )}
      </div>
    </div>
  );
}
