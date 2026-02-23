"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Search, UserPlus, Mail } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createClient();
    const { toast } = useToast();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching users:", error);
            toast({
                title: "Error fetching users",
                description: "Make sure you have run the Admin RLS SQL script.",
                variant: "destructive",
            });
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    }, [supabase, toast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        setUpdating(userId);
        const { error } = await supabase
            .from("profiles")
            .update({ role: newRole })
            .eq("id", userId);

        if (error) {
            toast({
                title: "Update failed",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Role updated",
                description: `User role changed to ${newRole}`,
            });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        }
        setUpdating(null);
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
                    <p className="text-slate-500 mt-2">Manage access and roles for all users.</p>
                </div>
                <Link href="/admin/users/invite">
                    <Button variant="brand">
                        <UserPlus className="w-4 h-4 mr-2" /> Invite User
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search users..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-gold" />
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-brand-navy font-bold">
                                                    {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{user.full_name || 'No Name'}</p>
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <Mail className="w-3 h-3 mr-1" />
                                                        {user.email || 'No Email'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-gold focus:border-brand-gold block w-full p-2.5"
                                                value={user.role || 'client'}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                disabled={updating === user.id}
                                            >
                                                <option value="client">Client</option>
                                                <option value="attorney">Attorney</option>
                                                <option value="admin">Admin</option>
                                                <option value="staff">Staff</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {updating === user.id && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
