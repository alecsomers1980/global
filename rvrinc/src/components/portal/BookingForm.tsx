"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/Calendar";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, CheckCircle2 } from "lucide-react";
import { appointmentSchema } from "@/lib/schemas";

export function BookingForm({ attorneys, userId }: { attorneys: any[], userId: string }) {
    const [date, setDate] = useState<Date>();
    const [time, setTime] = useState<string>("");
    const [attorneyId, setAttorneyId] = useState<string>("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Mock time slots
    const timeSlots = [
        "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !time || !attorneyId) return;

        setLoading(true);

        // Construct simplified timestamp (combining date + time string)
        // In a real app, strictly handle timezones
        const dateTime = new Date(date);
        const [hours, minutes] = time.split(':');
        dateTime.setHours(parseInt(hours), parseInt(minutes));

        const endTime = new Date(dateTime);
        endTime.setHours(endTime.getHours() + 1); // 1 hour duration default

        // Zod Validation
        const formData = {
            attorney_id: attorneyId,
            start_time: dateTime.toISOString(),
            end_time: endTime.toISOString(),
            notes: notes || undefined
        };

        const result = appointmentSchema.safeParse(formData);

        if (!result.success) {
            setLoading(false);
            const errorMessage = result.error.errors.map(e => e.message).join("\n");
            alert(errorMessage);
            return;
        }

        try {
            const { error } = await supabase
                .from('appointments')
                .insert({
                    client_id: userId,
                    attorney_id: attorneyId,
                    start_time: dateTime.toISOString(),
                    end_time: endTime.toISOString(),
                    status: 'pending',
                    notes: notes
                });

            if (error) throw error;

            setSuccess(true);
            router.refresh();
            // Redirect after short delay
            setTimeout(() => {
                router.push('/portal/appointments');
            }, 2000);

        } catch (error) {
            console.error("Booking Error:", error);
            alert("Failed to book appointment.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-green-100 shadow-sm">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-serif font-bold text-brand-navy">Request Sent!</h2>
                <p className="text-gray-500 mt-2">We have received your appointment request.<br />You will receive a confirmation email shortly.</p>
                <Button variant="outline" className="mt-6" onClick={() => router.push('/portal')}>
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">

            {/* Attorney Selection */}
            <div className="space-y-4">
                <Label className="text-lg font-semibold text-brand-navy">1. Select Attorney</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {attorneys.map((att) => (
                        <div
                            key={att.id}
                            onClick={() => setAttorneyId(att.id)}
                            className={cn(
                                "cursor-pointer border rounded-lg p-4 flex items-center gap-4 transition-all hover:shadow-md",
                                attorneyId === att.id
                                    ? "border-brand-gold bg-brand-gold/5 ring-1 ring-brand-gold"
                                    : "border-gray-200 bg-white hover:border-brand-navy/30"
                            )}
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                {att.full_name?.charAt(0) || "A"}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{att.full_name}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Attorney</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Date & Time Selection */}
            <div className="space-y-4">
                <Label className="text-lg font-semibold text-brand-navy">2. Choose Date & Time</Label>
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border shadow-sm w-fit mx-auto md:mx-0"
                            disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                        />
                    </div>

                    <div className="flex-1 space-y-4">
                        <p className="text-sm font-medium text-gray-700">Available Slots for {date ? format(date, "MMMM do, yyyy") : "Selected Date"}:</p>
                        <div className="grid grid-cols-3 gap-2">
                            {timeSlots.map((slot) => (
                                <Button
                                    key={slot}
                                    type="button"
                                    variant="outline"
                                    disabled={!date}
                                    onClick={() => setTime(slot)}
                                    className={cn(
                                        "border-gray-200",
                                        time === slot && "bg-brand-navy text-white hover:bg-brand-navy hover:text-white border-brand-navy"
                                    )}
                                >
                                    {slot}
                                </Button>
                            ))}
                        </div>
                        {!date && <p className="text-xs text-gray-400 italic">Please select a date first.</p>}
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div className="space-y-4">
                <Label className="text-lg font-semibold text-brand-navy">3. Additional Notes</Label>
                <Input
                    placeholder="Briefly describe the reason for consultation..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <Button
                    type="submit"
                    variant="brand"
                    size="lg"
                    disabled={!date || !time || !attorneyId || loading}
                >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Confirm Booking
                </Button>
            </div>

        </form>
    );
}
