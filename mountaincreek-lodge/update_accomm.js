const fs = require('fs');
let content = fs.readFileSync('app/accommodation/page.js', 'utf8');

// 1. Add Image import and allImages array
content = content.replace(
  'import { useState } from "react";',
  `import { useState } from "react";\nimport Image from "next/image";\n\nconst allImages = [\n  "IMG_8185.jpg", "IMG_8186.jpg", "IMG_8187.jpg", "IMG_8188.jpg", "IMG_8191.jpg", "IMG_8193.jpg", "IMG_8195.jpg", "IMG_8197.jpg",\n  "IMG_8198.jpg", "IMG_8200.jpg", "IMG_8203.jpg", "IMG_8205.jpg", "IMG_8206.jpg", "IMG_8208.jpg", "IMG_8210.jpg", "IMG_8212.jpg",\n  "IMG_8214.jpg", "IMG_8217.jpg", "IMG_8219.jpg", "IMG_8222.jpg", "IMG_8225.jpg", "IMG_8231.jpg", "IMG_8232.jpg",\n  "IMG_8234.jpg", "IMG_8236.jpg", "IMG_8239.jpg", "IMG_8241.jpg", "IMG_8243.jpg", "IMG_8244.jpg", "IMG_8246.jpg",\n  "IMG_8249.jpg", "IMG_8252.jpg", "IMG_8253.jpg", "IMG_8255.jpg", "IMG_8257.jpg", "IMG_8261.jpg", "IMG_8263.jpg",\n  "IMG_8267.jpg", "IMG_8270.jpg", "IMG_8272.jpg", "IMG_8275.jpg", "IMG_8278.jpg", "IMG_8279.jpg", "IMG_8281.jpg",\n  "IMG_8283.jpg", "IMG_8287.jpg", "IMG_8288.jpg", "IMG_8290.jpg", "IMG_8292.jpg", "IMG_8293.jpg", "IMG_8294.jpg"\n].map(f => "/images/accommodation/" + f);`
);

// 2. Add images to units
content = content.replace('span: "col-span-2",\n  },\n  {\n    id: 2,', 'span: "col-span-2",\n    images: allImages.slice(0, 8),\n  },\n  {\n    id: 2,');
content = content.replace('span: "col-span-1",\n  },\n  {\n    id: 3,', 'span: "col-span-1",\n    images: allImages.slice(8, 15),\n  },\n  {\n    id: 3,');
content = content.replace('span: "col-span-1",\n  },\n  {\n    id: 4,', 'span: "col-span-1",\n    images: allImages.slice(15, 22),\n  },\n  {\n    id: 4,');
content = content.replace('span: "col-span-1",\n  },\n  {\n    id: 5,', 'span: "col-span-1",\n    images: allImages.slice(22, 29),\n  },\n  {\n    id: 5,');
content = content.replace('span: "col-span-1",\n  },\n  {\n    id: 6,', 'span: "col-span-1",\n    images: allImages.slice(29, 36),\n  },\n  {\n    id: 6,');
content = content.replace('span: "col-span-1",\n  },\n  {\n    id: 7,', 'span: "col-span-1",\n    images: allImages.slice(36, 43),\n  },\n  {\n    id: 7,');
content = content.replace('span: "col-span-2",\n  },\n];', 'span: "col-span-2",\n    images: allImages.slice(43, 51),\n  },\n];');

// 3. Update UnitCard component
const oldUnitCardTop = `function UnitCard({ unit, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const whatsappMessage = encodeURIComponent(
    \`Hi Mountaincreek Lodge, I would like to enquire about \${unit.name}...\`
  );
  const whatsappUrl = \`https://wa.me/27829594643?text=\${whatsappMessage}\`;
  const bookingUrl = "https://www.nightsbridge.co.za/bridge/book?bbid=27902";

  const cardOrdinal = String(unit.id).padStart(2, "0");

  return (
    <article
      className={\`
        group relative bg-white rounded-sm border border-primary/10 overflow-hidden
        transition-all duration-500 ease-out
        hover:border-primary/25 hover:shadow-[0_8px_40px_-12px_rgba(26,47,35,0.15)]
        \${unit.span === "col-span-2" ? "md:col-span-2" : "md:col-span-1"}
      \`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top accent bar */}
      <div className="h-1 bg-primary w-full" />`;

const newUnitCardTop = `function UnitCard({ unit, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? unit.images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === unit.images.length - 1 ? 0 : prev + 1));
  };

  const whatsappMessage = encodeURIComponent(
    \`Hi Mountaincreek Lodge, I would like to enquire about \${unit.name}...\`
  );
  const whatsappUrl = \`https://wa.me/27829594643?text=\${whatsappMessage}\`;
  const bookingUrl = "https://www.nightsbridge.co.za/bridge/book?bbid=27902";

  const cardOrdinal = String(unit.id).padStart(2, "0");

  return (
    <article
      className={\`
        group relative bg-white rounded-sm border border-primary/10 overflow-hidden
        transition-all duration-500 ease-out
        hover:border-primary/25 hover:shadow-[0_8px_40px_-12px_rgba(26,47,35,0.15)]
        \${unit.span === "col-span-2" ? "md:col-span-2" : "md:col-span-1"}
      \`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Slider */}
      {unit.images && unit.images.length > 0 && (
        <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[4/3] lg:aspect-[16/9] w-full overflow-hidden bg-primary/5">
          <Image
            src={unit.images[currentImageIndex]}
            alt={\`\${unit.name} - Image \${currentImageIndex + 1}\`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-opacity duration-300"
          />

          {unit.images.length > 1 && (
            <button
              onClick={handlePrevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {unit.images.length > 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {unit.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 bg-black/20 px-2 py-1.5 rounded-full backdrop-blur-sm">
              {unit.images.map((_, idx) => (
                <span
                  key={idx}
                  className={\`block w-1.5 h-1.5 rounded-full transition-all \${
                    idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                  }\`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Top accent bar */}
      <div className="h-1 bg-primary w-full" />`;

content = content.replace(oldUnitCardTop, newUnitCardTop);

fs.writeFileSync('app/accommodation/page.js', content, 'utf8');
console.log('Update complete!');
