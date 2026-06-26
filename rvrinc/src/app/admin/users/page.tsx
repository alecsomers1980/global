"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/Dialog";
import {
    Loader2,
    Search,
    UserPlus,
    Mail,
    Pencil,
    Ban,
    CircleCheck,
    Trash2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
    getUsers,
    createUser,
    updateUser,
    setSuspended,
    deleteUser,
    type AdminUser,
} from "./actions";

interface FormState {
    id: string | null; // null = creating
    fullName: string;
    email: string;
    role: string;
    branch: string;
    password: string;
}

const EMPTY_FORM: FormState = {
    id: null,
    fullName: "",
    email: "",
    role: "staff",
    branch: "pretoria",
    password: "",
};

const roleBadge: Record<string, string> = {
    admin: "bg-brand-gold/10 text-brand-gold border-brand-gold/20",
    attorney: "bg-purple-100 text-purple-800 border-purple-200",
    staff: "bg-blue-100 text-blue-800 border-blue-200",
    client: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function UserManagementPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const res = await getUsers();
        if (res.error) {
            toast({ title: "Error fetching users", description: res.error, variant: "destructive" });
        } else {
            setUsers(res.users || []);
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setDialogOpen(true);
    };

    const openEdit = (u: AdminUser) => {
        setForm({
            id: u.id,
            fullName: u.full_name || "",
            email: u.email || "",
            role: u.role || "client",
            branch: u.branch || "",
            password: "",
        });
        setDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const branch = form.branch || null;
        const res = form.id
            ? await updateUser({
                  id: form.id,
                  fullName: form.fullName,
                  email: form.email,
                  role: form.role,
                  branch,
                  password: form.password || undefined,
              })
            : await createUser({
                  fullName: form.fullName,
                  email: form.email,
                  role: form.role,
                  branch,
                  password: form.password,
              });
        setSaving(false);

        if (res.error) {
            toast({ title: "Save failed", description: res.error, variant: "destructive" });
            return;
        }
        toast({ title: form.id ? "User updated" : "User created" });
        setDialogOpen(false);
        fetchUsers();
    };

    const handleSuspend = async (u: AdminUser) => {
        setBusyId(u.id);
        const res = await setSuspended(u.id, !u.suspended);
        setBusyId(null);
        if (res.error) {
            toast({ title: "Action failed", description: res.error, variant: "destructive" });
            return;
        }
        toast({ title: u.suspended ? "User unsuspended" : "User suspended" });
        fetchUsers();
    };

    const handleDelete = async (u: AdminUser) => {
        if (!confirm(`Delete ${u.full_name || u.email}? This cannot be undone.`)) return;
        setBusyId(u.id);
        const res = await deleteUser(u.id);
        setBusyId(null);
        if (res.error) {
            toast({ title: "Delete failed", description: res.error, variant: "destructive" });
            return;
        }
        toast({ title: "User deleted" });
        fetchUsers();
    };

    const filteredUsers = users.filter(
        (u) =>
            u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
                    <p className="text-slate-500 mt-2">Add, edit, suspend, or remove users and reset their passwords.</p>
                </div>
                <Button variant="brand" onClick={openCreate}>
                    <UserPlus className="w-4 h-4 mr-2" /> Add User
                </Button>
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
                                <th className="px-6 py-4">Branch</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-gold" />
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-brand-navy font-bold">
                                                    {user.full_name?.charAt(0) || user.email?.charAt(0) || "?"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{user.full_name || "No Name"}</p>
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <Mail className="w-3 h-3 mr-1" />
                                                        {user.email || "No Email"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.branch ? (
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        user.branch === "marble-hall"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-blue-100 text-blue-800"
                                                    }`}
                                                >
                                                    {user.branch === "marble-hall" ? "Marble Hall" : "Pretoria"}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${
                                                    roleBadge[user.role || "client"] || roleBadge.client
                                                }`}
                                            >
                                                {user.role || "client"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.suspended ? (
                                                <span className="flex items-center gap-1 text-red-600 text-xs">
                                                    <Ban className="w-3.5 h-3.5" /> Suspended
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-green-600 text-xs">
                                                    <CircleCheck className="w-3.5 h-3.5" /> Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                {busyId === user.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            title="Edit"
                                                            onClick={() => openEdit(user)}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            title={user.suspended ? "Unsuspend" : "Suspend"}
                                                            onClick={() => handleSuspend(user)}
                                                        >
                                                            {user.suspended ? (
                                                                <CircleCheck className="w-4 h-4 text-green-600" />
                                                            ) : (
                                                                <Ban className="w-4 h-4 text-amber-600" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            title="Delete"
                                                            onClick={() => handleDelete(user)}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>{form.id ? "Edit User" : "Add User"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="f-name">Full Name</Label>
                            <Input
                                id="f-name"
                                value={form.fullName}
                                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                placeholder="e.g. Jan van der Merwe"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="f-email">Email Address</Label>
                            <Input
                                id="f-email"
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="user@rvrinc.co.za"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="f-role">Role</Label>
                                <Select
                                    id="f-role"
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                >
                                    <option value="client">Client</option>
                                    <option value="attorney">Attorney</option>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="f-branch">Branch</Label>
                                <Select
                                    id="f-branch"
                                    value={form.branch}
                                    onChange={(e) => setForm({ ...form, branch: e.target.value })}
                                >
                                    <option value="">None</option>
                                    <option value="pretoria">Pretoria</option>
                                    <option value="marble-hall">Marble Hall</option>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="f-password">{form.id ? "New Password (optional)" : "Temporary Password"}</Label>
                            <Input
                                id="f-password"
                                type="text"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="Min. 8 chars, 1 capital, 1 lowercase"
                                required={!form.id}
                            />
                            {form.id && (
                                <p className="text-xs text-gray-500">Leave blank to keep the current password.</p>
                            )}
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="brand" disabled={saving}>
                                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                {form.id ? "Save Changes" : "Create User"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
