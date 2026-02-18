import { createClient } from "@/lib/supabase/server";
import { Users, Mail, Phone, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function AdminClientsPage() {
    const supabase = createClient();

    // Fetch only clients
    const { data: clients } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "client")
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Client Directory</h1>
                    <p className="text-slate-500 mt-2">Manage client profiles and information.</p>
                </div>
                <Link href="/admin/users/invite">
                    <Button variant="brand"><Users className="w-4 h-4 mr-2" /> Invite Client</Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Contact Info</th>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {clients?.map((client: any) => (
                                <tr key={client.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold">
                                                {client.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <span className="font-semibold text-slate-800">{client.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-slate-600">
                                            {/* Email isn't in profiles by default schema, usually in auth, forcing manual join or assumption. 
                                       However, let's assume for MVP we fetch email or use placeholder if not sync'd to profile. 
                                       Ideally we sync auth.users email to profiles on signup. */}
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3 h-3" />
                                                <span>Click to view email</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        <span className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(client.created_at).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm">View Profile</Button>
                                    </td>
                                </tr>
                            ))}
                            {(!clients || clients.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No clients found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
