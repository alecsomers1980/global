"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Download, Loader2 } from "lucide-react";
import { getSignedUrl } from "@/app/portal/actions";
import { cn } from "@/lib/utils";

interface DownloadButtonProps {
    filePath: string;
    className?: string;
}

export function DownloadButton({ filePath, className }: DownloadButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const { signedUrl, error } = await getSignedUrl(filePath);

            if (error) {
                alert("Failed to get download link via signed URL.");
                console.error(error);
                return;
            }

            if (signedUrl) {
                // Open in new tab which will trigger download/view
                window.open(signedUrl, "_blank");
            }
        } catch (err) {
            console.error("Download error:", err);
            alert("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            className={cn("text-brand-navy hover:text-brand-gold", className)}
            onClick={handleDownload}
            disabled={loading}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
                <Download className="w-4 h-4 mr-2" />
            )}
            Download
        </Button>
    );
}
