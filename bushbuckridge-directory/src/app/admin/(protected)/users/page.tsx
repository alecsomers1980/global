import { createClient } from '@/utils/pocketbase/server'
import { requireAdmin } from '@/utils/pocketbase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import UserActionsMenu from './UserActionsMenu'

export default async function AdminUsersPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    await requireAdmin()
    const pb = await createClient()

    const resolvedParams = await searchParams
    const q = typeof resolvedParams?.q === 'string' ? resolvedParams.q.toLowerCase() : ''

    let users: any[] = []
    try {
        users = await pb.collection('users').getFullList({ sort: 'email', expand: 'business_id' })

        if (q) {
            users = users.filter((u) => {
                const haystack = `${u.email || ''} ${u.expand?.business_id?.name || ''}`.toLowerCase()
                return haystack.includes(q)
            })
        }
    } catch (e) {
        console.error('Failed to fetch users', e)
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-primary">User Management</h1>
                    <p className="text-muted-foreground font-medium mt-2 text-lg">Manage portal accounts — suspend, edit, or remove user access.</p>
                </div>
                <form method="get" className="flex items-center gap-2">
                    <input
                        name="q"
                        defaultValue={q}
                        placeholder="Search users..."
                        className="flex h-12 w-full md:w-64 rounded-xl border border-input bg-white px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                    <button type="submit" className="h-12 px-6 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary/90 transition-colors">
                        Search
                    </button>
                </form>
            </div>

            <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-primary/5 bg-white/50">
                    <CardTitle className="text-2xl font-black">All Users</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-primary/5">
                                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-xs text-primary/40">Email</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Linked Business</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Role</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Status</TableHead>
                                <TableHead className="py-6 px-8 text-right font-black uppercase tracking-widest text-xs text-primary/40">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.map((user) => (
                                <TableRow key={user.id} className="hover:bg-primary/5 transition-colors border-primary/5 align-top">
                                    <TableCell className="py-6 px-8 font-bold text-primary">{user.email}</TableCell>
                                    <TableCell className="py-6 px-4 text-sm font-medium text-muted-foreground">
                                        {user.expand?.business_id?.name || '—'}
                                    </TableCell>
                                    <TableCell className="py-6 px-4">
                                        <Badge variant="outline" className="rounded-xl font-bold">
                                            {user.is_admin ? 'Admin' : 'Portal User'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-6 px-4">
                                        {user.suspended ? (
                                            <Badge variant="outline" className="rounded-xl font-bold bg-red-50 text-red-700 border-red-200">Suspended</Badge>
                                        ) : (
                                            <Badge variant="outline" className="rounded-xl font-bold bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-6 px-8 text-right">
                                        <UserActionsMenu user={user} />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!users || users.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground font-medium">No users found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
