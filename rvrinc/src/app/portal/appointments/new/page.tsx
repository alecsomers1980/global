import { createClient } from "@/lib/supabase/server";
import { BookingForm } from "@/components/portal/BookingForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function NewAppointmentPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch attorneys to book with (filtering by role 'attorney')
    const { data: attorneys } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "attorney");

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <Link href="/portal/appointments">
                    <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-brand-gold">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Appointments
                    </Button>
                </Link>
                <h1 className="text-3xl font-serif font-bold text-brand-navy">Schedule Consultation</h1>
                <p className="text-gray-500 mt-2">Book a secure session with one of our legal experts.</p>
            </div>

            <BookingForm
                attorneys={attorneys || []}
                userId={user.id}
            />
        </div>
    );
}
