'use server'

import { cookies } from 'next/headers'

export async function setAuthCookie(token: string, model: any, maxAge?: number) {
    const cookieStore = await cookies()
    const value = JSON.stringify({ token, model })
    
    cookieStore.set({
        name: 'pb_auth',
        value: value,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: maxAge,
        sameSite: 'lax'
    })
}

export async function clearAuthCookie() {
    const cookieStore = await cookies()
    cookieStore.delete('pb_auth')
}
