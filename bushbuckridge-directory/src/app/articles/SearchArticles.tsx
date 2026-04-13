'use client'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function SearchArticles() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState(searchParams.get('q') || '')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (query.trim()) params.set('q', query.trim())
        router.push(`/articles?${params.toString()}`)
    }

    return (
        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/30" />
            <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search spotlight articles..."
                className="pl-14 h-16 text-lg font-medium bg-card border-0 shadow-xl rounded-2xl focus-visible:ring-primary/20 focus-visible:ring-2"
            />
        </form>
    )
}
