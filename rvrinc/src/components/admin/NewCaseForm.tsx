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
import { PHASE_CONFIG, type StatusPhase, type StatusConfig } from "@/lib/statusConfig";

export function NewCaseForm({ attorneys, userBranch, statuses }: { attorneys: any[]; userBranch?: string | null; statuses: StatusConfig[] }) {
    const [title, setTitle] = useState("");
    const [caseNumber, setCaseNumber] = useState("");
    const [attorneyId, setAttorneyId] = useState("");
    const [branch, setBranch] = useState(userBranch || "pretoria");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("consultation_complete");
    const [accidentDate, setAccidentDate] = useState("");
    const [idNumber, setIdNumber] = useState("");
    const [rafRef, setRafRef] = useState("");
    const [dateOfLodgement, setDateOfLodgement] = useState("");
    const [dateOfSummons, setDateOfSummons] = useState("");
    const [dateOfRelodgement, setDateOfRelodgement] = useState("");
    const [placeOfAccident, setPlaceOfAccident] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const phases = Object.entries(PHASE_CONFIG) as [StatusPhase, typeof PHASE_CONFIG[StatusPhase]][];

    const generateCaseNumber = () => {
        const prefix = "KC";
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}${year}${month}${day}-${random}`;
    };

    useEffect(() => {
        setCaseNumber(generateCaseNumber());
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!title || title.length < 3) {
            alert("Case Title (Client Name) is required (min 3 characters).");
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase
                .from('cases')
                .insert({
                    title,
                    case_number: caseNumber,
                    attorney_id: attorneyId || null,
                    branch,
                    description,
                    status,
                    accident_date: accidentDate || null,
                    id_number: idNumber || null,
                    raf_ref: rafRef || null,
                    date_of_lodgement: dateOfLodgement || null,
                    date_of_summons: dateOfSummons || null,
                    date_of_relodgement: dateOfRelodgement || null,
                    place_of_accident: placeOfAccident || null,
                    client_id: null, // no client portal yet
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
                    <Label>Case Title (Client Name)</Label>
                    <Input
                        required
                        placeholder="e.g. S'FISO SIBONGISENI GUMEDE"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Case Number</Label>
                    <div className="flex gap-2">
                        <Input
                            required
                            placeholder="e.g. KC250524-1234"
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

            <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label>RAF Reference</Label>
                    <Input
                        placeholder="e.g. RAF-2024-00123"
                        value={rafRef}
                        onChange={(e) => setRafRef(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Identity / Passport Number</Label>
                    <Input
                        placeholder="e.g. 7608245830081"
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Place of Accident</Label>
                    <Input
                        placeholder="e.g. N4 Highway, Pretoria"
                        value={placeOfAccident}
                        onChange={(e) => setPlaceOfAccident(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label>Date of Accident</Label>
                    <Input
                        type="date"
                        value={accidentDate}
                        onChange={(e) => setAccidentDate(e.target.value)}
                    />
                    <p className="text-xs text-amber-600">Required for RAF prescription tracking.</p>
                </div>
                <div className="space-y-2">
                    <Label>Date of Lodgement</Label>
                    <Input
                        type="date"
                        value={dateOfLodgement}
                        onChange={(e) => setDateOfLodgement(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Date of Summons</Label>
                    <Input
                        type="date"
                        value={dateOfSummons}
                        onChange={(e) => setDateOfSummons(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
                <div className="space-y-2">
                    <Label>Branch</Label>
                    <Select value={branch} onChange={(e) => setBranch(e.target.value)}>
                        <option value="pretoria">Pretoria</option>
                        <option value="marble-hall">Marble Hall</option>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Date of Re-Lodgement</Label>
                    <Input
                        type="date"
                        value={dateOfRelodgement}
                        onChange={(e) => setDateOfRelodgement(e.target.value)}
                    />
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
                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        {phases.map(([phase, config]) => (
                            <optgroup key={phase} label={config.label}>
                                {statuses.filter(s => s.phase === phase).map(s => (
                                    <option key={s.slug} value={s.slug}>
                                        {s.sortOrder}. {s.label}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Description / Notes</Label>
                <Textarea
                    placeholder="Brief overview of the legal matter..."
                    className="h-24"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
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
