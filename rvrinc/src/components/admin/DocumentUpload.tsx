"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Upload, Loader2 } from "lucide-react";

interface Props {
    userId: string;
    cases: { id: string; title: string; case_number: string }[];
}

export function DocumentUpload({ userId, cases }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [caseId, setCaseId] = useState("");
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const supabase = createClient();

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !caseId) return;
        setUploading(true);
        setMessage("");

        const filePath = `${caseId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
            .from("case-documents")
            .upload(filePath, file);

        if (uploadError) {
            setMessage("Upload failed: " + uploadError.message);
            setUploading(false);
            return;
        }

        const { error: dbError } = await supabase.from("documents").insert({
            case_id: caseId,
            name: file.name,
            file_path: filePath,
            uploaded_by: userId,
        });

        if (dbError) {
            setMessage("Failed to save document record: " + dbError.message);
        } else {
            setMessage("Document uploaded successfully.");
            setFile(null);
            setCaseId("");
        }
        setUploading(false);
    };

    return (
        <form onSubmit={handleUpload} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Case</label>
                <select
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none"
                >
                    <option value="">Choose a case...</option>
                    {cases.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.case_number} — {c.title}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                    className="w-full"
                />
            </div>

            {message && (
                <p className={`text-sm ${message.includes("failed") ? "text-red-600" : "text-green-600"}`}>
                    {message}
                </p>
            )}

            <Button type="submit" disabled={uploading || !file || !caseId}>
                {uploading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                ) : (
                    <><Upload className="w-4 h-4 mr-2" /> Upload Document</>
                )}
            </Button>
        </form>
    );
}
