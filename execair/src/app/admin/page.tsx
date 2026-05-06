"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  PhoneOff,
  AlertTriangle,
  Plus,
  ArrowRight,
  Send,
} from "lucide-react";

interface Enquiry {
  id: string;
  customer_name: string;
  company: string | null;
  status: string;
  priority: string;
  follow_up_date: string | null;
  quote_value: number;
  actual_value: number;
  created_at: string;
}

interface Stats {
  total: number;
  warmLeads: number;
  confirmed: number;
  onHold: number;
  noAnswer: number;
  highPriority: number;
  totalQuoteValue: number;
  totalActualValue: number;
  dueFollowUps: Enquiry[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingReport, setSendingReport] = useState(false);
  const [reportStatus, setReportStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/enquiries?limit=100")
      .then((r) => r.json())
      .then((data: Enquiry[]) => {
        const s: Stats = {
          total: data.length,
          warmLeads: data.filter((e) => e.status === "warm_lead").length,
          confirmed: data.filter((e) => e.status === "confirmed").length,
          onHold: data.filter((e) => e.status === "on_hold").length,
          noAnswer: data.filter((e) => e.status === "no_answer").length,
          highPriority: data.filter((e) => e.priority === "high").length,
          totalQuoteValue: data.reduce((sum, e) => sum + (e.quote_value || 0), 0),
          totalActualValue: data.reduce((sum, e) => sum + (e.actual_value || 0), 0),
          dueFollowUps: data
            .filter((e) => e.follow_up_date && new Date(e.follow_up_date) <= new Date() && e.status !== "confirmed")
            .sort((a, b) => new Date(a.follow_up_date!).getTime() - new Date(b.follow_up_date!).getTime()),
        };
        setStats(s);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-teal border-t-transparent" />
      </div>
    );
  }

  const cards = [
    { label: "Total Enquiries", value: stats?.total ?? 0, icon: FileText, color: "bg-blue-500" },
    { label: "Warm Leads", value: stats?.warmLeads ?? 0, icon: TrendingUp, color: "bg-amber-500" },
    { label: "Confirmed", value: stats?.confirmed ?? 0, icon: CheckCircle, color: "bg-emerald-500" },
    { label: "On Hold", value: stats?.onHold ?? 0, icon: Clock, color: "bg-violet-500" },
    { label: "No Answer", value: stats?.noAnswer ?? 0, icon: PhoneOff, color: "bg-gray-500" },
    { label: "High Priority", value: stats?.highPriority ?? 0, icon: AlertTriangle, color: "bg-red-500" },
  ];

  const handleSendReport = async () => {
    setSendingReport(true);
    setReportStatus(null);
    try {
      const res = await fetch("/api/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        setReportStatus(`Report sent! ${data.sent} follow-ups emailed.`);
      } else if (data.sent === 0) {
        setReportStatus("No follow-ups due right now.");
      } else {
        setReportStatus(`Error: ${data.error || "Failed to send"}`);
      }
    } catch {
      setReportStatus("Failed to send report. Check Resend API key.");
    } finally {
      setSendingReport(false);
      setTimeout(() => setReportStatus(null), 8000);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Dashboard</h1>
          <p className="text-sm text-brand-navy/50">Monthly Enquiry Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSendReport}
            disabled={sendingReport}
            className="inline-flex items-center gap-2 rounded-full border border-brand-teal px-5 py-2.5 text-sm font-semibold text-brand-teal transition-all hover:bg-brand-teal/5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {sendingReport ? "Sending..." : "Send Report"}
          </button>
          <Link
            href="/admin/enquiries/new"
            className="inline-flex items-center gap-2 rounded-full bg-brand-teal px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-teal/90 hover:shadow-lg hover:shadow-brand-teal/20 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            New Enquiry
          </Link>
        </div>
        {reportStatus && (
          <div className="mt-4 rounded-xl bg-brand-sky/30 px-4 py-3 text-sm font-medium text-brand-teal">
            {reportStatus}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-md">
            <div className="mb-3 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color} bg-opacity-10`}>
                <card.icon className={`h-5 w-5 ${card.color.replace("bg-", "text-")}`} />
              </div>
              <span className="text-sm font-medium text-brand-navy/50">{card.label}</span>
            </div>
            <p className="text-3xl font-bold text-brand-navy">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Summary */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-brand-teal/20 bg-gradient-to-r from-brand-teal/5 to-brand-sky/20 p-6">
          <p className="text-sm font-medium text-brand-navy/50">Total Quote Value</p>
          <p className="text-3xl font-bold text-brand-navy">
            R {stats?.totalQuoteValue.toLocaleString() ?? "0"}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-50/50 p-6">
          <p className="text-sm font-medium text-brand-navy/50">Actual Revenue</p>
          <p className="text-3xl font-bold text-emerald-600">
            R {stats?.totalActualValue.toLocaleString() ?? "0"}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-50/50 p-6">
          <p className="text-sm font-medium text-brand-navy/50">Conversion Rate</p>
          <p className="text-3xl font-bold text-amber-600">
            {stats ? (
              stats.confirmed > 0 && stats.totalQuoteValue > 0
                ? `${Math.round((stats.totalActualValue / stats.totalQuoteValue) * 100)}%`
                : "—"
            ) : "0"}
          </p>
          <p className="text-xs text-brand-navy/40 mt-1">
            {stats?.confirmed ?? 0} confirmed of {stats?.total ?? 0} enquiries
          </p>
        </div>
      </div>

      {/* Due Follow-ups */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-bold text-brand-navy">Due for Follow-up</h2>
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
            {stats?.dueFollowUps.length ?? 0} overdue
          </span>
        </div>
        {stats?.dueFollowUps && stats.dueFollowUps.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {stats.dueFollowUps.slice(0, 10).map((enquiry) => (
              <Link
                key={enquiry.id}
                href={`/admin/enquiries/${enquiry.id}`}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold text-brand-navy">{enquiry.customer_name}</p>
                  <p className="text-sm text-brand-navy/50">
                    {enquiry.company || "No company"} &middot; Due{" "}
                    {new Date(enquiry.follow_up_date!).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    enquiry.priority === "high"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {enquiry.priority === "high" ? "High Priority" : "Standard"}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="px-6 py-8 text-center text-sm text-brand-navy/40">
            No overdue follow-ups — great work!
          </p>
        )}
      </div>
    </div>
  );
}
