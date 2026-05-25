const fs = require('fs');
let content = fs.readFileSync('app/page.js', 'utf8');

// Replace hero background
content = content.replace(
  "bg-[url('https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=2000&auto=format&fit=crop')]",
  "bg-[url('/images/accommodation/IMG_8185.jpg')]"
);

// Replace 5 package images
const packageImages = [
  "/images/accommodation/IMG_8186.jpg",
  "/images/accommodation/IMG_8187.jpg",
  "/images/accommodation/IMG_8188.jpg",
  "/images/accommodation/IMG_8191.jpg",
  "/images/accommodation/IMG_8193.jpg",
];
const oldPackageUrls = [
  "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501555088652-2861a3b7a68a?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1520250497591-112f231b40bd?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600016535918-18a1-a3a1a1aa1a1a?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555396273-361b3e4c1935?q=80&w=800&auto=format&fit=crop"
];

for(let i=0; i<5; i++) {
  content = content.replace(oldPackageUrls[i], packageImages[i]);
}

// Replace 5 gallery images
const galleryImages = [
  "/images/accommodation/IMG_8195.jpg",
  "/images/accommodation/IMG_8197.jpg",
  "/images/accommodation/IMG_8198.jpg",
  "/images/accommodation/IMG_8200.jpg",
  "/images/accommodation/IMG_8203.jpg",
];
const oldGalleryUrls = [
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551882547-ff40c64fe8ea?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1414235077428-338989a268e1?q=80&w=800&auto=format&fit=crop"
];

for(let i=0; i<5; i++) {
  content = content.replace(oldGalleryUrls[i], galleryImages[i]);
}

fs.writeFileSync('app/page.js', content, 'utf8');
console.log('Home page updated with local images');
