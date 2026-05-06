"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EnquiryForm from "@/components/EnquiryForm";

export default function NewEnquiryPage() {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    setSaving(true);
    const res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push("/admin/enquiries");
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-brand-navy">New Enquiry</h1>
      <div className="max-w-2xl rounded-2xl border border-gray-200 bg-white p-8">
        <EnquiryForm onSubmit={handleSubmit} saving={saving} />
      </div>
    </div>
  );
}
