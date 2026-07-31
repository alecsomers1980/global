export const experiences = [
  {
    id: "kruger-national-park",
    slug: "kruger-national-park",
    title: "Kruger National Park",
    shortDescription: "Only 20 minutes away, making it the perfect base for guided safaris and self-drive adventures.",
    fullDescription: "Mountaincreek Lodge is situated a mere 20-minute drive from the Phabeni Gate of the world-renowned Kruger National Park. Whether you choose the independence of a self-drive safari or the expertise of a guided open-vehicle tour, the Kruger offers an unparalleled wildlife experience. Home to the legendary Big Five—lion, leopard, rhino, elephant, and buffalo—as well as hundreds of other mammal and bird species, every visit is a unique adventure. The varied landscapes, from dense bushveld to open plains, provide endless opportunities for incredible photography and wildlife viewing.",
    image: "/images/experiences/kruger_safari.png",
    category: "Wildlife & Nature",
    distance: "20 Minutes to Phabeni Gate",
    highlights: [
      "Spot the Big Five",
      "Self-drive or guided open-vehicle safaris",
      "Incredible birdwatching opportunities",
      "Experience the African bush at sunrise or sunset"
    ],
    practicalInfo: "Gates open early (times vary by season). We recommend leaving the lodge before sunrise for the best sightings. Don't forget your ID/Passport for entry.",
    reverse: false,
  },
  {
    id: "panorama-route",
    slug: "panorama-route",
    title: "Panorama Route",
    shortDescription: "Explore breathtaking views, God's Window, Blyde River Canyon, waterfalls and scenic drives.",
    fullDescription: "The Panorama Route is one of South Africa's most scenic drives, tracing the edge of the breathtaking Mpumalanga Escarpment. Start your journey just a short drive from the lodge and wind your way up to higher altitudes. You will encounter spectacular natural wonders such as the Blyde River Canyon (one of the largest green canyons in the world), the iconic Three Rondavels, the seemingly endless views from God's Window, and the fascinating geological formations at Bourke's Luck Potholes. The route is also dotted with magnificent waterfalls, including Mac Mac, Lisbon, and Berlin Falls.",
    image: "/images/experiences/panorama_route.png",
    category: "Sightseeing & Nature",
    distance: "Starts 45 Minutes Away",
    highlights: [
      "Blyde River Canyon & Three Rondavels",
      "God's Window viewpoint",
      "Bourke's Luck Potholes",
      "Numerous spectacular waterfalls"
    ],
    practicalInfo: "This is a full-day self-drive excursion. There are small entry fees at each of the viewpoints (cash or card usually accepted). Pack a light jacket as the escarpment can be cooler.",
    reverse: true,
  },
  {
    id: "adventure-activities",
    slug: "adventure-activities",
    title: "Adventure Activities",
    shortDescription: "Ziplining, quad biking, river rafting, canopy tours and more. Thrills for every kind of explorer.",
    fullDescription: "Hazyview is the adventure capital of the Lowveld. For those seeking an adrenaline rush, the Sabie River valley offers a playground of thrilling activities. Glide through the forest canopy on a high-speed zipline, navigate the rapids with white water rafting or river tubing, or explore the rugged terrain on a guided quad biking trail. For a different perspective, take to the skies in a hot air balloon at sunrise, or challenge your family to an aerial cable trail. Whatever your thrill-seeking preference, Hazyview delivers an unforgettable rush.",
    image: "/images/experiences/adventure_hazyview.png",
    category: "Action & Adventure",
    distance: "10-20 Minutes Away",
    highlights: [
      "Forest canopy zipline tours",
      "White water rafting on the Sabie River",
      "Guided quad biking trails",
      "Hot air ballooning"
    ],
    practicalInfo: "Most adventure activities require booking in advance. Wear comfortable, closed shoes and bring sunblock. We can assist with recommendations and bookings.",
    reverse: false,
  },
  {
    id: "local-food-cafe-culture",
    slug: "red-litchi", // Points to existing page
    title: "Red Litchi Farm Café",
    shortDescription: "Fresh, farm-to-table delights in a cosy setting. Perfect for coffee dates, breakfast, lunch, cake events, and kids at play.",
    fullDescription: "The Lowveld is home to a vibrant culinary scene, driven by local farms and passionate chefs. Right here on the estate, you can indulge in the delights of the Red Litchi Farm Café, offering artisanal coffee, freshly baked goods, and hearty, wholesome meals surrounded by nature. Beyond the lodge, Hazyview and the surrounding towns like Graskop and Sabie boast incredible pancake houses, craft breweries, and fine dining restaurants celebrating South African flavors.",
    image: "/images/Red Litchi/2.jpg",
    category: "Dining & Lifestyle",
    distance: "On-site & Nearby",
    highlights: [
      "Red Litchi Farm Café on site",
      "Famous Graskop pancakes",
      "Local craft breweries",
      "Fresh, farm-to-table dining"
    ],
    practicalInfo: "Check trading hours, especially on Sundays. Red Litchi Café is perfect for breakfast or lunch before heading out to explore.",
    reverse: true,
  }
];

export function getExperienceBySlug(slug) {
  return experiences.find(exp => exp.slug === slug);
}
