'use client';

import Link from 'next/link';

interface ServiceHeroProps {
    title: string;
    tagline: string;
    description: string;
    backgroundImage?: string;
    serviceId?: string;
    compact?: boolean;
}

// Helper for horizontal flat-top Hexagon
// Aspect ratio: Height = Width * 0.866
function Hex({ 
  w, 
  x, 
  y, 
  image, 
  color = "bg-aloe-green/20", 
  outline = false, 
  z = 10, 
  delay = "0s", 
  duration = "10s",
  floatType = "y"
}: any) {
    const isOutline = outline;
    const clipPath = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";
    
    // Setup inline animations
    const anim = floatType === "y" 
        ? `float-y ${duration} ease-in-out infinite alternate ${delay}`
        : `float-x ${duration} ease-in-out infinite alternate ${delay}`;

    return (
        <div 
            className={`absolute transition-transform duration-1000 ${isOutline ? '' : 'hover:scale-[1.02]'} hover:z-50`}
            style={{ 
                right: x, // Changed to right alignment for service pages
                top: y, 
                width: w, 
                height: w * 0.866, 
                zIndex: z,
                animation: anim
            }}
        >
            {isOutline ? (
                // Outline hexagon
                <svg viewBox="0 0 100 86.6" className="w-full h-full drop-shadow-lg">
                    <polygon 
                        points="25,1 75,1 99,43.3 75,85.6 25,85.6 1,43.3" 
                        fill="none" 
                        stroke="currentColor" 
                        className={color.startsWith('text') ? color : "text-aloe-green"}
                        strokeWidth="1.5"
                    />
                </svg>
            ) : image ? (
                // Image hexagon
                <div 
                    className="w-full h-full absolute inset-0 group overflow-hidden bg-charcoal shadow-2xl"
                    style={{ clipPath }}
                >
                   <div 
                        className="w-full h-full bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-105"
                        style={{ 
                            backgroundImage: `url('${image}')`, 
                            backgroundSize: 'cover' 
                        }}
                   />
                   <div className="absolute inset-0 bg-charcoal/20 group-hover:bg-transparent transition-colors duration-500" />
                </div>
            ) : (
                // Solid color hexagon
                <div 
                    className={`w-full h-full opacity-70 ${color} shadow-2xl`}
                    style={{ clipPath }}
                />
            )}
        </div>
    );
}

export default function ServiceHero({ title, tagline, description, backgroundImage, serviceId, compact = false }: ServiceHeroProps) {

    // Define standard hex layout for the right side
    const hexData = [
        // Main large image (uses the service image if passed down, else fallback)
        { w: 320, x: "5%", y: "15%", image: backgroundImage || "/images/portfolio/set-building-main.jpg", z: 20 },
        
        // Secondary accent images
        { w: 200, x: "30%", y: "45%", image: "/images/Tangible Visual Texture.jpeg", z: 15 },
        { w: 180, x: "-5%", y: "65%", image: "/images/3D.jpeg", z: 18 },
        
        // Colored accent elements based on inspiration imagery
        { w: 140, x: "25%", y: "80%", color: "bg-aloe-green", z: 10, floatType: "y", delay: "1.5s" },
        { w: 100, x: "40%", y: "5%", color: "bg-gradient-to-br from-orange-400 to-amber-600", z: 8, floatType: "x", delay: "2.5s" },
        { w: 120, x: "50%", y: "55%", color: "bg-gradient-to-br from-blue-500 to-cyan-400", z: 22, floatType: "y", delay: "0.5s" },
        { w: 150, x: "12%", y: "25%", color: "bg-white/5", z: 5, floatType: "y", delay: "0s" },
        
        // Wireframe outlines floating around
        { w: 100, x: "16%", y: "90%", outline: true, z: 28, delay: "1s" },
        { w: 150, x: "-5%", y: "20%", outline: true, z: 25, delay: "3s" },
        { w: 80,  x: "45%", y: "35%", outline: true, z: 12, delay: "2s" },
        { w: 120, x: "25%", y: "85%", outline: true, z: 22, color: "text-amber-500", delay: "1.8s" },
    ];

    return (
        <div className={`relative bg-charcoal text-white overflow-hidden flex items-center ${
            compact 
                ? "py-12 md:py-16 min-h-[35vh]" 
                : "py-20 md:py-32 min-h-[60vh]"
        }`}>
            {/* Inline keyframes for the smooth floating animations */}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes float-y {
                0% { transform: translateY(0px) rotate(0deg); }
                100% { transform: translateY(-20px) rotate(2deg); }
              }
              @keyframes float-x {
                0% { transform: translateX(0px) rotate(0deg); }
                100% { transform: translateX(20px) rotate(-2deg); }
              }
            `}} />

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}></div>
            </div>

            {/* Right Side Feature - Floating Hexagon Network */}
            <div className="absolute inset-0 w-[120%] -right-[10%] md:right-0 md:w-[65%] h-full z-0 overflow-visible opacity-40 md:opacity-100 pointer-events-none md:pointer-events-auto md:left-auto" style={{ right: 0 }}>
                <div className="relative w-full h-full max-w-[800px] float-right">
                    {hexData.map((hex, i) => (
                        <Hex key={i} {...hex} />
                    ))}
                </div>
            </div>

            {/* Dark Overlay - Fades right-to-left to protect text legibility on the left */}
            <div className="absolute inset-0 bg-charcoal/80 md:bg-transparent md:bg-gradient-to-r md:from-charcoal md:via-charcoal/95 md:to-transparent md:w-[60%] z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-20 w-full pointer-events-none">
                <div className="max-w-3xl pointer-events-auto relative">
                    {/* Breadcrumb */}
                    <div className="flex flex-wrap items-center gap-2 text-sm text-light-grey mb-8 font-bold tracking-widest uppercase">
                        <Link href="/" className="hover:text-aloe-green transition-colors">
                            <span className="w-8 h-1 bg-aloe-green inline-block mr-3 align-middle"></span>
                            Home
                        </Link>
                        <span>/</span>
                        <Link href="/services" className="hover:text-aloe-green transition-colors">
                            Services
                        </Link>
                        <span>/</span>
                        <span className="text-white">{title}</span>
                    </div>

                    {/* Title */}
                    <h1 className={`${
                        compact ? "text-4xl md:text-5xl lg:text-6xl" : "text-5xl md:text-6xl lg:text-7xl"
                    } font-black mb-6 uppercase tracking-tighter leading-[0.95]`}>
                        {title}
                    </h1>

                    {/* Tagline */}
                    <p className={`${compact ? "text-xl md:text-2xl mb-6" : "text-2xl md:text-3xl mb-8"} text-aloe-green font-bold uppercase tracking-widest`}>
                        {tagline}
                    </p>

                    {/* Description */}
                    <p className={`${compact ? "text-base md:text-lg mb-8" : "text-lg md:text-xl mb-10"} text-white/70 max-w-2xl leading-relaxed font-medium`}>
                        {description}
                    </p>

                    {/* CTA Button */}
                    <Link
                        href="/contact"
                        className="inline-block px-10 py-5 bg-aloe-green text-charcoal font-black rounded-full hover:bg-white transition-all duration-300 uppercase tracking-wider shadow-[0_0_20px_rgba(202,238,166,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] hover:-translate-y-1"
                    >
                        Let&apos;s Start a project
                    </Link>
                </div>
            </div>
        </div>
    );
}
