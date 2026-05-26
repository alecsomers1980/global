const fs = require('fs');
let content = fs.readFileSync('app/accommodation/page.js', 'utf8');

// 1. Add state for lightbox
content = content.replace(
  'const [currentImageIndex, setCurrentImageIndex] = useState(0);',
  'const [currentImageIndex, setCurrentImageIndex] = useState(0);\n  const [isLightboxOpen, setIsLightboxOpen] = useState(false);'
);

// 2. Modify Image container to add onClick and high quality props
const oldImageContainer = `{/* Image Slider */}
      {unit.images && unit.images.length > 0 && (
        <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[4/3] lg:aspect-[16/9] w-full overflow-hidden bg-primary/5">
          <Image
            src={unit.images[currentImageIndex]}
            alt={\`\${unit.name} - Image \${currentImageIndex + 1}\`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-opacity duration-300"
          />`;

const newImageContainer = `{/* Image Slider */}
      {unit.images && unit.images.length > 0 && (
        <div 
          className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[4/3] lg:aspect-[16/9] w-full overflow-hidden bg-primary/5 cursor-pointer group/img"
          onClick={() => setIsLightboxOpen(true)}
        >
          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors z-[5] pointer-events-none flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
          <Image
            src={unit.images[currentImageIndex]}
            alt={\`\${unit.name} - Image \${currentImageIndex + 1}\`}
            fill
            quality={90}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover/img:scale-105"
          />`;

content = content.replace(oldImageContainer, newImageContainer);

// 3. Add Lightbox JSX at the end of the article
const oldArticleEnd = `      {/* Decorative corner accent */}
      <div
        className={\`
        absolute top-1 right-0 w-20 h-20 overflow-hidden
        transition-opacity duration-500
        \${isHovered ? "opacity-100" : "opacity-0"}
      \`}
      >
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-accent/10 to-transparent" />
      </div>
    </article>
  );
}`;

const newArticleEnd = `      {/* Decorative corner accent */}
      <div
        className={\`
        absolute top-1 right-0 w-20 h-20 overflow-hidden pointer-events-none
        transition-opacity duration-500
        \${isHovered ? "opacity-100" : "opacity-0"}
      \`}
      >
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-accent/10 to-transparent" />
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={() => setIsLightboxOpen(false)}>
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2"
            onClick={() => setIsLightboxOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {unit.images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); handlePrevImage(e); }}
              className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-16 md:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div className="relative w-full max-w-6xl h-[80vh] mx-4 md:mx-24" onClick={(e) => e.stopPropagation()}>
            <Image
              src={unit.images[currentImageIndex]}
              alt={\`\${unit.name} - Image \${currentImageIndex + 1} (Fullscreen)\`}
              fill
              quality={95}
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {unit.images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); handleNextImage(e); }}
              className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-16 md:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 font-sans tracking-widest text-sm">
            {currentImageIndex + 1} / {unit.images.length}
          </div>
        </div>
      )}
    </article>
  );
}`;

content = content.replace(oldArticleEnd, newArticleEnd);

// Fix overlapping z-indexes from earlier
content = content.replace('z-10 bg-black/40', 'z-[10] bg-black/40').replace('z-10 flex gap-1.5', 'z-[10] flex gap-1.5');

fs.writeFileSync('app/accommodation/page.js', content, 'utf8');
console.log("Lightbox and quality update complete!");
