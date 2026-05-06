"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EnquiryForm from "@/components/EnquiryForm";

export default function EditEnquiryPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/enquiries/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("Enquiry not found"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSubmit = async (formData: any) => {
    setSaving(true);
    const res = await fetch(`/api/enquiries/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      router.push("/admin/enquiries");
      router.refresh();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-teal border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return <p className="py-16 text-center text-red-500">{error}</p>;
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-brand-navy">Edit Enquiry</h1>
      <div className="max-w-2xl rounded-2xl border border-gray-200 bg-white p-8">
        <EnquiryForm onSubmit={handleSubmit} initialData={data} saving={saving} />
      </div>
    </div>
  );
}
