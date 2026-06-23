'use client'
import { useState } from 'react'
import { MoreHorizontal, CheckCircle2, Archive, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { updateEnquiryStatus, deleteEnquiry } from './actions'
import { toast } from 'sonner'

const STATUS_OPTIONS: { value: string; label: string; icon: any }[] = [
    { value: 'approved', label: 'Approve', icon: CheckCircle2 },
    { value: 'resolved', label: 'Mark Resolved', icon: Archive },
]

export default function EnquiryActionsMenu({ enquiry }: { enquiry: any }) {
    const [loading, setLoading] = useState(false)

    async function handleStatus(status: string) {
        setLoading(true)
        try {
            await updateEnquiryStatus(enquiry.id, status)
            toast.success(`Marked as ${status}`)
        } catch (e: any) {
            toast.error(e.message || 'Failed to update status')
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        if (!confirm('Delete this enquiry? This cannot be undone.')) return
        setLoading(true)
        try {
            await deleteEnquiry(enquiry.id)
            toast.success('Enquiry deleted')
        } catch (e: any) {
            toast.error(e.message || 'Failed to delete')
        } finally {
            setLoading(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={loading}
                    className="h-10 w-10 p-0 rounded-xl hover:bg-primary/5"
                >
                    <MoreHorizontal className="h-5 w-5 text-primary/60" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-52 rounded-2xl border-primary/10 shadow-xl bg-white/90 backdrop-blur-xl"
            >
                <DropdownMenuLabel className="font-black text-xs uppercase tracking-widest text-primary/40 px-3 py-2">
                    Actions
                </DropdownMenuLabel>
                {STATUS_OPTIONS.filter((opt) => opt.value !== enquiry.status).map((opt) => (
                    <DropdownMenuItem
                        key={opt.value}
                        className="rounded-xl mx-1 cursor-pointer font-bold focus:bg-primary/5"
                        onClick={() => handleStatus(opt.value)}
                    >
                        <opt.icon className="mr-2 h-4 w-4" /> {opt.label}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-primary/5" />
                <DropdownMenuItem
                    className="rounded-xl mx-1 cursor-pointer focus:bg-red-50 focus:text-red-700 text-red-600 font-bold"
                    onClick={handleDelete}
                >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
