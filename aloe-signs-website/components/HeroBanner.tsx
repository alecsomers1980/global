'use client';

import Link from 'next/link';

const slides = [
    {
        id: 1,
        seoH1: 'Branding, Printing & Signage Company in South Africa',
        title: 'UNMISSABLE\nBRANDING\nSOLUTIONS',
        description: 'Test us and become part of our returning customer circle.',
        primaryCTA: { text: 'Get a Quote', href: '/get-quote' },
        secondaryCTA: { text: 'View Our Work', href: '#work' },
        location: 'High-impact visual branding built to be seen.'
    }
];

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
                left: x, 
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
                   {/* Zoom out solution: wider aspect ratio inherently shows more of the image laterally */}
                   <div 
                        className="w-full h-full bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-105"
                        style={{ 
                            backgroundImage: `url('${image}')`, 
                            backgroundSize: 'cover' 
                        }}
                   />
                   {/* Subtle dark tint to help text readability, lifted on hover */}
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

const hexData = [
    // Main large grouped images
    { w: 320, x: "12%", y: "10%", image: "/images/Billboards.jpg", z: 20 },
    { w: 260, x: "-5%", y: "35%", image: "/images/Tangible Visual Texture.jpeg", z: 15 },
    { w: 290, x: "22%", y: "55%", image: "/images/3D.jpeg", z: 18 },
    { w: 250, x: "42%", y: "15%", image: "/images/Wall Art.jpeg", z: 10 }, // Moved down from 5%
    
    // Extra portfolio items scaled down slightly
    { w: 240, x: "0%", y: "65%", image: "/images/portfolio/vehicle-rapping-main.jpg", z: 16, delay: "1s" }, // Increased width and moved right from -10%
    { w: 180, x: "55%", y: "45%", image: "/images/portfolio/set-building-main.jpg", z: 12, delay: "2s" },

    // Colored accent elements based on inspiration imagery
    { w: 140, x: "48%", y: "85%", color: "bg-aloe-green", z: 25, floatType: "y", delay: "1.5s" },
    { w: 100, x: "8%", y: "-5%", color: "bg-gradient-to-br from-orange-400 to-amber-600", z: 8, floatType: "x", delay: "2.5s" },
    { w: 120, x: "2%", y: "90%", color: "bg-gradient-to-br from-blue-500 to-cyan-400", z: 22, floatType: "y", delay: "0.5s" },
    { w: 150, x: "32%", y: "25%", color: "bg-white/5", z: 5, floatType: "y", delay: "0s" },
    
    // Wireframe outlines floating around
    { w: 100, x: "36%", y: "90%", outline: true, z: 28, delay: "1s" },
    { w: 150, x: "65%", y: "20%", outline: true, z: 25, delay: "3s" },
    { w: 80,  x: "15%", y: "45%", outline: true, z: 25, delay: "2s" },
    { w: 120, x: "25%", y: "85%", outline: true, z: 22, color: "text-amber-500", delay: "1.8s" },
    { w: 60,  x: "5%",  y: "25%", outline: true, z: 30, color: "text-cyan-400", delay: "0s" },
];

export default function HeroBanner() {
    const activeSlide = slides[0];

    return (
        <section className="relative min-h-[85svh] md:h-[85vh] bg-charcoal flex items-center overflow-hidden">
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

            {/* Background Texture Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Left Side Feature - Floating Hexagon Network */}
            <div className="absolute inset-0 w-[120%] -left-[10%] md:left-0 md:w-[65%] h-full z-0 overflow-visible opacity-40 md:opacity-100 pointer-events-none md:pointer-events-auto">
                {hexData.map((hex, i) => (
                    <Hex key={i} {...hex} />
                ))}
            </div>

            {/* Dark Overlay - Fades left-to-right to protect text legibility */}
            <div className="absolute inset-0 bg-charcoal/80 md:bg-transparent md:bg-gradient-to-l md:from-charcoal md:via-charcoal/95 md:to-transparent md:w-[60%] md:left-auto md:right-0 z-10 pointer-events-none border-t-[1px] border-white/5" />

            {/* Right Side Content Container */}
            <div className="relative h-full w-full max-w-[1400px] mx-auto px-6 flex flex-col justify-center pt-36 pb-12 md:pt-20 md:pb-0 items-center md:items-end z-20 pointer-events-none">
                <div className="max-w-2xl text-center md:text-right flex flex-col items-center md:items-end pointer-events-auto">
                    <div className="animate-fadeIn w-full flex flex-col items-center md:items-end">
                        
                        <h1 className="text-aloe-green font-bold tracking-widest uppercase text-[10px] md:text-sm mb-2 md:mb-4 flex items-center justify-center md:justify-end gap-3 w-full">
                            <span className="md:hidden w-8 h-px bg-aloe-green block"></span>
                            {activeSlide.seoH1}
                            <span className="hidden md:block w-8 h-px bg-aloe-green"></span>
                        </h1>

                        <h2 className="text-[calc(1rem+8vw)] md:text-[calc(2.5rem+4.5vw)] font-black text-white mb-3 md:mb-6 uppercase leading-[0.9] tracking-tighter">
                            {activeSlide.title.split('\n').map((line, i) => (
                                <span key={i} className="block">{line}</span>
                            ))}
                        </h2>

                        <p className="text-sm md:text-2xl font-medium text-white/70 mb-6 md:mb-10 max-w-2xl leading-relaxed">
                            {activeSlide.description}
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-end gap-4 mb-4 md:mb-8 w-full">
                            <Link
                                href={activeSlide.primaryCTA.href}
                                className="px-6 py-3 md:px-10 md:py-5 bg-aloe-green text-charcoal font-black rounded-full uppercase tracking-wider hover:bg-white transition-all duration-300 text-base md:text-xl shadow-[0_0_20px_rgba(202,238,166,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] hover:-translate-y-1"
                            >
                                {activeSlide.primaryCTA.text}
                            </Link>
                        </div>

                        <p className="text-white/40 font-bold uppercase tracking-widest text-xs text-center md:text-right w-full">
                            {activeSlide.location}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
