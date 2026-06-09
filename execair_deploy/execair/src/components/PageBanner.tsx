import { cn } from "@/lib/utils";

interface PageBannerProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function PageBanner({ title, subtitle, className }: PageBannerProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-[40vh] items-center justify-center overflow-hidden bg-brand-navy",
        className
      )}
    >
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy/95 to-brand-teal/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-teal/10 via-transparent to-transparent" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Animated gradient orb */}
      <div className="absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-brand-teal/5 blur-3xl" />

      {/* 
        Increased pt-36 to clear ~112px fixed header. 
        Added pb-12 to keep content visually balanced in the flex container. 
      */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 pt-36 pb-12 text-center">
        <h1 className="font-bold tracking-tight text-white text-[clamp(2.25rem,1rem+4vw,3.75rem)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-6 max-w-2xl text-white/60 text-[clamp(1.125rem,0.875rem+1vw,1.25rem)]">
            {subtitle}
          </p>
        )}
        {/* Decorative line */}
        <div className="mx-auto mt-8 h-1 w-20 rounded-full bg-gradient-to-r from-brand-teal to-brand-teal/30" />
      </div>
    </section>
  );
}
