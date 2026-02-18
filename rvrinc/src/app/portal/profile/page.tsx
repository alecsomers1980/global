import { createClient } from "@/lib/supabase/server";
import { User, Mail, Phone, MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function ProfilePage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Ideally fetch profile from 'profiles' table, but fallback to auth user data for now
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-serif font-bold text-brand-navy">My Profile</h1>
                <p className="text-gray-500 mt-2">Manage your personal information and account security.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-brand-navy text-white text-4xl font-serif flex items-center justify-center rounded-full border-4 border-white shadow-lg">
                            {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-brand-navy">{profile?.full_name || "User"}</h2>
                            <p className="text-gray-500">{user.email}</p>
                            <span className="inline-block mt-2 bg-brand-gold/10 text-brand-navy px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                                {profile?.role || "Client"} Account
                            </span>
                        </div>
                    </div>
                    <Button variant="outline">Edit Profile</Button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Contact Information</h3>

                        <div className="flex items-center gap-3 text-gray-600">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <span>+27 (0) -- --- ----</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <span>Pretoria, South Africa</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Security</h3>

                        <div className="flex items-center gap-3 text-gray-600">
                            <Shield className="w-5 h-5 text-gray-400" />
                            <span>Password last changed: Never</span>
                        </div>

                        <div className="pt-2">
                            <Button variant="outline" size="sm" className="w-full">Change Password</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
