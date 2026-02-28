import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default async function AdminLoginPage({
    searchParams,
}: {
    searchParams: { message: string }
}) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    // If already logged in, redirect to dashboard
    if (session) {
        redirect('/admin')
    }

    const signIn = async (formData: FormData) => {
        'use server'

        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const supabase = await createClient()

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return redirect(`/admin/login?message=${encodeURIComponent(error.message)}`)
        }

        return redirect('/admin')
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-muted/40 px-4">
            <Card className="mx-auto max-w-sm w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">Staff Login</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={signIn} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        {searchParams?.message && (
                            <p className="text-sm text-destructive">{searchParams.message}</p>
                        )}
                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Need access? Contact the super administrator.
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
