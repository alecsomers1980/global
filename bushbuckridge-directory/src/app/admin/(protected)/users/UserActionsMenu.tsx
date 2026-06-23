'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, ShieldOff, ShieldCheck, Mail, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { suspendUser, deleteUser, sendPasswordResetLink } from './actions'
import { toast } from 'sonner'
import UserEditDialog from './UserEditDialog'

export default function UserActionsMenu({ user }: { user: any }) {
    const [isLoading, setIsLoading] = useState(false)
    const [editOpen, setEditOpen] = useState(false)

    const handleAction = async (action: () => Promise<void>, successMessage: string) => {
        setIsLoading(true)
        try {
            await action()
            toast.success(successMessage)
        } catch (error: any) {
            toast.error(error.message || 'Action failed')
        } finally {
            setIsLoading(false)
        }
    }

    function handleDelete() {
        if (!confirm('Delete this user account? This cannot be undone.')) return
        handleAction(() => deleteUser(user.id), 'User deleted')
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-primary/5" disabled={isLoading}>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-5 w-5 text-primary/60" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-primary/10 shadow-xl bg-white/90 backdrop-blur-xl font-medium">
                    <DropdownMenuLabel className="font-black text-xs uppercase tracking-widest text-primary/40 px-3 py-2">Actions</DropdownMenuLabel>

                    <DropdownMenuItem
                        className="rounded-xl mx-1 cursor-pointer font-bold focus:bg-primary/5"
                        onClick={() => setEditOpen(true)}
                    >
                        <Pencil className="mr-2 h-4 w-4" /> Edit User
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        className="rounded-xl mx-1 cursor-pointer font-bold focus:bg-primary/5"
                        onClick={() => handleAction(() => sendPasswordResetLink(user.email), `Password reset email sent to ${user.email}`)}
                    >
                        <Mail className="mr-2 h-4 w-4" /> Send Password Reset Link
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-primary/5" />

                    {user.suspended ? (
                        <DropdownMenuItem
                            className="rounded-xl mx-1 cursor-pointer focus:bg-emerald-50 focus:text-emerald-700 text-emerald-600 font-bold"
                            onClick={() => handleAction(() => suspendUser(user.id, false), 'Account reactivated')}
                        >
                            <ShieldCheck className="mr-2 h-4 w-4" /> Reactivate Account
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            className="rounded-xl mx-1 cursor-pointer focus:bg-amber-50 focus:text-amber-700 text-amber-600 font-bold"
                            onClick={() => handleAction(() => suspendUser(user.id, true), 'Account suspended')}
                        >
                            <ShieldOff className="mr-2 h-4 w-4" /> Suspend Account
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator className="bg-primary/5" />

                    <DropdownMenuItem
                        className="rounded-xl mx-1 cursor-pointer focus:bg-red-50 focus:text-red-700 text-red-600 font-bold"
                        onClick={handleDelete}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete User
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <UserEditDialog open={editOpen} onClose={() => setEditOpen(false)} user={user} />
        </>
    )
}
