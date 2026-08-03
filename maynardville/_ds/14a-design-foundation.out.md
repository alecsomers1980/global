===FILE: tailwind.config.ts===
import type { Config } from "tailwindcss";

const config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
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
          canvas: "#F4F4F1",
          line: "#E6E6E1",
        },
      },
      fontFamily: {
        heading: [
          "var(--font-montserrat)",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        sans: [
          "var(--font-montserrat)",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        DEFAULT: "3px",
        md: "4px",
        lg: "6px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(6,10,60,0.04), 0 6px 20px -10px rgba(6,10,60,0.14)",
        lift: "0 10px 34px -12px rgba(6,10,60,0.28)",
        focus: "0 0 0 3px rgba(15,49,147,0.35)",
      },
      letterSpacing: {
        tightish: "-0.01em",
      },
      keyframes: {
        "fade-up": {
          from: {
            opacity: "0",
            transform: "translateY(6px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
} satisfies Config;

export default config;
===END===
===FILE: app/globals.css===
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-mv-navy: #060A3C;
    --color-mv-royal-blue: #0F3193;
    --color-mv-mint: #62DAA9;
    --color-mv-cream: #FFFADB;
    --color-mv-navy-muted: #3D4067;
    --color-mv-canvas: #F4F4F1;
    --color-mv-line: #E6E6E1;
  }

  body {
    @apply bg-mv-canvas text-mv-navy font-sans antialiased;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    @apply font-heading tracking-tightish font-semibold;
  }

  a {
    @apply transition-colors;
  }

  :focus-visible {
    @apply outline-none ring-2 ring-mv-blue/50 ring-offset-1;
  }

  ::selection {
    background: #62DAA9;
    color: #060A3C;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background-color: theme("colors.mv.navy-muted");
    border-radius: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}
===END===
===FILE: components/brand/Logo.tsx===
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  href?: string | null;
}

export default function Logo({ className, href }: LogoProps) {
  const image = (
    <Image
      src="/maynardville-logo.png"
      width={1514}
      height={327}
      alt="Maynardville Open-Air Festival"
      priority
      className={className ?? "h-9 w-auto"}
    />
  );

  if (href === null) return image;

  const linkHref = href ?? "/dashboard";
  return <Link href={linkHref}>{image}</Link>;
}
===END===
===FILE: components/ui/AppHeader.tsx===
import Logo from "@/components/brand/Logo";
import Link from "next/link";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  staffName?: string;
}

export default function AppHeader({
  title,
  subtitle,
  staffName,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-mv-navy text-mv-cream shadow">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center space-x-4">
          <Logo className="h-8 w-auto" />
          <span className="hidden sm:block w-px h-6 bg-mv-cream/20" aria-hidden="true" />
          <div>
            <h1 className="font-heading text-lg font-semibold">{title}</h1>
            {subtitle && (
              <p className="text-xs text-mv-cream/70">{subtitle}</p>
            )}
          </div>
        </div>

        {staffName && (
          <div className="flex items-center">
            <span className="hidden sm:inline text-sm text-mv-cream/70 mr-3">
              Signed in as {staffName}
            </span>
            <Link
              href="/api/auth/logout"
              className="border border-mv-cream/30 rounded px-3 py-1 text-sm hover:bg-mv-cream hover:text-mv-navy transition-colors"
            >
              Sign out
            </Link>
          </div>
        )}
      </div>
      <div className="h-0.5 w-full bg-mv-mint" aria-hidden="true" />
    </header>
  );
}
===END===