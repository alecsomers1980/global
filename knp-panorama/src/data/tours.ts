import type { Pillar, Tour } from '@/types/tour';

export const TOURS: Tour[] = [
  {
    slug: "full-day-safari-kruger-national-park",
    title: "Full Day Safari — Kruger National Park",
    pillar: "safari",
    destination: "kruger-national-park",
    duration: "8–10 hours",
    locationLabel: "Kruger National Park, Mpumalanga",
    summary:
      "A full dawn-to-dusk game drive across the vast Kruger wilderness, including a bush braai lunch and time with a local guide who shares tracking skills and ecology insights.",
    heroImage: "/images/tours/full-day-safari-kruger-national-park.webp",
    gallery: [],
    overview: [
      "You leave before first light and enter the reserve as the gates open. While the air is still cool, we start scanning for predators on the move — lion, leopard, and spotted hyena are often still active. The morning takes us past pans and rivers where hippos grunt and crocodiles bask, and we look for elephant herds along the watercourses.",
      "Mid-morning we stop for a bush braai at a shaded rest camp or a designated picnic site. The meal is prepared over an open fire while you stretch your legs and listen to the sounds of the bush around you. After lunch we cross through open savannah into dense riverine forest, watching for plains game, birds, and the tracks that tell of the night’s movements.",
      "The afternoon drive follows quieter roads where wild dog and cheetah are sometimes sighted. Your guide explains how to read animal spoor, identifies medicinal plants, and talks frankly about conservation challenges in the park. We finish at a panoramic viewpoint as the sun sets, then make our way back to the gate after dusk."
    ],
    highlights: [
      {
        title: "Sunrise Game Drive",
        body: "Depart at first light when big cats and hyenas are most active. Your guide knows the roads that offer the best early sightings and will position the vehicle so you get a proper look."
      },
      {
        title: "Bush Braai Lunch",
        body: "A fireside meal in the heart of the park. You eat under the trees at a quiet rest camp, soaking up the atmosphere before the afternoon session begins."
      },
      {
        title: "Changing Landscapes",
        body: "The route crosses several ecosystems — from open grassland to riverine thickets — giving you a chance to see different wildlife and appreciate the park’s variety."
      },
      {
        title: "Quiet Afternoon Trails",
        body: "We head into less-visited areas where wild dog and cheetah sometimes appear. Fewer vehicles mean a calmer experience and more time to stop for birds and smaller creatures."
      },
      {
        title: "Guide’s Field Knowledge",
        body: "Your guide grew up on the edges of the park and shares practical tips on tracking, plant uses, and the realities of conservation in a way that brings the landscape to life."
      }
    ],
    included: ["Lunch (bush braai)", "Transport"],
    excluded: ["Personal spending money", "Gratuities", "Travel insurance"],
    whatToBring: [
      "Comfortable neutral-coloured clothing",
      "Sunscreen",
      "Hat",
      "Binoculars",
      "Camera",
      "Warm layer for the early start"
    ]
  },
  {
    slug: "half-day-safari-kruger-national-park",
    title: "Half Day Safari — Kruger National Park",
    pillar: "safari",
    destination: "kruger-national-park",
    duration: "4–5 hours",
    locationLabel: "Kruger National Park, Mpumalanga",
    summary:
      "An early morning safari capturing the best light and most active game, with a short refreshment stop and the knowledge of a local guide.",
    heroImage: "/images/tours/half-day-safari-kruger-national-park.webp",
    gallery: [],
    overview: [
      "The half-day safari starts early to catch the golden morning light when game is most animated. We enter the reserve at gate-opening time and head straight to areas known for recent lion and leopard activity. Your guide will also show you waterholes where hippos, crocodiles and thirsty antelope gather.",
      "About midway we pause for a light refreshment — coffee or tea with a snack — at a lookout point or a quiet camp. From there we continue scanning the plains and river loops until the heat builds and the animals begin to settle. We have you back at your lodge by midday, with a memory card full of photos and a much better sense of how the bush works."
    ],
    highlights: [
      {
        title: "Early Start",
        body: "We leave before the heat picks up, using the first hours when predators are often still on the move and the bush is at its freshest."
      },
      {
        title: "Active Game",
        body: "Your guide knows where to look for elephant, buffalo, antelope, and the birds that follow the herds. Mornings in the park are rarely quiet."
      },
      {
        title: "Scenic Coffee Stop",
        body: "A short break at a viewpoint or rest camp lets you stretch your legs, sip something warm, and absorb the sounds of the bush before we continue the drive."
      },
      {
        title: "Local Insights",
        body: "Your guide shares stories from growing up in the area — explaining animal behaviour, plant medicine, and how communities live alongside the park."
      },
      {
        title: "Compact Adventure",
        body: "Ideal for travellers who only have a morning but don’t want to miss a genuine Kruger experience. You still see a lot in four to five hours."
      }
    ],
    included: ["Morning refreshments", "Transport"],
    excluded: ["Personal spending money", "Gratuities", "Travel insurance"],
    whatToBring: [
      "Comfortable neutral-coloured clothing",
      "Sunscreen",
      "Hat",
      "Binoculars",
      "Camera",
      "Warm layer for the early start"
    ]
  },
  {
    slug: "full-day-panorama",
    title: "Full Day Panorama Route",
    pillar: "tours",
    destination: "panorama-route",
    duration: "8–10 hours",
    locationLabel: "Panorama Route, Mpumalanga",
    summary:
      "A full-day journey along the escarpment visiting Blyde River Canyon, Bourke’s Luck Potholes, God’s Window and the historic town of Pilgrim’s Rest.",
    heroImage: "/images/tours/full-day-panorama.webp",
    gallery: [],
    overview: [
      "The day begins with a drive up onto the escarpment, where the air cools and the lowveld stretches out below. Our first major stop is the rim of the Blyde River Canyon — one of the largest green canyons on earth — where you can walk along viewpoints and watch eagles circling above the treetops.",
      "From there we move to Bourke’s Luck Potholes, a series of cylindrical rock pools carved by centuries of swirling water at the confluence of the Blyde and Treur rivers. You’ll have time to explore the walkways, peer into the potholes, and hear the local legends attached to this geological wonder.",
      "After a lunch break we continue to God’s Window, a sheer cliff edge with a view that stretches across the plateau all the way to the distant blue mountains. The day ends in the living museum town of Pilgrim’s Rest, where you can stroll past original tin-roofed buildings from the gold-rush era before we head back down the pass."
    ],
    highlights: [
      {
        title: "Blyde River Canyon",
        body: "Stand on the lip of one of Africa’s largest canyons, looking down onto the treetops and the winding Blyde River far below."
      },
      {
        title: "Bourke’s Luck Potholes",
        body: "Marvel at the swirling cylindrical rock pools carved by the confluence of the Blyde and Treur rivers — a geological spectacle explained by your guide."
      },
      {
        title: "God’s Window",
        body: "On a clear day the view from this sheer cliff stretches across the lowveld plateau to the distant blue hills. A short walking trail takes you through indigenous forest to the best vantage point."
      },
      {
        title: "Pilgrim’s Rest",
        body: "Step back into the 1870s gold rush in a town preserved as a national monument. Wooden buildings, a vintage garage, and quiet cemetery tell stories of fortune seekers."
      },
      {
        title: "Escarpment Panorama",
        body: "Throughout the day the road hugs the edge of the Great Escarpment, offering ever-changing views of the Mpumalanga lowveld below."
      }
    ],
    included: ["Transport and local guide"],
    excluded: ["Personal spending money", "Gratuities", "Travel insurance"],
    whatToBring: [
      "Comfortable walking shoes",
      "Sunscreen",
      "Hat",
      "Camera",
      "Water bottle",
      "Light jacket or fleece"
    ]
  },
  {
    slug: "half-day-panorama",
    title: "Half Day Panorama Route",
    pillar: "tours",
    destination: "panorama-route",
    duration: "4–5 hours",
    locationLabel: "Panorama Route, Mpumalanga",
    summary:
      "A condensed morning tour of the Panorama Route’s top viewpoints, including God’s Window, Bourke’s Luck Potholes and a canyon lookout, for travellers short on time.",
    heroImage: "/images/tours/half-day-panorama.webp",
    gallery: [],
    overview: [
      "Designed for travellers who want to taste the Panorama Route in a few hours, this morning trip focuses on the highlights closest to the access roads. We start at a canyon viewpoint that opens up the great green expanse below, then move on to Bourke’s Luck Potholes.",
      "A stop at God’s Window completes the loop — its misty forest path and sudden cliff-edge view leave a lasting impression. You are back at your lodge by early afternoon, having seen the three most iconic stops without a full day on the road."
    ],
    highlights: [
      {
        title: "Blyde Canyon Lookout",
        body: "A short stop at a vantage point overlooking the great green canyon — perfect for photographs and understanding the scale of the escarpment."
      },
      {
        title: "Bourke’s Luck Potholes",
        body: "See the famous swirling rock pools and walk across the footbridges while your guide explains the geology and folklore."
      },
      {
        title: "God’s Window",
        body: "Weather permitting, the view from this cliff stretches across the lowveld. A brief forest walk leads to the edge where the world drops away."
      },
      {
        title: "Efficient Route",
        body: "In just over four hours you visit the Panorama’s most celebrated stops, leaving the afternoon free for other plans."
      },
      {
        title: "Local Companion",
        body: "Your driver-guide grew up exploring these mountains and will point out details — from rock formations to medicinal plants — that you might otherwise miss."
      }
    ],
    included: ["Transport and local guide"],
    excluded: ["Personal spending money", "Gratuities", "Travel insurance"],
    whatToBring: [
      "Comfortable walking shoes",
      "Sunscreen",
      "Hat",
      "Camera",
      "Water bottle",
      "Light jacket or fleece"
    ]
  },
  {
    slug: "or-tambo-transfer",
    title: "OR Tambo Airport Transfer",
    pillar: "transfers",
    destination: "johannesburg",
    duration: "By arrangement",
    locationLabel: "OR Tambo International to the Lowveld",
    summary:
      "Private door-to-door road transfer between Johannesburg’s OR Tambo International Airport and your accommodation in the Mpumalanga Lowveld, with a friendly driver who meets you at arrivals and handles your luggage.",
    heroImage: "/images/tours/or-tambo-transfer.webp",
    gallery: [],
    overview: [
      "Your driver meets you at the arrivals hall of OR Tambo International with a nameboard and helps you with your luggage. From there you settle into a comfortable, air-conditioned vehicle for the road journey east.",
      "The drive climbs out of Johannesburg, crosses the Highveld grasslands, and descends through the dramatic escarpment passes into the subtropical Lowveld. Along the way your driver can point out notable landmarks and suggest a good place to stop for coffee or a leg-stretch.",
      "You are dropped at the door of your accommodation, whether a lodge near the Kruger gates or a guest house in the towns of Hazyview, White River or Nelspruit. The journey takes approximately four to five hours, depending on traffic and weather, and we adjust the departure time to suit your flight and check-in."
    ],
    highlights: [
      {
        title: "Meet-and-Greet",
        body: "Your driver waits at arrivals with a nameboard, takes your luggage, and escorts you to the vehicle — no hunting for a taxi."
      },
      {
        title: "Comfortable Ride",
        body: "Travel in a modern, air-conditioned vehicle with enough space for you and your bags, making the long haul eastwards a relaxed affair."
      },
      {
        title: "Scenic Routing",
        body: "The road winds off the plateau through stunning escarpment passes, offering sweeping views of the lowveld as you descend."
      },
      {
        title: "Luggage Assistance",
        body: "Your driver loads and unloads your bags at both ends of the journey, so you can simply sit back and enjoy the scenery."
      },
      {
        title: "Flexible Timing",
        body: "We coordinate the pickup around your flight arrival or your preferred departure time, making the transfer work for your schedule."
      }
    ],
    included: [
      "Private transport",
      "Meet-and-greet at arrivals",
      "Luggage assistance",
      "Bottled water"
    ],
    excluded: ["Personal spending money", "Gratuities", "Travel insurance"],
    whatToBring: [
      "Comfortable clothes for the drive",
      "Phone charger or power bank",
      "Any personal medication",
      "Snacks and water for the road"
    ]
  }
];

export function getTour(slug: string): Tour | undefined {
  return TOURS.find((t) => t.slug === slug);
}

export function getToursByPillar(pillar: Pillar): Tour[] {
  return TOURS.filter((t) => t.pillar === pillar);
}