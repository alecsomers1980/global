"use client";

import { useState, useTransition } from "react";
import { assignAttorney } from "@/app/admin/cases/actions";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";

interface Props {
    caseId: string;
    currentAttorneyId: string | null;
    attorneys: { id: string; full_name: string }[];
}

export default function AssignAttorneyForm({ caseId, currentAttorneyId, attorneys }: Props) {
    const [selectedId, setSelectedId] = useState(currentAttorneyId || "");
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newId = e.target.value;
        setSelectedId(newId);
        setMessage(null);

        startTransition(async () => {
            const result = await assignAttorney(caseId, newId);
            if (result?.error) {
                setMessage({ type: "error", text: result.error });
                setSelectedId(currentAttorneyId || "");
            } else {
                setMessage({ type: "success", text: "Attorney reassigned." });
                setTimeout(() => setMessage(null), 2500);
            }
        });
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <select
                    value={selectedId}
                    onChange={handleChange}
                    disabled={isPending}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                >
                    <option value="">Unassigned</option>
                    {attorneys.map((a) => (
                        <option key={a.id} value={a.id}>{a.full_name}</option>
                    ))}
                </select>
                {isPending && <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />}
            </div>
            {message && (
                <p className={`text-xs ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
                    {message.text}
                </p>
            )}
        </div>
    );
}
