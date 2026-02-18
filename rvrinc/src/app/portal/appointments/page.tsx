import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Calendar, Clock, User, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";

export default async function AppointmentsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch appointments
    const { data: appointments } = await supabase
        .from("appointments")
        .select("*, attorney:profiles!attorney_id(full_name)")
        .or(`client_id.eq.${user.id},attorney_id.eq.${user.id}`)
        .order("start_time", { ascending: true });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-brand-navy">Appointments</h1>
                    <p className="text-gray-500 mt-2">Manage your scheduled legal consultations.</p>
                </div>
                <Link href="/portal/appointments/new">
                    <Button variant="brand"><Plus className="w-4 h-4 mr-2" /> Book New</Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {appointments && appointments.length > 0 ? (
                    appointments.map((apt: any) => (
                        <div key={apt.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md">
                            <div className="flex items-start gap-4">
                                <div className="bg-brand-navy/5 p-3 rounded-lg text-brand-navy">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-brand-navy">
                                            {format(new Date(apt.start_time), "MMMM do, yyyy")}
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                            apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {apt.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            {format(new Date(apt.start_time), "HH:mm")} - {format(new Date(apt.end_time), "HH:mm")}
                                        </span>
                                        {apt.attorney && (
                                            <span className="flex items-center gap-1">
                                                <User className="w-4 h-4 text-gray-400" />
                                                with {apt.attorney.full_name}
                                            </span>
                                        )}
                                    </div>
                                    {apt.notes && <p className="text-gray-500 text-sm mt-2 italic">&quot;{apt.notes}&quot;</p>}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {/* Actions would go here e.g. Reschedule / Cancel */}
                                <Button variant="outline" size="sm" disabled>Reschedule</Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" disabled>Cancel</Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No appointments scheduled</h3>
                        <p className="text-gray-500 mb-6">Book a session to get started.</p>
                        <Link href="/portal/appointments/new">
                            <Button variant="brand">Schedule Consultation</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
