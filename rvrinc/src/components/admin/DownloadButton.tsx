"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Download, Loader2 } from "lucide-react";

export function DownloadButton({ filePath }: { filePath: string }) {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleDownload = async () => {
        setLoading(true);
        const { data } = await supabase.storage
            .from("case-documents")
            .createSignedUrl(filePath, 60);

        if (data?.signedUrl) {
            window.open(data.signedUrl, "_blank");
        }
        setLoading(false);
    };

    return (
        <Button variant="ghost" size="sm" onClick={handleDownload} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        </Button>
    );
}
