===FILE: package.json===
{
  "name": "maynardville-ops",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "tailwindcss": "^3.4.7",
    "postcss": "^8.4.40",
    "autoprefixer": "^10.4.19",
    "eslint": "^8",
    "eslint-config-next": "^14.2.5"
  }
}
===END===
===FILE: tsconfig.json===
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
===END===
===FILE: next.config.mjs===
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
===END===
===FILE: postcss.config.mjs===
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
===END===
===FILE: .eslintrc.json===
{
  "extends": "next/core-web-vitals"
}
===END===
===FILE: .gitignore===
node_modules
.next
.env*
===END===
===FILE: tailwind.config.ts===
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mv: {
          navy: "#060A3C",
          blue: "#0F3193",
          mint: "#62DAA9",
          cream: "#FFFADB",
          "navy-muted": "#3D4067",
        },
      },
      fontFamily: {
        heading: ["var(--font-montserrat)", "Helvetica", "Arial", "sans-serif"],
        sans: ["var(--font-montserrat)", "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "3px",
      },
    },
  },
  plugins: [],
};
export default config;
===END===
===FILE: app/globals.css===
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --mv-navy: #060A3C;
  --mv-blue: #0F3193;
  --mv-mint: #62DAA9;
  --mv-cream: #FFFADB;
  --mv-navy-muted: #3D4067;
}

body {
  background-color: white;
  color: var(--mv-navy);
}
===END===
===FILE: app/layout.tsx===
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Maynardville Festival Ops",
  description: "Internal operations platform for the Maynardville Festival",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-sans bg-white text-mv-navy">
        {children}
      </body>
    </html>
  );
}
===END===
===FILE: app/page.tsx===
export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero band */}
      <section className="bg-mv-navy text-mv-cream py-24 px-6 text-center">
        <h1 className="text-5xl font-heading font-bold tracking-tight">
          Maynardville Festival
        </h1>
        <p className="mt-4 text-lg text-mv-cream/90 max-w-xl mx-auto">
          Internal operations platform — manage performances, complimentary tickets, and more.
        </p>
      </section>
      {/* Placeholder for future features */}
      <section className="max-w-5xl mx-auto py-16 px-6 text-center text-mv-navy-muted">
        <p>Welcome to the Maynardville Ops Hub.</p>
      </section>
    </main>
  );
}
===END===
===FILE: lib/types.ts===
export interface Category {
  id: string;
  name: string;
}

export interface Performance {
  id: string;
  label: string;
  date: string;     // ISO date string
  time: string;
  venue: string;
  performanceType: string;
  season: string;
}

export interface Requester {
  id: string;
  name: string;
  email: string;
  role: string;
  allowedCategoryIds: string[]; // IDs of categories they can request for
}

export interface CompRequestInput {
  guestName: string;
  guestSurname: string;
  performanceId: string;       // linked Performance record ID
  categoryId: string;          // linked Category record ID
  guestEmail: string;
  houseSeats: number;
  notes: string;
  totalSeats: number;
  requesterId: string;         // linked Requester record ID
}
===END===
===FILE: lib/airtable.ts===
// Airtable REST API wrapper – no SDK, using fetch.
// All sensitive values come from environment variables.

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!API_KEY || !BASE_ID) {
  throw new Error("Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID environment variables.");
}

// Table names used across the app.
const TABLE = {
  PERFORMANCES: "Performances",
  COMP_REQUESTS: "Comp Requests",
  REQUESTERS: "Requesters",
  CATEGORIES: "Categories",
} as const;

// Base fetch helper that adds auth header and handles errors.
async function airtableFetch(
  tablePathAndQuery: string,
  init?: RequestInit
): Promise<any> {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${tablePathAndQuery}`;
  const headers: HeadersInit = {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    ...init?.headers,
  };

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Airtable API error (${response.status}): ${errorBody}`
    );
  }

  return response.json();
}

// ---------- Helpers to map Airtable records ---------- //
function mapRequester(record: any): import("./types").Requester {
  return {
    id: record.id,
    name: record.fields["Name"] ?? "",
    email: record.fields["Email"] ?? "",
    role: record.fields["Role"] ?? "",
    allowedCategoryIds: Array.isArray(record.fields["Allowed Categories"])
      ? record.fields["Allowed Categories"]
      : [],
  };
}

function mapPerformance(record: any): import("./types").Performance {
  return {
    id: record.id,
    label: record.fields["Label"] ?? "",
    date: record.fields["Date"] ?? "",
    time: record.fields["Time"] ?? "",
    venue: record.fields["Venue"] ?? "",
    performanceType: record.fields["Performance Type"] ?? "",
    season: record.fields["Season"] ?? "",
  };
}

function mapCategory(record: any): import("./types").Category {
  return {
    id: record.id,
    name: record.fields["Name"] ?? "",
  };
}

// ---------- Public API functions ---------- //

/**
 * Looks up a Requester using a magic link token and ensures they are active.
 * Returns the first matched Requester or null.
 */
export async function getRequesterByToken(token: string) {
  const formula = `AND({Magic Link Token}="${token}",{Active}=1)`;
  const path = `${TABLE.REQUESTERS}?filterByFormula=${encodeURIComponent(formula)}`;
  const data = await airtableFetch(path);
  if (data.records && data.records.length > 0) {
    return mapRequester(data.records[0]);
  }
  return null;
}

/**
 * Returns all active performances for a given season, sorted by date.
 */
export async function listActivePerformances(season: string) {
  const formula = `AND({Active}=1,{Season}="${season}")`;
  const path = `${TABLE.PERFORMANCES}?filterByFormula=${encodeURIComponent(formula)}&sort[0][field]=Date&sort[0][direction]=asc`;
  const data = await airtableFetch(path);
  return (data.records ?? []).map(mapPerformance);
}

/**
 * Given an array of category IDs, returns corresponding Category objects.
 * Fetches all categories and filters client‑side (expected to be a small list).
 */
export async function listCategoriesByIds(ids: string[]) {
  const path = `${TABLE.CATEGORIES}`;
  const data = await airtableFetch(path);
  const allCategories: any[] = data.records ?? [];
  return allCategories
    .filter((rec) => ids.includes(rec.id))
    .map(mapCategory);
}

/**
 * Creates a new Comp Request record and returns its ID.
 */
export async function createCompRequest(input: import("./types").CompRequestInput) {
  const fields: Record<string, any> = {
    "Guest Name": input.guestName,
    "Guest Surname": input.guestSurname,
    "Performance": [input.performanceId],       // linked record
    "Category": [input.categoryId],             // linked record
    "Guest Email": input.guestEmail,
    "House Seats": input.houseSeats,
    "Notes": input.notes,
    "Total Seats Requested": input.totalSeats,
    "Ticket Status": "REQUEST",
    "Requester": [input.requesterId],           // linked record
  };

  const path = TABLE.COMP_REQUESTS;
  const body = JSON.stringify({ fields });

  const data = await airtableFetch(path, {
    method: "POST",
    body,
  });

  return data.id as string;
}
===END===
===FILE: .env.example===
# Airtable
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
CURRENT_SEASON=2026

# Quicket (when needed)
QUICKET_API_KEY=
QUICKET_USER_TOKEN=

# Base URL of this app (used for magic links, redirects, etc.)
APP_BASE_URL=http://localhost:3000

# All keys live in Maynardville‑owned accounts.
===END===