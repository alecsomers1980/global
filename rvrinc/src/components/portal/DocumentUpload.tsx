"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { Upload, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DocumentUpload({
    userId,
    cases
}: {
    userId: string,
    cases?: any[]
}) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [caseId, setCaseId] = useState<string>("");
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !caseId) return;

        setUploading(true);
        try {
            // 1. Upload to Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${userId}/${caseId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('case-documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Create DB Record
            const { error: dbError } = await supabase
                .from('documents')
                .insert({
                    case_id: caseId,
                    name: file.name,
                    file_path: filePath,
                    uploaded_by: userId
                });

            if (dbError) throw dbError;

            setSuccess(true);
            router.refresh();

            // Reset after delay
            setTimeout(() => {
                setOpen(false);
                setSuccess(false);
                setFile(null);
                setCaseId("");
                setUploading(false);
            }, 1500);

        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Please try again.");
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="brand">
                    <Upload className="w-4 h-4 mr-2" /> Upload Document
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                </DialogHeader>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-8 text-green-600">
                        <CheckCircle2 className="w-12 h-12 mb-4" />
                        <p className="font-semibold">Upload Successful!</p>
                    </div>
                ) : (
                    <div className="space-y-6 pt-4">

                        <div className="space-y-2">
                            <Label>Select Case</Label>
                            <Select
                                value={caseId}
                                onChange={(e) => setCaseId(e.target.value)}
                                className="w-full"
                            >
                                <option value="" disabled>Select a case...</option>
                                {cases?.map((c) => (
                                    <option key={c.id} value={c.id}>{c.title} (#{c.case_number})</option>
                                ))}
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>File</Label>
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-2">
                                    <FileText className="w-8 h-8 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        {file ? file.name : "Click to select a file"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button
                                variant="brand"
                                disabled={!file || !caseId || uploading}
                                onClick={handleUpload}
                            >
                                {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {uploading ? "Uploading..." : "Upload"}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
