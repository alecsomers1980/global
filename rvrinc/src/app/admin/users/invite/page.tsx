import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default function InviteUserPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <Link href="/admin/users">
                    <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-brand-gold">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-slate-800">Invite New User</h1>
                <p className="text-slate-500 mt-2">Send an invitation email to a new client or staff member.</p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <form className="space-y-6">
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input type="email" placeholder="client@example.com" required />
                    </div>

                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select required>
                            <option value="client">Client</option>
                            <option value="attorney">Attorney</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Personal Note (Optional)</Label>
                        <Input placeholder="Welcome to RVR Inc..." />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" variant="brand">
                            <Send className="w-4 h-4 mr-2" /> Send Invitation
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
