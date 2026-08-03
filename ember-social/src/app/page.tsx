import Link from 'next/link'
import { Calendar, Sparkles, BarChart3 } from 'lucide-react'

export default function HomePage() {
    const features = [
        {
            icon: Calendar,
            title: 'Schedule & Publish',
            description: 'Plan content once and publish it automatically to TikTok, Instagram, Facebook, and YouTube.',
        },
        {
            icon: Sparkles,
            title: 'AI-Assisted Captions',
            description: 'Generate on-brand captions and content ideas tailored to each client’s voice.',
        },
        {
            icon: BarChart3,
            title: 'Performance Analytics',
            description: 'Track reach, engagement, and growth for every connected account in one dashboard.',
        },
    ]

    return (
        <div className="min-h-screen flex flex-col bg-[#0a0a0f] text-[#e2e2f0]" style={{ fontFamily: 'var(--font-sans)' }}>
            <header className="flex items-center justify-between max-w-5xl w-full mx-auto px-6 py-6">
                <img src="/images/ember-logo.png" alt="Ember Automations" className="h-16 w-auto" />
                <Link href="/login"
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-orange-500/20"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                    Log In
                </Link>
            </header>

            <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 space-y-16">
                <section className="text-center space-y-4 max-w-2xl mx-auto">
                    <h1 className="text-4xl font-bold text-white">Manage all your clients&apos; social media from one place</h1>
                    <p className="text-lg" style={{ color: '#a0a0c0' }}>
                        Ember Social is an agency platform for connecting client social media accounts, scheduling content,
                        and publishing it automatically &mdash; with AI-assisted captions and performance analytics built in.
                    </p>
                </section>

                <section className="grid md:grid-cols-3 gap-6">
                    {features.map(({ icon: Icon, title, description }) => (
                        <div key={title} className="glass-card p-6 space-y-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: '#f9731615', color: '#f97316' }}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <h2 className="font-semibold text-white">{title}</h2>
                            <p className="text-sm" style={{ color: '#8a8aaa' }}>{description}</p>
                        </div>
                    ))}
                </section>
            </main>

            <footer className="max-w-5xl w-full mx-auto px-6 py-8 flex items-center justify-between text-sm" style={{ color: '#5a5a7a', borderTop: '1px solid #2a2a3d' }}>
                <span>&copy; {new Date().getFullYear()} Ember Automations</span>
                <div className="flex items-center gap-6">
                    <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                </div>
            </footer>
        </div>
    )
}
