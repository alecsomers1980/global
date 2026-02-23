"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Loader2, RefreshCw } from "lucide-react";
import { caseSchema } from "@/lib/schemas";

export function NewCaseForm({ clients, attorneys }: { clients: any[], attorneys: any[] }) {
    const [title, setTitle] = useState("");
    const [caseNumber, setCaseNumber] = useState("");
    const [clientId, setClientId] = useState("");
    const [attorneyId, setAttorneyId] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("open");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const generateCaseNumber = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000);
        return `RVR-${year}${month}${day}-${random}`;
    };

    useEffect(() => {
        setCaseNumber(generateCaseNumber());
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Zod Validation
        const formData = {
            title,
            case_number: caseNumber,
            client_id: clientId,
            attorney_id: attorneyId || undefined,
            description,
            status
        };

        const result = caseSchema.safeParse(formData);

        if (!result.success) {
            setLoading(false);
            const errorMessage = result.error.errors.map(e => e.message).join("\n");
            alert(errorMessage);
            return;
        }

        try {
            const { error } = await supabase
                .from('cases')
                .insert({
                    title,
                    case_number: caseNumber,
                    client_id: clientId,
                    attorney_id: attorneyId || null,
                    description,
                    status
                });

            if (error) throw error;

            router.push('/admin/cases');
            router.refresh();
        } catch (error) {
            console.error("Error creating case:", error);
            alert("Failed to create case. Ensure Case Number is unique.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Case Title</Label>
                    <Input
                        required
                        placeholder="e.g. Smith Estate Planning"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Case Number</Label>
                    <div className="flex gap-2">
                        <Input
                            required
                            placeholder="e.g. RVR-20240219-1234"
                            value={caseNumber}
                            onChange={(e) => setCaseNumber(e.target.value)}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setCaseNumber(generateCaseNumber())}
                            title="Generate new number"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Assign Client</Label>
                    <Select
                        required
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                    >
                        <option value="" disabled>Select Client</option>
                        {clients.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.full_name} ({c.email || 'No Email'})
                            </option>
                        ))}
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Assign Attorney</Label>
                    <Select
                        value={attorneyId}
                        onChange={(e) => setAttorneyId(e.target.value)}
                    >
                        <option value="">Unassigned</option>
                        {attorneys.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.full_name}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                    placeholder="Brief overview of the legal matter..."
                    className="h-32"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label>Status</Label>
                <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="open">Open</option>
                    <option value="discovery">Discovery</option>
                    <option value="litigation">Litigation</option>
                    <option value="closed">Closed</option>
                </Select>
            </div>

            <div className="pt-4 flex justify-end gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="brand"
                    disabled={loading}
                >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Case
                </Button>
            </div>
        </form>
    );
}
