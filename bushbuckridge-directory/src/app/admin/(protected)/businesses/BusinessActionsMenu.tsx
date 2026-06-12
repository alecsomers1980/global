'use client'

import { useState } from 'react'
import { MoreHorizontal, CheckCircle2, XCircle, Star, ShieldAlert, Sparkles, Building, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import {
    updateBusinessStatus,
    updateBusinessTier,
    toggleBusinessVerification,
    deleteBusiness
} from './actions'
import { toast } from 'sonner'
import Link from 'next/link'

export default function BusinessActionsMenu({ business }: { business: any }) {
    const [isLoading, setIsLoading] = useState(false)

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

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-primary/5" disabled={isLoading}>
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-5 w-5 text-primary/60" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl border-primary/10 shadow-xl bg-white/90 backdrop-blur-xl font-medium">
                <DropdownMenuLabel className="font-black text-xs uppercase tracking-widest text-primary/40 px-3 py-2">Actions</DropdownMenuLabel>

                <DropdownMenuItem asChild className="rounded-xl mx-1 cursor-pointer font-bold focus:bg-primary/5 text-primary">
                    <Link href={`/business/${business.id}`} target="_blank">
                        <Building className="mr-2 h-4 w-4" /> View Live Profile
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-primary/5" />

                <DropdownMenuItem
                    className="rounded-xl mx-1 cursor-pointer focus:bg-emerald-50 focus:text-emerald-700 text-emerald-600 font-bold"
                    onClick={() => handleAction(() => toggleBusinessVerification(business.id, !business.is_verified), `Business ${business.is_verified ? 'unverified' : 'verified'}`)}
                >
                    {business.is_verified ? <XCircle className="mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    {business.is_verified ? 'Remove Verification' : 'Verify Business'}
                </DropdownMenuItem>

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="rounded-xl mx-1 cursor-pointer font-bold focus:bg-primary/5">
                        <ShieldAlert className="mr-2 h-4 w-4 text-primary/60" />
                        <span>Status</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="rounded-2xl border-primary/10 shadow-xl p-1">
                        {['pending', 'active', 'rejected'].map(status => (
                            <DropdownMenuItem
                                key={status}
                                className="rounded-xl font-bold cursor-pointer capitalize focus:bg-primary/5"
                                onClick={() => handleAction(() => updateBusinessStatus(business.id, status), `Status changed to ${status}`)}
                                disabled={business.status === status}
                            >
                                {status}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="rounded-xl mx-1 cursor-pointer font-bold focus:bg-primary/5">
                        <Sparkles className="mr-2 h-4 w-4 text-secondary/80" />
                        <span>Package Tier</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="rounded-2xl border-primary/10 shadow-xl p-1">
                        {['basic', 'pro-lead', 'pro-business'].map(tier => (
                            <DropdownMenuItem
                                key={tier}
                                className="rounded-xl font-bold cursor-pointer capitalize focus:bg-primary/5"
                                onClick={() => handleAction(() => updateBusinessTier(business.id, tier), `Tier upgraded to ${tier}`)}
                                disabled={business.package_tier === tier}
                            >
                                {tier.replace('-', ' ')}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator className="bg-primary/5" />

                <DropdownMenuItem
                    className="rounded-xl mx-1 cursor-pointer focus:bg-red-50 focus:text-red-700 text-red-600 font-bold"
                    onClick={() => {
                        if (confirm(`Are you sure you want to delete ${business.name}? This cannot be undone.`)) {
                            handleAction(() => deleteBusiness(business.id), 'Business deleted globally')
                        }
                    }}
                >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Globally
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}