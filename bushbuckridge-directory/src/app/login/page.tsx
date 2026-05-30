'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const pb = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const authData = await pb.collection('users').authWithPassword(email, password)
            
            // Sync the auth store to a cookie so the middleware/RSC can see it
            // If rememberMe is checked, set a 30 day maxAge. Otherwise, let it expire on session end.
            const exportOptions = { 
                httpOnly: false, 
                secure: process.env.NODE_ENV === 'production', 
                maxAge: rememberMe ? 60 * 60 * 24 * 30 : undefined 
            };
            document.cookie = pb.authStore.exportToCookie(exportOptions)
            
            toast.success('Logged in successfully')
            
            if (authData.record.is_admin) {
                router.push('/admin')
            } else {
                router.push('/portal')
            }
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to authenticate')
            setLoading(false)
        }
    }

    const handleForgotPassword = async () => {
        if (!email) {
            toast.error('Please enter your email address first.')
            return
        }
        try {
            await pb.collection('users').requestPasswordReset(email)
            toast.success('Password reset email sent (if an account exists).')
        } catch (error: any) {
            // PocketBase might throw an error if mail server isn't configured, but it's safe to catch.
            toast.error(error.message || 'Failed to request password reset.')
        }
    }

    return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-0 shadow-2xl bg-card/60 backdrop-blur-xl rounded-[2rem]">
                <CardHeader className="space-y-4 items-center text-center p-8 pb-4">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-black">Portal Access</CardTitle>
                        <CardDescription className="text-base font-medium mt-2">
                            Secure portal for directory management
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-14 rounded-xl bg-white shadow-sm"
                                required
                            />
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-14 rounded-xl bg-white shadow-sm pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary" 
                                    />
                                    <span className="text-sm font-medium text-muted-foreground">Remember me</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-sm font-bold text-primary hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-14 rounded-xl bg-primary text-white font-bold text-lg shadow-lg hover:bg-primary/90"
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
