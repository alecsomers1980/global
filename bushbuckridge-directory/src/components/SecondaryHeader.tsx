import { Badge } from '@/components/ui/badge'

interface SecondaryHeaderProps {
    title: string
    subtitle?: string
    badge?: string
    backgroundImage?: string
}

export default function SecondaryHeader({
    title,
    subtitle,
    badge,
    backgroundImage = '/hero.png'
}: SecondaryHeaderProps) {
    return (
        <section className="relative pt-48 pb-32 overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url('${backgroundImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-background" />
            </div>

            <div className="container relative z-10 mx-auto px-4 text-center">
                {badge && (
                    <Badge variant="outline" className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-md px-6 py-1.5 text-sm font-medium tracking-wide uppercase">
                        {badge}
                    </Badge>
                )}
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto mb-6 leading-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-xl text-white/70 max-w-2xl mx-auto font-medium italic">
                        {subtitle}
                    </p>
                )}
            </div>
        </section>
    )
}
