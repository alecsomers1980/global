// Centralized site copy — sourced from nyoniedu.co.za (live site) + client brief.
// Keep this as the single source of truth so page/component code stays presentational.

export const siteConfig = {
  name: "Nyoni Education Hub",
  tagline: "Where curiosity leads and creativity thrives",
  description:
    "An environmentally friendly, child-centered school and tutor centre in White River — built around critical thinking, soft skills, and a calm learning environment.",
  phone: "+27 (69) 220 2663",
  email: "info@nyoniedu.co.za",
  address: {
    line1: "Portion 25, Bellevue",
    line2: "New Plaston Road",
    line3: "White River",
  },
  social: {
    facebook: "https://www.facebook.com/Nyonieducationhub",
    instagram: "https://www.instagram.com/nyonieducation",
  },
};

export const nav = [
  { label: "Home", href: "/" },
  { label: "Our Story", href: "/our-story" },
  { label: "School", href: "/school" },
  { label: "Tutor Centre", href: "/tutor-centre" },
  { label: "Philosophy", href: "/philosophy" },
  { label: "Gallery", href: "/gallery" },
  { label: "Admissions", href: "/admissions" },
  { label: "Contact", href: "/contact" },
];

export const valueStrip = [
  "Critical Thinking",
  "Skills Development",
  "Future Oriented",
  "Child Centered",
  "Inspire Innovation",
  "Holistic Growth",
];

export const vision =
  "Nurturing minds, building character, and caring for our planet through education that moves the future.";

export const mission =
  "To provide a supportive learning environment that nurtures minds, builds character, and encourages care for the environment, while helping learners reach their academic potential. Through guided learning and individual support, we develop confidence, responsibility, and essential life skills.";

export const philosophyPoints = [
  "Small classes, allowing for personalized attention and a tailored learning experience for each student.",
  "A focus on critical thinking and understanding, so students engage deeply with content rather than relying on memorization.",
  "Progressive learning methods that prepare students with the skills they need to thrive in an ever-changing future.",
  "Project-based learning and practical skills that build creativity, problem-solving, and real-world competence.",
];

export const values = [
  { title: "Collaboration & Communication", icon: "Users" },
  { title: "Kindness & Compassion", icon: "Heart" },
  { title: "Commitment & Perseverance", icon: "Target" },
  { title: "Respect & Citizenship", icon: "Handshake" },
  { title: "Gratitude & Appreciation", icon: "Sparkles" },
];

export const programs = [
  {
    slug: "school",
    grade: "Grade 4 – 7",
    name: "School",
    summary:
      "A CAPS-aligned, project-based school programme for a calm, supportive foundation phase.",
    features: [
      "CAPS Curriculum",
      "Project Based Learning",
      "Limited Exams",
      "No Homework",
    ],
    href: "/school",
  },
  {
    slug: "tutor-centre",
    grade: "Grade 8 – 12",
    name: "Tutor Centre",
    summary:
      "A CAPS-aligned tutor centre guiding learners through to their National Senior Certificate.",
    features: [
      "CAPS Curriculum",
      "Online Provider",
      "Grade 12 National Senior Certificate Exams",
    ],
    href: "/tutor-centre",
  },
];

export const environment = {
  eyebrow: "Environmentally Friendly",
  heading: "Learning that cares for the planet, too",
  body: "Sustainability isn't a side lesson at Nyoni — it's part of how the campus runs and how children are taught to think about the world around them. Outdoor time, nature-based activities, and environmental responsibility are woven into everyday learning.",
};

export const wellbeing = {
  eyebrow: "A Calm, Supportive Environment",
  heading: "Room to be yourself",
  body: "Small classes and an unhurried pace mean children who feel overwhelmed in mainstream schools — anxious, introverted, or neurodivergent learners — have space to settle in, be understood, and grow in confidence.",
};

export const testimonials = [
  {
    quote:
      "Before joining Nyoni Education Hub, my child never liked school. Now, he feels at home, is much happier, and has the freedom to be himself.",
    name: "Hannelien Somers",
  },
  {
    quote:
      "Due to neuro-divergence, my child couldn't attend mainstream school, but Nyoni Education Hub provided him with an authentic school experience. They prioritized his specific needs and taught him invaluable life skills.",
    name: "Mathilda Ross",
  },
  {
    quote:
      "My child is introverted and shy, but at Nyoni Education Hub, she is truly blossoming. The small, supportive environment is helping her come out of her shell.",
    name: "Sandra Oelofsen",
  },
];
