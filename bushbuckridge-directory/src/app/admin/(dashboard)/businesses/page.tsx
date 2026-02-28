import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { revalidatePath } from 'next/cache'
import { CheckCircle2, XCircle, Phone, Mail, MapPin } from 'lucide-react'

export default async function AdminBusinessesPage() {
    const supabase = await createClient()

    const { data: pending } = await supabase
        .from('businesses')
        .select('*, sectors(name), areas(name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    const { data: active } = await supabase
        .from('businesses')
        .select('*, sectors(name), areas(name)')
        .eq('status', 'active')
        .order('name', { ascending: true })
        .limit(50)

    async function approveAndActivate(formData: FormData) {
        'use server'
        const businessId = formData.get('id') as string
        const db = await createClient()
        await db.from('businesses').update({ status: 'active' }).eq('id', businessId)
        revalidatePath('/admin/businesses')
    }

    async function rejectListing(formData: FormData) {
        'use server'
        const businessId = formData.get('id') as string
        const db = await createClient()
        await db.from('businesses').update({ status: 'rejected' }).eq('id', businessId)
        revalidatePath('/admin/businesses')
    }

    async function updatePackage(formData: FormData) {
        'use server'
        const businessId = formData.get('id') as string
        const tier = formData.get('tier') as string
        const isFeatured = formData.get('featured') === 'true'
        const db = await createClient()
        await db.from('businesses').update({
            package_tier: tier,
            is_featured: isFeatured
        }).eq('id', businessId)
        revalidatePath('/admin/businesses')
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Directory Approvals</h1>
                <p className="text-muted-foreground">Review business submissions and manage active directory listings.</p>
            </div>

            {/* Pending Queue */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Pending Review</CardTitle>
                            <CardDescription>Businesses awaiting payment confirmation before publishing.</CardDescription>
                        </div>
                        <Badge className="bg-orange-500">{pending?.length || 0} Pending</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {pending?.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            ✅ No pending submissions — you're all caught up!
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Business</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Package</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pending?.map((biz) => (
                                    <TableRow key={biz.id}>
                                        <TableCell>
                                            <div className="font-medium">{biz.name}</div>
                                            <div className="text-xs text-muted-foreground">{biz.sectors?.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {biz.phone && <span className="flex items-center text-xs text-muted-foreground"><Phone className="h-3 w-3 mr-1" />{biz.phone}</span>}
                                                {biz.email && <span className="flex items-center text-xs text-muted-foreground"><Mail className="h-3 w-3 mr-1" />{biz.email}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">{biz.package_tier}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="flex items-center text-sm text-muted-foreground">
                                                <MapPin className="h-3 w-3 mr-1" />{biz.areas?.name}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <form action={approveAndActivate}>
                                                    <input type="hidden" name="id" value={biz.id} />
                                                    <Button type="submit" size="sm" className="gap-1 h-8 bg-green-600 hover:bg-green-700">
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                                                    </Button>
                                                </form>
                                                <form action={rejectListing}>
                                                    <input type="hidden" name="id" value={biz.id} />
                                                    <Button type="submit" size="sm" variant="outline" className="gap-1 h-8 text-destructive hover:bg-destructive/10">
                                                        <XCircle className="h-3.5 w-3.5" /> Reject
                                                    </Button>
                                                </form>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Active Listings Quick Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Listings</CardTitle>
                    <CardDescription>All published businesses in the directory.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Business</TableHead>
                                <TableHead>Sector</TableHead>
                                <TableHead>Package</TableHead>
                                <TableHead>Featured</TableHead>
                                <TableHead>Verified</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {active?.map((biz) => (
                                <TableRow key={biz.id}>
                                    <TableCell className="font-medium">{biz.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{biz.sectors?.name}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`capitalize text-xs ${biz.package_tier === 'premium' ? 'border-amber-400 text-amber-600 bg-amber-50' : biz.package_tier === 'enhanced' ? 'border-blue-400 text-blue-600 bg-blue-50' : ''}`}
                                        >
                                            {biz.package_tier}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {biz.is_featured
                                            ? <Badge className="bg-yellow-500 text-xs">⭐ Featured</Badge>
                                            : <span className="text-xs text-muted-foreground">—</span>
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {biz.is_verified
                                            ? <Badge className="bg-green-600 text-xs">✓ Verified</Badge>
                                            : <span className="text-xs text-muted-foreground">—</span>
                                        }
                                    </TableCell>
                                </TableRow>
                            ))}
                            {active?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No active listings yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
