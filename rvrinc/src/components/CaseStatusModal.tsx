"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loader2, Search, ShieldCheck, AlertCircle, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { PHASE_CONFIG, type StatusPhase } from "@/lib/statusConfig";

interface CaseStatusResult {
    found: boolean;
    case: {
        caseNumber: string;
        title: string;
        clientName: string;
        status: string;
        statusLabel: string;
        statusColor: { bgColor: string; textColor: string };
        progress: { current: number; total: number; percentage: number };
        clientMessage: string;
        phases: { key: string; label: string; color: string; completed: boolean }[];
        lastUpdated: string;
        accidentDate: string | null;
        scheduledDate: string | null;
    };
}

export function CaseStatusModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [idNumber, setIdNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CaseStatusResult | null>(null);
    const [error, setError] = useState("");

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!open) {
            // Delay reset so the close animation finishes
            const t = setTimeout(() => {
                setIdNumber("");
                setResult(null);
                setError("");
                setLoading(false);
            }, 300);
            return () => clearTimeout(t);
        }
    }, [open]);

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!idNumber.trim() || idNumber.trim().length < 2) {
            setError("Please enter a valid ID number, passport number, or file reference.");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch("/api/case-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idNumber: idNumber.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Case not found.");
            } else {
                setResult(data);
            }
        } catch {
            setError("Unable to connect. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl font-serif font-bold text-brand-navy flex items-center gap-2">
                        <Search className="w-5 h-5 text-brand-gold" />
                        View Case Status
                    </DialogTitle>
                    <DialogDescription>
                        Enter your ID number, passport number, or file reference (e.g. KC001, KCS250) to check your case status.
                    </DialogDescription>
                </DialogHeader>

                {/* Search Form */}
                <form onSubmit={handleLookup} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="idNumber">ID Number, Passport, or File Reference</Label>
                        <Input
                            id="idNumber"
                            type="text"
                            placeholder="e.g. 8708100193085 or KC001"
                            value={idNumber}
                            onChange={(e) => { setIdNumber(e.target.value); setError(""); }}
                            className="text-lg tracking-wider font-mono"
                            autoFocus
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="brand"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Looking up your case...
                            </>
                        ) : (
                            <>
                                <Search className="w-4 h-4 mr-2" />
                                Check Status
                            </>
                        )}
                    </Button>
                </form>

                {/* Results */}
                {result && result.case && (
                    <div className="border-t border-gray-200 pt-4 mt-2 space-y-4">
                        {/* Client & Case Info */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-brand-navy text-lg">{result.case.clientName}</p>
                                <p className="text-xs text-gray-500">Case #{result.case.caseNumber}</p>
                            </div>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                                result.case.statusColor.bgColor,
                                result.case.statusColor.textColor
                            )}>
                                {result.case.statusLabel}
                            </span>
                        </div>

                        {/* Phase Progress Bar */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-500">Case Progress</span>
                                <span className="text-xs font-bold text-brand-navy">{result.case.progress.percentage}%</span>
                            </div>
                            <div className="flex gap-1">
                                {result.case.phases.map((phase) => (
                                    <div
                                        key={phase.key}
                                        className="h-2 flex-1 rounded-full transition-colors"
                                        style={{ backgroundColor: phase.completed ? phase.color : "#e5e7eb" }}
                                        title={phase.label}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between mt-1">
                                {result.case.phases.map((phase) => (
                                    <span
                                        key={phase.key}
                                        className={cn(
                                            "text-[9px]",
                                            phase.completed ? "font-bold text-gray-700" : "text-gray-400"
                                        )}
                                    >
                                        {phase.label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Client Message */}
                        <div className="p-4 bg-brand-navy/5 rounded-lg border border-brand-navy/10">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="w-4 h-4 text-brand-gold" />
                                <span className="text-xs font-bold uppercase tracking-widest text-brand-navy">Status Update</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{result.case.clientMessage}</p>
                        </div>

                        {/* Key Dates */}
                        <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Updated: {new Date(result.case.lastUpdated).toLocaleDateString("en-ZA")}
                            </div>
                            {result.case.scheduledDate && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Court: {new Date(result.case.scheduledDate).toLocaleDateString("en-ZA")}
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
